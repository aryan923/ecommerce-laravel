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

        AuditLogService::log(
            module: 'staff',
            action: 'admin.create',
            entityType: AdminUser::class,
            entityId: $user->id,
            newValues: ['name' => $user->name, 'email' => $user->email, 'status' => $user->status, 'role_ids' => $roleIds]
        );

        return $user->load('roles');
    }

    /**
     * Update an admin staff user.
     */
    public function update(AdminUser $user, array $data): AdminUser
    {
        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'role_ids' => $user->roles->pluck('id')->toArray(),
        ];

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $roleIds = $data['role_ids'] ?? null;
        unset($data['role_ids']);

        $user->update($data);

        if ($roleIds !== null) {
            $user->roles()->sync($roleIds);
        }

        if (isset($data['status']) && in_array($data['status'], ['disabled', 'inactive'])) {
            $user->tokens()->delete();
        }

        AuditLogService::log(
            module: 'staff',
            action: 'admin.update',
            entityType: AdminUser::class,
            entityId: $user->id,
            oldValues: $oldValues,
            newValues: ['name' => $user->name, 'email' => $user->email, 'status' => $user->status, 'role_ids' => $roleIds ?? $oldValues['role_ids']]
        );

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

        $oldStatus = $targetUser->status;
        $targetUser->update(['status' => $status]);

        if (in_array($status, ['disabled', 'inactive'])) {
            $targetUser->tokens()->delete();
        }

        AuditLogService::log(
            module: 'staff',
            action: 'admin.status_change',
            entityType: AdminUser::class,
            entityId: $targetUser->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $status]
        );

        return $targetUser->load('roles');
    }

    /**
     * Reset access / password for a staff member and purge active tokens.
     */
    public function resetAccess(AdminUser $targetUser, ?string $newPassword = null): AdminUser
    {
        if ($newPassword) {
            $targetUser->update(['password' => \Illuminate\Support\Facades\Hash::make($newPassword)]);
        }

        // Purge tokens so staff member is forced to re-authenticate
        $targetUser->tokens()->delete();

        AuditLogService::log(
            module: 'staff',
            action: 'admin.reset_access',
            entityType: AdminUser::class,
            entityId: $targetUser->id,
            newValues: ['tokens_purged' => true, 'password_reset' => !empty($newPassword)]
        );

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

        AuditLogService::log(
            module: 'staff',
            action: 'admin.delete',
            entityType: AdminUser::class,
            entityId: $targetUser->id,
            oldValues: ['name' => $targetUser->name, 'email' => $targetUser->email]
        );

        $targetUser->tokens()->delete();
        return $targetUser->delete();
    }
}
