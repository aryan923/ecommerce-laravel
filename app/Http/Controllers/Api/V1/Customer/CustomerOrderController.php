<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\CancelOrderRequest;
use App\Services\CustomerOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends BaseController
{
    protected CustomerOrderService $customerOrderService;

    public function __construct(CustomerOrderService $customerOrderService)
    {
        $this->customerOrderService = $customerOrderService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/orders",
     *     summary="List authenticated customer orders with filters and pagination",
     *     tags={"Customer Orders"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, description="Filter by status", @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, description="Search by order number", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated order list",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Customer orders retrieved successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $orders = $this->customerOrderService->getCustomerOrders($user, $filters, $perPage);

        return $this->successResponse($orders, 'Customer orders retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/orders/{order_number}",
     *     summary="Fetch customer order details",
     *     tags={"Customer Orders"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="order_number", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Order details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Order details retrieved successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Order not found or unauthorized")
     * )
     */
    public function show(string $orderNumber, Request $request): JsonResponse
    {
        $user = $request->user();
        $order = $this->customerOrderService->getOrderDetail($user, $orderNumber);

        return $this->successResponse($order, 'Order details retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/orders/{order_number}/tracking",
     *     summary="Fetch live order progress step timeline and shipment tracking",
     *     tags={"Customer Orders"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="order_number", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Order tracking timeline retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Order tracking timeline retrieved successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function tracking(string $orderNumber, Request $request): JsonResponse
    {
        $user = $request->user();
        $tracking = $this->customerOrderService->getOrderTracking($user, $orderNumber);

        return $this->successResponse($tracking, 'Order tracking timeline retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customer/orders/{order_number}/cancel",
     *     summary="Cancel customer order and release reserved stock",
     *     tags={"Customer Orders"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="order_number", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reason"},
     *             @OA\Property(property="reason", type="string", example="changed_mind"),
     *             @OA\Property(property="comments", type="string", example="Found alternative product")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order cancelled successfully and stock released",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Order cancelled successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Order cannot be cancelled in current status")
     * )
     */
    public function cancel(string $orderNumber, CancelOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $order = $this->customerOrderService->cancelOrder(
            $user,
            $orderNumber,
            $request->input('reason'),
            $request->input('comments')
        );

        return $this->successResponse($order, 'Order cancelled successfully.');
    }
}
