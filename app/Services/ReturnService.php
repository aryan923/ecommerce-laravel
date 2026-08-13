<?php

namespace App\Services;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
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

        return DB::transaction(function () use ($order, $user, $data, $requestedItems) {
            $returnRequest = ReturnRequest::create([
                'return_number' => ReturnRequest::generateReturnNumber(),
                'order_id' => $order->id,
                'user_id' => $user->id,
                'status' => 'requested',
                'reason' => $data['reason'],
                'description' => $data['description'] ?? null,
                'images' => $data['images'] ?? null,
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

            return $returnRequest->load(['items', 'order']);
        });
    }

    /**
     * Get paginated customer return requests.
     */
    public function getCustomerReturns(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return ReturnRequest::with(['items', 'order'])
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
        return ReturnRequest::with(['items', 'order', 'refunds'])
            ->where('user_id', $user->id)
            ->where('return_number', $returnNumber)
            ->firstOrFail();
    }

    /**
     * Admin list return requests with filters.
     */
    public function listAdminReturns(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = ReturnRequest::with(['order', 'user', 'items']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Update return milestone status by Admin.
     */
    public function updateReturnStatus(int $returnId, string $status, ?string $notes = null, ?AdminUser $admin = null): ReturnRequest
    {
        $return = ReturnRequest::with('order')->findOrFail($returnId);
        $return->status = $status;
        $return->admin_notes = $notes ?? $return->admin_notes;

        if ($status === 'approved' && !$return->approved_at) {
            $return->approved_at = now();
        } elseif ($status === 'rejected' && !$return->rejected_at) {
            $return->rejected_at = now();
        }

        $return->save();

        if ($return->order) {
            OrderHistory::create([
                'order_id' => $return->order_id,
                'user_id' => $return->order->user_id,
                'status' => "return_{$status}",
                'comment' => "Return {$return->return_number} status updated to {$status}." . ($notes ? " Notes: {$notes}" : ''),
            ]);
        }

        return $return;
    }

    /**
     * Restock returned item variants into inventory via InventoryService.
     */
    public function restockReturnedItems(int $returnId, ?AdminUser $admin = null): ReturnRequest
    {
        $return = ReturnRequest::with(['items', 'order'])->findOrFail($returnId);

        DB::transaction(function () use ($return, $admin) {
            foreach ($return->items as $item) {
                if ($item->product_variant_id) {
                    $this->inventoryService->adjustStock(
                        $item->product_variant_id,
                        'add',
                        $item->quantity,
                        "Restocked returned item for Return {$return->return_number}",
                        null,
                        $admin?->id
                    );
                }
            }

            OrderHistory::create([
                'order_id' => $return->order_id,
                'user_id' => $return->order->user_id,
                'status' => 'returned_restocked',
                'comment' => "Returned items for Return {$return->return_number} restocked into inventory.",
            ]);
        });

        return $return->fresh(['items', 'order']);
    }
}
