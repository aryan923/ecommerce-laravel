<?php

namespace App\Services;

use App\Models\AdminUser;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class AdminUserService
{
    /**
     * List admin users with search, status filtering, and pagination.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = AdminUser::with('roles');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['role_id'])) {
            $query->whereHas('roles', function ($q) use ($filters) {
                $q->where('roles.id', $filters['role_id']);
            });
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Create a new admin staff user.
     */
    public function create(array $data): AdminUser
    {
        $roleIds = $data['role_ids'] ?? [];
        unset($data['role_ids']);

        $user = AdminUser::create($data);

        if (!empty($roleIds)) {
            $user->roles()->sync($roleIds);
        }

        return $user->load('roles');
    }

    /**
     * Update an admin staff user.
     */
    public function update(AdminUser $user, array $data): AdminUser
    {
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $roleIds = $data['role_ids'] ?? null;
        unset($data['role_ids']);

        $user->update($data);

        if ($roleIds !== null) {
            $user->roles()->sync($roleIds);
        }

        return $user->load('roles');
    }

    /**
     * Toggle status for an admin user (prevent disabling self).
     */
    public function toggleStatus(AdminUser $targetUser, string $status, AdminUser $currentAdmin): AdminUser
    {
        if ($targetUser->id === $currentAdmin->id && in_array($status, ['disabled', 'inactive'])) {
            throw ValidationException::withMessages([
                'status' => ['You cannot disable or deactivate your own admin account.'],
            ]);
        }

        $targetUser->update(['status' => $status]);

        return $targetUser->load('roles');
    }

    /**
     * Delete an admin user (prevent self-deletion).
     */
    public function delete(AdminUser $targetUser, AdminUser $currentAdmin): bool
    {
        if ($targetUser->id === $currentAdmin->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own admin account.'],
            ]);
        }

        return $targetUser->delete();
    }
}
