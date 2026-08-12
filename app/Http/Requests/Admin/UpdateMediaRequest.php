<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'alt' => 'nullable|string|max:255',
            'type' => 'sometimes|in:main,gallery,thumbnail,banner,document',
            'sort_order' => 'sometimes|integer|min:0',
        ];
    }
}
