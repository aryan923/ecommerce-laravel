<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Inventory;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AdminWarehouseManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected Warehouse $defaultWh;
    protected Warehouse $eastWh;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'inventory.view'], ['module' => 'inventory', 'action' => 'view']);
        $permUpdate = Permission::firstOrCreate(['name' => 'inventory.update'], ['module' => 'inventory', 'action' => 'update']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([$permView->id, $permUpdate->id]);

        $this->superAdmin = AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin_wh@example.com',
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

        $this->eastWh = Warehouse::create([
            'name' => 'East Regional Hub',
            'code' => 'WH-EAST',
            'is_active' => true,
            'is_default' => false,
        ]);

        $product = Product::create([
            'name' => 'Enterprise Server Rack',
            'type' => 'simple',
            'status' => 'active',
            'price' => 1500.00,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SRV-RACK-001',
            'price' => 1500.00,
            'stock_qty' => 50,
            'status' => 'active',
        ]);

        Inventory::create([
            'warehouse_id' => $this->defaultWh->id,
            'product_variant_id' => $this->variant->id,
            'sku' => $this->variant->sku,
            'cost_price' => 900.00,
            'available_qty' => 50,
            'reserved_qty' => 0,
            'low_stock_threshold' => 10,
            'reorder_qty' => 20,
        ]);
    }

    public function test_super_admin_can_list_warehouses(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/warehouses');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_super_admin_can_create_warehouse(): void
    {
        $payload = [
            'name' => 'West Coast Hub',
            'code' => 'WH-WEST',
            'city' => 'Mumbai',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/warehouses', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'WH-WEST',
                ],
            ]);

        $this->assertDatabaseHas('warehouses', ['code' => 'WH-WEST']);
    }

    public function test_super_admin_can_transfer_stock_between_warehouses(): void
    {
        $payload = [
            'product_variant_id' => $this->variant->id,
            'source_warehouse_id' => $this->defaultWh->id,
            'target_warehouse_id' => $this->eastWh->id,
            'quantity' => 15,
            'remarks' => 'Balancing inventory across hubs',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/inventory/transfer', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'transferred_qty' => 15,
                ],
            ]);

        // Source warehouse stock should be 50 - 15 = 35
        $this->assertDatabaseHas('inventories', [
            'warehouse_id' => $this->defaultWh->id,
            'product_variant_id' => $this->variant->id,
            'available_qty' => 35,
        ]);

        // Target warehouse stock should be 0 + 15 = 15
        $this->assertDatabaseHas('inventories', [
            'warehouse_id' => $this->eastWh->id,
            'product_variant_id' => $this->variant->id,
            'available_qty' => 15,
        ]);

        // Audit log created
        $this->assertDatabaseHas('inventory_transactions', [
            'warehouse_id' => $this->defaultWh->id,
            'destination_warehouse_id' => $this->eastWh->id,
            'quantity_change' => -15,
        ]);
    }

    public function test_super_admin_can_import_bulk_stock_csv(): void
    {
        $csvContent = "SKU,Action,Quantity,Unit Cost Price,Location Code\nSRV-RACK-001,add,30,950.00,Aisle 4B\nUNKNOWN-SKU-999,set,100,500.00,Bin 1\n";
        $file = UploadedFile::fake()->createWithContent('audit.csv', $csvContent);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/inventory/import', [
                'file' => $file,
                'warehouse_id' => $this->defaultWh->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'skus_updated' => 1,
                    'skipped_count' => 1,
                    'skipped_skus' => ['UNKNOWN-SKU-999'],
                ],
            ]);

        // Available qty should be 50 + 30 = 80
        $this->assertDatabaseHas('inventories', [
            'warehouse_id' => $this->defaultWh->id,
            'product_variant_id' => $this->variant->id,
            'available_qty' => 80,
            'cost_price' => 950.00,
            'location_code' => 'Aisle 4B',
        ]);
    }
}
