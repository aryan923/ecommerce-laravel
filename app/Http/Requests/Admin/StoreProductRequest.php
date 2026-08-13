<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'type' => ['required', 'in:simple,variable,digital'],
            'status' => ['sometimes', 'in:draft,active,inactive,archived'],
            'featured' => ['sometimes', 'boolean'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['exists:categories,id'],
            'primary_category_id' => ['nullable', 'exists:categories,id'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'tax_class' => ['nullable', 'array'],
            'tax_class.*' => ['string', 'max:50'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'length' => ['nullable', 'numeric', 'min:0'],
            'width' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'download_url' => ['required_if:type,digital', 'nullable', 'string'],
            'download_limit' => ['nullable', 'integer', 'min:1'],
            'download_expiry_days' => ['nullable', 'integer', 'min:1'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.sku' => ['nullable', 'string', 'max:100'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.cost_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock_qty' => ['nullable', 'integer', 'min:0'],
            'variants.*.image' => ['nullable', 'string'],
            'variants.*.download_url' => ['nullable', 'string'],
            'variants.*.download_limit' => ['nullable', 'integer'],
            'variants.*.download_expiry_days' => ['nullable', 'integer'],
            'variants.*.attribute_value_ids' => ['nullable', 'array'],
            'variants.*.attribute_value_ids.*' => ['exists:attribute_values,id'],
        ];
    }
}
