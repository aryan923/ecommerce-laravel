<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new customer.
     *
     * @param array $data
     * @return array
     */
    public function register(array $data): array
    {
        $data['name'] = trim("{$data['first_name']} {$data['last_name']}");
        $data['status'] = 'active';
        $data['role'] = 'customer';

        $user = User::create($data);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Authenticate customer with email or mobile.
     *
     * @param string $login
     * @param string $password
     * @return array
     * @throws ValidationException
     */
    public function login(string $login, string $password): array
    {
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'mobile';

        $user = User::where($field, $login)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials provided.'],
            ]);
        }

        if ($user->status === 'suspended' || $user->status === 'inactive') {
            throw ValidationException::withMessages([
                'login' => ['Your account is suspended or inactive.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Revoke tokens for authenticated customer.
     *
     * @param User $user
     * @param bool $logoutAll
     * @return void
     */
    public function logout(User $user, bool $logoutAll = false): void
    {
        if ($logoutAll) {
            $user->tokens()->delete();
        } else {
            $user->currentAccessToken()?->delete();
        }
    }

    /**
     * Send password reset OTP code.
     *
     * @param string $identifier
     * @return void
     */
    public function forgotPassword(string $identifier): void
    {
        $user = User::where('email', $identifier)->orWhere('mobile', $identifier)->first();

        if (!$user) {
            // Do not leak account non-existence for security
            return;
        }

        $otpCode = (string) rand(100000, 999999);

        Otp::create([
            'identifier' => $identifier,
            'code' => $otpCode,
            'type' => 'password_reset',
            'expires_at' => now()->addMinutes(15),
        ]);

        // Note: Notification/Email dispatch will be handled in Module 21
    }

    /**
     * Reset password using OTP code.
     *
     * @param string $identifier
     * @param string $otpCode
     * @param string $newPassword
     * @return void
     * @throws ValidationException
     */
    public function resetPassword(string $identifier, string $otpCode, string $newPassword): void
    {
        $otp = Otp::valid($identifier, 'password_reset')
            ->orderBy('id', 'desc')
            ->first();

        if (!$otp || !Hash::check($otpCode, $otp->code)) {
            if ($otp) {
                $otp->increment('attempts');
            }
            throw ValidationException::withMessages([
                'otp_code' => ['Invalid or expired OTP code.'],
            ]);
        }

        $user = User::where('email', $identifier)->orWhere('mobile', $identifier)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'identifier' => ['User account not found.'],
            ]);
        }

        $user->update([
            'password' => $newPassword,
        ]);

        $otp->update([
            'verified_at' => now(),
        ]);

        // Revoke all existing tokens for security
        $user->tokens()->delete();
    }
}
