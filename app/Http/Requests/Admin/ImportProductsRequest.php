<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'products' => ['required', 'array', 'min:1'],
            'products.*.name' => ['required', 'string', 'max:255'],
            'products.*.price' => ['required', 'numeric', 'min:0'],
            'products.*.sku' => ['nullable', 'string', 'max:100'],
            'products.*.type' => ['nullable', 'string', 'in:simple,variable,digital'],
            'products.*.status' => ['nullable', 'string', 'in:draft,active,inactive,archived'],
        ];
    }
}
