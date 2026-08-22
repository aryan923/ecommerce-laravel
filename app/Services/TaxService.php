<?php

namespace App\Services;

use App\Models\Product;
use App\Models\TaxClass;
use App\Models\TaxRate;

class TaxService
{
    /**
     * Calculate tax breakdown for line items based on jurisdiction state codes.
     *
     * @param array $items Array of ['product_id' => int, 'amount' => float, 'quantity' => int]
     * @param string $shippingStateCode
     * @param string|null $originStateCode
     * @return array
     */
    public function calculateTax(array $items, string $shippingStateCode, ?string $originStateCode = null): array
    {
        $originStateCode = strtoupper($originStateCode ?? config('app.store_state_code', 'MH'));
        $shippingStateCode = strtoupper($shippingStateCode);
        $isIntraState = ($originStateCode === $shippingStateCode);

        $lineResults = [];
        $totalCgst = 0.0;
        $totalSgst = 0.0;
        $totalIgst = 0.0;
        $totalFlatTax = 0.0;
        $totalSubtotal = 0.0;
        $totalTaxableAmount = 0.0;

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $amount = (float) $item['amount'];
            $quantity = (int) ($item['quantity'] ?? 1);
            $lineSubtotal = $amount * $quantity;
            $totalSubtotal += $lineSubtotal;

            $product = Product::with('taxClass.rates')->find($productId);
            $taxClass = $product?->taxClass;

            $lineCgst = 0.0;
            $lineSgst = 0.0;
            $lineIgst = 0.0;
            $lineFlat = 0.0;
            $lineBaseAmount = $lineSubtotal;
            $isInclusive = false;

            if ($taxClass && $taxClass->rates->isNotEmpty()) {
                $rates = $taxClass->rates->where('status', 'active');

                // Filter rates by jurisdiction
                if ($isIntraState) {
                    $applicableRates = $rates->filter(function ($rate) use ($shippingStateCode) {
                        return in_array($rate->type, ['cgst', 'sgst', 'flat', 'standard']) &&
                            (empty($rate->state_code) || strtoupper($rate->state_code) === $shippingStateCode);
                    });
                } else {
                    $applicableRates = $rates->filter(function ($rate) {
                        return in_array($rate->type, ['igst', 'flat', 'standard']);
                    });
                }

                // Check if any rate is marked inclusive
                $isInclusive = $applicableRates->contains('is_inclusive', true);

                $combinedRate = (float) $applicableRates->sum('rate');

                if ($combinedRate > 0) {
                    if ($isInclusive) {
                        // Tax Inclusive Math: Tax = Amount - (Amount / (1 + Rate/100))
                        $lineBaseAmount = round($lineSubtotal / (1 + ($combinedRate / 100)), 4);
                        $lineTotalTax = round($lineSubtotal - $lineBaseAmount, 2);
                    } else {
                        // Tax Exclusive Math: Tax = Amount * (Rate/100)
                        $lineBaseAmount = $lineSubtotal;
                        $lineTotalTax = round($lineSubtotal * ($combinedRate / 100), 2);
                    }

                    // Distribute calculated tax into CGST/SGST or IGST buckets
                    foreach ($applicableRates as $rate) {
                        $ratePercent = (float) $rate->rate;
                        $rateShare = $combinedRate > 0 ? ($ratePercent / $combinedRate) : 0;
                        $rateTaxAmount = round($lineTotalTax * $rateShare, 2);

                        if ($rate->type === 'cgst') {
                            $lineCgst += $rateTaxAmount;
                        } elseif ($rate->type === 'sgst') {
                            $lineSgst += $rateTaxAmount;
                        } elseif ($rate->type === 'igst') {
                            $lineIgst += $rateTaxAmount;
                        } else {
                            $lineFlat += $rateTaxAmount;
                        }
                    }
                }
            }

            $lineTaxTotal = round($lineCgst + $lineSgst + $lineIgst + $lineFlat, 2);

            $totalCgst += $lineCgst;
            $totalSgst += $lineSgst;
            $totalIgst += $lineIgst;
            $totalFlatTax += $lineFlat;
            $totalTaxableAmount += $lineBaseAmount;

            $lineResults[] = [
                'product_id' => $productId,
                'product_name' => $product?->name,
                'quantity' => $quantity,
                'unit_amount' => round($amount, 2),
                'line_subtotal' => round($lineSubtotal, 2),
                'is_inclusive' => $isInclusive,
                'base_amount' => round($lineBaseAmount, 2),
                'cgst' => round($lineCgst, 2),
                'sgst' => round($lineSgst, 2),
                'igst' => round($lineIgst, 2),
                'flat_tax' => round($lineFlat, 2),
                'line_tax_total' => $lineTaxTotal,
                'line_grand_total' => $isInclusive ? round($lineSubtotal, 2) : round($lineSubtotal + $lineTaxTotal, 2),
            ];
        }

        $totalTax = round($totalCgst + $totalSgst + $totalIgst + $totalFlatTax, 2);

        return [
            'jurisdiction' => [
                'origin_state' => $originStateCode,
                'shipping_state' => $shippingStateCode,
                'is_intra_state' => $isIntraState,
            ],
            'subtotal' => round($totalSubtotal, 2),
            'taxable_amount' => round($totalTaxableAmount, 2),
            'cgst_amount' => round($totalCgst, 2),
            'sgst_amount' => round($totalSgst, 2),
            'igst_amount' => round($totalIgst, 2),
            'flat_tax_amount' => round($totalFlatTax, 2),
            'total_tax' => $totalTax,
            'grand_total' => round($totalSubtotal + (array_sum(array_column($lineResults, 'is_inclusive')) ? 0 : $totalTax), 2),
            'line_items' => $lineResults,
        ];
    }

    /**
     * Get paginated tax classes for admin management.
     */
    public function getAdminTaxClasses(array $filters = [], int $perPage = 15)
    {
        $query = TaxClass::with('rates');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Create a new tax class.
     */
    public function createTaxClass(array $data): TaxClass
    {
        if (empty($data['code'])) {
            $data['code'] = strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $data['name']), 0, 10));
        }

        $isDefault = !empty($data['is_default']);

        if ($isDefault) {
            TaxClass::query()->update(['is_default' => false]);
        }

        $taxClass = TaxClass::create([
            'name' => $data['name'],
            'code' => $data['code'],
            'description' => $data['description'] ?? null,
            'is_default' => $isDefault,
            'status' => $data['status'] ?? 'active',
        ]);

        // Auto-create rate components if provided in payload
        $stateCode = !empty($data['state_code']) ? strtoupper(trim($data['state_code'])) : 'MH';

        if (isset($data['cgst_rate']) && (float) $data['cgst_rate'] > 0) {
            TaxRate::create([
                'tax_class_id' => $taxClass->id,
                'name' => 'CGST ' . floatval($data['cgst_rate']) . '%',
                'type' => 'cgst',
                'rate' => (float) $data['cgst_rate'],
                'state_code' => $stateCode,
                'country_code' => 'IN',
                'status' => 'active',
            ]);
        }

        if (isset($data['sgst_rate']) && (float) $data['sgst_rate'] > 0) {
            TaxRate::create([
                'tax_class_id' => $taxClass->id,
                'name' => 'SGST ' . floatval($data['sgst_rate']) . '%',
                'type' => 'sgst',
                'rate' => (float) $data['sgst_rate'],
                'state_code' => $stateCode,
                'country_code' => 'IN',
                'status' => 'active',
            ]);
        }

        if (isset($data['igst_rate']) && (float) $data['igst_rate'] > 0) {
            TaxRate::create([
                'tax_class_id' => $taxClass->id,
                'name' => 'IGST ' . floatval($data['igst_rate']) . '%',
                'type' => 'igst',
                'rate' => (float) $data['igst_rate'],
                'state_code' => null,
                'country_code' => 'IN',
                'status' => 'active',
            ]);
        }

        $this->logTaxAudit('tax_class_created', TaxClass::class, $taxClass->id, [], $taxClass->toArray());

        return $taxClass->load('rates');
    }

    /**
     * Update an existing tax class.
     */
    public function updateTaxClass(TaxClass $taxClass, array $data): TaxClass
    {
        $oldValues = $taxClass->toArray();

        if (array_key_exists('is_default', $data) && $data['is_default']) {
            TaxClass::where('id', '!=', $taxClass->id)->update(['is_default' => false]);
        }

        $taxClass->update(array_filter([
            'name' => $data['name'] ?? $taxClass->name,
            'code' => $data['code'] ?? $taxClass->code,
            'description' => array_key_exists('description', $data) ? $data['description'] : $taxClass->description,
            'is_default' => array_key_exists('is_default', $data) ? (bool) $data['is_default'] : $taxClass->is_default,
            'status' => $data['status'] ?? $taxClass->status,
        ], fn ($val) => $val !== null));

        $this->logTaxAudit('tax_class_updated', TaxClass::class, $taxClass->id, $oldValues, $taxClass->toArray());

        return $taxClass->fresh('rates');
    }

    /**
     * Set a tax class as default.
     */
    public function setTaxClassDefault(TaxClass $taxClass): TaxClass
    {
        $oldValues = $taxClass->toArray();
        TaxClass::query()->update(['is_default' => false]);
        $taxClass->update(['is_default' => true]);

        $this->logTaxAudit('tax_class_set_default', TaxClass::class, $taxClass->id, $oldValues, $taxClass->toArray());

        return $taxClass->fresh('rates');
    }

    /**
     * Delete a tax class.
     */
    public function deleteTaxClass(TaxClass $taxClass): bool
    {
        $oldValues = $taxClass->toArray();
        $deleted = $taxClass->delete();

        if ($deleted) {
            $this->logTaxAudit('tax_class_deleted', TaxClass::class, $taxClass->id, $oldValues, []);
        }

        return $deleted;
    }

    /**
     * Get paginated tax rates.
     */
    public function getAdminTaxRates(array $filters = [], int $perPage = 15)
    {
        $query = TaxRate::with('taxClass');

        if (!empty($filters['tax_class_id'])) {
            $query->where('tax_class_id', $filters['tax_class_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Create a new tax rate.
     */
    public function createTaxRate(array $data): TaxRate
    {
        $rate = TaxRate::create([
            'tax_class_id' => $data['tax_class_id'],
            'name' => $data['name'],
            'type' => $data['type'] ?? 'standard',
            'rate' => $data['rate'] ?? 0.0000,
            'state_code' => $data['state_code'] ?? null,
            'country_code' => $data['country_code'] ?? 'IN',
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
            'status' => !empty($data['is_active']) ? 'active' : 'inactive',
        ]);

        $this->logTaxAudit('tax_rate_created', TaxRate::class, $rate->id, [], $rate->toArray());

        return $rate->load('taxClass');
    }

    /**
     * Update an existing tax rate.
     */
    public function updateTaxRate(TaxRate $rate, array $data): TaxRate
    {
        $oldValues = $rate->toArray();

        $rate->update([
            'tax_class_id' => $data['tax_class_id'] ?? $rate->tax_class_id,
            'name' => $data['name'] ?? $rate->name,
            'type' => $data['type'] ?? $rate->type,
            'rate' => array_key_exists('rate', $data) ? $data['rate'] : $rate->rate,
            'state_code' => array_key_exists('state_code', $data) ? $data['state_code'] : $rate->state_code,
            'country_code' => array_key_exists('country_code', $data) ? $data['country_code'] : $rate->country_code,
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $rate->is_active,
            'status' => array_key_exists('is_active', $data) ? ($data['is_active'] ? 'active' : 'inactive') : $rate->status,
        ]);

        $this->logTaxAudit('tax_rate_updated', TaxRate::class, $rate->id, $oldValues, $rate->toArray());

        return $rate->fresh('taxClass');
    }

    /**
     * Delete a tax rate.
     */
    public function deleteTaxRate(TaxRate $rate): bool
    {
        $oldValues = $rate->toArray();
        $deleted = $rate->delete();

        if ($deleted) {
            $this->logTaxAudit('tax_rate_deleted', TaxRate::class, $rate->id, $oldValues, []);
        }

        return $deleted;
    }

    /**
     * Get global tax settings.
     */
    public function getTaxSettings(): \App\Models\TaxSetting
    {
        return \App\Models\TaxSetting::firstOrCreate([], [
            'pricing_mode' => 'tax_exclusive',
            'store_gstin' => '27AAAAA0000A1Z5',
            'store_state_code' => 'MH',
            'shipping_tax_mode' => 'same_as_items',
            'cod_fee_taxable' => false,
        ]);
    }

    /**
     * Update global tax settings.
     */
    public function updateTaxSettings(array $data): \App\Models\TaxSetting
    {
        $settings = $this->getTaxSettings();
        $oldValues = $settings->toArray();

        $settings->update([
            'pricing_mode' => $data['pricing_mode'] ?? $settings->pricing_mode,
            'default_tax_class_id' => array_key_exists('default_tax_class_id', $data) ? $data['default_tax_class_id'] : $settings->default_tax_class_id,
            'store_gstin' => array_key_exists('store_gstin', $data) ? $data['store_gstin'] : $settings->store_gstin,
            'store_state_code' => array_key_exists('store_state_code', $data) ? $data['store_state_code'] : $settings->store_state_code,
            'shipping_tax_mode' => !empty($data['shipping_tax_mode']) ? $data['shipping_tax_mode'] : ($settings->shipping_tax_mode ?? 'same_as_items'),
            'shipping_tax_class_id' => array_key_exists('shipping_tax_class_id', $data) ? $data['shipping_tax_class_id'] : $settings->shipping_tax_class_id,
            'cod_fee_taxable' => array_key_exists('cod_fee_taxable', $data) ? (bool) $data['cod_fee_taxable'] : ($settings->cod_fee_taxable ?? false),
            'cod_fee_tax_class_id' => array_key_exists('cod_fee_tax_class_id', $data) ? $data['cod_fee_tax_class_id'] : $settings->cod_fee_tax_class_id,
        ]);

        $this->logTaxAudit('tax_settings_updated', \App\Models\TaxSetting::class, $settings->id, $oldValues, $settings->toArray());

        return $settings->fresh(['defaultTaxClass', 'shippingTaxClass', 'codFeeTaxClass']);
    }

    /**
     * Get paginated HSN / SAC codes directory.
     */
    public function getHsnCodes(array $filters = [], int $perPage = 15)
    {
        $query = \App\Models\HsnCode::with('taxClass');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('code', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->orderBy('code', 'asc')->paginate($perPage);
    }

    /**
     * Create a new HSN/SAC code entry.
     */
    public function createHsnCode(array $data): \App\Models\HsnCode
    {
        $hsnCode = \App\Models\HsnCode::create([
            'code' => strtoupper(trim($data['code'])),
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? 'hsn',
            'tax_class_id' => $data['tax_class_id'] ?? null,
            'status' => $data['status'] ?? 'active',
        ]);

        $this->logTaxAudit('hsn_code_created', \App\Models\HsnCode::class, $hsnCode->id, [], $hsnCode->toArray());

        return $hsnCode->load('taxClass');
    }

    /**
     * Update an HSN/SAC code entry.
     */
    public function updateHsnCode(\App\Models\HsnCode $hsnCode, array $data): \App\Models\HsnCode
    {
        $oldValues = $hsnCode->toArray();

        $hsnCode->update([
            'code' => isset($data['code']) ? strtoupper(trim($data['code'])) : $hsnCode->code,
            'description' => array_key_exists('description', $data) ? $data['description'] : $hsnCode->description,
            'type' => $data['type'] ?? $hsnCode->type,
            'tax_class_id' => array_key_exists('tax_class_id', $data) ? $data['tax_class_id'] : $hsnCode->tax_class_id,
            'status' => $data['status'] ?? $hsnCode->status,
        ]);

        $this->logTaxAudit('hsn_code_updated', \App\Models\HsnCode::class, $hsnCode->id, $oldValues, $hsnCode->toArray());

        return $hsnCode->fresh('taxClass');
    }

    /**
     * Delete an HSN/SAC code entry.
     */
    public function deleteHsnCode(\App\Models\HsnCode $hsnCode): bool
    {
        $oldValues = $hsnCode->toArray();
        $deleted = $hsnCode->delete();

        if ($deleted) {
            $this->logTaxAudit('hsn_code_deleted', \App\Models\HsnCode::class, $hsnCode->id, $oldValues, []);
        }

        return $deleted;
    }

    /**
     * Generate GST Monthly / Periodic Tax Report for GSTR-1 filing.
     */
    public function generateGstReport(?string $startDate = null, ?string $endDate = null): array
    {
        $query = \App\Models\Order::query()->where('status', '!=', 'cancelled');

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $orders = $query->with('items')->get();

        $totalSales = $orders->sum('total');
        $totalTax = $orders->sum('tax_amount');
        $taxableValue = max(0, $totalSales - $totalTax);

        // Approximate GST component split (Intra-state CGST 50% + SGST 50%, Inter-state IGST)
        $storeState = $this->getTaxSettings()->store_state_code ?? 'MH';
        $cgstTotal = 0;
        $sgstTotal = 0;
        $igstTotal = 0;

        foreach ($orders as $order) {
            $shippingState = strtoupper(trim($order->shipping_state ?? $storeState));
            if ($shippingState === $storeState) {
                $cgstTotal += $order->tax_amount / 2;
                $sgstTotal += $order->tax_amount / 2;
            } else {
                $igstTotal += $order->tax_amount;
            }
        }

        return [
            'period' => [
                'start_date' => $startDate ?? date('Y-m-01'),
                'end_date' => $endDate ?? date('Y-m-t'),
            ],
            'summary' => [
                'total_orders' => $orders->count(),
                'gross_sales' => round($totalSales, 2),
                'taxable_value' => round($taxableValue, 2),
                'total_gst_collected' => round($totalTax, 2),
                'cgst_total' => round($cgstTotal, 2),
                'sgst_total' => round($sgstTotal, 2),
                'igst_total' => round($igstTotal, 2),
            ],
            'hsn_summary' => \App\Models\HsnCode::with('taxClass')->get()->map(function ($hsn) {
                return [
                    'hsn_code' => $hsn->code,
                    'description' => $hsn->description,
                    'tax_class' => $hsn->taxClass->name ?? 'Standard',
                    'total_sales' => 0.00,
                    'taxable_amount' => 0.00,
                    'gst_collected' => 0.00,
                ];
            })
        ];
    }

    /**
     * Log an audit trail entry for tax modifications.
     */
    public function logTaxAudit(string $action, string $modelType, ?int $modelId, array $oldValues = [], array $newValues = []): void
    {
        try {
            \App\Models\TaxAuditLog::create([
                'user_id' => auth()->id() ?? 1,
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            AuditLogService::log(
                module: 'taxes',
                action: 'tax.update',
                entityType: $modelType,
                entityId: $modelId,
                oldValues: $oldValues,
                newValues: $newValues
            );
        } catch (\Throwable $e) {
            // Silently absorb audit failures
        }
    }
}
