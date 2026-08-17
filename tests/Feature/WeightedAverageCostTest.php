<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeightedAverageCostTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected Warehouse $defaultWh;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'inventory.view'], ['module' => 'inventory', 'action' => 'view']);
        $permUpdate = Permission::firstOrCreate(['name' => 'inventory.update'], ['module' => 'inventory', 'action' => 'update']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([$permView->id, $permUpdate->id]);

        $this->superAdmin = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin_avco@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->superAdmin->roles()->sync([$role->id]);

        $this->defaultWh = Warehouse::create([
            'name' => 'Main Warehouse',
            'code' => 'WH-MAIN',
            'is_active' => true,
            'is_default' => true,
        ]);
    }

    public function test_variant_creation_seeds_inventory_under_default_warehouse(): void
    {
        $product = Product::create([
            'name' => 'Smart Router AX',
            'type' => 'simple',
            'status' => 'active',
            'price' => 500.00,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'RTR-AX-001',
            'price' => 500.00,
            'cost_price' => 300.00,
            'stock_qty' => 20,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $variant->id,
            'warehouse_id' => $this->defaultWh->id,
            'cost_price' => 300.00,
            'available_qty' => 20,
        ]);
    }

    public function test_weighted_average_cost_recalculation_on_stock_addition(): void
    {
        $product = Product::create([
            'name' => 'Enterprise Switch',
            'type' => 'simple',
            'status' => 'active',
            'price' => 1000.00,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SWT-ENT-001',
            'price' => 1000.00,
            'cost_price' => 400.00,
            'stock_qty' => 50,
            'status' => 'active',
        ]);

        // Restock Batch 2: 50 units @ 500.00 cost price each
        // Weighted Cost = ((50 * 400) + (50 * 500)) / (50 + 50) = 450.00
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/inventory/adjust', [
                'product_variant_id' => $variant->id,
                'warehouse_id' => $this->defaultWh->id,
                'type' => 'add',
                'quantity' => 50,
                'cost_price' => 500.00,
                'reason' => 'Supplier Restock Batch 2',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Inventory cost_price should be weighted average 450.00
        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $variant->id,
            'warehouse_id' => $this->defaultWh->id,
            'available_qty' => 100,
            'cost_price' => 450.00,
        ]);

        // Transaction log unit_cost_price should record batch unit cost 500.00
        $this->assertDatabaseHas('inventory_transactions', [
            'product_variant_id' => $variant->id,
            'quantity_change' => 50,
            'new_qty' => 100,
            'unit_cost_price' => 500.00,
        ]);

        // ProductVariant cost_price synced
        $this->assertDatabaseHas('product_variants', [
            'id' => $variant->id,
            'cost_price' => 450.00,
            'stock_qty' => 100,
        ]);
    }
}
