<?php

namespace App\Services;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\ReturnRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RefundService
{
    /**
     * Process full or partial refund for an order / return.
     *
     * @throws ValidationException
     */
    public function processRefund(array $data, ?AdminUser $admin = null): Refund
    {
        $order = Order::with('payments')->findOrFail($data['order_id']);
        $amount = (float) $data['amount'];

        if ($amount <= 0 || $amount > (float) $order->grand_total) {
            throw ValidationException::withMessages([
                'amount' => ["Refund amount must be between 0.01 and {$order->grand_total}."],
            ]);
        }

        $payment = Payment::where('order_id', $order->id)->first();
        $gateway = $data['gateway'] ?? ($payment?->gateway ?? 'manual');

        return DB::transaction(function () use ($order, $payment, $amount, $gateway, $data, $admin) {
            $refund = Refund::create([
                'refund_number' => Refund::generateRefundNumber(),
                'order_id' => $order->id,
                'payment_id' => $payment?->id,
                'return_id' => $data['return_id'] ?? null,
                'amount' => $amount,
                'reason' => $data['reason'],
                'gateway' => $gateway,
                'gateway_refund_id' => $data['gateway_refund_id'] ?? ('RFD_TXN_' . time()),
                'status' => 'completed',
                'processed_by' => $admin?->id,
                'payload' => $data['payload'] ?? null,
                'completed_at' => now(),
            ]);

            // Update payment status
            if ($payment) {
                $totalRefunded = (float) Refund::where('order_id', $order->id)
                    ->where('status', 'completed')
                    ->sum('amount');

                if ($totalRefunded >= (float) $order->grand_total) {
                    $payment->status = 'refunded';
                } else {
                    $payment->status = 'partially_refunded';
                }
                $payment->save();
            }

            // Update return status if associated
            if (!empty($data['return_id'])) {
                $returnRequest = ReturnRequest::find($data['return_id']);
                if ($returnRequest) {
                    $returnRequest->status = 'refunded';
                    $returnRequest->save();
                }
            }

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'status' => 'refunded',
                'comment' => "Refund {$refund->refund_number} of {$amount} {$order->currency} processed via {$gateway}.",
            ]);

            return $refund->load(['order', 'payment', 'returnRequest']);
        });
    }

    /**
     * Admin list refund transaction records.
     */
    public function listAdminRefunds(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Refund::with(['order', 'payment', 'returnRequest', 'processor']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['gateway'])) {
            $query->where('gateway', $filters['gateway']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('refund_number', 'like', "%{$search}%")
                  ->orWhere('gateway_refund_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }
}
