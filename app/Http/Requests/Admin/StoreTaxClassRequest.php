<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaxClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $taxClassId = $this->route('id') ?? $this->route('tax_class');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('tax_classes', 'name')->ignore($taxClassId)],
            'description' => ['nullable', 'string'],
            'is_default' => ['boolean'],
        ];
    }
}
