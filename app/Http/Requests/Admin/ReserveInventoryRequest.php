<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReserveInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
            'remarks' => 'nullable|string|max:255',
        ];
    }
}
