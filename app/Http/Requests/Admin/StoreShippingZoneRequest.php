<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShippingZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $zoneId = $this->route('id') ?? $this->route('shipping_zone');

        return [
            'name' => ['required', 'string', 'max:255'],
            'countries' => ['nullable', 'array'],
            'countries.*' => ['string', 'max:2'],
            'states' => ['nullable', 'array'],
            'states.*' => ['string', 'max:10'],
            'postal_codes' => ['nullable', 'array'],
            'postal_codes.*' => ['string', 'max:20'],
            'is_global' => ['boolean'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive'])],
        ];
    }
}
