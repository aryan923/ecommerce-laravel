<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CalculateShippingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'state_code' => ['required', 'string', 'max:10'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'total_weight' => ['nullable', 'numeric', 'min:0'],
            'items' => ['nullable', 'array'],
            'combination_strategy' => ['nullable', 'string', 'in:highest_item_first,sum_all,fixed_base_plus_weight,price_bracket_combined'],
        ];
    }
}
