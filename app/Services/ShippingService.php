<?php

namespace App\Services;

use App\Models\Shipment;
use App\Models\ShipmentTracking;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ShippingService
{
    /**
     * Calculate available shipping options and costs for a destination.
     *
     * @param string $stateCode
     * @param string|null $postalCode
     * @param float $subtotal
     * @param float $totalWeight
     * @return array
     */
    public function calculateShippingOptions(string $stateCode, ?string $postalCode = null, float $subtotal = 0.0, float $totalWeight = 0.0): array
    {
        $stateCode = strtoupper(trim($stateCode));
        $postalCode = $postalCode ? trim($postalCode) : null;

        // Match zone
        $matchedZone = $this->matchZone($stateCode, $postalCode);

        if (!$matchedZone) {
            return [
                'is_deliverable' => false,
                'zone' => null,
                'available_methods' => [],
            ];
        }

        // Fetch active rates for zone
        $rates = ShippingRate::with('method')
            ->where('zone_id', $matchedZone->id)
            ->where('status', 'active')
            ->get();

        $availableMethods = [];

        foreach ($rates as $rate) {
            $method = $rate->method;

            if (!$method || $method->status !== 'active') {
                continue;
            }

            // Check method weight limit
            if ($method->weight_limit !== null && $totalWeight > (float) $method->weight_limit) {
                continue;
            }

            // Check min/max values depending on rate_type
            if ($rate->rate_type === 'weight_based') {
                if ($rate->min_value > 0 && $totalWeight < (float) $rate->min_value) {
                    continue;
                }
                if ($rate->max_value !== null && $totalWeight > (float) $rate->max_value) {
                    continue;
                }
            } else {
                if ($rate->min_value > 0 && $subtotal < (float) $rate->min_value) {
                    continue;
                }
                if ($rate->max_value !== null && $subtotal > (float) $rate->max_value) {
                    continue;
                }
            }

            // Calculate fee
            $fee = 0.00;
            $isFree = false;

            if ($rate->free_threshold !== null && $subtotal >= (float) $rate->free_threshold) {
                $fee = 0.00;
                $isFree = true;
            } elseif ($rate->rate_type === 'flat_rate' || $rate->rate_type === 'order_value_based') {
                $fee = (float) $rate->rate_value;
            } elseif ($rate->rate_type === 'weight_based') {
                $fee = round((float) $rate->rate_value * max(1.0, $totalWeight), 2);
            } elseif ($rate->rate_type === 'free_shipping') {
                $fee = 0.00;
                $isFree = true;
            }

            $availableMethods[] = [
                'method_id' => $method->id,
                'method_name' => $method->name,
                'type' => $method->type,
                'estimated_days' => $method->estimated_days,
                'fee' => round($fee, 2),
                'is_free' => $isFree,
            ];
        }

        return [
            'is_deliverable' => !empty($availableMethods),
            'zone' => [
                'id' => $matchedZone->id,
                'name' => $matchedZone->name,
            ],
            'available_methods' => $availableMethods,
        ];
    }

    /**
     * Create shipment.
     */
    public function createShipment(array $data): Shipment
    {
        if (empty($data['tracking_number'])) {
            $data['tracking_number'] = Shipment::generateTrackingNumber();
        }

        $shipment = Shipment::create($data);

        // Initial tracking log
        $this->addTrackingLog($shipment, [
            'status' => $shipment->status,
            'location' => 'Fulfillment Center',
            'description' => 'Shipment record created.',
        ]);

        return $shipment->load('trackingLogs');
    }

    /**
     * Add tracking event log to shipment.
     */
    public function addTrackingLog(Shipment $shipment, array $logData): ShipmentTracking
    {
        $log = ShipmentTracking::create([
            'shipment_id' => $shipment->id,
            'status' => $logData['status'] ?? $shipment->status,
            'location' => $logData['location'] ?? null,
            'description' => $logData['description'] ?? null,
            'occurred_at' => $logData['occurred_at'] ?? Carbon::now(),
        ]);

        // Sync main status if provided
        if (isset($logData['status'])) {
            $shipment->update(['status' => $logData['status']]);
            if ($logData['status'] === 'delivered' && !$shipment->delivered_at) {
                $shipment->update(['delivered_at' => Carbon::now()]);
            } elseif ($logData['status'] === 'in_transit' && !$shipment->shipped_at) {
                $shipment->update(['shipped_at' => Carbon::now()]);
            }
        }

        return $log;
    }

    /**
     * Track shipment by tracking number.
     */
    public function trackShipment(string $trackingNumber): Shipment
    {
        $shipment = Shipment::with('trackingLogs')
            ->where('tracking_number', strtoupper(trim($trackingNumber)))
            ->first();

        if (!$shipment) {
            throw ValidationException::withMessages([
                'tracking_number' => ['Shipment with this tracking number was not found.'],
            ]);
        }

        return $shipment;
    }

    /**
     * Helper to match zone by state or postal code.
     */
    protected function matchZone(string $stateCode, ?string $postalCode): ?ShippingZone
    {
        $zones = ShippingZone::where('status', 'active')->get();

        // 1. Match state code
        foreach ($zones as $zone) {
            if (!empty($zone->states) && in_array($stateCode, array_map('strtoupper', $zone->states))) {
                return $zone;
            }
        }

        // 2. Match postal code if provided
        if ($postalCode) {
            foreach ($zones as $zone) {
                if (!empty($zone->postal_codes) && in_array($postalCode, $zone->postal_codes)) {
                    return $zone;
                }
            }
        }

        // 3. Fallback to global zone
        return $zones->where('is_global', true)->first();
    }
}
