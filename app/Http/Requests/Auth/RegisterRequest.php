<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && (!$this->has('first_name') || !$this->has('last_name'))) {
            $nameParts = explode(' ', trim($this->input('name')), 2);
            $this->merge([
                'first_name' => $nameParts[0] ?? $this->input('name'),
                'last_name' => $nameParts[1] ?? ($nameParts[0] ?? 'Customer'),
            ]);
        }

        if (!$this->has('terms_accepted') && $this->has('terms')) {
            $this->merge([
                'terms_accepted' => filter_var($this->input('terms'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'mobile' => ['nullable', 'string', 'max:20', 'unique:users,mobile'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'terms_accepted' => ['required', 'boolean', 'accepted'],
        ];
    }
}
