<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tax_class_id' => 'sometimes|required|exists:tax_classes,id',
            'name' => 'sometimes|required|string|max:150',
            'type' => 'sometimes|required|in:cgst,sgst,igst,utgst,flat,standard',
            'rate' => 'sometimes|required|numeric|min:0|max:100',
            'state_code' => 'nullable|string|max:10',
            'country_code' => 'nullable|string|max:2',
            'is_active' => 'nullable|boolean',
        ];
    }
}
