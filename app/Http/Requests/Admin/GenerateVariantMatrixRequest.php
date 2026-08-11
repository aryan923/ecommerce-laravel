<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GenerateVariantMatrixRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attribute_value_ids' => ['required', 'array', 'min:1'],
            'attribute_value_ids.*' => ['required', 'array', 'min:1'],
            'attribute_value_ids.*.*' => ['required', 'integer', 'exists:attribute_values,id'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'base_stock' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
