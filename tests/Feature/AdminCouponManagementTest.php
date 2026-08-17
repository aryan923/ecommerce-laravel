<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCouponManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected User $customer;
    protected Product $product;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'coupons.view'], ['module' => 'coupons', 'action' => 'view']);
        $permCreate = Permission::firstOrCreate(['name' => 'coupons.create'], ['module' => 'coupons', 'action' => 'create']);
        $permUpdate = Permission::firstOrCreate(['name' => 'coupons.update'], ['module' => 'coupons', 'action' => 'update']);
        $permDelete = Permission::firstOrCreate(['name' => 'coupons.delete'], ['module' => 'coupons', 'action' => 'delete']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([$permView->id, $permCreate->id, $permUpdate->id, $permDelete->id]);

        $this->superAdmin = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin_coupon@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->superAdmin->roles()->sync([$role->id]);

        $this->customer = User::create([
            'name' => 'John Doe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.coupon@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
            'role' => 'customer',
        ]);

        $this->category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'status' => 'active',
        ]);

        $this->product = Product::create([
            'name' => 'Wireless Headphones',
            'slug' => 'wireless-headphones',
            'sku' => 'AUDIO-001',
            'category_id' => $this->category->id,
            'price' => 2000.00,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_list_coupons_with_filters(): void
    {
        Coupon::create([
            'code' => 'TEST10',
            'name' => 'Test 10%',
            'type' => 'percentage',
            'value' => 10.00,
            'status' => 'active',
        ]);

        Coupon::create([
            'code' => 'FLAT500',
            'name' => 'Flat 500 Off',
            'type' => 'fixed_amount',
            'value' => 500.00,
            'status' => 'inactive',
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/coupons?search=TEST&type=percentage');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'TEST10');
    }

    public function test_admin_can_create_coupon_and_sync_restrictions(): void
    {
        $payload = [
            'code' => 'festive50',
            'name' => 'Festive Offer',
            'description' => 'Festive ₹500 off',
            'type' => 'fixed_amount',
            'value' => 500.00,
            'min_order_value' => 1500.00,
            'start_date' => now()->toDateTimeString(),
            'end_date' => now()->addDays(10)->toDateTimeString(),
            'usage_limit' => 100,
            'per_customer_limit' => 1,
            'product_ids' => [$this->product->id],
            'category_ids' => [$this->category->id],
            'user_ids' => [$this->customer->id],
            'status' => 'active',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/coupons', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'FESTIVE50')
            ->assertJsonCount(1, 'data.products')
            ->assertJsonCount(1, 'data.categories')
            ->assertJsonCount(1, 'data.customers');

        $this->assertDatabaseHas('coupons', ['code' => 'FESTIVE50']);
    }

    public function test_coupon_creation_validates_duplicate_code(): void
    {
        Coupon::create([
            'code' => 'UNIQUE20',
            'name' => 'Existing Coupon',
            'type' => 'percentage',
            'value' => 20.00,
            'status' => 'active',
        ]);

        $payload = [
            'code' => 'unique20',
            'name' => 'Duplicate Coupon Attempt',
            'type' => 'percentage',
            'value' => 20.00,
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/coupons', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    public function test_coupon_creation_validates_invalid_date_window(): void
    {
        $payload = [
            'code' => 'INVALIDDATES',
            'name' => 'Bad Dates',
            'type' => 'percentage',
            'value' => 10.00,
            'start_date' => now()->addDays(5)->toDateTimeString(),
            'end_date' => now()->toDateTimeString(),
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/coupons', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_admin_can_view_single_coupon_details(): void
    {
        $coupon = Coupon::create([
            'code' => 'SHOWME10',
            'name' => 'Show Details Coupon',
            'type' => 'percentage',
            'value' => 10.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson("/api/v1/admin/coupons/{$coupon->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $coupon->id)
            ->assertJsonPath('data.code', 'SHOWME10');
    }

    public function test_admin_can_update_coupon(): void
    {
        $coupon = Coupon::create([
            'code' => 'UPDATE20',
            'name' => 'Old Name',
            'type' => 'percentage',
            'value' => 20.00,
            'status' => 'active',
        ]);

        $payload = [
            'name' => 'Updated Name',
            'value' => 25.00,
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/v1/admin/coupons/{$coupon->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.value', '25.00');

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_toggle_coupon_status(): void
    {
        $coupon = Coupon::create([
            'code' => 'TOGGLE10',
            'name' => 'Toggle Status Coupon',
            'type' => 'percentage',
            'value' => 10.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/v1/admin/coupons/{$coupon->id}/status", ['status' => 'inactive']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'status' => 'inactive']);
    }

    public function test_admin_can_archive_delete_coupon(): void
    {
        $coupon = Coupon::create([
            'code' => 'DELETE10',
            'name' => 'Delete Coupon',
            'type' => 'percentage',
            'value' => 10.00,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/v1/admin/coupons/{$coupon->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'status' => 'archived']);
    }

    public function test_admin_can_view_coupon_performance_report(): void
    {
        $coupon = Coupon::create([
            'code' => 'REPORT100',
            'name' => 'Report Test Coupon',
            'type' => 'fixed_amount',
            'value' => 100.00,
            'usage_limit' => 50,
            'status' => 'active',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-REPORT-001',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'payment_method' => 'cod',
            'currency' => 'INR',
            'subtotal' => 1000.00,
            'tax_total' => 180.00,
            'shipping_total' => 50.00,
            'discount_total' => 100.00,
            'grand_total' => 1130.00,
        ]);

        CouponUsage::create([
            'coupon_id' => $coupon->id,
            'user_id' => $this->customer->id,
            'order_id' => $order->id,
            'discount_amount' => 100.00,
            'used_at' => now(),
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson("/api/v1/admin/coupons/{$coupon->id}/reports");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.metrics.total_uses', 1)
            ->assertJsonPath('data.metrics.total_discount_amount', 100)
            ->assertJsonPath('data.metrics.orders_count', 1)
            ->assertJsonPath('data.metrics.total_revenue_generated', 1130)
            ->assertJsonPath('data.metrics.remaining_uses', 49)
            ->assertJsonCount(1, 'data.recent_usages');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/admin/coupons');
        $response->assertStatus(401);
    }
}
