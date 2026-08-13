<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Http\Requests\Payment\VerifyPaymentRequest;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends BaseController
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/payments/methods",
     *     summary="List active payment gateways and check COD availability",
     *     tags={"Payments"},
     *     @OA\Parameter(name="amount", in="query", required=false, description="Order total amount", @OA\Schema(type="number", format="float")),
     *     @OA\Parameter(name="postal_code", in="query", required=false, description="Delivery postal code", @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Available payment methods list",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Payment methods retrieved successfully."),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function methods(Request $request): JsonResponse
    {
        $amount = $request->has('amount') ? (float) $request->input('amount') : null;
        $postalCode = $request->input('postal_code');

        $methods = $this->paymentService->getAvailableMethods($amount, $postalCode);

        return $this->successResponse($methods, 'Payment methods retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/payments/initiate",
     *     summary="Initiate payment for purchase order",
     *     tags={"Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id", "payment_method"},
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="payment_method", type="string", enum={"razorpay", "stripe", "cod"}, example="razorpay")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payment initiation session created",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Payment initiated successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error or order already paid")
     * )
     */
    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        $user = $request->user() ?? auth('sanctum')->user();
        $result = $this->paymentService->initiatePayment($request->validated(), $user);

        return $this->successResponse($result, 'Payment initiated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/payments/verify",
     *     summary="Verify gateway payment signature and confirm payment",
     *     tags={"Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id", "payment_method"},
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="payment_method", type="string", example="razorpay"),
     *             @OA\Property(property="razorpay_payment_id", type="string", example="pay_293847293"),
     *             @OA\Property(property="razorpay_order_id", type="string", example="order_9923847"),
     *             @OA\Property(property="razorpay_signature", type="string", example="9a8b7c6d5e...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payment verified and order status updated to paid",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Payment verified successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid signature or verification failed")
     * )
     */
    public function verify(VerifyPaymentRequest $request): JsonResponse
    {
        $payment = $this->paymentService->verifyPayment($request->validated());

        return $this->successResponse($payment, 'Payment verified successfully.');
    }
}
