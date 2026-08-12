<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\CheckoutProcessRequest;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends BaseController
{
    protected CheckoutService $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/checkout/process",
     *     summary="Process checkout and place purchase order",
     *     description="Transactional order creation endpoint supporting guest and customer carts, idempotency protection, atomic stock reservation, historical item snapshotting, and payment initialization.",
     *     tags={"Checkout & Orders"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, description="Guest Session ID", @OA\Schema(type="string")),
     *     @OA\Parameter(name="X-Idempotency-Key", in="header", required=false, description="Duplicate prevention key", @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"payment_method"},
     *             @OA\Property(property="payment_method", type="string", enum={"cod", "razorpay", "stripe", "bank_transfer"}, example="cod"),
     *             @OA\Property(property="shipping_address_id", type="integer", example=1),
     *             @OA\Property(
     *                 property="shipping_address",
     *                 type="object",
     *                 @OA\Property(property="address_line1", type="string", example="123 Main St"),
     *                 @OA\Property(property="city", type="string", example="Mumbai"),
     *                 @OA\Property(property="state_code", type="string", example="MH"),
     *                 @OA\Property(property="postal_code", type="string", example="400001")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Order placed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Order placed successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="order_number", type="string", example="ORD-20260812-1001"),
     *                 @OA\Property(property="grand_total", type="number", format="float", example=1180.00),
     *                 @OA\Property(property="status", type="string", example="pending_payment")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error or out of stock")
     * )
     */
    public function process(CheckoutProcessRequest $request): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $sessionId = $request->header('X-Session-ID');
        $idempotencyHeader = $request->header('X-Idempotency-Key');

        $order = $this->checkoutService->processCheckout(
            $request->validated(),
            $user,
            $sessionId,
            $idempotencyHeader
        );

        $statusCode = $order->wasRecentlyCreated ? 201 : 200;

        return $this->successResponse($order, 'Order placed successfully.', $statusCode);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/orders/{order_number}",
     *     summary="Fetch customer order details",
     *     tags={"Checkout & Orders"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="order_number", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Order details retrieved successfully")
     * )
     */
    public function show(string $orderNumber, Request $request): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $query = Order::with(['items', 'payments', 'histories'])
            ->where('order_number', $orderNumber);

        if ($user) {
            $query->where('user_id', $user->id);
        }

        $order = $query->firstOrFail();

        return $this->successResponse($order, 'Order details retrieved successfully.');
    }
}
