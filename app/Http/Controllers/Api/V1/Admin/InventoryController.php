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
     *     description="Retrieve summary KPIs: total SKUs, total stock units, low stock count, out of stock count, reserved stock, damaged stock, and inventory value.",
     *     operationId="adminInventoryKpis",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="KPI metrics retrieved successfully")
     * )
     */
    public function kpis(): JsonResponse
    {
        return $this->dashboard();
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/dashboard",
     *     summary="Inventory Dashboard Summary Metrics",
     *     description="Retrieve summary metrics for inventory dashboard.",
     *     operationId="adminInventoryDashboardMetrics",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Dashboard metrics retrieved successfully")
     * )
     */
    public function dashboard(): JsonResponse
    {
        $kpis = $this->inventoryService->getDashboardMetrics();

        return $this->successResponse($kpis, 'Inventory dashboard metrics retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory",
     *     summary="List Inventory Items",
     *     description="Retrieve paginated inventory list with search, stock status, category, and brand filters.",
     *     operationId="adminListInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="stock_status", in="query", required=false, @OA\Schema(type="string", enum={"in_stock","low_stock","out_of_stock"})),
     *     @OA\Parameter(name="category_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="brand_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory list retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'stock_status', 'category_id', 'brand_id']);
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
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory alerts retrieved successfully")
     * )
     */
    public function alerts(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $items = $this->inventoryService->getAlerts($perPage);

        return $this->paginatedResponse($items, 'Inventory alerts retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/{variant_id}",
     *     summary="Single Variant Inventory Details",
     *     description="Retrieve inventory breakdown, thresholds, and transactions for a specific variant.",
     *     operationId="adminShowVariantInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="variant_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Variant inventory retrieved successfully")
     * )
     */
    public function show(int $variantId): JsonResponse
    {
        $inventory = $this->inventoryService->getVariantInventory($variantId);

        return $this->successResponse($inventory, 'Variant inventory retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/adjust",
     *     summary="Adjust Stock Quantity",
     *     description="Perform atomic stock adjustment (add, deduct, set, damage) with mandatory reason and optional remarks.",
     *     operationId="adminAdjustStock",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","type","quantity","reason"},
     *             @OA\Property(property="product_variant_id", type="integer", example=1),
     *             @OA\Property(property="type", type="string", enum={"add","deduct","set","damage"}, example="add"),
     *             @OA\Property(property="quantity", type="integer", example=10),
     *             @OA\Property(property="low_stock_threshold", type="integer", nullable=true, example=10),
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
        $result = $this->inventoryService->adjustStock($request->validated(), $adminId);

        return $this->successResponse($result, 'Stock adjusted successfully.');
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
     *             @OA\Property(property="quantity", type="integer", example=2)
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
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->reserveStock(
            $request->input('product_variant_id'),
            $request->input('quantity'),
            $request->input('reference_type'),
            $request->input('reference_id'),
            $request->input('remarks')
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
     *             @OA\Property(property="quantity", type="integer", example=2)
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
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->releaseStock(
            $request->input('product_variant_id'),
            $request->input('quantity'),
            $request->input('reference_type'),
            $request->input('reference_id'),
            $request->input('remarks')
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
     *             @OA\Property(property="quantity", type="integer", example=2)
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
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string',
        ]);

        $inventory = $this->inventoryService->commitStock(
            $request->input('product_variant_id'),
            $request->input('quantity'),
            $request->input('reference_type'),
            $request->input('reference_id'),
            $request->input('remarks')
        );

        return $this->successResponse($inventory, 'Stock committed successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/transactions",
     *     summary="List Inventory Transactions",
     *     description="Retrieve paginated inventory transaction audit trail logs.",
     *     operationId="adminListInventoryTransactions",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="sku", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="transaction_type", in="query", required=false, @OA\Schema(type="string")),
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
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory history retrieved successfully")
     * )
     */
    public function history(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'sku', 'product_variant_id', 'transaction_type']);
        $perPage = (int) $request->input('per_page', 15);

        $transactions = $this->inventoryService->getHistory($filters, $perPage);

        return $this->paginatedResponse($transactions, 'Inventory history retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/export",
     *     summary="Export Inventory to CSV",
     *     description="Stream CSV download containing current inventory stock levels.",
     *     operationId="adminExportInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="CSV file streamed successfully")
     * )
     */
    public function export(): Response
    {
        $csvContent = $this->inventoryService->exportCsv();
        $filename = 'inventory-export-' . date('Y-m-d-His') . '.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
