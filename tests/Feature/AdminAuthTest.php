<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        // Register dummy test routes for CheckAdminPermission middleware testing
        Route::middleware(['auth:sanctum', 'permission:products.create'])
            ->get('/api/v1/admin/test-permission', fn() => response()->json(['success' => true]));
    }

    /**
     * Test successful admin login.
     */
    public function test_admin_login_success(): void
    {
        $response = $this->postJson('/api/v1/admin/auth/login', [
            'login' => 'admin@example.com',
            'password' => 'SecretAdmin123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Admin login successful.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'admin' => ['id', 'name', 'email', 'status', 'roles', 'permissions'],
                    'token',
                    'token_type',
                ],
            ]);
    }

    /**
     * Test admin login fails with incorrect password.
     */
    public function test_admin_login_fails_with_incorrect_password(): void
    {
        $response = $this->postJson('/api/v1/admin/auth/login', [
            'login' => 'admin@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);
    }

    /**
     * Test admin login fails when account is disabled.
     */
    public function test_admin_login_fails_when_disabled(): void
    {
        $admin = AdminUser::where('email', 'admin@example.com')->first();
        $admin->update(['status' => 'disabled']);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'login' => 'admin@example.com',
            'password' => 'SecretAdmin123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);
    }

    /**
     * Test fetching authenticated admin profile.
     */
    public function test_authenticated_admin_can_fetch_profile(): void
    {
        $admin = AdminUser::where('email', 'admin@example.com')->first();
        $token = $admin->createToken('admin_token', ['role:admin'])->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'admin' => [
                        'email' => 'admin@example.com',
                        'permissions' => ['*'],
                    ],
                ],
            ]);
    }

    /**
     * Test CheckAdminPermission middleware allows Super Admin access.
     */
    public function test_check_admin_permission_middleware_allows_super_admin(): void
    {
        $superAdmin = AdminUser::where('email', 'admin@example.com')->first();
        $token = $superAdmin->createToken('admin_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/test-permission');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Test CheckAdminPermission middleware denies admin lacking required permission.
     */
    public function test_check_admin_permission_middleware_denies_unauthorized_role(): void
    {
        $role = Role::create(['name' => 'Order Staff', 'slug' => 'order_staff']);
        $permission = Permission::where('name', 'orders.view')->first();
        $role->permissions()->sync([$permission->id]);

        $staff = AdminUser::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('Password123!'),
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('admin_token')->plainTextToken;

        // Staff attempts to access products.create endpoint
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/test-permission');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to perform this action.',
            ]);
    }

    /**
     * Test guard isolation: Customer token cannot access Admin /me endpoint.
     */
    public function test_guard_isolation_customer_token_cannot_access_admin_me(): void
    {
        $customer = User::factory()->create();
        $customerToken = $customer->createToken('customer_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $customerToken)
            ->getJson('/api/v1/admin/auth/me');

        $response->assertStatus(401);
    }

    /**
     * Test admin logout revokes Sanctum token.
     */
    public function test_admin_logout_revokes_token(): void
    {
        $admin = AdminUser::where('email', 'admin@example.com')->first();
        $token = $admin->createToken('admin_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Admin logged out successfully.',
            ]);

        $this->assertCount(0, $admin->fresh()->tokens);
    }
}
