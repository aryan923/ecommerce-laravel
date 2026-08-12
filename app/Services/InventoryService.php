<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * List paginated inventory records with filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Inventory::with(['variant.product', 'variant.attributeValues.attribute']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('variant.product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (isset($filters['status'])) {
            if ($filters['status'] === 'low_stock') {
                $query->lowStock();
            } elseif ($filters['status'] === 'out_of_stock') {
                $query->outOfStock();
            } elseif ($filters['status'] === 'in_stock') {
                $query->whereColumn('available_qty', '>', 'low_stock_threshold');
            }
        }

        return $query->orderBy('available_qty', 'asc')
                     ->orderBy('id', 'desc')
                     ->paginate($perPage);
    }

    /**
     * Perform manual stock adjustment using pessimistic locking.
     *
     * @param int $variantId
     * @param string $adjustmentType ('add', 'deduct', 'set', 'damage')
     * @param int $qty
     * @param string $remarks
     * @param int|null $threshold
     * @param int|null $adminId
     * @return Inventory
     * @throws ValidationException
     */
    public function adjustStock(
        int $variantId,
        string $adjustmentType,
        int $qty,
        string $remarks,
        ?int $threshold = null,
        ?int $adminId = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $adjustmentType, $qty, $remarks, $threshold, $adminId) {
            $variant = ProductVariant::findOrFail($variantId);
            
            $inventory = Inventory::where('product_variant_id', $variantId)
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

            $previousQty = $inventory->available_qty;
            $quantityChange = 0;
            $newQty = $previousQty;
            $transactionType = 'adjustment';

            switch ($adjustmentType) {
                case 'add':
                    $quantityChange = $qty;
                    $newQty = $previousQty + $qty;
                    $transactionType = 'manual_addition';
                    break;
                case 'deduct':
                    if ($previousQty < $qty) {
                        throw ValidationException::withMessages([
                            'quantity' => ['Stock cannot be reduced below zero.'],
                        ]);
                    }
                    $quantityChange = -$qty;
                    $newQty = $previousQty - $qty;
                    $transactionType = 'manual_deduction';
                    break;
                case 'set':
                    $quantityChange = $qty - $previousQty;
                    $newQty = $qty;
                    $transactionType = 'adjustment';
                    break;
                case 'damage':
                    if ($previousQty < $qty) {
                        throw ValidationException::withMessages([
                            'quantity' => ['Stock cannot be reduced below zero.'],
                        ]);
                    }
                    $quantityChange = -$qty;
                    $newQty = $previousQty - $qty;
                    $transactionType = 'damage';
                    $inventory->damaged_qty += $qty;
                    break;
            }

            if ($threshold !== null) {
                $inventory->low_stock_threshold = $threshold;
            }

            $inventory->available_qty = $newQty;
            $inventory->save();

            // Sync with ProductVariant stock_qty column
            $variant->update(['stock_qty' => $newQty]);

            // Create immutable audit transaction record
            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'product_variant_id' => $variant->id,
                'sku' => $inventory->sku,
                'previous_qty' => $previousQty,
                'quantity_change' => $quantityChange,
                'new_qty' => $newQty,
                'transaction_type' => $transactionType,
                'admin_id' => $adminId,
                'remarks' => $remarks,
            ]);

            return $inventory->fresh(['variant.product']);
        });
    }

    /**
     * Atomically reserve stock for an order placement.
     *
     * @param int $variantId
     * @param int $qty
     * @param string|null $refType
     * @param int|null $refId
     * @param string|null $remarks
     * @return Inventory
     * @throws ValidationException
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
                ->firstOrFail();

            if ($inventory->available_qty < $qty) {
                throw ValidationException::withMessages([
                    'quantity' => ["Insufficient stock available for reservation (Available: {$inventory->available_qty}, Requested: {$qty})."],
                ]);
            }

            $previousQty = $inventory->available_qty;
            $inventory->available_qty -= $qty;
            $inventory->reserved_qty += $qty;
            $inventory->save();

            $variant->update(['stock_qty' => $inventory->available_qty]);

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
            ]);

            return $inventory;
        });
    }

    /**
     * Atomically release reserved stock (e.g. order cancellation).
     *
     * @param int $variantId
     * @param int $qty
     * @param string|null $refType
     * @param int|null $refId
     * @param string|null $remarks
     * @return Inventory
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

            $variant->update(['stock_qty' => $inventory->available_qty]);

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
            ]);

            return $inventory;
        });
    }

    /**
     * Atomically commit reserved stock upon shipment.
     *
     * @param int $variantId
     * @param int $qty
     * @param string|null $refType
     * @param int|null $refId
     * @param string|null $remarks
     * @return Inventory
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
            ]);

            return $inventory;
        });
    }

    /**
     * Get inventory dashboard summary metrics.
     *
     * @return array
     */
    public function getDashboardMetrics(): array
    {
        $totalSkus = Inventory::count();
        $totalStockUnits = (int) Inventory::sum('available_qty');
        $lowStockCount = Inventory::lowStock()->count();
        $outOfStockCount = Inventory::outOfStock()->count();
        $reservedStockCount = (int) Inventory::sum('reserved_qty');
        $damagedStockCount = (int) Inventory::sum('damaged_qty');

        $totalInventoryValue = (float) Inventory::join('product_variants', 'inventories.product_variant_id', '=', 'product_variants.id')
            ->selectRaw('SUM(inventories.available_qty * product_variants.price) as total_val')
            ->value('total_val') ?? 0.0;

        return [
            'total_skus' => $totalSkus,
            'total_stock_units' => $totalStockUnits,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'reserved_stock_count' => $reservedStockCount,
            'damaged_stock_count' => $damagedStockCount,
            'total_inventory_value' => round($totalInventoryValue, 2),
        ];
    }

    /**
     * Get low-stock and out-of-stock items.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAlerts(int $perPage = 15): LengthAwarePaginator
    {
        return Inventory::with(['variant.product'])
            ->whereColumn('available_qty', '<=', 'low_stock_threshold')
            ->orderBy('available_qty', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get paginated audit trail history.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getHistory(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryTransaction::with(['variant.product', 'admin']);

        if (!empty($filters['sku'])) {
            $query->where('sku', $filters['sku']);
        }

        if (!empty($filters['product_variant_id'])) {
            $query->where('product_variant_id', (int) $filters['product_variant_id']);
        }

        if (!empty($filters['transaction_type'])) {
            $query->where('transaction_type', $filters['transaction_type']);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }
}
