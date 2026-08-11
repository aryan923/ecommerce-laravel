<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserCrudTest extends TestCase
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
     * Test Super Admin can list staff users.
     */
    public function test_super_admin_can_list_staff_users(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Admin staff users retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'status', 'roles'],
                ],
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ]);
    }

    /**
     * Test Super Admin can create a new staff user.
     */
    public function test_super_admin_can_create_staff_user(): void
    {
        $role = Role::where('slug', 'product_manager')->first();

        $payload = [
            'name' => 'Jane Product Staff',
            'email' => 'jane.product@example.com',
            'mobile' => '+12223334444',
            'password' => 'SecretStaff123!',
            'status' => 'active',
            'role_ids' => [$role->id],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Admin staff user created successfully.',
            ]);

        $this->assertDatabaseHas('admin_users', [
            'email' => 'jane.product@example.com',
            'status' => 'active',
        ]);
    }

    /**
     * Test Super Admin can update staff user details.
     */
    public function test_super_admin_can_update_staff_user(): void
    {
        $staff = AdminUser::create([
            'name' => 'Old Staff Name',
            'email' => 'old.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/users/{$staff->id}", [
                'name' => 'New Updated Staff Name',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'New Updated Staff Name',
                ],
            ]);
    }

    /**
     * Test Super Admin can toggle staff status.
     */
    public function test_super_admin_can_toggle_staff_status(): void
    {
        $staff = AdminUser::create([
            'name' => 'Active Staff',
            'email' => 'active.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/v1/admin/users/{$staff->id}/status", [
                'status' => 'disabled',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'disabled',
                ],
            ]);
    }

    /**
     * Test Super Admin cannot disable self.
     */
    public function test_super_admin_cannot_disable_self(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/v1/admin/users/{$this->superAdmin->id}/status", [
                'status' => 'disabled',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    /**
     * Test Super Admin cannot delete self.
     */
    public function test_super_admin_cannot_delete_self(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/users/{$this->superAdmin->id}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user']);
    }

    /**
     * Test staff member without staff.create permission cannot create staff user.
     */
    public function test_unauthorized_admin_cannot_create_staff(): void
    {
        $role = Role::where('slug', 'order_manager')->first();
        $staff = AdminUser::create([
            'name' => 'Order Manager',
            'email' => 'orders.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('staff_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/users', [
                'name' => 'New Staff',
                'email' => 'new.staff@example.com',
                'password' => 'Password123!',
                'role_ids' => [$role->id],
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to perform this action.',
            ]);
    }
}
