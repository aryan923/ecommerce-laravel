<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class TestDispatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event' => ['required', 'string', 'max:255'],
            'recipient' => ['required', 'string', 'max:255'],
            'data' => ['required', 'array'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['string', 'in:email,sms,push,in_app'],
        ];
    }
}
