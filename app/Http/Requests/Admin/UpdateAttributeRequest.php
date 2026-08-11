<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $attributeId = $this->route('attribute')?->id ?? $this->route('attribute');

        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'code' => ['sometimes', 'string', 'max:100', Rule::unique('attributes', 'code')->ignore($attributeId)],
            'type' => ['sometimes', 'in:select,radio,color_picker,button'],
            'is_filterable' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:active,inactive'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
