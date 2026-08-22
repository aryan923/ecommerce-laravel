<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isSuperAdmin() || $user->hasPermission('currency.manage'));
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|size:3|unique:currencies,code',
            'name' => 'required|string|max:100',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|gt:0',
            'decimal_places' => 'sometimes|integer|min:0|max:6',
            'is_default' => 'sometimes|boolean',
            'status' => 'sometimes|string|in:active,inactive',
        ];
    }
}
