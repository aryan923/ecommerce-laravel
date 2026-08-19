<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'shipping.view'], ['module' => 'shipping', 'action' => 'view']);
        $permCreate = Permission::firstOrCreate(['name' => 'shipping.create'], ['module' => 'shipping', 'action' => 'create']);
        $permUpdate = Permission::firstOrCreate(['name' => 'shipping.update'], ['module' => 'shipping', 'action' => 'update']);
        $permDelete = Permission::firstOrCreate(['name' => 'shipping.delete'], ['module' => 'shipping', 'action' => 'delete']);
        $permManage = Permission::firstOrCreate(['name' => 'shipments.manage'], ['module' => 'shipments', 'action' => 'manage']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([$permView->id, $permCreate->id, $permUpdate->id, $permDelete->id, $permManage->id]);

        $this->adminUser = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin_shipping@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->sync([$role->id]);
    }

    public function test_unauthenticated_user_cannot_access_shipping_zones()
    {
        $response = $this->getJson('/api/v1/admin/shipping/zones');
        $response->assertStatus(401);
    }

    public function test_admin_can_list_shipping_zones()
    {
        ShippingZone::create([
            'name' => 'Domestic Metro',
            'countries' => ['US'],
            'states' => ['NY', 'CA'],
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/shipping/zones');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_create_shipping_zone()
    {
        $payload = [
            'name' => 'North America Express',
            'description' => 'Fast continental fulfillment',
            'countries' => ['US', 'CA'],
            'states' => ['NY', 'ON'],
            'is_global' => false,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/shipping/zones', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'North America Express');

        $this->assertDatabaseHas('shipping_zones', ['name' => 'North America Express']);
    }

    public function test_admin_can_create_shipping_method_with_rates()
    {
        $zone = ShippingZone::create([
            'name' => 'Default Zone',
            'status' => 'active',
        ]);

        $payload = [
            'shipping_zone_id' => $zone->id,
            'name' => 'FedEx Priority',
            'code' => 'FEDEX_PRIORITY',
            'carrier_name' => 'FedEx',
            'calculation_type' => 'weight_based',
            'base_cost' => 15.00,
            'handling_fee' => 2.50,
            'rates' => [
                ['min_value' => 0.0, 'max_value' => 5.0, 'rate_value' => 15.00],
                ['min_value' => 5.1, 'max_value' => 15.0, 'rate_value' => 30.00],
            ],
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/shipping/methods', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'FedEx Priority');

        $this->assertDatabaseHas('shipping_methods', ['code' => 'FEDEX_PRIORITY']);
    }

    public function test_admin_can_create_order_shipment()
    {
        $customer = User::factory()->create();

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-998811',
            'subtotal' => 100.00,
            'grand_total' => 100.00,
            'status' => 'processing',
        ]);

        $orderItem = $order->items()->create([
            'product_name' => 'Wireless Keyboard',
            'sku' => 'KEY-001',
            'unit_price' => 100.00,
            'quantity' => 1,
            'total_amount' => 100.00,
        ]);

        $payload = [
            'order_id' => $order->id,
            'carrier_name' => 'DHL Express',
            'tracking_number' => 'AWB-1234567890',
            'notes' => 'Fragile handling.',
            'items' => [
                ['order_item_id' => $orderItem->id, 'quantity' => 1],
            ],
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/shipments', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.courier_name', 'DHL Express');

        $this->assertDatabaseHas('shipments', ['tracking_number' => 'AWB-1234567890']);
    }

    public function test_admin_can_bulk_update_shipment_status()
    {
        $customer = User::factory()->create();
        $order = Order::create(['user_id' => $customer->id, 'order_number' => 'ORD-101', 'subtotal' => 50, 'grand_total' => 50, 'status' => 'processing']);
        $shipment = Shipment::create(['order_id' => $order->id, 'shipment_number' => 'SHP-101', 'courier_name' => 'FedEx', 'tracking_number' => 'AWB-101', 'status' => 'pending']);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/shipments/bulk-status', [
                'shipment_ids' => [$shipment->id],
                'status' => 'in_transit',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.updated_count', 1);

        $this->assertDatabaseHas('shipments', ['id' => $shipment->id, 'status' => 'in_transit']);
    }

    public function test_admin_can_generate_pickup_manifest()
    {
        $customer = User::factory()->create();
        $order = Order::create(['user_id' => $customer->id, 'order_number' => 'ORD-102', 'subtotal' => 75, 'grand_total' => 75, 'status' => 'processing']);
        $shipment = Shipment::create(['order_id' => $order->id, 'shipment_number' => 'SHP-102', 'courier_name' => 'DHL', 'tracking_number' => 'AWB-102', 'status' => 'in_transit']);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/shipments/manifest', [
                'shipment_ids' => [$shipment->id],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_shipments', 1);
    }

    public function test_admin_can_check_pincode_serviceability()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/shipping/check-serviceability', [
                'country_code' => 'US',
                'postal_code' => '90210',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_fetch_fulfillment_analytics()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/shipping/analytics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['overview', 'carrier_performance']]);
    }
}
