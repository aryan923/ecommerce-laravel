<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaxClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $taxClassId = $this->route('tax_class') ?? $this->route('id');

        return [
            'name' => 'sometimes|required|string|max:150',
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('tax_classes', 'code')->ignore($taxClassId),
            ],
            'description' => 'nullable|string',
            'is_default' => 'nullable|boolean',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
