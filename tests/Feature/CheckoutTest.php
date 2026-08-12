<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected Product $product;
    protected ProductVariant $variant;
    protected Address $address;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->customer = User::factory()->create([
            'email' => 'customer_checkout@example.com',
        ]);
        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        $brand = Brand::create(['name' => 'TechBrand', 'slug' => 'techbrand']);
        $category = Category::create(['name' => 'Electronics', 'slug' => 'electronics']);

        $this->product = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Smart Watch Pro',
            'slug' => 'smart-watch-pro',
            'sku' => 'SW-PRO-01',
            'price' => 1000.00,
            'status' => 'active',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'SW-PRO-01-BLK',
            'price' => 1000.00,
            'stock_qty' => 10,
        ]);

        $this->address = Address::create([
            'user_id' => $this->customer->id,
            'name' => 'John Doe',
            'mobile' => '9876543210',
            'line_1' => '123 Tech Park',
            'city' => 'Mumbai',
            'state' => 'MH',
            'country' => 'IN',
            'postal_code' => '400001',
            'is_default_shipping' => true,
        ]);
    }

    /**
     * Test customer can successfully process checkout.
     */
    public function test_customer_can_process_checkout(): void
    {
        // 1. Add item to cart
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);

        // 2. Process checkout
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/checkout/process', [
                'shipping_address_id' => $this->address->id,
                'payment_method' => 'cod',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'pending_payment',
                    'payment_method' => 'cod',
                ],
            ]);

        $orderData = $response->json('data');
        $this->assertStringStartsWith('ORD-', $orderData['order_number']);

        // Assert database records created
        $this->assertDatabaseHas('orders', ['order_number' => $orderData['order_number']]);
        $this->assertDatabaseHas('order_items', ['product_name' => 'Smart Watch Pro', 'quantity' => 2]);
        $this->assertDatabaseHas('payments', ['amount' => $orderData['grand_total'], 'status' => 'pending']);

        // Assert stock reserved
        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 8,
            'reserved_qty' => 2,
        ]);
    }

    /**
     * Test idempotency key prevents duplicate order creation.
     */
    public function test_idempotency_key_prevents_duplicate_orders(): void
    {
        // Add item to cart
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 1,
            ]);

        $idempotencyKey = 'IDEM-KEY-998877';

        // Request 1
        $res1 = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->withHeader('X-Idempotency-Key', $idempotencyKey)
            ->postJson('/api/v1/checkout/process', [
                'shipping_address_id' => $this->address->id,
                'payment_method' => 'cod',
            ]);

        $res1->assertStatus(201);
        $orderNumber1 = $res1->json('data.order_number');

        // Request 2 with same Idempotency Key
        $res2 = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->withHeader('X-Idempotency-Key', $idempotencyKey)
            ->postJson('/api/v1/checkout/process', [
                'shipping_address_id' => $this->address->id,
                'payment_method' => 'cod',
            ]);

        $res2->assertStatus(200);
        $orderNumber2 = $res2->json('data.order_number');

        $this->assertEquals($orderNumber1, $orderNumber2);
        $this->assertEquals(1, Order::where('idempotency_key', $idempotencyKey)->count());
    }

    /**
     * Test guest customer checkout with inline shipping address.
     */
    public function test_guest_customer_can_checkout(): void
    {
        $guestSessionId = 'guest_session_12345';

        // 1. Add item to guest cart
        $this->withHeader('X-Session-ID', $guestSessionId)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 1,
            ]);

        // 2. Process guest checkout
        $response = $this->withHeader('X-Session-ID', $guestSessionId)
            ->postJson('/api/v1/checkout/process', [
                'guest_name' => 'Alice Guest',
                'guest_email' => 'alice@example.com',
                'shipping_address' => [
                    'address_line1' => '456 Guest Lane',
                    'city' => 'Pune',
                    'state_code' => 'MH',
                    'postal_code' => '411001',
                ],
                'payment_method' => 'cod',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'guest_email' => 'alice@example.com',
                ],
            ]);
    }

    /**
     * Test item snapshot preservation when product is modified later.
     */
    public function test_item_snapshot_preservation(): void
    {
        // Place order
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 1,
            ]);

        $res = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/checkout/process', [
                'shipping_address_id' => $this->address->id,
                'payment_method' => 'cod',
            ]);

        $orderNumber = $res->json('data.order_number');

        // Modify product title and price after purchase
        $this->product->update(['name' => 'Smart Watch Pro V2', 'price' => 5000.00]);

        // Fetch order details
        $orderRes = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/v1/orders/{$orderNumber}");

        $orderRes->assertStatus(200)
            ->assertJson([
                'data' => [
                    'items' => [
                        [
                            'product_name' => 'Smart Watch Pro', // Preserved original name
                            'unit_price' => 1000.00, // Preserved original price
                        ],
                    ],
                ],
            ]);
    }

    /**
     * Test checkout fails if cart is empty.
     */
    public function test_checkout_fails_if_cart_is_empty(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/checkout/process', [
                'shipping_address_id' => $this->address->id,
                'payment_method' => 'cod',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cart']);
    }
}
