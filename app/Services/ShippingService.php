<?php

namespace App\Services;

use App\Models\Shipment;
use App\Models\ShipmentTracking;
use App\Models\ShippingMethod;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ShippingService
{
    /**
     * Get paginated shipping zones for admin management.
     */
    public function getAdminZonesList(array $filters = [], int $perPage = 15)
    {
        $query = ShippingZone::with(['methods', 'rates']);

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where('name', 'like', "%{$search}%");
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $status = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN) ? 'active' : 'inactive';
            $query->where('status', $status);
        }

        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortOrder = strtolower($filters['sort_order'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Create a new shipping zone.
     */
    public function createZone(array $data): ShippingZone
    {
        return ShippingZone::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'countries' => $data['countries'] ?? [],
            'states' => $data['states'] ?? [],
            'postal_codes' => $data['postal_codes'] ?? [],
            'is_global' => $data['is_global'] ?? false,
            'status' => $data['status'] ?? 'active',
            'sort_order' => $data['sort_order'] ?? 0,
        ]);
    }

    /**
     * Update an existing shipping zone.
     */
    public function updateZone(ShippingZone $zone, array $data): ShippingZone
    {
        $zone->update(array_filter([
            'name' => $data['name'] ?? $zone->name,
            'description' => array_key_exists('description', $data) ? $data['description'] : $zone->description,
            'countries' => array_key_exists('countries', $data) ? $data['countries'] : $zone->countries,
            'states' => array_key_exists('states', $data) ? $data['states'] : $zone->states,
            'postal_codes' => array_key_exists('postal_codes', $data) ? $data['postal_codes'] : $zone->postal_codes,
            'is_global' => array_key_exists('is_global', $data) ? $data['is_global'] : $zone->is_global,
            'status' => $data['status'] ?? $zone->status,
            'sort_order' => array_key_exists('sort_order', $data) ? $data['sort_order'] : $zone->sort_order,
        ], fn ($val) => $val !== null));

        return $zone->fresh(['methods', 'rates']);
    }

    /**
     * Delete/Archive a shipping zone.
     */
    public function deleteZone(ShippingZone $zone): bool
    {
        return $zone->delete();
    }

    /**
     * Get paginated shipping methods for admin management.
     */
    public function getAdminMethodsList(array $filters = [], int $perPage = 15)
    {
        $query = ShippingMethod::with(['zone', 'rates']);

        if (!empty($filters['zone_id'])) {
            $query->where('shipping_zone_id', $filters['zone_id']);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('carrier_name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('sort_order', 'asc')->paginate($perPage);
    }

    /**
     * Create a new shipping method with optional rate tiers.
     */
    public function createMethod(array $data): ShippingMethod
    {
        $method = ShippingMethod::create([
            'shipping_zone_id' => $data['shipping_zone_id'] ?? null,
            'name' => $data['name'],
            'code' => $data['code'] ?? strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $data['name']), 0, 10)),
            'carrier_name' => $data['carrier_name'] ?? null,
            'type' => $data['type'] ?? 'standard',
            'calculation_type' => $data['calculation_type'] ?? 'flat_rate',
            'base_cost' => $data['base_cost'] ?? 0.00,
            'handling_fee' => $data['handling_fee'] ?? 0.00,
            'min_free_shipping_amount' => $data['min_free_shipping_amount'] ?? null,
            'estimated_days' => $data['estimated_days'] ?? null,
            'estimated_days_min' => $data['estimated_days_min'] ?? 1,
            'estimated_days_max' => $data['estimated_days_max'] ?? 7,
            'weight_limit' => $data['weight_limit'] ?? null,
            'status' => $data['status'] ?? 'active',
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        if (!empty($data['rates']) && is_array($data['rates'])) {
            foreach ($data['rates'] as $rateData) {
                ShippingRate::create([
                    'zone_id' => $method->shipping_zone_id,
                    'method_id' => $method->id,
                    'rate_type' => $rateData['rate_type'] ?? $method->calculation_type,
                    'min_value' => $rateData['min_value'] ?? 0.00,
                    'max_value' => $rateData['max_value'] ?? null,
                    'rate_value' => $rateData['rate_value'] ?? $method->base_cost,
                    'free_threshold' => $rateData['free_threshold'] ?? $method->min_free_shipping_amount,
                    'status' => 'active',
                ]);
            }
        }

        return $method->load(['zone', 'rates']);
    }

    /**
     * Update an existing shipping method & rate tiers.
     */
    public function updateMethod(ShippingMethod $method, array $data): ShippingMethod
    {
        $method->update([
            'shipping_zone_id' => array_key_exists('shipping_zone_id', $data) ? $data['shipping_zone_id'] : $method->shipping_zone_id,
            'name' => $data['name'] ?? $method->name,
            'code' => $data['code'] ?? $method->code,
            'carrier_name' => array_key_exists('carrier_name', $data) ? $data['carrier_name'] : $method->carrier_name,
            'type' => $data['type'] ?? $method->type,
            'calculation_type' => $data['calculation_type'] ?? $method->calculation_type,
            'base_cost' => array_key_exists('base_cost', $data) ? $data['base_cost'] : $method->base_cost,
            'handling_fee' => array_key_exists('handling_fee', $data) ? $data['handling_fee'] : $method->handling_fee,
            'min_free_shipping_amount' => array_key_exists('min_free_shipping_amount', $data) ? $data['min_free_shipping_amount'] : $method->min_free_shipping_amount,
            'estimated_days' => array_key_exists('estimated_days', $data) ? $data['estimated_days'] : $method->estimated_days,
            'estimated_days_min' => array_key_exists('estimated_days_min', $data) ? $data['estimated_days_min'] : $method->estimated_days_min,
            'estimated_days_max' => array_key_exists('estimated_days_max', $data) ? $data['estimated_days_max'] : $method->estimated_days_max,
            'weight_limit' => array_key_exists('weight_limit', $data) ? $data['weight_limit'] : $method->weight_limit,
            'status' => $data['status'] ?? $method->status,
            'sort_order' => array_key_exists('sort_order', $data) ? $data['sort_order'] : $method->sort_order,
        ]);

        if (array_key_exists('rates', $data) && is_array($data['rates'])) {
            $method->rates()->delete();
            foreach ($data['rates'] as $rateData) {
                ShippingRate::create([
                    'zone_id' => $method->shipping_zone_id,
                    'method_id' => $method->id,
                    'rate_type' => $rateData['rate_type'] ?? $method->calculation_type,
                    'min_value' => $rateData['min_value'] ?? 0.00,
                    'max_value' => $rateData['max_value'] ?? null,
                    'rate_value' => $rateData['rate_value'] ?? $method->base_cost,
                    'free_threshold' => $rateData['free_threshold'] ?? $method->min_free_shipping_amount,
                    'status' => 'active',
                ]);
            }
        }

        return $method->fresh(['zone', 'rates']);
    }

    /**
     * Delete a shipping method.
     */
    public function deleteMethod(ShippingMethod $method): bool
    {
        return $method->delete();
    }

    /**
     * Calculate available shipping options and costs for a destination (Storefront Checkout).
     */
    public function calculateShippingOptions(
        string $stateCode,
        ?string $postalCode = null,
        float $subtotal = 0.0,
        float $totalWeight = 0.0,
        array $items = [],
        ?string $combinationStrategy = 'highest_item_first'
    ): array {
        $stateCode = strtoupper(trim($stateCode));
        $postalCode = $postalCode ? trim($postalCode) : null;

        $matchedZone = $this->matchZone($stateCode, $postalCode);

        if (!$matchedZone) {
            return [
                'is_deliverable' => false,
                'zone' => null,
                'available_methods' => [],
            ];
        }

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

            if ($method->weight_limit !== null && $totalWeight > (float) $method->weight_limit) {
                continue;
            }

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
                'combination_strategy' => $combinationStrategy,
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
        if (empty($data['shipment_number'])) {
            $data['shipment_number'] = Shipment::generateShipmentNumber();
        }

        $shipment = Shipment::create($data);

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

        if (isset($logData['status'])) {
            $shipment->update(['status' => $logData['status']]);
            if (in_array($logData['status'], ['delivered']) && !$shipment->delivered_at) {
                $shipment->update(['delivered_at' => Carbon::now()]);
            } elseif (in_array($logData['status'], ['shipped', 'in_transit']) && !$shipment->shipped_at) {
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
        $shipment = Shipment::with(['trackingLogs', 'items', 'order'])
            ->where('tracking_number', strtoupper(trim($trackingNumber)))
            ->orWhere('shipment_number', strtoupper(trim($trackingNumber)))
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

        foreach ($zones as $zone) {
            if (!empty($zone->states) && in_array($stateCode, array_map('strtoupper', $zone->states))) {
                return $zone;
            }
        }

        if ($postalCode) {
            foreach ($zones as $zone) {
                if (!empty($zone->postal_codes) && in_array($postalCode, $zone->postal_codes)) {
                    return $zone;
                }
            }
        }

        return $zones->where('is_global', true)->first();
    }
}
