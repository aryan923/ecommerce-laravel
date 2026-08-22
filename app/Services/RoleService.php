<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RoleService
{
    /**
     * List all roles with permission and staff counts.
     */
    public function list(): Collection
    {
        return Role::withCount(['permissions', 'adminUsers'])
            ->with('permissions')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Create a new role with permissions.
     */
    public function create(array $data): Role
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name'], '_');
        }

        $permissionIds = $data['permission_ids'] ?? [];
        unset($data['permission_ids']);

        $role = Role::create($data);

        if (!empty($permissionIds)) {
            $role->permissions()->sync($permissionIds);
        }

        AuditLogService::log(
            module: 'roles',
            action: 'role.create',
            entityType: Role::class,
            entityId: $role->id,
            newValues: ['name' => $role->name, 'slug' => $role->slug, 'permission_ids' => $permissionIds]
        );

        return $role->load('permissions');
    }

    /**
     * Update an existing role and permissions.
     */
    public function update(Role $role, array $data): Role
    {
        $oldValues = [
            'name' => $role->name,
            'description' => $role->description,
            'permission_ids' => $role->permissions->pluck('id')->toArray(),
        ];

        $permissionIds = $data['permission_ids'] ?? null;
        unset($data['permission_ids']);

        $role->update($data);

        if ($permissionIds !== null) {
            $role->permissions()->sync($permissionIds);
        }

        AuditLogService::log(
            module: 'roles',
            action: 'role.update',
            entityType: Role::class,
            entityId: $role->id,
            oldValues: $oldValues,
            newValues: ['name' => $role->name, 'description' => $role->description, 'permission_ids' => $permissionIds ?? $oldValues['permission_ids']]
        );

        return $role->load('permissions');
    }

    /**
     * Delete a role (prevent deletion of system roles or assigned roles).
     */
    public function delete(Role $role): bool
    {
        if ($role->is_system) {
            throw ValidationException::withMessages([
                'role' => ['System roles cannot be deleted.'],
            ]);
        }

        if ($role->adminUsers()->exists()) {
            throw ValidationException::withMessages([
                'role' => ['Cannot delete a role currently assigned to active staff members.'],
            ]);
        }

        AuditLogService::log(
            module: 'roles',
            action: 'role.delete',
            entityType: Role::class,
            entityId: $role->id,
            oldValues: ['name' => $role->name, 'slug' => $role->slug]
        );

        return $role->delete();
    }
}
