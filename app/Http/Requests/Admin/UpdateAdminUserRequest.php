<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('admin_users', 'email')->ignore($userId)],
            'mobile' => ['nullable', 'string', 'max:20', Rule::unique('admin_users', 'mobile')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['sometimes', 'in:active,inactive,disabled'],
            'role_ids' => ['sometimes', 'array'],
            'role_ids.*' => ['exists:roles,id'],
        ];
    }
}
