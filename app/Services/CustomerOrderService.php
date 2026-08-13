<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerOrderService
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Get paginated customer order list scoped to authenticated user.
     */
    public function getCustomerOrders(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with(['items', 'payments'])
            ->where('user_id', $user->id);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('order_number', 'like', "%{$search}%");
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Get customer order details by order number.
     *
     * @throws ModelNotFoundException
     */
    public function getOrderDetail(User $user, string $orderNumber): Order
    {
        return Order::with(['items', 'payments', 'histories'])
            ->where('user_id', $user->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();
    }

    /**
     * Get live order tracking timeline and shipment info.
     *
     * @throws ModelNotFoundException
     */
    public function getOrderTracking(User $user, string $orderNumber): array
    {
        $order = $this->getOrderDetail($user, $orderNumber);
        $shipment = Shipment::with('trackingLogs')->where('order_id', $order->id)->first();

        $stepMap = [
            'pending_payment' => 1,
            'paid' => 2,
            'confirmed' => 2,
            'processing' => 3,
            'packed' => 4,
            'shipped' => 5,
            'out_for_delivery' => 6,
            'delivered' => 7,
            'cancelled' => 0,
        ];

        $currentStep = $stepMap[$order->status] ?? 1;

        $steps = [
            ['step' => 1, 'name' => 'Order Placed', 'completed' => $currentStep >= 1],
            ['step' => 2, 'name' => 'Confirmed / Paid', 'completed' => $currentStep >= 2],
            ['step' => 3, 'name' => 'Processing', 'completed' => $currentStep >= 3],
            ['step' => 4, 'name' => 'Packed', 'completed' => $currentStep >= 4],
            ['step' => 5, 'name' => 'Shipped', 'completed' => $currentStep >= 5],
            ['step' => 6, 'name' => 'Out for Delivery', 'completed' => $currentStep >= 6],
            ['step' => 7, 'name' => 'Delivered', 'completed' => $currentStep >= 7],
        ];

        return [
            'order_number' => $order->order_number,
            'current_status' => $order->status,
            'current_step' => $currentStep,
            'total_steps' => 7,
            'is_cancelled' => $order->status === 'cancelled',
            'shipment' => $shipment ? [
                'provider' => $shipment->provider,
                'courier_name' => $shipment->courier_name,
                'awb_number' => $shipment->awb_number,
                'tracking_number' => $shipment->tracking_number,
                'status' => $shipment->status,
                'shipped_at' => $shipment->shipped_at,
                'delivered_at' => $shipment->delivered_at,
                'tracking_logs' => $shipment->trackingLogs,
            ] : null,
            'steps' => $steps,
            'timeline' => $order->histories,
        ];
    }

    /**
     * Cancel an eligible customer order and release stock.
     *
     * @throws ValidationException|ModelNotFoundException
     */
    public function cancelOrder(User $user, string $orderNumber, string $reason, ?string $comments = null): Order
    {
        $order = Order::with('items')
            ->where('user_id', $user->id)
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if ($order->status === 'cancelled') {
            throw ValidationException::withMessages([
                'order' => ['Order is already cancelled.'],
            ]);
        }

        $forbiddenStatuses = ['packed', 'shipped', 'out_for_delivery', 'delivered'];
        if (in_array($order->status, $forbiddenStatuses)) {
            throw ValidationException::withMessages([
                'order' => ['Orders that are already packed or shipped cannot be cancelled.'],
            ]);
        }

        return DB::transaction(function () use ($order, $user, $reason, $comments) {
            // Release reserved stock for each variant item
            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    $this->inventoryService->releaseStock(
                        $item->product_variant_id,
                        $item->quantity,
                        'Order',
                        $order->id,
                        "Order {$order->order_number} cancelled by customer"
                    );
                }
            }

            $order->status = 'cancelled';
            $order->save();

            $commentText = "Order cancelled by customer. Reason: {$reason}";
            if ($comments) {
                $commentText .= ". Comments: {$comments}";
            }

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'status' => 'cancelled',
                'comment' => $commentText,
            ]);

            return $order->fresh(['items', 'payments', 'histories']);
        });
    }
}
