<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleCrudTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected string $superAdminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = AdminUser::where('email', 'admin@example.com')->first();
        $this->superAdminToken = $this->superAdmin->createToken('admin_token')->plainTextToken;
    }

    /**
     * Test Super Admin can list all roles.
     */
    public function test_super_admin_can_list_roles(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/roles');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description', 'permissions_count', 'admin_users_count', 'permissions'],
                ],
            ]);
    }

    /**
     * Test Super Admin can create a custom role with permissions.
     */
    public function test_super_admin_can_create_role(): void
    {
        $permissions = Permission::whereIn('module', ['products', 'categories'])->pluck('id')->toArray();

        $payload = [
            'name' => 'Custom Catalog Lead',
            'description' => 'Custom role for managing catalog',
            'permission_ids' => $permissions,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/roles', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Role created successfully.',
            ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'Custom Catalog Lead',
            'slug' => 'custom_catalog_lead',
        ]);
    }

    /**
     * Test Super Admin can update custom role details.
     */
    public function test_super_admin_can_update_role(): void
    {
        $role = Role::create([
            'name' => 'Original Role Name',
            'slug' => 'original_role_name',
            'is_system' => false,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/roles/{$role->id}", [
                'name' => 'Updated Role Name',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Updated Role Name',
                ],
            ]);
    }

    /**
     * Test Super Admin cannot delete system role.
     */
    public function test_super_admin_cannot_delete_system_role(): void
    {
        $superAdminRole = Role::where('slug', 'super_admin')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/roles/{$superAdminRole->id}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    /**
     * Test Super Admin can list permissions grouped by module.
     */
    public function test_super_admin_can_list_permissions_grouped_by_module(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/permissions');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permissions retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'module',
                        'permissions' => [
                            '*' => ['id', 'name', 'module', 'action'],
                        ],
                    ],
                ],
            ]);
    }
}
