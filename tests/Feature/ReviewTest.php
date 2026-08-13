<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected AdminUser $admin;
    protected string $adminToken;
    protected Product $product;
    protected Order $deliveredOrder;
    protected OrderItem $orderItem;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->customer = User::factory()->create(['email' => 'reviewer@example.com']);
        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $brand = Brand::create(['name' => 'Brand REV', 'slug' => 'brand-rev']);
        $category = Category::create(['name' => 'Cat REV', 'slug' => 'cat-rev']);

        $this->product = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Reviewed Smartphone',
            'slug' => 'reviewed-smartphone',
            'sku' => 'REV-SMART-01',
            'price' => 15000.00,
            'status' => 'active',
        ]);

        $this->deliveredOrder = Order::create([
            'order_number' => 'ORD-20260813-8001',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'grand_total' => 15000.00,
        ]);

        $this->orderItem = OrderItem::create([
            'order_id' => $this->deliveredOrder->id,
            'product_id' => $this->product->id,
            'product_name' => 'Reviewed Smartphone',
            'sku' => 'REV-SMART-01',
            'unit_price' => 15000.00,
            'quantity' => 1,
            'total_amount' => 15000.00,
        ]);
    }

    /**
     * Test customer can submit a review for a delivered order product.
     */
    public function test_customer_can_submit_review_for_delivered_order_product(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/reviews', [
                'product_id' => $this->product->id,
                'order_id' => $this->deliveredOrder->id,
                'rating' => 5,
                'title' => 'Fantastic Phone!',
                'review' => 'Great battery life and build quality.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('reviews', [
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'rating' => 5,
            'status' => 'pending',
        ]);
    }

    /**
     * Test review submission fails for non-delivered order or unpurchased product.
     */
    public function test_customer_cannot_submit_review_for_unpurchased_or_nondelivered_product(): void
    {
        $pendingOrder = Order::create([
            'order_number' => 'ORD-20260813-8002',
            'user_id' => $this->customer->id,
            'status' => 'processing',
            'grand_total' => 15000.00,
        ]);

        $pendingItem = OrderItem::create([
            'order_id' => $pendingOrder->id,
            'product_id' => $this->product->id,
            'product_name' => 'Reviewed Smartphone',
            'sku' => 'REV-SMART-01',
            'unit_price' => 15000.00,
            'quantity' => 1,
            'total_amount' => 15000.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/reviews', [
                'product_id' => $this->product->id,
                'order_id' => $pendingOrder->id,
                'rating' => 4,
                'review' => 'Haven\'t received it yet.',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test duplicate review submission for same order product is prevented.
     */
    public function test_customer_cannot_submit_duplicate_review_for_same_order_product(): void
    {
        Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $this->deliveredOrder->id,
            'rating' => 5,
            'review' => 'First review submission',
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/reviews', [
                'product_id' => $this->product->id,
                'order_id' => $this->deliveredOrder->id,
                'rating' => 4,
                'review' => 'Second duplicate review submission',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test public product review endpoint returns only approved reviews and average summary.
     */
    public function test_public_product_review_endpoint_returns_only_approved_reviews_and_summary(): void
    {
        // 1 Approved review (rating 5)
        Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $this->deliveredOrder->id,
            'rating' => 5,
            'title' => 'Approved Review',
            'review' => 'Verified five star review',
            'status' => 'approved',
        ]);

        // 1 Pending review (rating 1) from second order
        $secondOrder = Order::create([
            'order_number' => 'ORD-20260813-8002',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'grand_total' => 15000.00,
        ]);

        Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $secondOrder->id,
            'rating' => 1,
            'title' => 'Pending Spam',
            'review' => 'Spam review',
            'status' => 'pending',
        ]);

        $response = $this->getJson("/api/v1/products/{$this->product->id}/reviews");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary.total_reviews', 1)
            ->assertJsonPath('data.summary.average_rating', 5)
            ->assertJsonPath('data.reviews.total', 1)
            ->assertJsonPath('data.reviews.data.0.title', 'Approved Review');
    }

    /**
     * Test Admin can list and moderate review status.
     */
    public function test_admin_can_list_and_moderate_review_status(): void
    {
        $review = Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $this->deliveredOrder->id,
            'rating' => 5,
            'review' => 'Awaiting approval',
            'status' => 'pending',
        ]);

        $listResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/reviews');

        $listResp->assertStatus(200)->assertJsonPath('success', true);

        $statusResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/reviews/{$review->id}/status", [
                'status' => 'approved',
                'notes' => 'Verified review',
            ]);

        $statusResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'status' => 'approved',
        ]);
    }

    /**
     * Test Admin can delete a review.
     */
    public function test_admin_can_delete_review(): void
    {
        $review = Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $this->deliveredOrder->id,
            'rating' => 1,
            'review' => 'To be deleted',
            'status' => 'rejected',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->deleteJson("/api/v1/admin/reviews/{$review->id}");

        $response->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('reviews', [
            'id' => $review->id,
        ]);
    }
}
