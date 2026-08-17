<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\AdminUser;
use App\Models\Order;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'customers.view'], ['module' => 'customers', 'action' => 'view']);
        $permUpdate = Permission::firstOrCreate(['name' => 'customers.update'], ['module' => 'customers', 'action' => 'update']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([$permView->id, $permUpdate->id]);

        $this->superAdmin = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin_cust@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->superAdmin->roles()->sync([$role->id]);

        $this->customer = User::create([
            'name' => 'Alice Smith',
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => 'alice@example.com',
            'mobile' => '+919876543210',
            'password' => bcrypt('password'),
            'status' => 'active',
            'role' => 'customer',
        ]);

        Order::create([
            'order_number' => 'ORD-10001',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'payment_method' => 'cod',
            'currency' => 'INR',
            'subtotal' => 1000.00,
            'tax_total' => 180.00,
            'shipping_total' => 50.00,
            'discount_total' => 0.00,
            'grand_total' => 1230.00,
        ]);

        Address::create([
            'name' => 'Alice Smith',
            'mobile' => '+919876543210',
            'user_id' => $this->customer->id,
            'line_1' => '123 Tech Park',
            'city' => 'Bangalore',
            'state' => 'Karnataka',
            'postal_code' => '560001',
            'country' => 'India',
            'is_default_shipping' => true,
        ]);
    }

    public function test_super_admin_can_view_customer_stats(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/customers/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_customers' => 1,
                    'active_customers' => 1,
                    'total_customer_revenue' => 1230.00,
                ],
            ]);
    }

    public function test_super_admin_can_list_customers(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/customers?search=Alice');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_super_admin_can_view_customer_profile_and_tabs(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson("/api/v1/admin/customers/{$this->customer->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'metrics' => [
                        'total_orders' => 1,
                        'total_spent' => 1230.00,
                    ],
                ],
            ]);

        // Orders tab test
        $ordersResponse = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson("/api/v1/admin/customers/{$this->customer->id}/orders");

        $ordersResponse->assertStatus(200);
        $this->assertCount(1, $ordersResponse->json('data'));

        // Addresses tab test
        $addressesResponse = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson("/api/v1/admin/customers/{$this->customer->id}/addresses");

        $addressesResponse->assertStatus(200);
        $this->assertCount(1, $addressesResponse->json('data'));
    }

    public function test_super_admin_can_update_customer_status(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/v1/admin/customers/{$this->customer->id}/status", [
                'status' => 'suspended',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'suspended',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->customer->id,
            'status' => 'suspended',
        ]);
    }

    public function test_super_admin_can_update_admin_notes(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/v1/admin/customers/{$this->customer->id}/notes", [
                'notes' => 'VIP corporate client account.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'admin_notes' => 'VIP corporate client account.',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->customer->id,
            'admin_notes' => 'VIP corporate client account.',
        ]);
    }
}
