<?php

namespace App\Services;

use App\Models\AdminUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthService
{
    /**
     * Authenticate admin user with email or mobile.
     *
     * @param string $login
     * @param string $password
     * @param string|null $ipAddress
     * @return array
     * @throws ValidationException
     */
    public function login(string $login, string $password, ?string $ipAddress = null): array
    {
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'mobile';

        $admin = AdminUser::where($field, $login)->first();

        if (!$admin || !Hash::check($password, $admin->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid admin credentials provided.'],
            ]);
        }

        if ($admin->status !== 'active') {
            throw ValidationException::withMessages([
                'login' => ['Your admin account is disabled or inactive.'],
            ]);
        }

        $admin->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress,
        ]);

        $token = $admin->createToken('admin_token', ['role:admin'])->plainTextToken;

        return [
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'mobile' => $admin->mobile,
                'status' => $admin->status,
                'roles' => $admin->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'permissions' => $admin->getAllPermissions(),
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Revoke tokens for authenticated admin user.
     *
     * @param AdminUser $admin
     * @param bool $logoutAll
     * @return void
     */
    public function logout(AdminUser $admin, bool $logoutAll = false): void
    {
        if ($logoutAll) {
            $admin->tokens()->delete();
        } else {
            $admin->currentAccessToken()?->delete();
        }
    }
}
