<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RbacSeeder']);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
    }

    public function test_super_admin_can_view_order_stats(): void
    {
        Order::create([
            'order_number' => 'ORD-20260814-0001',
            'status' => 'pending_payment',
            'currency' => 'INR',
            'subtotal' => 100.00,
            'grand_total' => 100.00,
        ]);

        Order::create([
            'order_number' => 'ORD-20260814-0002',
            'status' => 'delivered',
            'currency' => 'INR',
            'subtotal' => 250.00,
            'grand_total' => 250.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/orders/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_orders' => 2,
                    'pending_orders' => 1,
                    'delivered_orders' => 1,
                    'total_revenue' => 350.00,
                ],
            ]);
    }

    public function test_super_admin_can_list_orders(): void
    {
        Order::create([
            'order_number' => 'ORD-TEST-1001',
            'guest_name' => 'John Doe',
            'guest_email' => 'john@example.com',
            'status' => 'confirmed',
            'currency' => 'INR',
            'grand_total' => 500.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/orders?search=1001');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonPath('data.0.order_number', 'ORD-TEST-1001');
    }

    public function test_super_admin_can_view_order_360_details(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TEST-1002',
            'guest_name' => 'Jane Smith',
            'guest_email' => 'jane@example.com',
            'status' => 'processing',
            'currency' => 'INR',
            'grand_total' => 750.00,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_name' => 'Sample Smartphone',
            'sku' => 'PHONE-SMPL-01',
            'unit_price' => 750.00,
            'quantity' => 1,
            'total_amount' => 750.00,
            'snapshot_data' => [
                'name' => 'Sample Smartphone',
                'sku' => 'PHONE-SMPL-01',
            ],
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $order->id,
                    'order_number' => 'ORD-TEST-1002',
                ],
            ])
            ->assertJsonPath('data.items.0.sku', 'PHONE-SMPL-01');
    }

    public function test_super_admin_can_update_order_status_and_audit_history(): void
    {
        $this->withoutExceptionHandling();
        $order = Order::create([
            'order_number' => 'ORD-TEST-1003',
            'status' => 'confirmed',
            'currency' => 'INR',
            'grand_total' => 300.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/orders/{$order->id}/status", [
                'status' => 'processing',
                'comment' => 'Moved to processing queue by admin.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'processing',
                ],
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'processing',
        ]);

        $this->assertDatabaseHas('order_histories', [
            'order_id' => $order->id,
            'status' => 'processing',
            'comment' => 'Moved to processing queue by admin.',
        ]);
    }

    public function test_super_admin_can_create_shipment(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TEST-1004',
            'status' => 'processing',
            'currency' => 'INR',
            'grand_total' => 1200.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/orders/{$order->id}/shipment", [
                'courier_name' => 'FedEx Express',
                'awb_number' => 'AWB-88776655',
                'tracking_number' => 'TRK887766',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'courier_name' => 'FedEx Express',
                    'awb_number' => 'AWB-88776655',
                    'tracking_number' => 'TRK887766',
                ],
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'shipped',
        ]);
    }

    public function test_super_admin_can_update_admin_notes(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TEST-1005',
            'status' => 'pending_payment',
            'currency' => 'INR',
            'grand_total' => 450.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/orders/{$order->id}/notes", [
                'notes' => 'Customer requested evening delivery after 6 PM.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'admin_notes' => 'Customer requested evening delivery after 6 PM.',
        ]);
    }
}
