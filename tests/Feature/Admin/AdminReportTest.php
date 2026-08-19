<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\Product;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first() ?? AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_reports_endpoints(): void
    {
        $response = $this->getJson('/api/v1/admin/reports/sales');
        $response->assertStatus(401);
    }

    public function test_admin_can_fetch_sales_report(): void
    {
        Order::create([
            'order_number' => 'ORD-1001',
            'status' => 'delivered',
            'subtotal' => 200.00,
            'discount_total' => 10.00,
            'tax_total' => 18.00,
            'shipping_total' => 15.00,
            'grand_total' => 223.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/sales');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'summary' => [
                        'gross_sales' => 200.00,
                        'discounts' => 10.00,
                        'tax' => 18.00,
                        'shipping' => 15.00,
                    ]
                ]
            ]);
    }

    public function test_admin_can_fetch_order_status_report(): void
    {
        Order::create([
            'order_number' => 'ORD-1002',
            'status' => 'pending_payment',
            'subtotal' => 100.00,
            'grand_total' => 100.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/orders');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_orders' => 1,
                ]
            ]);
    }

    public function test_admin_can_fetch_product_performance_report(): void
    {
        Product::create([
            'name' => 'Report Test Product',
            'slug' => 'report-test-product',
            'sku' => 'RPT-001',
            'price' => 49.99,
            'stock_quantity' => 25,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/products');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('RPT-001', $response->json('data.data.0.sku'));
    }

    public function test_admin_can_fetch_customer_analytics_report(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/customers');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_admin_can_fetch_inventory_report(): void
    {
        $product = Product::create([
            'name' => 'Low Stock Item',
            'slug' => 'low-stock-item',
            'sku' => 'LOW-001',
            'price' => 15.00,
            'status' => 'active',
        ]);

        $variant = \App\Models\ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'LOW-001',
            'price' => 15.00,
            'status' => 'active',
        ]);

        \App\Models\Inventory::updateOrCreate(
            ['sku' => 'LOW-001'],
            [
                'product_variant_id' => $variant->id,
                'cost_price' => 10.00,
                'available_qty' => 3,
                'low_stock_threshold' => 10,
            ]
        );

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/inventory');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'low_stock_count' => 1,
                ]
            ]);
    }

    public function test_admin_can_fetch_tax_report(): void
    {
        Order::create([
            'order_number' => 'ORD-1003',
            'status' => 'delivered',
            'subtotal' => 500.00,
            'tax_total' => 50.00,
            'grand_total' => 550.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/tax');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'taxable_amount' => 500.00,
                    'total_tax' => 50.00,
                ]
            ]);
    }

    public function test_admin_can_export_sales_report_csv(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->post('/api/v1/admin/reports/export', [
                'report_type' => 'sales',
                'format' => 'csv',
            ]);

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'text/csv'));

        $this->assertDatabaseHas('report_exports', [
            'report_type' => 'sales',
            'format' => 'csv',
        ]);
    }
}
