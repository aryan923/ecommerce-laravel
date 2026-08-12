<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected string $adminToken;
    protected ShippingZone $zone;
    protected ShippingMethod $method;
    protected ShippingRate $flatRate;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        // Setup Shipping Zone
        $this->zone = ShippingZone::create([
            'name' => 'Local MH Zone',
            'states' => ['MH'],
            'postal_codes' => ['400001', '400002'],
            'status' => 'active',
        ]);

        // Setup Shipping Method
        $this->method = ShippingMethod::create([
            'name' => 'Standard Delivery',
            'type' => 'standard',
            'estimated_days' => '3-5 business days',
            'weight_limit' => 10.00,
            'status' => 'active',
        ]);

        // Setup Shipping Rate: Flat ₹50, Free above ₹999
        $this->flatRate = ShippingRate::create([
            'zone_id' => $this->zone->id,
            'method_id' => $this->method->id,
            'rate_type' => 'flat_rate',
            'rate_value' => 50.00,
            'free_threshold' => 999.00,
            'status' => 'active',
        ]);
    }

    /**
     * Test admin can create a shipping zone.
     */
    public function test_admin_can_create_shipping_zone(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/shipping-zones', [
                'name' => 'National India Zone',
                'is_global' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('shipping_zones', ['name' => 'National India Zone', 'is_global' => true]);
    }

    /**
     * Test admin can create a shipping method.
     */
    public function test_admin_can_create_shipping_method(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/shipping-methods', [
                'name' => 'Express Same Day',
                'type' => 'same_day',
                'estimated_days' => '1 business day',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('shipping_methods', ['name' => 'Express Same Day', 'type' => 'same_day']);
    }

    /**
     * Test shipping calculation below free threshold.
     */
    public function test_calculate_shipping_below_free_threshold(): void
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'state_code' => 'MH',
            'postal_code' => '400001',
            'subtotal' => 500.00,
            'total_weight' => 2.0,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_deliverable' => true,
                    'available_methods' => [
                        [
                            'method_name' => 'Standard Delivery',
                            'fee' => 50.00,
                            'is_free' => false,
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Test shipping calculation above free threshold grants free shipping.
     */
    public function test_calculate_shipping_above_free_threshold_grants_free_delivery(): void
    {
        $response = $this->postJson('/api/v1/shipping/calculate', [
            'state_code' => 'MH',
            'postal_code' => '400001',
            'subtotal' => 1200.00, // Exceeds threshold of 999.00
            'total_weight' => 2.0,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'available_methods' => [
                        [
                            'method_name' => 'Standard Delivery',
                            'fee' => 0.00,
                            'is_free' => true,
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Test admin can create a shipment record.
     */
    public function test_admin_can_create_shipment(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/shipments', [
                'courier_name' => 'Delhivery',
                'awb_number' => 'DL123456789',
                'tracking_number' => 'TRK987654321',
                'status' => 'pending',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('shipments', [
            'courier_name' => 'Delhivery',
            'tracking_number' => 'TRK987654321',
        ]);
    }

    /**
     * Test admin can add tracking event log to shipment.
     */
    public function test_admin_can_add_tracking_event(): void
    {
        $shipment = Shipment::create([
            'courier_name' => 'BlueDart',
            'tracking_number' => 'TRK11223344',
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/shipments/{$shipment->id}/tracking", [
                'status' => 'in_transit',
                'location' => 'Mumbai Sorting Hub',
                'description' => 'Dispatched from hub',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('shipment_tracking', [
            'shipment_id' => $shipment->id,
            'status' => 'in_transit',
            'location' => 'Mumbai Sorting Hub',
        ]);
    }

    /**
     * Test public customer tracking lookup.
     */
    public function test_public_customer_can_track_shipment(): void
    {
        $shipment = Shipment::create([
            'courier_name' => 'Shiprocket',
            'tracking_number' => 'TRK55667788',
            'status' => 'in_transit',
        ]);

        $response = $this->getJson('/api/v1/shipments/track/TRK55667788');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'tracking_number' => 'TRK55667788',
                    'courier_name' => 'Shiprocket',
                    'status' => 'in_transit',
                ],
            ]);
    }
}
