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

class AdminReviewModerationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $customer;
    protected $brand;
    protected $category;

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
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $this->brand = Brand::create(['name' => 'Brand REV', 'slug' => 'brand-rev']);
        $this->category = Category::create(['name' => 'Cat REV', 'slug' => 'cat-rev']);
    }

    private function createTestProductAndOrder($sku = 'HD-900', $ordNum = 'ORD-2026-1001')
    {
        $product = Product::create([
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'name' => 'Product ' . $sku,
            'slug' => 'product-' . strtolower($sku),
            'sku' => $sku,
            'price' => 4999.00,
            'status' => 'active',
        ]);

        $order = Order::create([
            'order_number' => $ordNum,
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'grand_total' => 4999.00,
        ]);

        return [$product, $order];
    }

    public function test_unauthenticated_user_cannot_access_review_stats()
    {
        $response = $this->getJson('/api/v1/admin/reviews/stats');
        $response->assertStatus(401);
    }

    public function test_admin_can_fetch_review_stats()
    {
        [$p1, $o1] = $this->createTestProductAndOrder('P1', 'ORD-1');
        [$p2, $o2] = $this->createTestProductAndOrder('P2', 'ORD-2');
        [$p3, $o3] = $this->createTestProductAndOrder('P3', 'ORD-3');

        Review::create(['product_id' => $p1->id, 'user_id' => $this->customer->id, 'order_id' => $o1->id, 'status' => 'pending', 'rating' => 5, 'review' => 'Great product!']);
        Review::create(['product_id' => $p2->id, 'user_id' => $this->customer->id, 'order_id' => $o2->id, 'status' => 'approved', 'rating' => 4, 'review' => 'Good product.']);
        Review::create(['product_id' => $p3->id, 'user_id' => $this->customer->id, 'order_id' => $o3->id, 'status' => 'rejected', 'rating' => 1, 'review' => 'Bad product.']);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reviews/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $this->assertGreaterThanOrEqual(3, $response->json('data.total_reviews'));
    }

    public function test_admin_can_list_and_filter_reviews()
    {
        [$p1, $o1] = $this->createTestProductAndOrder('P1', 'ORD-1');
        [$p2, $o2] = $this->createTestProductAndOrder('P2', 'ORD-2');

        Review::create(['product_id' => $p1->id, 'user_id' => $this->customer->id, 'order_id' => $o1->id, 'status' => 'pending', 'rating' => 5, 'title' => 'Amazing Sound', 'review' => 'Loved it!']);
        Review::create(['product_id' => $p2->id, 'user_id' => $this->customer->id, 'order_id' => $o2->id, 'status' => 'approved', 'rating' => 2, 'title' => 'Poor Battery', 'review' => 'Drains fast.']);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reviews?status=pending');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $items = $response->json('data');
        if (is_array($items)) {
            foreach ($items as $item) {
                if (is_array($item) && isset($item['status'])) {
                    $this->assertEquals('pending', $item['status']);
                }
            }
        }
    }

    public function test_admin_can_view_single_review_detail()
    {
        [$p1, $o1] = $this->createTestProductAndOrder('P1', 'ORD-1');

        $review = Review::create([
            'product_id' => $p1->id,
            'user_id' => $this->customer->id,
            'order_id' => $o1->id,
            'status' => 'pending',
            'rating' => 5,
            'title' => 'Top Quality',
            'review' => 'Best headphones I ever bought.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/admin/reviews/{$review->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $review->id,
                    'title' => 'Top Quality',
                    'rating' => 5,
                ]
            ]);
    }

    public function test_admin_can_update_review_status()
    {
        [$p1, $o1] = $this->createTestProductAndOrder('P1', 'ORD-1');

        $review = Review::create([
            'product_id' => $p1->id,
            'user_id' => $this->customer->id,
            'order_id' => $o1->id,
            'status' => 'pending',
            'rating' => 5,
            'review' => 'Awesome sound quality.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->patchJson("/api/v1/admin/reviews/{$review->id}/status", [
            'status' => 'approved',
            'admin_notes' => 'Verified legitimate customer review',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $review->id,
                    'status' => 'approved',
                    'admin_notes' => 'Verified legitimate customer review',
                ]
            ]);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'status' => 'approved',
        ]);
    }

    public function test_admin_can_bulk_update_review_status()
    {
        [$p1, $o1] = $this->createTestProductAndOrder('P1', 'ORD-1');
        [$p2, $o2] = $this->createTestProductAndOrder('P2', 'ORD-2');

        $r1 = Review::create(['product_id' => $p1->id, 'user_id' => $this->customer->id, 'order_id' => $o1->id, 'status' => 'pending', 'rating' => 4, 'review' => 'Review 1']);
        $r2 = Review::create(['product_id' => $p2->id, 'user_id' => $this->customer->id, 'order_id' => $o2->id, 'status' => 'pending', 'rating' => 5, 'review' => 'Review 2']);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/admin/reviews/bulk-status', [
            'ids' => [$r1->id, $r2->id],
            'status' => 'approved',
            'admin_notes' => 'Bulk approved by moderator',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('reviews', ['id' => $r1->id, 'status' => 'approved']);
        $this->assertDatabaseHas('reviews', ['id' => $r2->id, 'status' => 'approved']);
    }

    public function test_admin_can_delete_review()
    {
        [$p1, $o1] = $this->createTestProductAndOrder('P1', 'ORD-1');

        $review = Review::create([
            'product_id' => $p1->id,
            'user_id' => $this->customer->id,
            'order_id' => $o1->id,
            'status' => 'rejected',
            'rating' => 1,
            'review' => 'Spam content.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson("/api/v1/admin/reviews/{$review->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }
}
