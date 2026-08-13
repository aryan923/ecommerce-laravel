<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'variables' => ['nullable', 'array'],
            'variables.*' => ['string'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
