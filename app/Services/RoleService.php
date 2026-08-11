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

        return $role->load('permissions');
    }

    /**
     * Update an existing role and permissions.
     */
    public function update(Role $role, array $data): Role
    {
        $permissionIds = $data['permission_ids'] ?? null;
        unset($data['permission_ids']);

        $role->update($data);

        if ($permissionIds !== null) {
            $role->permissions()->sync($permissionIds);
        }

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

        return $role->delete();
    }
}
