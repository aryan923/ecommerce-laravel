<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShipmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:pending,pending_pickup,shipped,in_transit,out_for_delivery,delivered,failed,failed_delivery,cancelled,returned_to_origin',
            'location' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
