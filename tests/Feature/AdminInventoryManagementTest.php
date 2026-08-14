<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInventoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected ProductVariant $variant;
    protected Inventory $inventory;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed RBAC Permissions
        $permissionView = Permission::firstOrCreate(['name' => 'inventory.view'], ['module' => 'inventory', 'action' => 'view']);
        $permissionUpdate = Permission::firstOrCreate(['name' => 'inventory.update'], ['module' => 'inventory', 'action' => 'update']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([$permissionView->id, $permissionUpdate->id]);

        $this->superAdmin = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin_inv@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->superAdmin->roles()->sync([$role->id]);

        // Create sample product, variant, and inventory
        $product = Product::create([
            'name' => 'Test Smartwatch',
            'type' => 'simple',
            'status' => 'active',
            'price' => 199.99,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SMART-001',
            'price' => 199.99,
            'stock_qty' => 20,
            'status' => 'active',
        ]);

        $this->inventory = Inventory::firstOrCreate(
            ['product_variant_id' => $this->variant->id],
            [
                'sku' => $this->variant->sku,
                'available_qty' => 20,
                'reserved_qty' => 2,
                'low_stock_threshold' => 5,
            ]
        );
        $this->inventory->update([
            'available_qty' => 20,
            'reserved_qty' => 2,
            'low_stock_threshold' => 5,
        ]);
    }

    public function test_super_admin_can_fetch_inventory_kpis(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/inventory/kpis');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_skus' => 1,
                    'total_stock_units' => 20,
                    'low_stock_count' => 0,
                    'out_of_stock_count' => 0,
                    'reserved_stock_units' => 2,
                ],
            ]);
    }

    public function test_super_admin_can_list_inventory_items(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/inventory?search=TEST-SMART-001');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_super_admin_can_adjust_stock_add(): void
    {
        $payload = [
            'product_variant_id' => $this->variant->id,
            'type' => 'add',
            'quantity' => 10,
            'reason' => 'Supplier Restock',
            'remarks' => 'Received from shipment #102',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/inventory/adjust', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'previous_available_qty' => 20,
                    'change_qty' => 10,
                    'new_available_qty' => 30,
                ],
            ]);

        $this->assertDatabaseHas('inventories', [
            'id' => $this->inventory->id,
            'available_qty' => 30,
        ]);

        $this->assertDatabaseHas('product_variants', [
            'id' => $this->variant->id,
            'stock_qty' => 30,
        ]);

        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_id' => $this->inventory->id,
            'previous_qty' => 20,
            'quantity_change' => 10,
            'new_qty' => 30,
        ]);
    }

    public function test_super_admin_can_adjust_stock_deduct(): void
    {
        $payload = [
            'product_variant_id' => $this->variant->id,
            'type' => 'deduct',
            'quantity' => 5,
            'reason' => 'Damaged Inventory',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/inventory/adjust', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'previous_available_qty' => 20,
                    'change_qty' => -5,
                    'new_available_qty' => 15,
                ],
            ]);
    }

    public function test_stock_deduction_fails_if_exceeding_available_qty(): void
    {
        $payload = [
            'product_variant_id' => $this->variant->id,
            'type' => 'deduct',
            'quantity' => 50,
            'reason' => 'Excessive Deduction',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/inventory/adjust', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_super_admin_can_fetch_inventory_transactions(): void
    {
        InventoryTransaction::create([
            'inventory_id' => $this->inventory->id,
            'product_variant_id' => $this->variant->id,
            'sku' => $this->variant->sku,
            'previous_qty' => 10,
            'quantity_change' => 10,
            'new_qty' => 20,
            'transaction_type' => 'manual_addition',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/inventory/transactions');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_super_admin_can_export_inventory_csv(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->get('/api/v1/admin/inventory/export');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}
