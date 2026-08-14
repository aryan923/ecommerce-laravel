<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\ProductVariant;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * Get real-time summary statistics for inventory dashboard.
     */
    public function getKpis(): array
    {
        $this->ensureAllProductsHaveInventory();
        return $this->getDashboardMetrics();
    }

    /**
     * Get inventory dashboard summary metrics (Legacy / Alternative name).
     */
    public function getDashboardMetrics(): array
    {
        $totalSkus = Inventory::count();
        $totalStockUnits = (int) Inventory::sum('available_qty');
        $lowStockCount = Inventory::whereColumn('available_qty', '<=', 'low_stock_threshold')
            ->where('available_qty', '>', 0)
            ->count();
        $outOfStockCount = Inventory::where('available_qty', '<=', 0)->count();
        $reservedStockUnits = (int) Inventory::sum('reserved_qty');
        $damagedStockUnits = (int) Inventory::sum('damaged_qty');
        $committedStockUnits = (int) Inventory::sum('committed_qty');
        $returnedStockUnits = (int) Inventory::sum('returned_qty');

        // Total Valuation: Sum of (available_qty * product_variants.price)
        $totalValuation = DB::table('inventories')
            ->join('product_variants', 'inventories.product_variant_id', '=', 'product_variants.id')
            ->sum(DB::raw('inventories.available_qty * product_variants.price'));

        return [
            'total_skus' => $totalSkus,
            'total_stock_units' => $totalStockUnits,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'reserved_stock_units' => $reservedStockUnits,
            'reserved_stock_count' => $reservedStockUnits,
            'damaged_stock_units' => $damagedStockUnits,
            'damaged_stock_count' => $damagedStockUnits,
            'committed_stock_units' => $committedStockUnits,
            'returned_stock_units' => $returnedStockUnits,
            'total_inventory_value' => round((float) $totalValuation, 2),
        ];
    }

    /**
     * List inventory items with filters, search, and pagination.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $this->ensureAllProductsHaveInventory();
        $query = Inventory::with(['variant.product.brand', 'variant.product.categories', 'variant.attributeValues']);

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('variant.product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['stock_status'])) {
            match ($filters['stock_status']) {
                'in_stock' => $query->whereColumn('available_qty', '>', 'low_stock_threshold'),
                'low_stock' => $query->whereColumn('available_qty', '<=', 'low_stock_threshold')->where('available_qty', '>', 0),
                'out_of_stock' => $query->where('available_qty', '<=', 0),
                default => null,
            };
        }

        if (!empty($filters['category_id']) && is_numeric($filters['category_id'])) {
            $query->whereHas('variant.product.categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category_id']);
            });
        }

        if (!empty($filters['brand_id']) && is_numeric($filters['brand_id'])) {
            $query->whereHas('variant.product', function ($q) use ($filters) {
                $q->where('brand_id', $filters['brand_id']);
            });
        }

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->orderBy('id', 'desc')->paginate($perPageInt);
    }

    /**
     * Fetch low stock alert list.
     */
    public function getLowStock(int $perPage = 15): LengthAwarePaginator
    {
        return $this->getAlerts($perPage);
    }

    /**
     * Fetch low stock & out-of-stock items (Legacy / Alias).
     */
    public function getAlerts(int $perPage = 15): LengthAwarePaginator
    {
        return Inventory::with(['variant.product'])
            ->whereColumn('available_qty', '<=', 'low_stock_threshold')
            ->orderBy('available_qty', 'asc')
            ->paginate($perPage);
    }

    /**
     * Single variant inventory detail.
     */
    public function getVariantInventory(int $variantId): Inventory
    {
        return Inventory::with(['variant.product.brand', 'variant.product.categories', 'variant.attributeValues', 'transactions.admin'])
            ->where('product_variant_id', $variantId)
            ->firstOrFail();
    }

    /**
     * Polymorphic manual stock adjustment supporting both Array payload and Positional arguments.
     *
     * Signature 1: adjustStock(array $data, ?int $adminId = null)
     * Signature 2: adjustStock(int $variantId, string $type, int $qty, string $remarks = '', ?int $threshold = null, ?int $adminId = null)
     */
    public function adjustStock(
        int|array $variantIdOrData,
        string $type = 'add',
        int $qty = 0,
        string $remarks = '',
        ?int $threshold = null,
        ?int $adminId = null
    ): mixed {
        if (is_array($variantIdOrData)) {
            $data = $variantIdOrData;
            $adminId = $adminId ?? ($data['admin_id'] ?? null);
            $variantId = (int) $data['product_variant_id'];
            $type = $data['type'] ?? 'add';
            $qty = (int) ($data['quantity'] ?? 0);
            $remarks = trim(($data['reason'] ?? '') . ' ' . ($data['remarks'] ?? ''));
            $threshold = isset($data['low_stock_threshold']) ? (int) $data['low_stock_threshold'] : null;
        } else {
            $variantId = (int) $variantIdOrData;
        }

        return DB::transaction(function () use ($variantId, $type, $qty, $remarks, $threshold, $adminId) {
            $variant = ProductVariant::findOrFail($variantId);

            $inventory = Inventory::where('product_variant_id', $variant->id)
                ->lockForUpdate()
                ->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'product_variant_id' => $variant->id,
                    'sku' => $variant->sku,
                    'available_qty' => 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => 10,
                ]);
            }

            if ($threshold !== null && $threshold >= 0) {
                $inventory->low_stock_threshold = $threshold;
            }

            $previousQty = (int) $inventory->available_qty;
            $quantityChange = 0;
            $newQty = $previousQty;
            $transactionType = 'adjustment';

            if ($type === 'add') {
                if ($qty <= 0) {
                    throw ValidationException::withMessages([
                        'quantity' => ['Quantity for addition must be greater than zero.'],
                    ]);
                }
                $quantityChange = $qty;
                $newQty = $previousQty + $quantityChange;
                $transactionType = 'manual_addition';
            } elseif ($type === 'deduct') {
                if ($qty <= 0) {
                    throw ValidationException::withMessages([
                        'quantity' => ['Quantity for deduction must be greater than zero.'],
                    ]);
                }
                if ($qty > $previousQty) {
                    throw ValidationException::withMessages([
                        'quantity' => ["Cannot deduct more stock than currently available (Available: {$previousQty}, Requested: {$qty})."],
                    ]);
                }
                $quantityChange = -$qty;
                $newQty = $previousQty + $quantityChange;
                $transactionType = 'manual_deduction';
            } elseif ($type === 'damage') {
                if ($qty <= 0) {
                    throw ValidationException::withMessages([
                        'quantity' => ['Quantity for damage write-off must be greater than zero.'],
                    ]);
                }
                if ($qty > $previousQty) {
                    throw ValidationException::withMessages([
                        'quantity' => ["Cannot mark more stock damaged than currently available."],
                    ]);
                }
                $quantityChange = -$qty;
                $newQty = $previousQty + $quantityChange;
                $inventory->damaged_qty += $qty;
                $transactionType = 'damage';
            } elseif ($type === 'set') {
                $newQty = $qty;
                $quantityChange = $newQty - $previousQty;
                $transactionType = 'adjustment';
            }

            // Update Inventory & ProductVariant
            $inventory->available_qty = $newQty;
            $inventory->save();

            $variant->stock_qty = $newQty;
            $variant->save();

            // Log Inventory Transaction record
            $transaction = InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'product_variant_id' => $variant->id,
                'sku' => $variant->sku,
                'previous_qty' => $previousQty,
                'quantity_change' => $quantityChange,
                'new_qty' => $newQty,
                'transaction_type' => $transactionType,
                'reference_type' => 'Manual Adjustment',
                'admin_id' => $adminId,
                'remarks' => $remarks ?: 'Manual Stock Adjustment',
                'created_at' => now(),
            ]);

            return [
                'inventory_id' => $inventory->id,
                'product_variant_id' => $variant->id,
                'sku' => $variant->sku,
                'previous_available_qty' => $previousQty,
                'change_qty' => $quantityChange,
                'new_available_qty' => $newQty,
                'low_stock_threshold' => $inventory->low_stock_threshold,
                'transaction_id' => $transaction->id,
                'inventory' => $inventory->fresh(['variant.product']),
            ];
        });
    }

    /**
     * Atomically reserve stock for an order placement.
     */
    public function reserveStock(
        int $variantId,
        int $qty,
        ?string $refType = null,
        ?int $refId = null,
        ?string $remarks = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $qty, $refType, $refId, $remarks) {
            $variant = ProductVariant::findOrFail($variantId);
            $inventory = Inventory::where('product_variant_id', $variantId)
                ->lockForUpdate()
                ->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'product_variant_id' => $variant->id,
                    'sku' => $variant->sku,
                    'available_qty' => $variant->stock_qty ?? 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => 10,
                ]);
            }

            if ($inventory->available_qty < $qty) {
                throw ValidationException::withMessages([
                    'quantity' => ["Insufficient stock available for reservation (Available: {$inventory->available_qty}, Requested: {$qty})."],
                ]);
            }

            $previousQty = $inventory->available_qty;
            $inventory->available_qty -= $qty;
            $inventory->reserved_qty += $qty;
            $inventory->save();

            $variant->stock_qty = $inventory->available_qty;
            $variant->save();

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'product_variant_id' => $variant->id,
                'sku' => $inventory->sku,
                'previous_qty' => $previousQty,
                'quantity_change' => -$qty,
                'new_qty' => $inventory->available_qty,
                'transaction_type' => 'order_reservation',
                'reference_type' => $refType,
                'reference_id' => $refId,
                'remarks' => $remarks ?? "Reserved {$qty} units for order",
                'created_at' => now(),
            ]);

            return $inventory;
        });
    }

    /**
     * Atomically release reserved stock (e.g. order cancellation).
     */
    public function releaseStock(
        int $variantId,
        int $qty,
        ?string $refType = null,
        ?int $refId = null,
        ?string $remarks = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $qty, $refType, $refId, $remarks) {
            $variant = ProductVariant::findOrFail($variantId);
            $inventory = Inventory::where('product_variant_id', $variantId)
                ->lockForUpdate()
                ->firstOrFail();

            $releaseQty = min($inventory->reserved_qty, $qty);
            $previousQty = $inventory->available_qty;

            $inventory->reserved_qty -= $releaseQty;
            $inventory->available_qty += $releaseQty;
            $inventory->save();

            $variant->stock_qty = $inventory->available_qty;
            $variant->save();

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'product_variant_id' => $variant->id,
                'sku' => $inventory->sku,
                'previous_qty' => $previousQty,
                'quantity_change' => $releaseQty,
                'new_qty' => $inventory->available_qty,
                'transaction_type' => 'order_cancellation',
                'reference_type' => $refType,
                'reference_id' => $refId,
                'remarks' => $remarks ?? "Released {$releaseQty} reserved units",
                'created_at' => now(),
            ]);

            return $inventory;
        });
    }

    /**
     * Atomically commit reserved stock upon shipment.
     */
    public function commitStock(
        int $variantId,
        int $qty,
        ?string $refType = null,
        ?int $refId = null,
        ?string $remarks = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $qty, $refType, $refId, $remarks) {
            $variant = ProductVariant::findOrFail($variantId);
            $inventory = Inventory::where('product_variant_id', $variantId)
                ->lockForUpdate()
                ->firstOrFail();

            $commitQty = min($inventory->reserved_qty, $qty);

            $inventory->reserved_qty -= $commitQty;
            $inventory->committed_qty += $commitQty;
            $inventory->save();

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'product_variant_id' => $variant->id,
                'sku' => $inventory->sku,
                'previous_qty' => $inventory->available_qty,
                'quantity_change' => 0,
                'new_qty' => $inventory->available_qty,
                'transaction_type' => 'order_shipment',
                'reference_type' => $refType,
                'reference_id' => $refId,
                'remarks' => $remarks ?? "Committed {$commitQty} units for shipment",
                'created_at' => now(),
            ]);

            return $inventory;
        });
    }

    /**
     * Fetch inventory transactions audit history.
     */
    public function getTransactions(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->getHistory($filters, $perPage);
    }

    /**
     * Fetch inventory transactions audit history (Alias).
     */
    public function getHistory(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryTransaction::with(['variant.product', 'admin']);

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhere('remarks', 'like', "%{$search}%")
                  ->orWhereHas('variant.product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['sku'])) {
            $query->where('sku', $filters['sku']);
        }

        if (!empty($filters['product_variant_id'])) {
            $query->where('product_variant_id', (int) $filters['product_variant_id']);
        }

        if (!empty($filters['transaction_type'])) {
            $query->where('transaction_type', 'like', "%{$filters['transaction_type']}%");
        }

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->orderBy('id', 'desc')->paginate($perPageInt);
    }

    /**
     * Generate CSV export string for current inventory.
     */
    public function exportCsv(): string
    {
        $items = Inventory::with(['variant.product.brand', 'variant.product.categories'])->get();

        $output = "SKU,Product Name,Brand,Available Qty,Reserved Qty,Committed Qty,Damaged Qty,Returned Qty,Low Stock Threshold,Status\n";

        foreach ($items as $item) {
            $productName = $item->variant?->product?->name ?? 'N/A';
            $brandName = $item->variant?->product?->brand?->name ?? 'N/A';
            $status = $item->available_qty <= 0 ? 'Out of Stock' : ($item->available_qty <= $item->low_stock_threshold ? 'Low Stock' : 'In Stock');

            $output .= sprintf(
                "\"%s\",\"%s\",\"%s\",%d,%d,%d,%d,%d,%d,\"%s\"\n",
                str_replace('"', '""', $item->sku),
                str_replace('"', '""', $productName),
                str_replace('"', '""', $brandName),
                $item->available_qty,
                $item->reserved_qty,
                $item->committed_qty,
                $item->damaged_qty,
                $item->returned_qty,
                $item->low_stock_threshold,
                $status
            );
        }

        return $output;
    }

    /**
     * Self-healing helper: ensure all products have variants and inventory records.
     */
    public function ensureAllProductsHaveInventory(): void
    {
        $productsWithoutVariants = \App\Models\Product::doesntHave('variants')->get();
        foreach ($productsWithoutVariants as $product) {
            ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $product->sku ?: ProductVariant::generateUniqueSku(),
                'price' => $product->price ?? 0,
                'stock_qty' => 0,
                'status' => 'active',
            ]);
        }

        $variantsWithoutInventory = ProductVariant::doesntHave('inventory')->get();
        foreach ($variantsWithoutInventory as $variant) {
            Inventory::firstOrCreate(
                ['product_variant_id' => $variant->id],
                [
                    'sku' => $variant->sku,
                    'available_qty' => $variant->stock_qty ?? 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => 10,
                ]
            );
        }
    }
}
