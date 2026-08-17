<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Refund\ProcessRefundRequest;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class RefundAdminController extends BaseController
{
    protected RefundService $refundService;

    public function __construct(RefundService $refundService)
    {
        $this->refundService = $refundService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/refunds/stats",
     *     summary="Executive Refund Dashboard KPIs",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Refund statistics overview",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function stats(): JsonResponse
    {
        $stats = $this->refundService->getDashboardStats();
        return $this->successResponse($stats, 'Refund dashboard stats retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/refunds",
     *     summary="Admin list refund transaction records with pagination & filters",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="gateway", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="refund_channel", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_from", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="date_to", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="Paginated refund transaction logs")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'gateway', 'refund_channel', 'search', 'date_from', 'date_to', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 15);

        $refunds = $this->refundService->listAdminRefunds($filters, $perPage);

        return $this->successResponse($refunds, 'Refund transaction records retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/refunds/{id}",
     *     summary="Fetch single refund transaction details with frozen bank snapshots",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Refund record details")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $refund = $this->refundService->getRefundDetails($id);

        return $this->successResponse($refund, 'Refund details retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/refunds/process",
     *     summary="Process dual-channel refund (Original Gateway, Bank Transfer, Store Credit)",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id", "amount", "reason"},
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="return_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=500.00),
     *             @OA\Property(property="reason", type="string", example="Customer approved return payout"),
     *             @OA\Property(property="refund_channel", type="string", enum={"original_gateway", "bank_transfer", "store_credit", "manual_cash"}, example="bank_transfer"),
     *             @OA\Property(property="bank_account_id", type="integer", example=2),
     *             @OA\Property(property="transaction_reference", type="string", example="UTR9876543210")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Refund processed successfully"),
     *     @OA\Response(response=422, description="Invalid refund amount or parameters")
     * )
     */
    public function process(ProcessRefundRequest $request): JsonResponse
    {
        $admin = $request->user();
        $refund = $this->refundService->processRefund($request->validated(), $admin);

        return $this->successResponse($refund, 'Refund processed successfully.', 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/refunds/{id}/retry",
     *     summary="Retry failed refund transaction",
     *     tags={"Admin Refunds"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Refund retried successfully")
     * )
     */
    public function retry(int $id, Request $request): JsonResponse
    {
        $admin = $request->user();
        $refund = $this->refundService->retryRefund($id, $admin);

        return $this->successResponse($refund, 'Refund retried and completed successfully.');
    }
}
