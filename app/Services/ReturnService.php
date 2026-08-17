<?php

namespace App\Services;

use App\Models\AdminUser;
use App\Models\CustomerBankAccount;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Refund;
use App\Models\ReturnItem;
use App\Models\ReturnRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReturnService
{
    protected InventoryService $inventoryService;
    protected int $returnWindowDays = 7;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Customer submits return request for a delivered order.
     *
     * @throws ValidationException|ModelNotFoundException
     */
    public function createReturnRequest(User $user, array $data): ReturnRequest
    {
        $order = Order::with('items')
            ->where('id', $data['order_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($order->status !== 'delivered') {
            throw ValidationException::withMessages([
                'order' => ['Return requests can only be submitted for delivered orders.'],
            ]);
        }

        // Check 7-day return window policy
        $deliveryDate = $order->updated_at ?? $order->created_at;
        if (Carbon::now()->diffInDays($deliveryDate) > $this->returnWindowDays) {
            throw ValidationException::withMessages([
                'return_window' => ["Return request window ({$this->returnWindowDays} days) has expired for this order."],
            ]);
        }

        $requestedItems = $data['items'] ?? [];
        if (empty($requestedItems)) {
            throw ValidationException::withMessages([
                'items' => ['At least one return item must be selected.'],
            ]);
        }

        // Prepare bank details snapshot if provided or selected
        $bankAccountId = $data['bank_account_id'] ?? null;
        $bankDetailsSnapshot = null;

        if ($bankAccountId) {
            $bankAccount = CustomerBankAccount::where('user_id', $user->id)->find($bankAccountId);
            if ($bankAccount) {
                $bankDetailsSnapshot = $bankAccount->toSnapshot();
            }
        } elseif (!empty($data['bank_details'])) {
            $bankDetailsSnapshot = $data['bank_details'];
        }

        return DB::transaction(function () use ($order, $user, $data, $requestedItems, $bankAccountId, $bankDetailsSnapshot) {
            $returnRequest = ReturnRequest::create([
                'return_number' => ReturnRequest::generateReturnNumber(),
                'order_id' => $order->id,
                'user_id' => $user->id,
                'bank_account_id' => $bankAccountId,
                'status' => 'requested',
                'reason' => $data['reason'],
                'description' => $data['description'] ?? null,
                'images' => $data['images'] ?? null,
                'bank_details_snapshot' => $bankDetailsSnapshot,
            ]);

            foreach ($requestedItems as $reqItem) {
                $orderItem = OrderItem::where('order_id', $order->id)
                    ->where('id', $reqItem['order_item_id'])
                    ->firstOrFail();

                if ($reqItem['quantity'] > $orderItem->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => ["Return quantity cannot exceed purchased item quantity ({$orderItem->quantity})."],
                    ]);
                }

                ReturnItem::create([
                    'return_id' => $returnRequest->id,
                    'order_item_id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'product_variant_id' => $orderItem->product_variant_id,
                    'quantity' => $reqItem['quantity'],
                    'unit_price' => $orderItem->unit_price,
                    'refund_amount' => (float) $orderItem->unit_price * $reqItem['quantity'],
                ]);
            }

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'status' => 'return_requested',
                'comment' => "Return request {$returnRequest->return_number} submitted by customer.",
            ]);

            return $returnRequest->load(['items', 'order', 'bankAccount']);
        });
    }

    /**
     * Get paginated customer return requests.
     */
    public function getCustomerReturns(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return ReturnRequest::with(['items', 'order', 'bankAccount'])
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get customer return detail by return number.
     *
     * @throws ModelNotFoundException
     */
    public function getReturnDetail(User $user, string $returnNumber): ReturnRequest
    {
        return ReturnRequest::with(['items', 'order', 'refunds', 'bankAccount'])
            ->where('user_id', $user->id)
            ->where('return_number', $returnNumber)
            ->firstOrFail();
    }

    /**
     * Get executive dashboard stats for returns & refunds.
     */
    public function getDashboardStats(): array
    {
        $totalReturns = ReturnRequest::count();
        $requestedReturns = ReturnRequest::where('status', 'requested')->count();
        $underReviewReturns = ReturnRequest::where('status', 'under_review')->count();
        $approvedReturns = ReturnRequest::where('status', 'approved')->count();
        $pickupScheduledReturns = ReturnRequest::where('status', 'pickup_scheduled')->count();
        $receivedReturns = ReturnRequest::where('status', 'received')->count();
        $qualityCheckReturns = ReturnRequest::where('status', 'quality_check')->count();
        $approvedForRefundReturns = ReturnRequest::where('status', 'approved_for_refund')->count();
        $refundedReturns = ReturnRequest::where('status', 'refunded')->count();
        $rejectedReturns = ReturnRequest::where('status', 'rejected')->count();

        $totalRefundsVolume = (float) Refund::where('status', 'completed')->sum('amount');
        $totalRefundsCount = Refund::count();

        return [
            'total_returns' => $totalReturns,
            'requested_returns' => $requestedReturns,
            'pending_review_returns' => $requestedReturns + $underReviewReturns,
            'approved_returns' => $approvedReturns,
            'pickup_scheduled_returns' => $pickupScheduledReturns,
            'received_returns' => $receivedReturns,
            'quality_check_returns' => $qualityCheckReturns,
            'approved_for_refund_returns' => $approvedForRefundReturns,
            'refunded_returns' => $refundedReturns,
            'rejected_returns' => $rejectedReturns,
            'total_refunds_count' => $totalRefundsCount,
            'total_refunded_amount' => $totalRefundsVolume,
        ];
    }

    /**
     * Admin list return requests with multi-filters and search.
     */
    public function listAdminReturns(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = ReturnRequest::with([
            'order:id,order_number,status,currency,grand_total,payment_method,created_at',
            'user:id,name,email,mobile',
            'items.orderItem',
            'bankAccount',
            'refunds',
        ]);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  })
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
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

        if (in_array($sortBy, ['created_at', 'return_number', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Get 360 return detail for admin console.
     */
    public function getAdminReturnDetail(int $returnId): ReturnRequest
    {
        return ReturnRequest::with([
            'order.items',
            'order.payments',
            'user.bankAccounts',
            'bankAccount',
            'items.orderItem',
            'refunds.processor',
        ])->findOrFail($returnId);
    }

    /**
     * Update return milestone status by Admin.
     */
    public function updateReturnStatus(int $returnId, string $status, ?string $notes = null, $admin = null): ReturnRequest
    {
        $validStatuses = [
            'requested',
            'under_review',
            'approved',
            'rejected',
            'pickup_scheduled',
            'picked_up',
            'received',
            'quality_check',
            'approved_for_refund',
            'refunded',
            'closed',
        ];

        if (!in_array($status, $validStatuses)) {
            throw ValidationException::withMessages([
                'status' => ["Invalid status '{$status}'."],
            ]);
        }

        $return = ReturnRequest::with('order')->findOrFail($returnId);
        $oldStatus = $return->status;
        $return->status = $status;

        if ($notes) {
            $return->admin_notes = $notes;
        }

        if ($status === 'approved' && !$return->approved_at) {
            $return->approved_at = now();
        } elseif ($status === 'rejected' && !$return->rejected_at) {
            $return->rejected_at = now();
        }

        $return->save();

        if ($return->order) {
            $authorUserId = ($admin instanceof User) ? $admin->id : null;
            OrderHistory::create([
                'order_id' => $return->order_id,
                'user_id' => $authorUserId,
                'status' => "return_{$status}",
                'comment' => "Return {$return->return_number} status updated from '{$oldStatus}' to '{$status}'." . ($notes ? " Remarks: {$notes}" : ''),
            ]);
        }

        return $return->fresh(['items.orderItem', 'order', 'user', 'bankAccount', 'refunds']);
    }

    /**
     * Restock returned item variants into inventory via InventoryService.
     */
    public function restockReturnedItems(int $returnId, $admin = null): ReturnRequest
    {
        $return = ReturnRequest::with(['items', 'order'])->findOrFail($returnId);

        if ($return->restocked_at) {
            throw ValidationException::withMessages([
                'restock' => ["Return #{$return->return_number} items have already been restocked on {$return->restocked_at->toFormattedDateString()}."],
            ]);
        }

        DB::transaction(function () use ($return, $admin) {
            foreach ($return->items as $item) {
                if ($item->product_variant_id) {
                    $adminId = ($admin instanceof AdminUser) ? $admin->id : null;
                    $this->inventoryService->adjustStock(
                        $item->product_variant_id,
                        'add',
                        $item->quantity,
                        "Restocked returned item for Return {$return->return_number}",
                        null,
                        $adminId
                    );
                }
            }

            $return->restocked_at = now();
            $return->save();

            $authorUserId = ($admin instanceof User) ? $admin->id : null;
            OrderHistory::create([
                'order_id' => $return->order_id,
                'user_id' => $authorUserId,
                'status' => 'returned_restocked',
                'comment' => "Returned items for Return {$return->return_number} restocked into inventory.",
            ]);
        });

        return $return->fresh(['items.orderItem', 'order', 'user', 'bankAccount']);
    }
}
