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
}
