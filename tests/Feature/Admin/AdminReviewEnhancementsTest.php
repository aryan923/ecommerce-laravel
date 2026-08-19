<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReviewEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected User $customer;
    protected Product $product;
    protected Order $order;
    protected Review $review;

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

        $this->customer = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);

        $brand = Brand::create(['name' => 'Brand Test', 'slug' => 'brand-test']);
        $category = Category::create(['name' => 'Category Test', 'slug' => 'category-test']);

        $this->product = Product::create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'name' => 'Premium Wireless Headphones',
            'slug' => 'premium-wireless-headphones',
            'sku' => 'HD-WIRELESS-001',
            'price' => 299.99,
            'stock_quantity' => 50,
            'status' => 'active',
        ]);

        $this->order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-REV-2026',
            'status' => 'delivered',
            'subtotal' => 299.99,
            'tax_amount' => 0,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'grand_total' => 299.99,
        ]);

        $this->review = Review::create([
            'product_id' => $this->product->id,
            'user_id' => $this->customer->id,
            'order_id' => $this->order->id,
            'rating' => 5,
            'title' => 'Outstanding Sound Quality',
            'review' => 'Great battery life and crystal clear audio output!',
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_post_and_delete_official_reply(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/reviews/{$this->review->id}/reply", [
                'admin_reply' => 'Thank you for your fantastic review! We are delighted you enjoy the sound quality.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.admin_reply', 'Thank you for your fantastic review! We are delighted you enjoy the sound quality.');

        $this->assertDatabaseHas('reviews', [
            'id' => $this->review->id,
            'admin_reply' => 'Thank you for your fantastic review! We are delighted you enjoy the sound quality.',
            'replied_by' => $this->admin->id,
        ]);

        // Delete reply
        $deleteResponse = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/reviews/{$this->review->id}/reply");

        $deleteResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.admin_reply', null);

        $this->assertDatabaseHas('reviews', [
            'id' => $this->review->id,
            'admin_reply' => null,
        ]);
    }

    public function test_admin_can_flag_and_unflag_review_for_spam(): void
    {
        $flagResponse = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/reviews/{$this->review->id}/flag", [
                'flag_reason' => 'Suspicious competitor link',
            ]);

        $flagResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_flagged', true);

        $this->assertDatabaseHas('reviews', [
            'id' => $this->review->id,
            'is_flagged' => true,
        ]);

        // Unflag
        $unflagResponse = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/reviews/{$this->review->id}/flag");

        $unflagResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_flagged', false);
    }

    public function test_admin_can_export_reviews_csv(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->get("/api/v1/admin/reviews/export");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Review ID', $response->streamedContent());
        $this->assertStringContainsString('Outstanding Sound Quality', $response->streamedContent());
    }
}
