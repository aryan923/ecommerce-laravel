<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected string $superAdminToken;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = AdminUser::where('email', 'admin@example.com')->first();
        $this->superAdminToken = $this->superAdmin->createToken('admin_token')->plainTextToken;

        $product = Product::create([
            'name' => 'T-Shirt',
            'slug' => 't-shirt',
            'sku' => 'TSHIRT-001',
            'type' => 'simple',
            'status' => 'active',
            'price' => 29.99,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TSHIRT-BLK-M',
            'price' => 29.99,
            'stock_qty' => 50,
            'status' => 'active',
        ]);
    }

    /**
     * Test variant creation automatically initializes inventory record.
     */
    public function test_variant_creation_initializes_inventory(): void
    {
        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'sku' => 'TSHIRT-BLK-M',
            'available_qty' => 50,
        ]);
    }

    /**
     * Test manual stock addition and audit transaction creation.
     */
    public function test_admin_can_add_stock_manually(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/adjust', [
                'product_variant_id' => $this->variant->id,
                'adjustment_type' => 'add',
                'quantity' => 20,
                'remarks' => 'Restock shipment #101',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'available_qty' => 70,
                ],
            ]);

        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 70,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'product_variant_id' => $this->variant->id,
            'previous_qty' => 50,
            'quantity_change' => 20,
            'new_qty' => 70,
            'transaction_type' => 'manual_addition',
        ]);
    }

    /**
     * Test stock reduction below zero returns 422 error.
     */
    public function test_cannot_deduct_stock_below_zero(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/adjust', [
                'product_variant_id' => $this->variant->id,
                'adjustment_type' => 'deduct',
                'quantity' => 100,
                'remarks' => 'Excess deduction',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    /**
     * Test atomic stock reservation.
     */
    public function test_atomic_stock_reservation_success(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/reserve', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 10,
                'reference_type' => 'Order',
                'reference_id' => 55,
                'remarks' => 'Order placement reservation',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 40,
            'reserved_qty' => 10,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'product_variant_id' => $this->variant->id,
            'quantity_change' => -10,
            'new_qty' => 40,
            'transaction_type' => 'order_reservation',
        ]);
    }

    /**
     * Test insufficient stock reservation failure.
     */
    public function test_reservation_fails_on_insufficient_stock(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/reserve', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 200,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    /**
     * Test releasing reserved stock restored available quantity.
     */
    public function test_releasing_reserved_stock(): void
    {
        // Reserve 15
        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/reserve', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 15,
            ]);

        // Release 15
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/release', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 15,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 50,
            'reserved_qty' => 0,
        ]);
    }

    /**
     * Test committing reserved stock for shipment.
     */
    public function test_committing_reserved_stock(): void
    {
        // Reserve 10
        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/reserve', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 10,
            ]);

        // Commit 10
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/commit', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 10,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 40,
            'reserved_qty' => 0,
            'committed_qty' => 10,
        ]);
    }

    /**
     * Test low stock alerts fetching.
     */
    public function test_admin_can_fetch_low_stock_alerts(): void
    {
        // Adjust stock to 3 (threshold is 10)
        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/adjust', [
                'product_variant_id' => $this->variant->id,
                'adjustment_type' => 'set',
                'quantity' => 3,
                'remarks' => 'Set low stock for alert test',
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/inventory/alerts');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => ['total' => 1],
            ]);
    }

    /**
     * Test inventory dashboard metrics.
     */
    public function test_admin_can_get_dashboard_metrics(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/inventory/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_skus' => 1,
                    'total_stock_units' => 50,
                ],
            ]);
    }

    /**
     * Test audit trail history endpoint.
     */
    public function test_admin_can_view_inventory_history(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/inventory/adjust', [
                'product_variant_id' => $this->variant->id,
                'adjustment_type' => 'add',
                'quantity' => 10,
                'remarks' => 'Test history log',
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/inventory/history?sku=TSHIRT-BLK-M');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => ['total' => 1],
            ]);
    }
}
