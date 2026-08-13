<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected string $adminToken;
    protected User $customer;
    protected Product $product;
    protected ProductVariant $variant;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $this->customer = User::factory()->create(['email' => 'dash_cust@example.com']);

        $brand = Brand::create(['name' => 'Dash Brand', 'slug' => 'dash-brand']);
        $category = Category::create(['name' => 'Dash Category', 'slug' => 'dash-category']);

        $this->product = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Dash Product',
            'slug' => 'dash-product',
            'sku' => 'DASH-PRD-01',
            'price' => 2000.00,
            'status' => 'active',
        ]);
        $this->product->categories()->attach($category->id);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'DASH-PRD-01-VAR',
            'price' => 2000.00,
            'stock_qty' => 3,
        ]);

        Inventory::updateOrCreate(
            ['product_variant_id' => $this->variant->id],
            [
                'sku' => $this->variant->sku,
                'available_qty' => 3,
                'reserved_qty' => 0,
                'low_stock_threshold' => 5,
            ]
        );

        $this->order = Order::create([
            'order_number' => 'ORD-20260813-9001',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'grand_total' => 4000.00,
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'product_name' => 'Dash Product',
            'sku' => 'DASH-PRD-01-VAR',
            'unit_price' => 2000.00,
            'quantity' => 2,
            'total_amount' => 4000.00,
        ]);
    }

    /**
     * Test admin can fetch real-time summary KPI metrics.
     */
    public function test_admin_can_fetch_kpi_summary_metrics(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/dashboard/kpis');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_revenue', 4000)
            ->assertJsonPath('data.total_orders', 1)
            ->assertJsonPath('data.delivered_orders', 1)
            ->assertJsonPath('data.low_stock_count', 1);
    }

    /**
     * Test admin can fetch sales chart analytics time-series.
     */
    public function test_admin_can_fetch_sales_chart_analytics(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/dashboard/sales-chart?period=last_7_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.period', 'last_7_days');
    }

    /**
     * Test admin can fetch order lifecycle status distribution.
     */
    public function test_admin_can_fetch_order_status_distribution(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/dashboard/order-stats');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.delivered', 1)
            ->assertJsonPath('data.cancelled', 0);
    }

    /**
     * Test admin can fetch top performing products and categories.
     */
    public function test_admin_can_fetch_top_performing_products_and_categories(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/dashboard/top-performers');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.top_products.0.product_name', 'Dash Product')
            ->assertJsonPath('data.top_products.0.units_sold', 2);
    }

    /**
     * Test admin can fetch dashboard highlights.
     */
    public function test_admin_can_fetch_dashboard_highlights(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/dashboard/highlights');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.recent_orders.0.order_number', 'ORD-20260813-9001')
            ->assertJsonPath('data.low_stock_items.0.sku', 'DASH-PRD-01-VAR');
    }

    /**
     * Test unauthenticated request fails with 401.
     */
    public function test_unauthenticated_user_cannot_access_admin_dashboard(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard/kpis');

        $response->assertStatus(401);
    }
}
