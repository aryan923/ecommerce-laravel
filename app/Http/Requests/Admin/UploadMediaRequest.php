<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required_without:files|file|mimes:jpg,jpeg,png,webp,gif,svg,pdf|max:10240',
            'files' => 'required_without:file|array|max:10',
            'files.*' => 'file|mimes:jpg,jpeg,png,webp,gif,svg,pdf|max:10240',
            'model_type' => 'nullable|string|in:product,category,brand,banner,cms_page',
            'model_id' => 'nullable|integer|required_with:model_type',
            'type' => 'nullable|in:main,gallery,thumbnail,banner,document',
            'alt' => 'nullable|string|max:255',
        ];
    }
}
