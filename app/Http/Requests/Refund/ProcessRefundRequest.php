<?php

namespace App\Http\Requests\Refund;

use Illuminate\Foundation\Http\FormRequest;

class ProcessRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'return_id' => ['nullable', 'integer', 'exists:returns,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'reason' => ['required', 'string', 'max:255'],
            'gateway' => ['nullable', 'string', 'in:razorpay,stripe,manual,store_credit'],
            'gateway_refund_id' => ['nullable', 'string', 'max:255'],
            'payload' => ['nullable', 'array'],
        ];
    }
}
