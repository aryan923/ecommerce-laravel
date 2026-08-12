<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected Product $product;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::create([
            'first_name' => 'Charlie',
            'last_name' => 'Brown',
            'name' => 'Charlie Brown',
            'email' => 'charlie@example.com',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
        ]);

        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        $this->product = Product::create([
            'name' => 'Wireless Headphones',
            'slug' => 'wireless-headphones',
            'sku' => 'HP-001',
            'type' => 'variable',
            'status' => 'active',
            'price' => 99.99,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'HP-BLK-01',
            'price' => 99.99,
            'stock_qty' => 20,
            'status' => 'active',
        ]);
    }

    /**
     * Test customer can add simple product to wishlist.
     */
    public function test_customer_can_add_product_to_wishlist(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/wishlist', [
                'product_id' => $this->product->id,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'product_id' => $this->product->id,
                    'product_variant_id' => null,
                ],
            ]);

        $this->assertDatabaseHas('wishlist_items', [
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);
    }

    /**
     * Test customer can add product variant to wishlist.
     */
    public function test_customer_can_add_variant_to_wishlist(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/wishlist', [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'product_id' => $this->product->id,
                    'product_variant_id' => $this->variant->id,
                ],
            ]);

        $this->assertDatabaseHas('wishlist_items', [
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
        ]);
    }

    /**
     * Test duplicate add is idempotent and does not create duplicate rows.
     */
    public function test_duplicate_add_to_wishlist_is_idempotent(): void
    {
        // First add
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/wishlist', [
                'product_id' => $this->product->id,
            ]);

        // Duplicate add
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/wishlist', [
                'product_id' => $this->product->id,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('wishlist_items', 1);
    }

    /**
     * Test listing customer wishlist items.
     */
    public function test_customer_can_list_wishlist_items(): void
    {
        WishlistItem::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/v1/wishlist');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => ['total' => 1],
            ]);
    }

    /**
     * Test checking wishlist status for a product.
     */
    public function test_customer_can_check_wishlist_status(): void
    {
        WishlistItem::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/v1/wishlist/check/{$this->product->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_in_wishlist' => true,
                ],
            ]);
    }

    /**
     * Test moving wishlist item to cart removes it from wishlist.
     */
    public function test_moving_wishlist_item_to_cart_removes_it_from_wishlist(): void
    {
        $item = WishlistItem::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson("/api/v1/wishlist/{$item->id}/move-to-cart", [
                'quantity' => 1,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'moved_to_cart' => true,
                ],
            ]);

        $this->assertDatabaseMissing('wishlist_items', ['id' => $item->id]);
    }

    /**
     * Test removing a single item from wishlist.
     */
    public function test_customer_can_remove_item_from_wishlist(): void
    {
        $item = WishlistItem::create([
            'user_id' => $this->customer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson("/api/v1/wishlist/{$item->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('wishlist_items', ['id' => $item->id]);
    }

    /**
     * Test clearing entire wishlist.
     */
    public function test_customer_can_clear_wishlist(): void
    {
        WishlistItem::create(['user_id' => $this->customer->id, 'product_id' => $this->product->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson('/api/v1/wishlist');

        $response->assertStatus(200);
        $this->assertDatabaseCount('wishlist_items', 0);
    }

    /**
     * Test customer cannot delete another customer's wishlist item.
     */
    public function test_customer_cannot_delete_other_customer_wishlist_item(): void
    {
        $otherCustomer = User::create([
            'first_name' => 'David',
            'last_name' => 'Miller',
            'name' => 'David Miller',
            'email' => 'david@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        $otherItem = WishlistItem::create([
            'user_id' => $otherCustomer->id,
            'product_id' => $this->product->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson("/api/v1/wishlist/{$otherItem->id}");

        $response->assertStatus(404);
        $this->assertDatabaseHas('wishlist_items', ['id' => $otherItem->id]);
    }
}
