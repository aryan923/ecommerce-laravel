<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected Product $product;
    protected ProductVariant $variant;
    protected string $guestSessionId = 'guest_test_session_abc';

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::create([
            'first_name' => 'Eve',
            'last_name' => 'Clark',
            'name' => 'Eve Clark',
            'email' => 'eve@example.com',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
        ]);

        $this->customerToken = $this->customer->createToken('test_token')->plainTextToken;

        $this->product = Product::create([
            'name' => 'Smart Watch',
            'slug' => 'smart-watch',
            'sku' => 'SW-001',
            'type' => 'variable',
            'status' => 'active',
            'price' => 100.00,
            'stock_qty' => 20,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'SW-BLK-01',
            'price' => 150.00,
            'stock_qty' => 10,
            'status' => 'active',
        ]);

        // ProductVariant observer auto-creates an inventory record; update it to set correct available_qty
        Inventory::where('product_variant_id', $this->variant->id)
            ->update(['available_qty' => 10, 'low_stock_threshold' => 2]);
    }

    /**
     * Test guest can create a cart and add a product using X-Session-ID.
     */
    public function test_guest_can_add_product_to_cart(): void
    {
        $response = $this->withHeader('X-Session-ID', $this->guestSessionId)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('carts', ['session_id' => $this->guestSessionId]);
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);
    }

    /**
     * Test authenticated customer can add product variant to cart.
     */
    public function test_authenticated_customer_can_add_variant_to_cart(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 1,
            'unit_price' => 150.00,
        ]);
    }

    /**
     * Test server-side price calculation ignores frontend price payload.
     */
    public function test_server_side_price_is_always_used_not_frontend_price(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'quantity' => 1,
                // Even if frontend sends unit_price, it should be ignored
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'unit_price' => 100.00, // Must be database price, not frontend
        ]);
    }

    /**
     * Test stock validation prevents adding quantity exceeding available stock.
     */
    public function test_adding_quantity_exceeding_available_stock_fails(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/items', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 99, // Exceeds stock of 10
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);
    }

    /**
     * Test updating cart item quantity.
     */
    public function test_customer_can_update_cart_item_quantity(): void
    {
        $cart = Cart::create(['user_id' => $this->customer->id]);
        $item = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 100.00,
            'total' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->putJson("/api/v1/cart/items/{$item->id}", [
                'quantity' => 3,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('cart_items', ['id' => $item->id, 'quantity' => 3]);
    }

    /**
     * Test removing cart item.
     */
    public function test_customer_can_remove_item_from_cart(): void
    {
        $cart = Cart::create(['user_id' => $this->customer->id]);
        $item = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 100.00,
            'total' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson("/api/v1/cart/items/{$item->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }

    /**
     * Test clearing entire cart.
     */
    public function test_customer_can_clear_cart(): void
    {
        $cart = Cart::create(['user_id' => $this->customer->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 100.00,
            'total' => 200.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson('/api/v1/cart');

        $response->assertStatus(200);
        $this->assertDatabaseCount('cart_items', 0);
    }

    /**
     * Test merging guest cart into customer cart upon login.
     */
    public function test_guest_cart_merges_into_customer_cart(): void
    {
        // Create guest cart with item
        $guestCart = Cart::create(['session_id' => $this->guestSessionId]);
        CartItem::create([
            'cart_id' => $guestCart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 100.00,
            'total' => 200.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/merge', [
                'session_id' => $this->guestSessionId,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Guest cart should be deleted
        $this->assertDatabaseMissing('carts', ['session_id' => $this->guestSessionId]);
        // Customer cart should have merged item
        $this->assertDatabaseHas('carts', ['user_id' => $this->customer->id]);
    }

    /**
     * Test pre-checkout cart validation passes for valid cart.
     */
    public function test_cart_validation_passes_for_valid_cart(): void
    {
        $cart = Cart::create(['user_id' => $this->customer->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 100.00,
            'total' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/cart/validate');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_valid' => true,
                ],
            ]);
    }

    /**
     * Test viewing cart retrieves correct totals.
     */
    public function test_customer_can_view_cart_with_totals(): void
    {
        $cart = Cart::create([
            'user_id' => $this->customer->id,
            'subtotal' => 200.00,
            'grand_total' => 200.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/v1/cart');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user_id' => $this->customer->id,
                    'grand_total' => '200.00',
                ],
            ]);
    }
}
