<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\ProductVariant;
use App\Models\Warehouse;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * Get real-time summary statistics for inventory dashboard.
     */
    public function getKpis(?int $warehouseId = null): array
    {
        $this->ensureAllProductsHaveInventory();
        return $this->getDashboardMetrics($warehouseId);
    }

    /**
     * Get inventory dashboard summary metrics supporting optional warehouse scoping.
     */
    public function getDashboardMetrics(?int $warehouseId = null): array
    {
        $query = Inventory::query();
        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $totalSkus = (clone $query)->count();
        $totalStockUnits = (int) (clone $query)->sum('available_qty');
        $lowStockCount = (clone $query)->whereColumn('available_qty', '<=', 'low_stock_threshold')
            ->where('available_qty', '>', 0)
            ->count();
        $outOfStockCount = (clone $query)->where('available_qty', '<=', 0)->count();
        $reservedStockUnits = (int) (clone $query)->sum('reserved_qty');
        $damagedStockUnits = (int) (clone $query)->sum('damaged_qty');
        $committedStockUnits = (int) (clone $query)->sum('committed_qty');
        $returnedStockUnits = (int) (clone $query)->sum('returned_qty');

        // Financial Valuation Metrics
        $totalCostValuation = (float) (clone $query)->selectRaw('SUM(available_qty * cost_price) as total_cost')->value('total_cost');

        $totalRetailValuation = DB::table('inventories')
            ->join('product_variants', 'inventories.product_variant_id', '=', 'product_variants.id')
            ->when($warehouseId, fn($q) => $q->where('inventories.warehouse_id', $warehouseId))
            ->sum(DB::raw('inventories.available_qty * product_variants.price'));

        $damagedStockLoss = (float) (clone $query)->selectRaw('SUM(damaged_qty * cost_price) as loss')->value('loss');
        $potentialMargin = max(0, $totalRetailValuation - $totalCostValuation);

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
            'total_inventory_cost_value' => round((float) $totalCostValuation, 2),
            'total_inventory_retail_value' => round((float) $totalRetailValuation, 2),
            'total_inventory_value' => round((float) $totalRetailValuation, 2), // Backward compatibility
            'potential_margin_value' => round((float) $potentialMargin, 2),
            'damaged_stock_loss_value' => round((float) $damagedStockLoss, 2),
        ];
    }

    /**
     * List inventory items with warehouse, search, category, brand, and sorting filters.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $this->ensureAllProductsHaveInventory();
        $query = Inventory::with([
            'warehouse',
            'variant.product.brand',
            'variant.product.categories',
            'variant.attributeValues'
        ]);

        if (!empty($filters['warehouse_id']) && is_numeric($filters['warehouse_id'])) {
            $query->where('warehouse_id', (int) $filters['warehouse_id']);
        }

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhere('location_code', 'like', "%{$search}%")
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

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, ['available_qty', 'cost_price', 'low_stock_threshold', 'sku', 'id', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->paginate($perPageInt);
    }

    /**
     * Fetch low stock alert list.
     */
    public function getLowStock(int $perPage = 15, ?int $warehouseId = null): LengthAwarePaginator
    {
        return $this->getAlerts($perPage, $warehouseId);
    }

    /**
     * Fetch low stock & out-of-stock items.
     */
    public function getAlerts(int $perPage = 15, ?int $warehouseId = null): LengthAwarePaginator
    {
        $query = Inventory::with(['warehouse', 'variant.product'])
            ->whereColumn('available_qty', '<=', 'low_stock_threshold');

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        return $query->orderBy('available_qty', 'asc')->paginate($perPage);
    }

    /**
     * Single variant inventory detail.
     */
    public function getVariantInventory(int $variantId, ?int $warehouseId = null): Inventory
    {
        $query = Inventory::with(['warehouse', 'variant.product.brand', 'variant.product.categories', 'variant.attributeValues', 'transactions.admin'])
            ->where('product_variant_id', $variantId);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        return $query->firstOrFail();
    }

    /**
     * Polymorphic manual stock adjustment supporting warehouse_id, cost_price, reorder_qty, and location_code.
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
            $warehouseId = !empty($data['warehouse_id']) ? (int) $data['warehouse_id'] : null;
            $type = $data['type'] ?? 'add';
            $qty = (int) ($data['quantity'] ?? 0);
            $remarks = trim(($data['reason'] ?? '') . ' ' . ($data['remarks'] ?? ''));
            $threshold = isset($data['low_stock_threshold']) ? (int) $data['low_stock_threshold'] : null;
            $costPrice = isset($data['cost_price']) ? (float) $data['cost_price'] : null;
            $reorderQty = isset($data['reorder_qty']) ? (int) $data['reorder_qty'] : null;
            $allowBackorder = isset($data['allow_backorder']) ? (bool) $data['allow_backorder'] : null;
            $locationCode = isset($data['location_code']) ? trim($data['location_code']) : null;
        } else {
            $variantId = (int) $variantIdOrData;
            $warehouseId = null;
            $costPrice = null;
            $reorderQty = null;
            $allowBackorder = null;
            $locationCode = null;
        }

        return DB::transaction(function () use ($variantId, $warehouseId, $type, $qty, $remarks, $threshold, $costPrice, $reorderQty, $allowBackorder, $locationCode, $adminId) {
            $variant = ProductVariant::findOrFail($variantId);
            $targetWarehouse = $warehouseId ? Warehouse::findOrFail($warehouseId) : Warehouse::getDefaultWarehouse();

            $inventory = Inventory::where('product_variant_id', $variant->id)
                ->where('warehouse_id', $targetWarehouse->id)
                ->lockForUpdate()
                ->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'warehouse_id' => $targetWarehouse->id,
                    'product_variant_id' => $variant->id,
                    'sku' => $variant->sku,
                    'cost_price' => $costPrice ?? 0.00,
                    'available_qty' => 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => $threshold ?? 10,
                    'reorder_qty' => $reorderQty ?? 50,
                    'allow_backorder' => $allowBackorder ?? false,
                    'location_code' => $locationCode,
                ]);
            }

            if ($threshold !== null && $threshold >= 0) {
                $inventory->low_stock_threshold = $threshold;
            }
            if ($costPrice !== null && $costPrice >= 0) {
                $inventory->cost_price = $costPrice;
            }
            if ($reorderQty !== null && $reorderQty >= 0) {
                $inventory->reorder_qty = $reorderQty;
            }
            if ($allowBackorder !== null) {
                $inventory->allow_backorder = $allowBackorder;
            }
            if ($locationCode !== null) {
                $inventory->location_code = $locationCode;
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
                        'quantity' => ["Cannot deduct more stock than currently available in {$targetWarehouse->name} (Available: {$previousQty}, Requested: {$qty})."],
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

            $inventory->available_qty = $newQty;
            $inventory->save();

            // Sync total aggregate stock_qty on ProductVariant across all active warehouses
            $totalStockAcrossWarehouses = (int) Inventory::where('product_variant_id', $variant->id)->sum('available_qty');
            $variant->stock_qty = $totalStockAcrossWarehouses;
            $variant->save();

            // Audit log
            $transaction = InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'warehouse_id' => $targetWarehouse->id,
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
                'warehouse_id' => $targetWarehouse->id,
                'warehouse_name' => $targetWarehouse->name,
                'product_variant_id' => $variant->id,
                'sku' => $variant->sku,
                'previous_available_qty' => $previousQty,
                'change_qty' => $quantityChange,
                'new_available_qty' => $newQty,
                'low_stock_threshold' => $inventory->low_stock_threshold,
                'transaction_id' => $transaction->id,
                'inventory' => $inventory->fresh(['warehouse', 'variant.product']),
            ];
        });
    }

    /**
     * Transfer stock between two warehouses atomically with transaction audit logs.
     */
    public function transferStock(
        int $variantId,
        int $sourceWarehouseId,
        int $targetWarehouseId,
        int $qty,
        string $remarks = '',
        ?int $adminId = null
    ): array {
        if ($sourceWarehouseId === $targetWarehouseId) {
            throw ValidationException::withMessages([
                'target_warehouse_id' => ['Source and target warehouse must be different for stock transfer.'],
            ]);
        }

        if ($qty <= 0) {
            throw ValidationException::withMessages([
                'quantity' => ['Transfer quantity must be greater than zero.'],
            ]);
        }

        return DB::transaction(function () use ($variantId, $sourceWarehouseId, $targetWarehouseId, $qty, $remarks, $adminId) {
            $variant = ProductVariant::findOrFail($variantId);
            $sourceWh = Warehouse::findOrFail($sourceWarehouseId);
            $targetWh = Warehouse::findOrFail($targetWarehouseId);

            $sourceInventory = Inventory::where('product_variant_id', $variant->id)
                ->where('warehouse_id', $sourceWh->id)
                ->lockForUpdate()
                ->first();

            if (!$sourceInventory || $sourceInventory->available_qty < $qty) {
                $available = $sourceInventory ? $sourceInventory->available_qty : 0;
                throw ValidationException::withMessages([
                    'quantity' => ["Insufficient stock in {$sourceWh->name} for transfer (Available: {$available}, Requested: {$qty})."],
                ]);
            }

            // Deduct from Source Warehouse
            $srcPrev = $sourceInventory->available_qty;
            $sourceInventory->available_qty -= $qty;
            $sourceInventory->save();

            // Add to Target Warehouse
            $targetInventory = Inventory::where('product_variant_id', $variant->id)
                ->where('warehouse_id', $targetWh->id)
                ->lockForUpdate()
                ->first();

            if (!$targetInventory) {
                $targetInventory = Inventory::create([
                    'warehouse_id' => $targetWh->id,
                    'product_variant_id' => $variant->id,
                    'sku' => $variant->sku,
                    'cost_price' => $sourceInventory->cost_price,
                    'available_qty' => 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => $sourceInventory->low_stock_threshold,
                    'reorder_qty' => $sourceInventory->reorder_qty,
                    'allow_backorder' => $sourceInventory->allow_backorder,
                ]);
            }

            $tgtPrev = $targetInventory->available_qty;
            $targetInventory->available_qty += $qty;
            $targetInventory->save();

            // Transaction log for Transfer
            $txRemarks = trim("Transferred {$qty} units from {$sourceWh->name} to {$targetWh->name}. " . $remarks);

            $tx = InventoryTransaction::create([
                'inventory_id' => $sourceInventory->id,
                'warehouse_id' => $sourceWh->id,
                'destination_warehouse_id' => $targetWh->id,
                'product_variant_id' => $variant->id,
                'sku' => $variant->sku,
                'previous_qty' => $srcPrev,
                'quantity_change' => -$qty,
                'new_qty' => $sourceInventory->available_qty,
                'transaction_type' => 'adjustment',
                'reference_type' => 'Inter-Warehouse Transfer',
                'admin_id' => $adminId,
                'remarks' => $txRemarks,
                'created_at' => now(),
            ]);

            return [
                'variant_id' => $variant->id,
                'sku' => $variant->sku,
                'source_warehouse' => $sourceWh->name,
                'target_warehouse' => $targetWh->name,
                'transferred_qty' => $qty,
                'transaction_id' => $tx->id,
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
        ?string $remarks = null,
        ?int $warehouseId = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $qty, $refType, $refId, $remarks, $warehouseId) {
            $variant = ProductVariant::findOrFail($variantId);
            $targetWh = $warehouseId ? Warehouse::findOrFail($warehouseId) : Warehouse::getDefaultWarehouse();

            $inventory = Inventory::where('product_variant_id', $variantId)
                ->where('warehouse_id', $targetWh->id)
                ->lockForUpdate()
                ->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'warehouse_id' => $targetWh->id,
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

            if ($inventory->available_qty < $qty && !$inventory->allow_backorder) {
                throw ValidationException::withMessages([
                    'quantity' => ["Insufficient stock available in {$targetWh->name} for reservation (Available: {$inventory->available_qty}, Requested: {$qty})."],
                ]);
            }

            $previousQty = $inventory->available_qty;
            $inventory->available_qty -= $qty;
            $inventory->reserved_qty += $qty;
            $inventory->save();

            // Sync aggregate stock_qty
            $variant->stock_qty = (int) Inventory::where('product_variant_id', $variant->id)->sum('available_qty');
            $variant->save();

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'warehouse_id' => $targetWh->id,
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
     * Atomically release reserved stock.
     */
    public function releaseStock(
        int $variantId,
        int $qty,
        ?string $refType = null,
        ?int $refId = null,
        ?string $remarks = null,
        ?int $warehouseId = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $qty, $refType, $refId, $remarks, $warehouseId) {
            $variant = ProductVariant::findOrFail($variantId);
            $targetWh = $warehouseId ? Warehouse::find($warehouseId) : null;

            $query = Inventory::where('product_variant_id', $variantId);
            if ($targetWh) {
                $query->where('warehouse_id', $targetWh->id);
            }

            $inventory = $query->lockForUpdate()->firstOrFail();

            $releaseQty = min($inventory->reserved_qty, $qty);
            $previousQty = $inventory->available_qty;

            $inventory->reserved_qty -= $releaseQty;
            $inventory->available_qty += $releaseQty;
            $inventory->save();

            $variant->stock_qty = (int) Inventory::where('product_variant_id', $variant->id)->sum('available_qty');
            $variant->save();

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'warehouse_id' => $inventory->warehouse_id,
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
        ?string $remarks = null,
        ?int $warehouseId = null
    ): Inventory {
        return DB::transaction(function () use ($variantId, $qty, $refType, $refId, $remarks, $warehouseId) {
            $variant = ProductVariant::findOrFail($variantId);
            $query = Inventory::where('product_variant_id', $variantId);
            if ($warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            }
            $inventory = $query->lockForUpdate()->firstOrFail();

            $commitQty = min($inventory->reserved_qty, $qty);

            $inventory->reserved_qty -= $commitQty;
            $inventory->committed_qty += $commitQty;
            $inventory->save();

            InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'warehouse_id' => $inventory->warehouse_id,
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
     * Fetch inventory audit transactions with search and warehouse filtering.
     */
    public function getHistory(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryTransaction::with(['warehouse', 'destinationWarehouse', 'variant.product', 'admin']);

        if (!empty($filters['warehouse_id']) && is_numeric($filters['warehouse_id'])) {
            $query->where('warehouse_id', (int) $filters['warehouse_id']);
        }

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
     * Bulk stock update from uploaded CSV file.
     */
    public function importCsv(UploadedFile $file, ?int $warehouseId = null, ?int $adminId = null): array
    {
        $filePath = $file->getRealPath();

        // 1. Auto-detect Delimiter (Comma, Semicolon, or Tab)
        $firstLine = file_get_contents($filePath, false, null, 0, 2048);
        $delimiter = ',';
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        }

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            throw ValidationException::withMessages(['file' => ['Failed to open uploaded CSV file.']]);
        }

        $headers = fgetcsv($handle, 0, $delimiter);
        if (!$headers) {
            fclose($handle);
            throw ValidationException::withMessages(['file' => ['CSV file is empty or invalid.']]);
        }

        // Clean UTF-8 BOM from first header column
        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', trim($headers[0]));

        // 2. Map Column Indices Dynamically from Headers
        $colMap = [
            'sku' => 0,
            'action' => null,
            'qty' => 1,
            'cost' => null,
            'threshold' => null,
            'reorder' => null,
            'location' => null,
        ];

        foreach ($headers as $idx => $h) {
            $norm = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', trim($h)));
            if (in_array($norm, ['sku', 'productsku', 'itemsku'])) {
                $colMap['sku'] = $idx;
            } elseif (in_array($norm, ['action', 'type', 'operation', 'adjustmenttype'])) {
                $colMap['action'] = $idx;
            } elseif (in_array($norm, ['quantity', 'qty', 'newavailableqty', 'availableqty', 'stockqty', 'units', 'count'])) {
                $colMap['qty'] = $idx;
            } elseif (in_array($norm, ['unitcostprice', 'costprice', 'unitcost', 'cost', 'cogs'])) {
                $colMap['cost'] = $idx;
            } elseif (in_array($norm, ['lowstocklimit', 'lowstockthreshold', 'threshold', 'alertlimit'])) {
                $colMap['threshold'] = $idx;
            } elseif (in_array($norm, ['reorderquantity', 'reorderqty', 'reorderlimit', 'reorder'])) {
                $colMap['reorder'] = $idx;
            } elseif (in_array($norm, ['locationcode', 'location', 'binlocation', 'aisle', 'slot'])) {
                $colMap['location'] = $idx;
            }
        }

        $targetWh = $warehouseId ? Warehouse::findOrFail($warehouseId) : Warehouse::getDefaultWarehouse();

        $processed = 0;
        $updated = 0;
        $skippedSkus = [];
        $errors = [];

        // 3. Process Rows Atomically inside DB Transaction
        DB::transaction(function () use ($handle, $delimiter, $colMap, $targetWh, $adminId, $file, &$processed, &$updated, &$skippedSkus, &$errors) {
            $rowNum = 1;
            while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                $rowNum++;
                if (count($row) < 2) continue;

                $skuIndex = $colMap['sku'];
                $sku = isset($row[$skuIndex]) ? preg_replace('/^\xEF\xBB\xBF/', '', trim($row[$skuIndex])) : '';
                if (empty($sku) || strtolower($sku) === 'sku') continue;

                $processed++;

                // Determine Operation Type & Quantity
                $type = 'set';
                $qty = 0;

                if ($colMap['action'] !== null && isset($row[$colMap['action']])) {
                    $actionRaw = strtolower(trim($row[$colMap['action']]));
                    $type = match ($actionRaw) {
                        'add', 'increase', '+' => 'add',
                        'deduct', 'decrease', '-' => 'deduct',
                        'damage' => 'damage',
                        default => 'set',
                    };
                    $qtyIndex = $colMap['qty'];
                    $qty = isset($row[$qtyIndex]) ? abs((int) trim($row[$qtyIndex])) : 0;
                } else {
                    // Positional indexing or signed quantity fallback
                    $qtyVal = isset($row[$colMap['qty']]) ? trim($row[$colMap['qty']]) : '0';
                    $actionCheck = strtolower($qtyVal);

                    if (in_array($actionCheck, ['add', 'increase', '+', 'deduct', 'decrease', '-', 'set', 'absolute', '=', 'damage'])) {
                        $type = match ($actionCheck) {
                            'add', 'increase', '+' => 'add',
                            'deduct', 'decrease', '-' => 'deduct',
                            'damage' => 'damage',
                            default => 'set',
                        };
                        $qty = isset($row[2]) ? abs((int) trim($row[2])) : 0;
                    } elseif (str_starts_with($qtyVal, '+')) {
                        $type = 'add';
                        $qty = abs((int) $qtyVal);
                    } elseif (str_starts_with($qtyVal, '-')) {
                        $type = 'deduct';
                        $qty = abs((int) $qtyVal);
                    } else {
                        $type = 'set';
                        $qty = (int) $qtyVal;
                    }
                }

                // Extract optional metadata values
                $cost = ($colMap['cost'] !== null && isset($row[$colMap['cost']]) && is_numeric(trim($row[$colMap['cost']]))) ? (float) trim($row[$colMap['cost']]) : null;
                $threshold = ($colMap['threshold'] !== null && isset($row[$colMap['threshold']]) && is_numeric(trim($row[$colMap['threshold']]))) ? (int) trim($row[$colMap['threshold']]) : null;
                $reorder = ($colMap['reorder'] !== null && isset($row[$colMap['reorder']]) && is_numeric(trim($row[$colMap['reorder']]))) ? (int) trim($row[$colMap['reorder']]) : null;
                $location = ($colMap['location'] !== null && isset($row[$colMap['location']])) ? trim($row[$colMap['location']]) : null;

                // Fallback positional indices if headers were unmapped
                if ($cost === null && $colMap['cost'] === null && isset($row[3]) && is_numeric(trim($row[3]))) {
                    $cost = (float) trim($row[3]);
                }
                if ($threshold === null && $colMap['threshold'] === null && isset($row[4]) && is_numeric(trim($row[4]))) {
                    $threshold = (int) trim($row[4]);
                }
                if ($reorder === null && $colMap['reorder'] === null && isset($row[5]) && is_numeric(trim($row[5]))) {
                    $reorder = (int) trim($row[5]);
                }
                if ($location === null && $colMap['location'] === null && isset($row[6])) {
                    $location = trim($row[6]);
                }

                $variant = ProductVariant::where('sku', $sku)->first();
                if (!$variant) {
                    $skippedSkus[] = $sku;
                    $errors[] = "Row {$rowNum}: SKU '{$sku}' not found in database.";
                    continue;
                }

                // 4. Negative Stock Guard (for deductions/damage when backorders are disabled)
                if (in_array($type, ['deduct', 'damage'])) {
                    $inv = Inventory::where('product_variant_id', $variant->id)
                        ->where('warehouse_id', $targetWh->id)
                        ->first();

                    $avail = $inv ? $inv->available_qty : 0;
                    $allowBackorder = $inv ? $inv->allow_backorder : false;

                    if (!$allowBackorder && $qty > $avail) {
                        $errors[] = "Row {$rowNum} (SKU '{$sku}'): Deduction quantity ({$qty}) exceeds available stock ({$avail}). Adjusted deduction to {$avail}.";
                        $qty = $avail; // Cap deduction at available stock
                    }
                }

                $this->adjustStock([
                    'product_variant_id' => $variant->id,
                    'warehouse_id' => $targetWh->id,
                    'type' => $type,
                    'quantity' => $qty,
                    'cost_price' => $cost,
                    'low_stock_threshold' => $threshold,
                    'reorder_qty' => $reorder,
                    'location_code' => $location,
                    'reason' => 'Bulk CSV Audit Import',
                    'remarks' => "Bulk import ({$type}) from {$file->getClientOriginalName()}",
                    'admin_id' => $adminId,
                ]);

                $updated++;
            }
        });

        fclose($handle);

        return [
            'rows_processed' => $processed,
            'skus_updated' => $updated,
            'skipped_count' => count($skippedSkus),
            'skipped_skus' => array_values(array_unique($skippedSkus)),
            'warnings' => $errors,
            'warehouse' => $targetWh->name,
        ];
    }

    /**
     * Generate sample CSV import template string.
     */
    public function getSampleCsvTemplate(): string
    {
        return "SKU,Action,Quantity,Unit Cost Price,Low Stock Limit,Reorder Quantity,Location Code\n" .
               "TEST-SMART-001,add,50,450.00,10,50,Aisle 3B\n" .
               "SRV-RACK-001,deduct,5,890.50,15,40,Bin 14\n" .
               "LAPTOP-PRO-15,set,100,65000.00,5,20,Shelf 2A\n";
    }

    /**
     * Generate CSV export string for current inventory snapshot.
     */
    public function exportCsv(?int $warehouseId = null): string
    {
        $query = Inventory::with(['warehouse', 'variant.product.brand', 'variant.product.categories']);
        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }
        $items = $query->get();

        $output = "SKU,Product Name,Warehouse,Location Code,Unit Cost,Retail Price,Available Qty,Reserved Qty,Committed Qty,Damaged Qty,Returned Qty,Low Threshold,Reorder Qty,Status\n";

        foreach ($items as $item) {
            $productName = $item->variant?->product?->name ?? 'N/A';
            $warehouseName = $item->warehouse?->name ?? 'Main Warehouse';
            $retailPrice = $item->variant?->price ?? 0;
            $status = $item->available_qty <= 0 ? 'Out of Stock' : ($item->available_qty <= $item->low_stock_threshold ? 'Low Stock' : 'In Stock');

            $output .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%d,%d,%d,%d,%d,%d,%d,\"%s\"\n",
                str_replace('"', '""', $item->sku),
                str_replace('"', '""', $productName),
                str_replace('"', '""', $warehouseName),
                str_replace('"', '""', $item->location_code ?? ''),
                $item->cost_price ?? 0,
                $retailPrice,
                $item->available_qty,
                $item->reserved_qty,
                $item->committed_qty,
                $item->damaged_qty,
                $item->returned_qty,
                $item->low_stock_threshold,
                $item->reorder_qty ?? 50,
                $status
            );
        }

        return $output;
    }

    /**
     * Helper to ensure all products have variants and inventory records in default warehouse.
     */
    public function ensureAllProductsHaveInventory(): void
    {
        $defaultWh = Warehouse::getDefaultWarehouse();
        if (!$defaultWh) return;

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
                [
                    'product_variant_id' => $variant->id,
                    'warehouse_id' => $defaultWh->id,
                ],
                [
                    'sku' => $variant->sku,
                    'cost_price' => round(($variant->price ?? 0) * 0.6, 2),
                    'available_qty' => $variant->stock_qty ?? 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => 10,
                    'reorder_qty' => 50,
                    'allow_backorder' => false,
                ]
            );
        }
    }
}
