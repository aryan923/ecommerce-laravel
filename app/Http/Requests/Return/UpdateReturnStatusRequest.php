<?php

namespace App\Http\Requests\Return;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReturnStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                'in:requested,under_review,approved,rejected,pickup_scheduled,picked_up,received,quality_check,approved_for_refund,refunded,closed',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
