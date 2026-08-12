<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutProcessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'idempotency_key' => ['nullable', 'string', 'max:100'],
            'guest_name' => ['required_without:shipping_address_id', 'nullable', 'string', 'max:255'],
            'guest_email' => ['required_without:shipping_address_id', 'nullable', 'email', 'max:255'],
            'shipping_address_id' => ['nullable', 'exists:addresses,id'],
            'shipping_address' => ['required_without:shipping_address_id', 'nullable', 'array'],
            'shipping_address.address_line1' => ['required_with:shipping_address', 'string', 'max:255'],
            'shipping_address.city' => ['required_with:shipping_address', 'string', 'max:100'],
            'shipping_address.state_code' => ['required_with:shipping_address', 'string', 'max:10'],
            'shipping_address.postal_code' => ['required_with:shipping_address', 'string', 'max:20'],
            'shipping_address.country_code' => ['nullable', 'string', 'max:2'],
            'billing_address_id' => ['nullable', 'exists:addresses,id'],
            'billing_address' => ['nullable', 'array'],
            'shipping_method_id' => ['nullable', 'exists:shipping_methods,id'],
            'payment_method' => ['required', 'string', Rule::in(['cod', 'razorpay', 'stripe', 'bank_transfer'])],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}
