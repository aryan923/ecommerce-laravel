<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:admin_users,email'],
            'mobile' => ['nullable', 'string', 'max:20', 'unique:admin_users,mobile'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['sometimes', 'in:active,inactive,disabled'],
            'role_ids' => ['required', 'array'],
            'role_ids.*' => ['exists:roles,id'],
        ];
    }
}
