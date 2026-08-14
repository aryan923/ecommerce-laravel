<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\AdminUser;
use App\Models\CustomerNote;
use App\Models\Order;
use App\Models\Permission;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::firstOrCreate(['name' => 'super_admin'], ['slug' => 'super-admin', 'description' => 'Super Admin']);
        $permissionView = Permission::firstOrCreate(['name' => 'customers.view'], ['module' => 'customers', 'action' => 'view']);
        $permissionUpdate = Permission::firstOrCreate(['name' => 'customers.update'], ['module' => 'customers', 'action' => 'update']);

        $role->permissions()->syncWithoutDetaching([$permissionView->id, $permissionUpdate->id]);

        $this->admin = AdminUser::factory()->create(['status' => 'active']);
        $this->admin->roles()->attach($role);
    }

    public function test_admin_can_fetch_customer_executive_stats(): void
    {
        User::factory()->create(['role' => 'customer', 'status' => 'active']);
        User::factory()->create(['role' => 'customer', 'status' => 'suspended']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/customers/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_customers',
                    'active_customers',
                    'suspended_customers',
                    'new_customers_this_month',
                    'total_revenue',
                ],
            ]);
    }

    public function test_admin_can_fetch_paginated_customer_list(): void
    {
        User::factory()->count(5)->create(['role' => 'customer']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/customers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'email', 'status', 'orders_count'],
                ],
                'meta' => ['current_page', 'last_page', 'total'],
            ]);
    }

    public function test_admin_can_search_customers_by_name_email_mobile(): void
    {
        User::factory()->create(['name' => 'Alice Walker', 'email' => 'alice@example.com', 'role' => 'customer']);
        User::factory()->create(['name' => 'Bob Builder', 'email' => 'bob@example.com', 'role' => 'customer']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/customers?search=Alice');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'alice@example.com');
    }

    public function test_admin_can_filter_customers_by_status(): void
    {
        User::factory()->create(['role' => 'customer', 'status' => 'active']);
        User::factory()->create(['role' => 'customer', 'status' => 'suspended']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/customers?status=suspended');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'suspended');
    }

    public function test_admin_can_fetch_single_customer_profile_with_lifetime_metrics(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/customers/{$customer->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $customer->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'email',
                    'total_orders',
                    'total_spent',
                    'avg_order_value',
                ],
            ]);
    }

    public function test_admin_can_update_customer_basic_info(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'name' => 'Original Name']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/customers/{$customer->id}", [
                'name' => 'Updated Customer Name',
                'email' => $customer->email,
                'mobile' => '+1987654321',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Customer Name')
            ->assertJsonPath('data.mobile', '+1987654321');
    }

    public function test_admin_can_toggle_customer_account_status(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'status' => 'active']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/customers/{$customer->id}/status", [
                'status' => 'suspended',
                'reason' => 'Policy violation review',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'suspended');

        $this->assertDatabaseHas('users', [
            'id' => $customer->id,
            'status' => 'suspended',
        ]);
    }

    public function test_admin_can_add_and_fetch_internal_staff_notes(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $responsePost = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/customers/{$customer->id}/notes", [
                'note' => 'Spoke with customer over phone regarding order inquiry.',
            ]);

        $responsePost->assertStatus(201)
            ->assertJsonPath('data.note', 'Spoke with customer over phone regarding order inquiry.');

        $responseGet = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/customers/{$customer->id}/notes");

        $responseGet->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.note', 'Spoke with customer over phone regarding order inquiry.');
    }

    public function test_admin_can_trigger_secure_password_reset(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/customers/{$customer->id}/reset-password");

        $response->assertStatus(200)
            ->assertJsonPath('data.email', $customer->email)
            ->assertJsonStructure(['data' => ['reset_token']]);
    }

    public function test_admin_can_export_customers_csv(): void
    {
        User::factory()->count(2)->create(['role' => 'customer']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->get('/api/v1/admin/customers/export');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
