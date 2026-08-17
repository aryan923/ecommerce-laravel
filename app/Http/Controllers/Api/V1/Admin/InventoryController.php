<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\AdjustStockRequest;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Response;

class InventoryController extends BaseController
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/kpis",
     *     summary="Inventory Dashboard KPIs",
     *     description="Retrieve summary KPIs: total SKUs, total stock units, low stock count, out of stock count, COGS cost valuation, retail valuation, potential profit margin, damaged stock loss, and warehouse filters.",
     *     operationId="adminInventoryKpis",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="KPI metrics retrieved successfully")
     * )
     */
    public function kpis(Request $request): JsonResponse
    {
        $warehouseId = $request->input('warehouse_id') ? (int) $request->input('warehouse_id') : null;
        $kpis = $this->inventoryService->getDashboardMetrics($warehouseId);

        return $this->successResponse($kpis, 'Inventory dashboard metrics retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/dashboard",
     *     summary="Inventory Dashboard Summary Metrics (Alias)",
     *     description="Retrieve summary metrics for inventory dashboard.",
     *     operationId="adminInventoryDashboardMetrics",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Dashboard metrics retrieved successfully")
     * )
     */
    public function dashboard(Request $request): JsonResponse
    {
        return $this->kpis($request);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory",
     *     summary="List Inventory Items",
     *     description="Retrieve paginated inventory list with search, stock status, category, brand, warehouse, and sorting filters.",
     *     operationId="adminListInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="stock_status", in="query", required=false, @OA\Schema(type="string", enum={"in_stock","low_stock","out_of_stock"})),
     *     @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="brand_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"available_qty","cost_price","low_stock_threshold","sku","id"})),
     *     @OA\Parameter(name="sort_order", in="query", required=false, @OA\Schema(type="string", enum={"asc","desc"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory list retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'stock_status', 'category_id', 'brand_id', 'warehouse_id', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 15);

        $inventory = $this->inventoryService->list($filters, $perPage);

        return $this->paginatedResponse($inventory, 'Inventory list retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/low-stock",
     *     summary="List Low Stock Items",
     *     description="Retrieve paginated list of SKUs where available stock is less than or equal to low stock threshold.",
     *     operationId="adminListLowStockInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Low stock items retrieved successfully")
     * )
     */
    public function lowStock(Request $request): JsonResponse
    {
        return $this->alerts($request);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/alerts",
     *     summary="Inventory Stock Alerts",
     *     description="Retrieve low-stock and out-of-stock items requiring attention.",
     *     operationId="adminInventoryAlerts",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory alerts retrieved successfully")
     * )
     */
    public function alerts(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $warehouseId = $request->input('warehouse_id') ? (int) $request->input('warehouse_id') : null;
        $items = $this->inventoryService->getAlerts($perPage, $warehouseId);

        return $this->paginatedResponse($items, 'Inventory alerts retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/{variant_id}",
     *     summary="Single Variant Inventory Details",
     *     description="Retrieve inventory breakdown, thresholds, unit cost, location code, and transactions for a specific variant.",
     *     operationId="adminShowVariantInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="variant_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Variant inventory retrieved successfully")
     * )
     */
    public function show(int $variantId, Request $request): JsonResponse
    {
        $warehouseId = $request->input('warehouse_id') ? (int) $request->input('warehouse_id') : null;
        $inventory = $this->inventoryService->getVariantInventory($variantId, $warehouseId);

        return $this->successResponse($inventory, 'Variant inventory retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/adjust",
     *     summary="Adjust Stock Quantity & Properties",
     *     description="Perform atomic stock adjustment (add, deduct, set, damage) with warehouse_id, cost_price, reorder_qty, allow_backorders, location_code, mandatory reason, and optional remarks.",
     *     operationId="adminAdjustStock",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","type","quantity","reason"},
     *             @OA\Property(property="product_variant_id", type="integer", example=1),
     *             @OA\Property(property="warehouse_id", type="integer", nullable=true, example=1),
     *             @OA\Property(property="type", type="string", enum={"add","deduct","set","damage"}, example="add"),
     *             @OA\Property(property="quantity", type="integer", example=10),
     *             @OA\Property(property="cost_price", type="number", format="float", example=450.00),
     *             @OA\Property(property="low_stock_threshold", type="integer", nullable=true, example=10),
     *             @OA\Property(property="reorder_qty", type="integer", nullable=true, example=50),
     *             @OA\Property(property="allow_backorder", type="boolean", example=false),
     *             @OA\Property(property="location_code", type="string", example="Aisle 3, Shelf B"),
     *             @OA\Property(property="reason", type="string", example="Supplier Restock"),
     *             @OA\Property(property="remarks", type="string", example="PO #9842 received")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock adjusted successfully"),
     *     @OA\Response(response=422, description="Validation failed")
     * )
     */
    public function adjust(AdjustStockRequest $request): JsonResponse
    {
        $adminId = $request->user()?->id;
        $result = $this->inventoryService->adjustStock($request->validated(), 'add', 0, '', null, $adminId);

        return $this->successResponse($result, 'Stock adjusted successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/transfer",
     *     summary="Inter-Warehouse Stock Transfer",
     *     description="Atomically transfer stock quantity from a source warehouse to a target destination warehouse with transaction audit log.",
     *     operationId="adminTransferStock",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","source_warehouse_id","target_warehouse_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer", example=1),
     *             @OA\Property(property="source_warehouse_id", type="integer", example=1),
     *             @OA\Property(property="target_warehouse_id", type="integer", example=2),
     *             @OA\Property(property="quantity", type="integer", example=15),
     *             @OA\Property(property="remarks", type="string", example="Balancing regional stock levels")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock transferred successfully")
     * )
     */
    public function transfer(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'source_warehouse_id' => 'required|exists:warehouses,id',
            'target_warehouse_id' => 'required|exists:warehouses,id|different:source_warehouse_id',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        $adminId = $request->user()?->id;
        $result = $this->inventoryService->transferStock(
            (int) $request->input('product_variant_id'),
            (int) $request->input('source_warehouse_id'),
            (int) $request->input('target_warehouse_id'),
            (int) $request->input('quantity'),
            (string) $request->input('remarks', ''),
            $adminId
        );

        return $this->successResponse($result, 'Stock transferred successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/reserve",
     *     summary="Reserve Stock Endpoint",
     *     description="Atomic stock reservation endpoint.",
     *     operationId="adminReserveStock",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer", example=1),
     *             @OA\Property(property="quantity", type="integer", example=2),
     *             @OA\Property(property="warehouse_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock reserved successfully")
     * )
     */
    public function reserve(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->reserveStock(
            $request->input('product_variant_id'),
            $request->input('quantity'),
            $request->input('reference_type'),
            $request->input('reference_id'),
            $request->input('remarks'),
            $request->input('warehouse_id')
        );

        return $this->successResponse($inventory, 'Stock reserved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/release",
     *     summary="Release Reserved Stock",
     *     description="Atomic stock release endpoint.",
     *     operationId="adminReleaseStock",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer", example=1),
     *             @OA\Property(property="quantity", type="integer", example=2),
     *             @OA\Property(property="warehouse_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock released successfully")
     * )
     */
    public function release(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->releaseStock(
            $request->input('product_variant_id'),
            $request->input('quantity'),
            $request->input('reference_type'),
            $request->input('reference_id'),
            $request->input('remarks'),
            $request->input('warehouse_id')
        );

        return $this->successResponse($inventory, 'Stock released successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/commit",
     *     summary="Commit Stock Shipment",
     *     description="Atomic stock commitment upon order shipment.",
     *     operationId="adminCommitStock",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer", example=1),
     *             @OA\Property(property="quantity", type="integer", example=2),
     *             @OA\Property(property="warehouse_id", type="integer", nullable=true, example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock committed successfully")
     * )
     */
    public function commit(Request $request): JsonResponse
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->commitStock(
            $request->input('product_variant_id'),
            $request->input('quantity'),
            $request->input('reference_type'),
            $request->input('reference_id'),
            $request->input('remarks'),
            $request->input('warehouse_id')
        );

        return $this->successResponse($inventory, 'Stock committed successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/transactions",
     *     summary="List Inventory Transactions",
     *     description="Retrieve paginated inventory transaction audit trail logs with search, SKU, transaction type, and warehouse filters.",
     *     operationId="adminListInventoryTransactions",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="sku", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="transaction_type", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory transactions retrieved successfully")
     * )
     */
    public function transactions(Request $request): JsonResponse
    {
        return $this->history($request);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/history",
     *     summary="List Inventory Audit History (Alias)",
     *     description="Retrieve paginated inventory transaction audit trail logs.",
     *     operationId="adminListInventoryHistory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="sku", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="transaction_type", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory history retrieved successfully")
     * )
     */
    public function history(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'sku', 'product_variant_id', 'transaction_type', 'warehouse_id']);
        $perPage = (int) $request->input('per_page', 15);

        $transactions = $this->inventoryService->getHistory($filters, $perPage);

        return $this->paginatedResponse($transactions, 'Inventory history retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/import",
     *     summary="Bulk Stock Audit CSV Import",
     *     description="Upload CSV file to perform bulk stock level audits across SKUs for a specified warehouse.",
     *     operationId="adminImportInventoryCsv",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"file"},
     *                 @OA\Property(property="file", type="string", format="binary"),
     *                 @OA\Property(property="warehouse_id", type="integer", nullable=true, example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bulk inventory CSV imported successfully")
     * )
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'warehouse_id' => 'nullable|exists:warehouses,id',
        ]);

        $adminId = $request->user()?->id;
        $result = $this->inventoryService->importCsv(
            $request->file('file'),
            $request->input('warehouse_id'),
            $adminId
        );

        return $this->successResponse($result, 'Bulk inventory CSV imported successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/sample-template",
     *     summary="Download Sample Stock Import CSV Template",
     *     description="Download sample ready-to-fill CSV template for bulk inventory audits.",
     *     operationId="adminDownloadSampleInventoryCsv",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Sample CSV file streamed successfully")
     * )
     */
    public function sampleTemplate(): Response
    {
        $csvContent = $this->inventoryService->getSampleCsvTemplate();

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="bulk-stock-import-template.csv"',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/export",
     *     summary="Export Inventory to CSV",
     *     description="Stream CSV download containing current inventory stock levels and location codes.",
     *     operationId="adminExportInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="warehouse_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="CSV file streamed successfully")
     * )
     */
    public function export(Request $request): Response
    {
        $warehouseId = $request->input('warehouse_id') ? (int) $request->input('warehouse_id') : null;
        $csvContent = $this->inventoryService->exportCsv($warehouseId);
        $filename = 'inventory-export-' . date('Y-m-d-His') . '.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
