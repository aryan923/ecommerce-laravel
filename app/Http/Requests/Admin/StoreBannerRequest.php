<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'image_desktop' => ['required', 'string', 'max:1024'],
            'image_mobile' => ['nullable', 'string', 'max:1024'],
            'link_url' => ['nullable', 'string', 'max:1024'],
            'button_text' => ['nullable', 'string', 'max:100'],
            'placement' => ['required', 'string', 'in:home_hero,category_banner,sidebar,footer,popup'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'ends_at' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:starts_at'],
        ];
    }
}
