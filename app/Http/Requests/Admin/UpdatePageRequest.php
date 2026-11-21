<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $reservedSlugs = ['cart', 'checkout', 'account', 'login', 'admin', 'api', 'register', 'auth'];
        $pageId = $this->route('id') ?? $this->route('page');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('pages', 'slug')->ignore($pageId),
                Rule::notIn($reservedSlugs),
            ],
            'content' => ['sometimes', 'required', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', 'string', 'in:published,draft,archived'],
        ];
    }
}
