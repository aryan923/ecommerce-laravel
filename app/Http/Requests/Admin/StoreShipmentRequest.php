<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['nullable', 'integer'],
            'provider' => ['nullable', 'string', 'max:50'],
            'courier_name' => ['required', 'string', 'max:255'],
            'awb_number' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100', 'unique:shipments,tracking_number'],
            'status' => ['nullable', 'string', Rule::in([
                'pending',
                'label_created',
                'picked_up',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed',
                'cancelled',
            ])],
        ];
    }
}
