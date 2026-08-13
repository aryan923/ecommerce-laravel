<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Payment;
use App\Services\Payment\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentAdminController extends BaseController
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/payments",
     *     summary="Admin list payment transactions with pagination & filters",
     *     tags={"Admin Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="gateway", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Paginated payments list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['order', 'order.user']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->input('gateway'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('gateway_order_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $payments = $query->orderBy('id', 'desc')->paginate($perPage);

        return $this->successResponse($payments, 'Payment records retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/payments/{id}",
     *     summary="Fetch admin payment detail record",
     *     tags={"Admin Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Payment detail record")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $payment = Payment::with(['order', 'order.user', 'order.items'])->findOrFail($id);

        return $this->successResponse($payment, 'Payment detail retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/payments/{id}/mark-paid",
     *     summary="Manually mark COD/Offline payment as paid by Admin",
     *     tags={"Admin Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"transaction_id"},
     *             @OA\Property(property="transaction_id", type="string", example="COD-COLLECTED-9981"),
     *             @OA\Property(property="notes", type="string", example="Collected cash upon home delivery")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Payment marked as paid")
     * )
     */
    public function markPaid(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = Payment::with('order')->findOrFail($id);
        $admin = $request->user();

        $updatedPayment = $this->paymentService->markAsPaidByAdmin(
            $payment,
            $request->input('transaction_id'),
            $request->input('notes'),
            $admin
        );

        return $this->successResponse($updatedPayment, 'Payment manually marked as paid.');
    }
}
