<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Refund\ProcessRefundRequest;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundAdminController extends BaseController
{
    protected RefundService $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/refunds",
     *     summary="Admin list refund transaction records with pagination & filters",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="gateway", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Paginated refund transaction logs")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'gateway', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $refunds = $this->refundService->listAdminRefunds($filters, $perPage);

        return $this->successResponse($refunds, 'Refund transaction records retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/refunds/process",
     *     summary="Process full or partial refund for order/return",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id", "amount", "reason"},
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="return_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="reason", type="string", example="Approved customer return refund"),
     *             @OA\Property(property="gateway", type="string", enum={"razorpay", "stripe", "manual", "store_credit"}, example="manual")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Refund processed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Refund processed successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid refund amount or parameters")
     * )
     */
    public function process(ProcessRefundRequest $request): JsonResponse
    {
        $admin = $request->user();
        $refund = $this->refundService->processRefund($request->validated(), $admin);

        return $this->successResponse($refund, 'Refund processed successfully.', 201);
    }
}
