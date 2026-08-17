<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Admin Orders",
 *     description="Admin Order Management & Storefront Order Fulfillment APIs"
 * )
 */
class OrderAdminController extends Controller
{
    protected AdminOrderService $orderService;

    public function __construct(AdminOrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/orders/stats",
     *     summary="Get order statistics for admin dashboard",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Order statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_orders", type="integer", example=120),
     *                 @OA\Property(property="pending_orders", type="integer", example=15),
     *                 @OA\Property(property="confirmed_orders", type="integer", example=35),
     *                 @OA\Property(property="processing_orders", type="integer", example=20),
     *                 @OA\Property(property="shipped_orders", type="integer", example=25),
     *                 @OA\Property(property="delivered_orders", type="integer", example=20),
     *                 @OA\Property(property="cancelled_orders", type="integer", example=5),
     *                 @OA\Property(property="total_revenue", type="number", format="float", example=45250.50)
     *             )
     *         )
     *     )
     * )
     */
    public function stats(): JsonResponse
    {
        $stats = $this->orderService->getDashboardStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/orders",
     *     summary="Get paginated list of store orders with search and multi-filtering",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="search", in="query", required=false, description="Order #, Customer Name/Email/Mobile, SKU", @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, description="Order status filter", @OA\Schema(type="string")),
     *     @OA\Parameter(name="payment_method", in="query", required=false, description="Payment method filter", @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_from", in="query", required=false, description="YYYY-MM-DD", @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_to", in="query", required=false, description="YYYY-MM-DD", @OA\Schema(type="string")),
     *     @OA\Parameter(name="min_amount", in="query", required=false, description="Minimum order total", @OA\Schema(type="number")),
     *     @OA\Parameter(name="max_amount", in="query", required=false, description="Maximum order total", @OA\Schema(type="number")),
     *     @OA\Parameter(name="page", in="query", required=false, description="Page number", @OA\Schema(type="integer", default=1)),
     *     @OA\Parameter(name="per_page", in="query", required=false, description="Items per page", @OA\Schema(type="integer", default=15)),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated orders catalog retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'status',
            'payment_method',
            'date_from',
            'date_to',
            'min_amount',
            'max_amount',
            'sort_by',
            'sort_order',
        ]);

        $perPage = (int) $request->input('per_page', 15);
        $orders = $this->orderService->list($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/orders/{id}",
     *     summary="Get complete 360 details for an order",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Order ID", @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Order details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->orderService->getDetails($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/orders/{id}/status",
     *     summary="Update order status and log audit history",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Order ID", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", example="confirmed"),
     *             @OA\Property(property="comment", type="string", example="Order verified by admin staff.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order status updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Order status updated successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending_payment,paid,confirmed,processing,shipped,delivered,cancelled,failed',
            'comment' => 'nullable|string|max:1000',
        ]);

        $order = $this->orderService->updateStatus(
            $id,
            $request->input('status'),
            $request->input('comment'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => "Order status updated to '" . strtoupper($order->status) . "'.",
            'data' => $order,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/orders/{id}/shipment",
     *     summary="Create shipment record and assign tracking details",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Order ID", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"courier_name"},
     *             @OA\Property(property="courier_name", type="string", example="FedEx Express"),
     *             @OA\Property(property="awb_number", type="string", example="AWB-987654321"),
     *             @OA\Property(property="tracking_number", type="string", example="TRK100987"),
     *             @OA\Property(property="provider", type="string", example="fedex")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Shipment created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Shipment created and order marked as shipped."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function createShipment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'courier_name' => 'required|string|max:191',
            'awb_number' => 'nullable|string|max:191',
            'tracking_number' => 'nullable|string|max:191',
            'provider' => 'nullable|string|max:191',
        ]);

        $shipment = $this->orderService->createShipment($id, $request->all(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Shipment created and tracking attached successfully.',
            'data' => $shipment,
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/orders/{id}/notes",
     *     summary="Update internal staff notes on order",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Order ID", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="notes", type="string", example="Customer requested delivery after 5 PM.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Internal notes updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Internal admin notes saved successfully.")
     *         )
     *     )
     * )
     */
    public function updateNotes(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:2000',
        ]);

        $order = $this->orderService->updateAdminNotes($id, $request->input('notes'));

        return response()->json([
            'success' => true,
            'message' => 'Internal admin notes saved successfully.',
            'data' => $order,
        ]);
    }
}
