<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends BaseController
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/webhooks/payment/{gateway}",
     *     summary="Asynchronous payment gateway webhook receiver",
     *     tags={"Webhooks"},
     *     @OA\Parameter(name="gateway", in="path", required=true, description="Gateway provider (razorpay, stripe)", @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Webhook processed idempotently",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Webhook processed successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function handle(string $gateway, Request $request): JsonResponse
    {
        $payload = $request->all();
        $headers = $request->headers->all();

        $webhook = $this->paymentService->handleWebhook($gateway, $payload, $headers);

        return $this->successResponse($webhook, 'Webhook processed successfully.');
    }
}
