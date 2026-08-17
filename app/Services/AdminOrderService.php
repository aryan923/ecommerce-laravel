<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminOrderService
{
    /**
     * Get executive dashboard statistics for order processing.
     *
     * @return array
     */
    public function getDashboardStats(): array
    {
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending_payment')->count();
        $confirmedOrders = Order::whereIn('status', ['confirmed', 'paid'])->count();
        $processingOrders = Order::where('status', 'processing')->count();
        $shippedOrders = Order::where('status', 'shipped')->count();
        $deliveredOrders = Order::where('status', 'delivered')->count();
        $cancelledOrders = Order::whereIn('status', ['cancelled', 'failed'])->count();

        $totalRevenue = (float) Order::whereNotIn('status', ['cancelled', 'failed'])->sum('grand_total');

        return [
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'confirmed_orders' => $confirmedOrders,
            'processing_orders' => $processingOrders,
            'shipped_orders' => $shippedOrders,
            'delivered_orders' => $deliveredOrders,
            'cancelled_orders' => $cancelledOrders,
            'total_revenue' => round($totalRevenue, 2),
        ];
    }

    /**
     * Get paginated catalog of store orders with search and multi-filtering.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with([
            'user:id,name,email,mobile',
            'items',
            'payments',
            'shipments',
        ]);

        // Search Filter
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                  ->orWhere('guest_email', 'LIKE', "%{$search}%")
                  ->orWhere('guest_name', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'LIKE', "%{$search}%")
                         ->orWhere('email', 'LIKE', "%{$search}%")
                         ->orWhere('mobile', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('items', function ($iq) use ($search) {
                      $iq->where('sku', 'LIKE', "%{$search}%")
                         ->orWhere('product_name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Payment Method Filter
        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        // Date Range Filter
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Amount Range Filter
        if (isset($filters['min_amount']) && $filters['min_amount'] !== '') {
            $query->where('grand_total', '>=', (float) $filters['min_amount']);
        }
        if (isset($filters['max_amount']) && $filters['max_amount'] !== '') {
            $query->where('grand_total', '<=', (float) $filters['max_amount']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, ['created_at', 'grand_total', 'order_number', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Get full 360-degree order detail with eager loaded records and frozen snapshot fallbacks.
     *
     * @param int $orderId
     * @return Order
     * @throws ValidationException
     */
    public function getDetails(int $orderId): Order
    {
        $order = Order::with([
            'user:id,name,email,mobile,created_at',
            'items.product:id,name,slug,brand_id',
            'items.product.brand:id,name',
            'items.product.categories:id,name',
            'payments',
            'histories.user:id,name,email',
            'shipments.trackingLogs',
            'returns',
            'refunds',
        ])->find($orderId);

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ["Order #{$orderId} not found."],
            ]);
        }

        return $order;
    }

    /**
     * Transition order status, write order_histories audit log, and handle inventory stock restoration.
     *
     * @param int $orderId
     * @param string $newStatus
     * @param string|null $comment
     * @param User|null $adminUser
     * @return Order
     * @throws ValidationException
     */
    public function updateStatus(int $orderId, string $newStatus, ?string $comment = null, $adminUser = null): Order
    {
        $validStatuses = [
            'pending_payment',
            'paid',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'failed',
        ];

        if (!in_array($newStatus, $validStatuses)) {
            throw ValidationException::withMessages([
                'status' => ["Invalid status '{$newStatus}'."],
            ]);
        }

        return DB::transaction(function () use ($orderId, $newStatus, $comment, $adminUser) {
            $order = Order::with('items')->findOrFail($orderId);
            $oldStatus = $order->status;

            if ($oldStatus === $newStatus) {
                return $order;
            }

            // Update order status
            $order->status = $newStatus;
            $order->save();

            // Record Timeline Audit Log
            $logComment = $comment ?: "Order status updated from '" . strtoupper($oldStatus) . "' to '" . strtoupper($newStatus) . "'";
            $authorUserId = ($adminUser instanceof User) ? $adminUser->id : null;

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $authorUserId,
                'status' => $newStatus,
                'comment' => $logComment,
            ]);

            // If order cancelled, restore stock in inventories
            if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                foreach ($order->items as $item) {
                    $variantId = $item->product_variant_id;
                    if ($variantId) {
                        Inventory::where('product_variant_id', $variantId)
                            ->increment('available_quantity', $item->quantity);
                        Inventory::where('product_variant_id', $variantId)
                            ->decrement('reserved_quantity', min($item->quantity, Inventory::where('product_variant_id', $variantId)->value('reserved_quantity') ?? 0));
                    }
                }
            }

            return $order->fresh(['histories.user', 'shipments', 'items']);
        });
    }

    /**
     * Create shipment record, attach tracking information, and set order status to shipped.
     *
     * @param int $orderId
     * @param array $data
     * @param User|null $adminUser
     * @return Shipment
     * @throws ValidationException
     */
    public function createShipment(int $orderId, array $data, $adminUser = null): Shipment
    {
        return DB::transaction(function () use ($orderId, $data, $adminUser) {
            $order = Order::findOrFail($orderId);

            $courierName = $data['courier_name'] ?? 'Standard Courier';
            $awbNumber = $data['awb_number'] ?? null;
            $trackingNumber = $data['tracking_number'] ?? Shipment::generateTrackingNumber('AWB');

            $shipment = Shipment::create([
                'order_id' => $order->id,
                'provider' => $data['provider'] ?? 'manual',
                'courier_name' => $courierName,
                'awb_number' => $awbNumber,
                'tracking_number' => $trackingNumber,
                'status' => 'in_transit',
                'shipped_at' => now(),
            ]);

            // Update order status to shipped
            $order->status = 'shipped';
            $order->save();

            // Record Timeline Audit Log
            $authorUserId = ($adminUser instanceof User) ? $adminUser->id : null;
            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $authorUserId,
                'status' => 'shipped',
                'comment' => "Shipment created via {$courierName}. Tracking #: {$trackingNumber}" . ($awbNumber ? " (AWB: {$awbNumber})" : ""),
            ]);

            return $shipment->load('trackingLogs');
        });
    }

    /**
     * Update internal staff notes on order.
     *
     * @param int $orderId
     * @param string|null $notes
     * @return Order
     */
    public function updateAdminNotes(int $orderId, ?string $notes): Order
    {
        $order = Order::findOrFail($orderId);
        $order->admin_notes = $notes;
        $order->save();

        return $order;
    }
}
