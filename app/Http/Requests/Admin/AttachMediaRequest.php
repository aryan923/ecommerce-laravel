<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AttachMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_id' => 'required|exists:media,id',
            'model_type' => 'required|string|in:product,category,brand,banner,cms_page',
            'model_id' => 'required|integer',
            'type' => 'sometimes|in:main,gallery,thumbnail,banner,document',
            'alt' => 'nullable|string|max:255',
        ];
    }
}
