<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreShippingMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_zone_id' => 'nullable|exists:shipping_zones,id',
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50',
            'carrier_name' => 'nullable|string|max:100',
            'type' => 'nullable|in:standard,express,same_day,pickup',
            'calculation_type' => 'nullable|in:flat_rate,weight_based,order_value_based,free_shipping,per_product,combined_shipping',
            'base_cost' => 'nullable|numeric|min:0',
            'handling_fee' => 'nullable|numeric|min:0',
            'min_free_shipping_amount' => 'nullable|numeric|min:0',
            'estimated_days' => 'nullable|string|max:50',
            'estimated_days_min' => 'nullable|integer|min:0',
            'estimated_days_max' => 'nullable|integer|min:0',
            'weight_limit' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'sort_order' => 'nullable|integer|min:0',
            'rates' => 'nullable|array',
            'rates.*.rate_type' => 'nullable|string',
            'rates.*.min_value' => 'nullable|numeric|min:0',
            'rates.*.max_value' => 'nullable|numeric|min:0',
            'rates.*.rate_value' => 'nullable|numeric|min:0',
            'rates.*.free_threshold' => 'nullable|numeric|min:0',
        ];
    }
}
