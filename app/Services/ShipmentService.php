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
            'warehouse_id' => $data['warehouse_id'] ?? null,
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

        return $shipment->load(['order', 'warehouse', 'items.orderItem', 'trackingLogs']);
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

        return $shipment->fresh(['order', 'warehouse', 'items.orderItem', 'trackingLogs']);
    }

    /**
     * Perform bulk status updates across multiple shipments.
     */
    public function bulkUpdateStatus(array $shipmentIds, string $status): int
    {
        $shipments = Shipment::whereIn('id', $shipmentIds)->get();
        $updatedCount = 0;

        foreach ($shipments as $shipment) {
            $this->updateShipmentStatus($shipment, [
                'status' => $status,
                'location' => 'Bulk Dispatch Hub',
                'description' => "Bulk status updated to {$status}",
            ]);
            $updatedCount++;
        }

        return $updatedCount;
    }

    /**
     * Generate structured courier pickup manifest payload for selected shipments.
     */
    public function generatePickupManifest(array $shipmentIds): array
    {
        $shipments = Shipment::with(['order', 'warehouse', 'items.orderItem'])
            ->whereIn('id', $shipmentIds)
            ->get();

        $manifestNumber = 'MNF-' . date('Ymd') . '-' . mt_rand(100, 999);

        $carriers = $shipments->pluck('courier_name')->unique()->values()->all();

        $totalItemsCount = $shipments->sum(function ($shp) {
            return $shp->items->sum('quantity');
        });

        return [
            'manifest_number' => $manifestNumber,
            'generated_at' => Carbon::now()->toIso8601String(),
            'carriers' => $carriers,
            'total_shipments' => $shipments->count(),
            'total_items' => $totalItemsCount,
            'shipments' => $shipments->map(function ($shp) {
                return [
                    'id' => $shp->id,
                    'shipment_number' => $shp->shipment_number,
                    'tracking_number' => $shp->tracking_number,
                    'carrier_name' => $shp->courier_name,
                    'status' => $shp->status,
                    'order_number' => $shp->order->order_number ?? 'ORD-' . $shp->order_id,
                    'warehouse_name' => $shp->warehouse->name ?? 'Default Warehouse',
                    'item_count' => $shp->items->sum('quantity'),
                ];
            }),
        ];
    }

    /**
     * Test postal code/country serviceability against active shipping zones.
     */
    public function checkServiceability(string $countryCode, ?string $postalCode = null): array
    {
        $countryCode = strtoupper(trim($countryCode));
        $postalCode = trim((string) $postalCode);

        $activeZones = \App\Models\ShippingZone::where('status', 'active')
            ->orWhere('is_active', true)
            ->with(['methods' => function ($q) {
                $q->where('status', 'active')->orWhere('is_active', true);
            }])
            ->get();

        $matchedZones = [];

        foreach ($activeZones as $zone) {
            $isMatched = false;

            // 1. Check country matching
            $zoneCountries = is_array($zone->countries) ? array_map('strtoupper', $zone->countries) : [];
            $countryMatched = $zone->is_global || empty($zoneCountries) || in_array('*', $zoneCountries) || in_array($countryCode, $zoneCountries);

            if ($countryMatched) {
                $zonePostalCodes = is_array($zone->postal_codes) ? $zone->postal_codes : [];

                if (empty($postalCode) || empty($zonePostalCodes) || in_array('*', $zonePostalCodes)) {
                    $isMatched = true;
                } else {
                    foreach ($zonePostalCodes as $pattern) {
                        if ($pattern === '*' || strtoupper($pattern) === strtoupper($postalCode)) {
                            $isMatched = true;
                            break;
                        }
                        $regex = '/^' . str_replace('*', '.*', preg_quote($pattern, '/')) . '$/i';
                        if (preg_match($regex, $postalCode)) {
                            $isMatched = true;
                            break;
                        }
                    }
                }
            }

            if ($isMatched) {
                $matchedZones[] = [
                    'zone_id' => $zone->id,
                    'zone_name' => $zone->name,
                    'description' => $zone->description,
                    'available_methods' => $zone->methods->map(function ($m) {
                        return [
                            'id' => $m->id,
                            'name' => $m->name,
                            'code' => $m->code,
                            'carrier_name' => $m->carrier_name,
                            'calculation_type' => $m->calculation_type,
                            'base_cost' => $m->base_cost,
                            'estimated_days' => "{$m->estimated_days_min}-{$m->estimated_days_max} days",
                        ];
                    }),
                ];
            }
        }

        return [
            'serviceable' => count($matchedZones) > 0,
            'country_code' => $countryCode,
            'postal_code' => $postalCode,
            'matched_zones' => $matchedZones,
        ];
    }

    /**
     * Calculate fulfillment analytics KPI metrics.
     */
    public function getFulfillmentAnalytics(): array
    {
        $totalShipments = Shipment::count();
        $pendingCount = Shipment::whereIn('status', ['pending', 'pending_pickup'])->count();
        $inTransitCount = Shipment::whereIn('status', ['shipped', 'in_transit', 'out_for_delivery'])->count();
        $deliveredCount = Shipment::where('status', 'delivered')->count();
        $failedCount = Shipment::whereIn('status', ['failed_delivery', 'returned_to_origin'])->count();

        $deliveredShipments = Shipment::where('status', 'delivered')
            ->whereNotNull('shipped_at')
            ->whereNotNull('delivered_at')
            ->get();

        $avgDeliveryTimeHours = 0;
        if ($deliveredShipments->count() > 0) {
            $totalHours = $deliveredShipments->sum(function ($shp) {
                return $shp->delivered_at->diffInHours($shp->shipped_at);
            });
            $avgDeliveryTimeHours = round($totalHours / $deliveredShipments->count(), 1);
        }

        $onTimeDeliveryRate = $totalShipments > 0
            ? round(($deliveredCount / max(1, $totalShipments)) * 100, 1)
            : 100;

        // Carrier breakdown
        $carrierStats = Shipment::selectRaw('courier_name, count(*) as count, sum(case when status = "delivered" then 1 else 0 end) as delivered')
            ->groupBy('courier_name')
            ->get()
            ->map(function ($c) {
                return [
                    'carrier_name' => $c->courier_name ?: 'Standard Carrier',
                    'total_shipments' => $c->count,
                    'delivered' => $c->delivered,
                    'success_rate' => $c->count > 0 ? round(($c->delivered / $c->count) * 100, 1) : 0,
                ];
            });

        return [
            'overview' => [
                'total_shipments' => $totalShipments,
                'pending_count' => $pendingCount,
                'in_transit_count' => $inTransitCount,
                'delivered_count' => $deliveredCount,
                'failed_count' => $failedCount,
                'on_time_rate' => $onTimeDeliveryRate,
                'avg_delivery_time_days' => round($avgDeliveryTimeHours / 24, 1),
            ],
            'carrier_performance' => $carrierStats,
        ];
    }

    /**
     * Generate HTML / PDF shipping label payload.
     */
    public function generatePackingSlipLabel(Shipment $shipment): array
    {
        $shipment->load(['order', 'warehouse', 'items.orderItem']);

        return [
            'shipment_number' => $shipment->shipment_number,
            'tracking_number' => $shipment->tracking_number,
            'carrier_name' => $shipment->courier_name,
            'status' => $shipment->status,
            'order_number' => $shipment->order->order_number ?? 'ORD-' . $shipment->order_id,
            'warehouse_name' => $shipment->warehouse->name ?? 'Default Warehouse',
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
