<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaxRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tax_class_id' => ['required', 'exists:tax_classes,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['cgst', 'sgst', 'igst', 'flat', 'standard'])],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'state_code' => ['nullable', 'string', 'max:10'],
            'country_code' => ['nullable', 'string', 'max:2'],
            'is_inclusive' => ['boolean'],
            'priority' => ['integer', 'min:0'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
        ];
    }
}
