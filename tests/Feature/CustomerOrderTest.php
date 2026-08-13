<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shipment;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerOrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer1;
    protected string $customer1Token;
    protected User $customer2;
    protected string $customer2Token;
    protected Product $product;
    protected ProductVariant $variant;
    protected Order $order1;
    protected Order $order2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->customer1 = User::factory()->create(['email' => 'cust1@example.com']);
        $this->customer1Token = $this->customer1->createToken('cust1_token')->plainTextToken;

        $this->customer2 = User::factory()->create(['email' => 'cust2@example.com']);
        $this->customer2Token = $this->customer2->createToken('cust2_token')->plainTextToken;

        $brand = Brand::create(['name' => 'Brand A', 'slug' => 'brand-a']);
        $category = Category::create(['name' => 'Cat A', 'slug' => 'cat-a']);

        $this->product = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'sku' => 'TP-01',
            'price' => 500.00,
            'status' => 'active',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'TP-01-VAR',
            'price' => 500.00,
            'stock_qty' => 10,
        ]);

        Inventory::updateOrCreate(
            ['product_variant_id' => $this->variant->id],
            [
                'sku' => $this->variant->sku,
                'available_qty' => 8,
                'reserved_qty' => 2,
                'committed_qty' => 0,
                'damaged_qty' => 0,
                'returned_qty' => 0,
                'low_stock_threshold' => 5,
            ]
        );

        $this->order1 = Order::create([
            'order_number' => 'ORD-20260813-1001',
            'user_id' => $this->customer1->id,
            'status' => 'confirmed',
            'currency' => 'INR',
            'subtotal' => 1000.00,
            'grand_total' => 1000.00,
            'payment_method' => 'cod',
        ]);

        OrderItem::create([
            'order_id' => $this->order1->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => 'Test Product',
            'sku' => 'TP-01-VAR',
            'unit_price' => 500.00,
            'quantity' => 2,
            'total_amount' => 1000.00,
        ]);

        OrderHistory::create([
            'order_id' => $this->order1->id,
            'user_id' => $this->customer1->id,
            'status' => 'confirmed',
            'comment' => 'Order placed and confirmed.',
        ]);

        $this->order2 = Order::create([
            'order_number' => 'ORD-20260813-2002',
            'user_id' => $this->customer2->id,
            'status' => 'shipped',
            'currency' => 'INR',
            'subtotal' => 500.00,
            'grand_total' => 500.00,
            'payment_method' => 'razorpay',
        ]);
    }

    /**
     * Test customer lists only their own orders.
     */
    public function test_customer_can_list_their_orders_only(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->getJson('/api/v1/customer/orders');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.order_number', 'ORD-20260813-1001');
    }

    /**
     * Test filtering customer orders by status.
     */
    public function test_customer_can_filter_order_list_by_status(): void
    {
        Order::create([
            'order_number' => 'ORD-20260813-1002',
            'user_id' => $this->customer1->id,
            'status' => 'delivered',
            'grand_total' => 500.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->getJson('/api/v1/customer/orders?status=delivered');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.order_number', 'ORD-20260813-1002');
    }

    /**
     * Test customer can view order details.
     */
    public function test_customer_can_view_order_details(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->getJson('/api/v1/customer/orders/ORD-20260813-1001');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_number', 'ORD-20260813-1001')
            ->assertJsonPath('data.items.0.sku', 'TP-01-VAR');
    }

    /**
     * Test customer can view order tracking timeline.
     */
    public function test_customer_can_view_order_tracking_timeline(): void
    {
        Shipment::create([
            'order_id' => $this->order1->id,
            'provider' => 'manual',
            'courier_name' => 'Delhivery',
            'awb_number' => 'AWB123456',
            'tracking_number' => 'TRACK999',
            'status' => 'in_transit',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->getJson('/api/v1/customer/orders/ORD-20260813-1001/tracking');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_number', 'ORD-20260813-1001')
            ->assertJsonPath('data.shipment.courier_name', 'Delhivery');
    }

    /**
     * Test customer can cancel an eligible order and release stock.
     */
    public function test_customer_can_cancel_eligible_confirmed_order_and_release_stock(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->postJson('/api/v1/customer/orders/ORD-20260813-1001/cancel', [
                'reason' => 'changed_mind',
                'comments' => 'Ordered by mistake',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('orders', [
            'id' => $this->order1->id,
            'status' => 'cancelled',
        ]);

        // Verify stock released from reserved_qty (2 -> 0) and added back to available_qty (8 -> 10)
        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 10,
            'reserved_qty' => 0,
        ]);

        $this->assertDatabaseHas('order_histories', [
            'order_id' => $this->order1->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * Test customer cannot access another user's order details.
     */
    public function test_customer_cannot_view_another_users_order(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->getJson('/api/v1/customer/orders/ORD-20260813-2002');

        $response->assertStatus(404);
    }

    /**
     * Test customer cannot cancel a shipped order.
     */
    public function test_customer_cannot_cancel_shipped_order(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer2Token)
            ->postJson('/api/v1/customer/orders/ORD-20260813-2002/cancel', [
                'reason' => 'changed_mind',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test customer cannot cancel an already cancelled order.
     */
    public function test_customer_cannot_cancel_already_cancelled_order(): void
    {
        $this->order1->status = 'cancelled';
        $this->order1->save();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customer1Token)
            ->postJson('/api/v1/customer/orders/ORD-20260813-1001/cancel', [
                'reason' => 'changed_mind',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
