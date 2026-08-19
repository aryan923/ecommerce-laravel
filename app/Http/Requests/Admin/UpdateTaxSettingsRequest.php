<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pricing_mode' => 'required|in:tax_inclusive,tax_exclusive',
            'default_tax_class_id' => 'nullable|exists:tax_classes,id',
            'store_gstin' => 'nullable|string|max:20',
            'store_state_code' => 'nullable|string|max:10',
            'shipping_tax_mode' => 'nullable|in:same_as_items,fixed_class,exempt',
            'shipping_tax_class_id' => 'nullable|exists:tax_classes,id',
            'cod_fee_taxable' => 'nullable|boolean',
            'cod_fee_tax_class_id' => 'nullable|exists:tax_classes,id',
        ];
    }
}
