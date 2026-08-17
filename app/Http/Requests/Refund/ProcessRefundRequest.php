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
            'reason' => ['required', 'string', 'max:500'],
            'gateway' => ['nullable', 'string', 'max:50'],
            'refund_channel' => ['nullable', 'string', 'in:original_gateway,bank_transfer,store_credit,manual_cash'],
            'bank_account_id' => ['nullable', 'integer', 'exists:customer_bank_accounts,id'],
            'bank_details_snapshot' => ['nullable', 'array'],
            'bank_details' => ['nullable', 'array'],
            'gateway_refund_id' => ['nullable', 'string', 'max:255'],
            'transaction_reference' => ['nullable', 'string', 'max:100'],
            'payload' => ['nullable', 'array'],
        ];
    }
}
