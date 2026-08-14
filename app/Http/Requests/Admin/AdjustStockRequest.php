<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'type' => ['required', 'string', 'in:add,deduct,set,damage'],
            'quantity' => ['required', 'integer', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'reorder_qty' => ['nullable', 'integer', 'min:0'],
            'allow_backorder' => ['nullable', 'boolean'],
            'location_code' => ['nullable', 'string', 'max:100'],
            'reason' => ['required', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }
}
