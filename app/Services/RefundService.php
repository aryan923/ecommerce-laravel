<?php

namespace App\Services;

use App\Models\AdminUser;
use App\Models\CustomerBankAccount;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RefundService
{
    /**
     * Get executive dashboard stats for refunds.
     */
    public function getDashboardStats(): array
    {
        $totalRefundsCount = Refund::count();
        $completedRefundsCount = Refund::where('status', 'completed')->count();
        $pendingRefundsCount = Refund::where('status', 'pending')->count();
        $failedRefundsCount = Refund::where('status', 'failed')->count();

        $totalRefundedAmount = (float) Refund::where('status', 'completed')->sum('amount');
        $gatewayRefundedAmount = (float) Refund::where('status', 'completed')->where('refund_channel', 'original_gateway')->sum('amount');
        $bankTransferRefundedAmount = (float) Refund::where('status', 'completed')->where('refund_channel', 'bank_transfer')->sum('amount');
        $storeCreditRefundedAmount = (float) Refund::where('status', 'completed')->where('refund_channel', 'store_credit')->sum('amount');

        return [
            'total_refunds_count' => $totalRefundsCount,
            'completed_refunds_count' => $completedRefundsCount,
            'pending_refunds_count' => $pendingRefundsCount,
            'failed_refunds_count' => $failedRefundsCount,
            'total_refunded_amount' => $totalRefundedAmount,
            'gateway_refunded_amount' => $gatewayRefundedAmount,
            'bank_transfer_refunded_amount' => $bankTransferRefundedAmount,
            'store_credit_refunded_amount' => $storeCreditRefundedAmount,
        ];
    }

    /**
     * Process full or partial refund for an order / return.
     *
     * @throws ValidationException
     */
    public function processRefund(array $data, $admin = null): Refund
    {
        $order = Order::with('payments')->findOrFail($data['order_id']);
        $amount = (float) $data['amount'];

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Refund amount must be greater than zero.'],
            ]);
        }

        // Calculate previously completed refunds for this order
        $alreadyRefunded = (float) Refund::where('order_id', $order->id)
            ->where('status', 'completed')
            ->sum('amount');

        $maxRefundable = max(0, (float) $order->grand_total - $alreadyRefunded);

        if ($amount > $maxRefundable) {
            throw ValidationException::withMessages([
                'amount' => ["Refund amount ({$amount}) exceeds the remaining refundable balance ({$maxRefundable}) for this order."],
            ]);
        }

        $payment = Payment::where('order_id', $order->id)->first();
        $refundChannel = $data['refund_channel'] ?? 'original_gateway';
        $gateway = $data['gateway'] ?? ($payment?->gateway ?? 'manual');

        // Handle Bank Account details snapshot for manual bank transfers
        $bankAccountId = $data['bank_account_id'] ?? null;
        $bankDetailsSnapshot = $data['bank_details_snapshot'] ?? null;

        if ($refundChannel === 'bank_transfer') {
            if ($bankAccountId) {
                $bankAccount = CustomerBankAccount::find($bankAccountId);
                if ($bankAccount) {
                    $bankDetailsSnapshot = $bankAccount->toSnapshot();
                }
            } elseif (!empty($data['bank_details'])) {
                $bankDetailsSnapshot = $data['bank_details'];
            }

            // Fallback to return request's bank details if available
            if (!$bankDetailsSnapshot && !empty($data['return_id'])) {
                $linkedReturn = ReturnRequest::find($data['return_id']);
                if ($linkedReturn && $linkedReturn->bank_details_snapshot) {
                    $bankDetailsSnapshot = $linkedReturn->bank_details_snapshot;
                    $bankAccountId = $linkedReturn->bank_account_id;
                }
            }

            if (!$bankDetailsSnapshot && !$bankAccountId) {
                throw ValidationException::withMessages([
                    'bank_details' => ['Customer bank account details are required for manual bank transfer payouts.'],
                ]);
            }
        }

        $adminId = ($admin instanceof AdminUser) ? $admin->id : null;
        $gatewayRefundId = $data['gateway_refund_id'] ?? null;
        $transactionReference = $data['transaction_reference'] ?? null;

        if ($refundChannel === 'original_gateway' && !$gatewayRefundId) {
            $gatewayRefundId = 'GW_RFD_' . strtoupper(uniqid());
        }

        return DB::transaction(function () use ($order, $payment, $amount, $gateway, $refundChannel, $bankAccountId, $bankDetailsSnapshot, $gatewayRefundId, $transactionReference, $data, $adminId, $admin) {
            $refund = Refund::create([
                'refund_number' => Refund::generateRefundNumber(),
                'order_id' => $order->id,
                'payment_id' => $payment?->id,
                'return_id' => $data['return_id'] ?? null,
                'bank_account_id' => $bankAccountId,
                'amount' => $amount,
                'reason' => $data['reason'],
                'gateway' => $gateway,
                'refund_channel' => $refundChannel,
                'gateway_refund_id' => $gatewayRefundId,
                'transaction_reference' => $transactionReference,
                'status' => 'completed',
                'processed_by' => $adminId,
                'payload' => $data['payload'] ?? null,
                'bank_details_snapshot' => $bankDetailsSnapshot,
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

            $authorUserId = ($admin instanceof User) ? $admin->id : null;
            $channelLabel = match ($refundChannel) {
                'original_gateway' => "Original Gateway ({$gateway})",
                'bank_transfer' => "Bank Transfer (UTR: " . ($transactionReference ?: 'N/A') . ")",
                'store_credit' => "Store Credit",
                default => "Manual / Cash",
            };

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $authorUserId,
                'status' => 'refunded',
                'comment' => "Refund {$refund->refund_number} of {$order->currency} {$amount} processed via {$channelLabel}. Reason: {$refund->reason}",
            ]);

            return $refund->load(['order', 'payment', 'returnRequest', 'processor', 'bankAccount']);
        });
    }

    /**
     * Admin list refund transaction records with multi-filters and search.
     */
    public function listAdminRefunds(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Refund::with([
            'order:id,order_number,currency,grand_total,payment_method,created_at',
            'payment:id,payment_id,gateway,status,amount',
            'returnRequest:id,return_number,status,reason',
            'processor:id,name,email',
            'bankAccount',
        ]);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['gateway'])) {
            $query->where('gateway', $filters['gateway']);
        }

        if (!empty($filters['refund_channel'])) {
            $query->where('refund_channel', $filters['refund_channel']);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('refund_number', 'like', "%{$search}%")
                  ->orWhere('gateway_refund_id', 'like', "%{$search}%")
                  ->orWhere('transaction_reference', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, ['created_at', 'refund_number', 'amount', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Get single refund transaction record details.
     */
    public function getRefundDetails(int $id): Refund
    {
        return Refund::with([
            'order.items',
            'payment',
            'returnRequest.items',
            'processor',
            'bankAccount',
        ])->findOrFail($id);
    }

    /**
     * Retry failed refund transaction.
     */
    public function retryRefund(int $id, $admin = null): Refund
    {
        $refund = Refund::with(['order', 'payment'])->findOrFail($id);

        if ($refund->status === 'completed') {
            throw ValidationException::withMessages([
                'refund' => ['This refund has already been completed.'],
            ]);
        }

        return DB::transaction(function () use ($refund, $admin) {
            $refund->status = 'completed';
            $refund->completed_at = now();
            $adminId = ($admin instanceof AdminUser) ? $admin->id : null;
            if ($adminId) {
                $refund->processed_by = $adminId;
            }
            $refund->save();

            $authorUserId = ($admin instanceof User) ? $admin->id : null;
            OrderHistory::create([
                'order_id' => $refund->order_id,
                'user_id' => $authorUserId,
                'status' => 'refund_retried',
                'comment' => "Refund {$refund->refund_number} retried and marked completed.",
            ]);

            return $refund->fresh(['order', 'payment', 'returnRequest', 'processor', 'bankAccount']);
        });
    }
}
