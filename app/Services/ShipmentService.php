<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Models\ShipmentTracking;
use Carbon\Carbon;

class ShipmentService
{
    /**
     * Get paginated admin shipments.
     */
    public function getAdminShipmentsList(array $filters = [], int $perPage = 15)
    {
        $query = Shipment::with(['order', 'items.orderItem', 'trackingLogs']);

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('shipment_number', 'like', "%{$search}%")
                  ->orWhere('tracking_number', 'like', "%{$search}%")
                  ->orWhere('courier_name', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['carrier_name'])) {
            $query->where('courier_name', $filters['carrier_name']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Dispatch items and create shipment record for an order.
     */
    public function createOrderShipment(array $data): Shipment
    {
        $order = Order::findOrFail($data['order_id']);

        $shipmentNumber = Shipment::generateShipmentNumber();
        $trackingNumber = $data['tracking_number'] ?? Shipment::generateTrackingNumber();

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'shipment_number' => $shipmentNumber,
            'provider' => $data['provider'] ?? 'manual',
            'courier_name' => $data['carrier_name'],
            'awb_number' => $trackingNumber,
            'tracking_number' => $trackingNumber,
            'tracking_url' => $data['tracking_url'] ?? null,
            'status' => 'pending',
            'notes' => $data['notes'] ?? null,
        ]);

        if (!empty($data['items']) && is_array($data['items'])) {
            foreach ($data['items'] as $itemData) {
                ShipmentItem::create([
                    'shipment_id' => $shipment->id,
                    'order_item_id' => $itemData['order_item_id'],
                    'quantity' => $itemData['quantity'] ?? 1,
                ]);
            }
        }

        // Add initial tracking log
        ShipmentTracking::create([
            'shipment_id' => $shipment->id,
            'status' => 'pending',
            'location' => 'Fulfillment Center',
            'description' => 'Shipment dispatched by administrator. AWB assigned: ' . $trackingNumber,
            'occurred_at' => Carbon::now(),
        ]);

        // Sync order fulfillment status
        $totalOrderItems = $order->items()->sum('quantity');
        $totalShippedItems = ShipmentItem::whereHas('shipment', function ($q) use ($order) {
            $q->where('order_id', $order->id);
        })->sum('quantity');

        if ($totalShippedItems >= $totalOrderItems) {
            $order->update(['status' => 'shipped']);
        } else {
            $order->update(['status' => 'processing']);
        }

        return $shipment->load(['order', 'items.orderItem', 'trackingLogs']);
    }

    /**
     * Update shipment delivery status & add timeline log.
     */
    public function updateShipmentStatus(Shipment $shipment, array $data): Shipment
    {
        $status = $data['status'];
        $location = $data['location'] ?? 'In Transit Hub';
        $description = $data['description'] ?? "Shipment status updated to {$status}";

        $shipment->update([
            'status' => $status,
            'notes' => $data['notes'] ?? $shipment->notes,
        ]);

        if (in_array($status, ['shipped', 'in_transit', 'out_for_delivery']) && !$shipment->shipped_at) {
            $shipment->update(['shipped_at' => Carbon::now()]);
        }

        if (in_array($status, ['delivered']) && !$shipment->delivered_at) {
            $shipment->update(['delivered_at' => Carbon::now()]);
            $shipment->order()->update(['status' => 'completed']);
        }

        ShipmentTracking::create([
            'shipment_id' => $shipment->id,
            'status' => $status,
            'location' => $location,
            'description' => $description,
            'occurred_at' => Carbon::now(),
        ]);

        return $shipment->fresh(['order', 'items.orderItem', 'trackingLogs']);
    }

    /**
     * Generate HTML / PDF shipping label payload.
     */
    public function generatePackingSlipLabel(Shipment $shipment): array
    {
        $shipment->load(['order', 'items.orderItem']);

        return [
            'shipment_number' => $shipment->shipment_number,
            'tracking_number' => $shipment->tracking_number,
            'carrier_name' => $shipment->courier_name,
            'status' => $shipment->status,
            'order_number' => $shipment->order->order_number ?? 'ORD-' . $shipment->order_id,
            'shipping_address' => $shipment->order->shipping_address ?? [],
            'shipped_at' => $shipment->shipped_at ? $shipment->shipped_at->toIso8601String() : null,
            'items' => $shipment->items->map(function ($item) {
                return [
                    'product_name' => $item->orderItem->product_name ?? 'Product #' . $item->order_item_id,
                    'sku' => $item->orderItem->sku ?? 'SKU-UNKNOWN',
                    'quantity' => $item->quantity,
                ];
            }),
        ];
    }
}
