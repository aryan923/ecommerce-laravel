<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminStaffManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected Role $superAdminRole;
    protected Role $storeManagerRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RbacSeeder']);

        $this->superAdminRole = Role::where('slug', 'super_admin')->first();
        $this->storeManagerRole = Role::where('slug', 'store_manager')->first();

        $this->superAdmin = AdminUser::where('email', 'admin@example.com')->first();
    }

    /** @test */
    public function unauthenticated_user_cannot_access_staff_api()
    {
        $response = $this->getJson('/api/v1/admin/users');
        $response->assertStatus(401);
    }

    /** @test */
    public function super_admin_can_list_staff_users()
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message'
            ]);
    }

    /** @test */
    public function super_admin_can_create_staff_user_with_role()
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'name' => 'Jane Staff',
            'email' => 'jane.staff@example.com',
            'mobile' => '+1234567890',
            'password' => 'SecretPassword123!',
            'status' => 'active',
            'role_ids' => [$this->storeManagerRole->id],
        ];

        $response = $this->postJson('/api/v1/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Jane Staff')
            ->assertJsonPath('data.email', 'jane.staff@example.com');

        $this->assertDatabaseHas('admin_users', [
            'email' => 'jane.staff@example.com',
        ]);
    }

    /** @test */
    public function cannot_create_staff_user_with_duplicate_email()
    {
        Sanctum::actingAs($this->superAdmin);

        $payload = [
            'name' => 'Duplicate Email Staff',
            'email' => 'admin@example.com',
            'password' => 'SecretPassword123!',
            'role_ids' => [$this->storeManagerRole->id],
        ];

        $response = $this->postJson('/api/v1/admin/users', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function super_admin_can_update_staff_user()
    {
        Sanctum::actingAs($this->superAdmin);

        $staff = AdminUser::create([
            'name' => 'John Staff',
            'email' => 'john.staff@example.com',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $payload = [
            'name' => 'John Staff Updated',
            'email' => 'john.staff@example.com',
            'status' => 'active',
            'role_ids' => [$this->storeManagerRole->id],
        ];

        $response = $this->putJson("/api/v1/admin/users/{$staff->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'John Staff Updated');
    }

    /** @test */
    public function super_admin_can_toggle_staff_status()
    {
        Sanctum::actingAs($this->superAdmin);

        $staff = AdminUser::create([
            'name' => 'Status Staff',
            'email' => 'status.staff@example.com',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $response = $this->patchJson("/api/v1/admin/users/{$staff->id}/status", [
            'status' => 'disabled',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'disabled');
    }

    /** @test */
    public function admin_cannot_disable_self()
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->patchJson("/api/v1/admin/users/{$this->superAdmin->id}/status", [
            'status' => 'disabled',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function super_admin_can_reset_staff_access()
    {
        Sanctum::actingAs($this->superAdmin);

        $staff = AdminUser::create([
            'name' => 'Reset Staff',
            'email' => 'reset.staff@example.com',
            'password' => bcrypt('password123'),
            'status' => 'active',
        ]);

        $response = $this->postJson("/api/v1/admin/users/{$staff->id}/reset-access", [
            'password' => 'NewSecretPassword123!',
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function super_admin_can_list_roles()
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/admin/roles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'permissions_count', 'admin_users_count']
                ]
            ]);
    }

    /** @test */
    public function super_admin_can_create_custom_role()
    {
        Sanctum::actingAs($this->superAdmin);

        $permission = Permission::first();

        $payload = [
            'name' => 'Support Agent',
            'description' => 'Handles customer queries.',
            'permission_ids' => [$permission->id],
        ];

        $response = $this->postJson('/api/v1/admin/roles', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Support Agent');

        $this->assertDatabaseHas('roles', [
            'name' => 'Support Agent',
        ]);
    }

    /** @test */
    public function cannot_delete_system_role()
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->deleteJson("/api/v1/admin/roles/{$this->superAdminRole->id}");

        $response->assertStatus(422);
    }

    /** @test */
    public function super_admin_can_retrieve_permissions_matrix()
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/admin/permissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['module', 'permissions']
                ]
            ]);
    }
}
