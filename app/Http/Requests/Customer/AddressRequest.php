<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isPost = $this->isMethod('post');
        $req = $isPost ? 'required' : 'sometimes';

        return [
            'name' => "{$req}|string|max:150",
            'mobile' => "{$req}|string|max:20",
            'line_1' => "{$req}|string|max:255",
            'line_2' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'city' => "{$req}|string|max:100",
            'state' => "{$req}|string|max:100",
            'country' => 'sometimes|string|max:100',
            'postal_code' => "{$req}|string|max:20",
            'type' => 'sometimes|in:home,office,other',
            'is_default_shipping' => 'sometimes|boolean',
            'is_default_billing' => 'sometimes|boolean',
        ];
    }
}
