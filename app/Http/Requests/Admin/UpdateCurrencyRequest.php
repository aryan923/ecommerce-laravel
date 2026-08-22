<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isSuperAdmin() || $user->hasPermission('currency.manage'));
    }

    public function rules(): array
    {
        $currencyId = $this->route('currency');

        return [
            'code' => 'sometimes|string|size:3|unique:currencies,code,' . $currencyId,
            'name' => 'sometimes|string|max:100',
            'symbol' => 'sometimes|string|max:10',
            'exchange_rate' => 'sometimes|numeric|gt:0',
            'decimal_places' => 'sometimes|integer|min:0|max:6',
            'is_default' => 'sometimes|boolean',
            'status' => 'sometimes|string|in:active,inactive',
        ];
    }
}
