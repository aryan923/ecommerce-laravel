<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\AdjustInventoryRequest;
use App\Http\Requests\Admin\ReserveInventoryRequest;
use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class InventoryController extends BaseController
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory",
     *     summary="List Inventory Records (Admin)",
     *     description="Retrieve paginated list of variant inventory levels with SKU search and stock status filters.",
     *     operationId="adminListInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"in_stock","low_stock","out_of_stock"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory records retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        $inventories = $this->inventoryService->list($filters, $perPage);

        return $this->paginatedResponse($inventories, 'Inventory records retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/dashboard",
     *     summary="Get Inventory Dashboard Summary (Admin)",
     *     description="Retrieve key inventory metrics including total SKUs, total units, low stock count, and valuation.",
     *     operationId="adminGetInventoryDashboard",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Inventory dashboard metrics retrieved successfully")
     * )
     */
    public function dashboard(): JsonResponse
    {
        $metrics = $this->inventoryService->getDashboardMetrics();
        return $this->successResponse($metrics, 'Inventory dashboard metrics retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/alerts",
     *     summary="Get Low & Out of Stock Alerts (Admin)",
     *     description="Fetch paginated list of items with stock at or below low stock threshold.",
     *     operationId="adminGetInventoryAlerts",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory alerts retrieved successfully")
     * )
     */
    public function alerts(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $alerts = $this->inventoryService->getAlerts($perPage);

        return $this->paginatedResponse($alerts, 'Inventory alerts retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/history",
     *     summary="Get Inventory Transaction Audit Trail (Admin)",
     *     description="Retrieve paginated history of all stock movements and adjustments.",
     *     operationId="adminGetInventoryHistory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="sku", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="product_variant_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="transaction_type", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Inventory audit history retrieved successfully")
     * )
     */
    public function history(Request $request): JsonResponse
    {
        $filters = $request->only(['sku', 'product_variant_id', 'transaction_type']);
        $perPage = (int) $request->input('per_page', 15);

        $history = $this->inventoryService->getHistory($filters, $perPage);

        return $this->paginatedResponse($history, 'Inventory audit history retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/inventory/{variant_id}",
     *     summary="Get Variant Inventory Detail (Admin)",
     *     description="Fetch single inventory record details by variant ID.",
     *     operationId="adminGetInventoryDetail",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="variant_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Inventory detail retrieved successfully"),
     *     @OA\Response(response=404, description="Inventory not found")
     * )
     */
    public function show(int $variantId): JsonResponse
    {
        $inventory = Inventory::with(['variant.product', 'transactions.admin'])
            ->where('product_variant_id', $variantId)
            ->firstOrFail();

        return $this->successResponse($inventory, 'Inventory detail retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/adjust",
     *     summary="Manual Stock Adjustment (Admin)",
     *     description="Add, deduct, override, or mark damaged stock for a product variant with pessimistic row locking.",
     *     operationId="adminAdjustInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","adjustment_type","quantity","remarks"},
     *             @OA\Property(property="product_variant_id", type="integer"),
     *             @OA\Property(property="adjustment_type", type="string", enum={"add","deduct","set","damage"}),
     *             @OA\Property(property="quantity", type="integer", minimum=0),
     *             @OA\Property(property="low_stock_threshold", type="integer", minimum=0),
     *             @OA\Property(property="remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Inventory stock adjusted successfully"),
     *     @OA\Response(response=422, description="Validation or insufficient stock error")
     * )
     */
    public function adjust(AdjustInventoryRequest $request): JsonResponse
    {
        $inventory = $this->inventoryService->adjustStock(
            (int) $request->input('product_variant_id'),
            $request->input('adjustment_type'),
            (int) $request->input('quantity'),
            $request->input('remarks'),
            $request->filled('low_stock_threshold') ? (int) $request->input('low_stock_threshold') : null,
            $request->user()?->id
        );

        return $this->successResponse($inventory, 'Inventory stock adjusted successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/reserve",
     *     summary="Atomic Stock Reservation (Admin / Internal)",
     *     description="Reserve available stock for checkout/order placement.",
     *     operationId="adminReserveInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer"),
     *             @OA\Property(property="quantity", type="integer", minimum=1),
     *             @OA\Property(property="reference_type", type="string"),
     *             @OA\Property(property="reference_id", type="integer"),
     *             @OA\Property(property="remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock reserved successfully"),
     *     @OA\Response(response=422, description="Insufficient stock available")
     * )
     */
    public function reserve(ReserveInventoryRequest $request): JsonResponse
    {
        $inventory = $this->inventoryService->reserveStock(
            (int) $request->input('product_variant_id'),
            (int) $request->input('quantity'),
            $request->input('reference_type'),
            $request->filled('reference_id') ? (int) $request->input('reference_id') : null,
            $request->input('remarks')
        );

        return $this->successResponse($inventory, 'Stock reserved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/release",
     *     summary="Atomic Stock Release (Admin / Internal)",
     *     description="Release reserved stock back to available pool upon order cancellation or timeout.",
     *     operationId="adminReleaseInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer"),
     *             @OA\Property(property="quantity", type="integer", minimum=1),
     *             @OA\Property(property="reference_type", type="string"),
     *             @OA\Property(property="reference_id", type="integer"),
     *             @OA\Property(property="remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock released successfully")
     * )
     */
    public function release(ReserveInventoryRequest $request): JsonResponse
    {
        $inventory = $this->inventoryService->releaseStock(
            (int) $request->input('product_variant_id'),
            (int) $request->input('quantity'),
            $request->input('reference_type'),
            $request->filled('reference_id') ? (int) $request->input('reference_id') : null,
            $request->input('remarks')
        );

        return $this->successResponse($inventory, 'Reserved stock released successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/inventory/commit",
     *     summary="Atomic Stock Commit / Shipment (Admin / Internal)",
     *     description="Commit reserved stock upon order fulfillment/shipment.",
     *     operationId="adminCommitInventory",
     *     tags={"Admin Inventory Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_variant_id","quantity"},
     *             @OA\Property(property="product_variant_id", type="integer"),
     *             @OA\Property(property="quantity", type="integer", minimum=1),
     *             @OA\Property(property="reference_type", type="string"),
     *             @OA\Property(property="reference_id", type="integer"),
     *             @OA\Property(property="remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stock committed successfully")
     * )
     */
    public function commit(ReserveInventoryRequest $request): JsonResponse
    {
        $inventory = $this->inventoryService->commitStock(
            (int) $request->input('product_variant_id'),
            (int) $request->input('quantity'),
            $request->input('reference_type'),
            $request->filled('reference_id') ? (int) $request->input('reference_id') : null,
            $request->input('remarks')
        );

        return $this->successResponse($inventory, 'Stock committed for shipment successfully.');
    }
}
