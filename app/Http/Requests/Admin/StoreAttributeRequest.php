<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'code' => ['nullable', 'string', 'max:100', 'unique:attributes,code'],
            'type' => ['sometimes', 'in:select,radio,color_picker,button'],
            'is_filterable' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:active,inactive'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
