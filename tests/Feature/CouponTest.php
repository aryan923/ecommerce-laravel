<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected string $adminToken;
    protected User $customer;
    protected string $customerToken;
    protected Product $product1;
    protected Product $product2;
    protected Category $category;
    protected Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        // Setup Customer
        $this->customer = User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('Password123!'),
            'status' => 'active',
        ]);
        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        // Setup Catalog
        $this->category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'status' => 'active',
        ]);

        $this->brand = Brand::create([
            'name' => 'TechCorp',
            'slug' => 'techcorp',
            'status' => 'active',
        ]);

        $this->product1 = Product::create([
            'name' => 'Headphones',
            'slug' => 'headphones',
            'sku' => 'HP-001',
            'type' => 'simple',
            'status' => 'active',
            'price' => 1000.00,
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);

        $this->product2 = Product::create([
            'name' => 'Mouse',
            'slug' => 'mouse',
            'sku' => 'MS-001',
            'type' => 'simple',
            'status' => 'active',
            'price' => 500.00,
        ]);
    }

    /**
     * Test admin can create a percentage coupon.
     */
    public function test_admin_can_create_percentage_coupon(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/coupons', [
                'code' => 'save20',
                'name' => '20% Off Sale',
                'type' => 'percentage',
                'value' => 20.00,
                'max_discount' => 500.00,
                'min_order_value' => 1000.00,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('coupons', [
            'code' => 'SAVE20',
            'type' => 'percentage',
            'value' => 20.00,
        ]);
    }

    /**
     * Test admin can create a fixed amount coupon.
     */
    public function test_admin_can_create_fixed_amount_coupon(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/coupons', [
                'code' => 'FLAT100',
                'name' => 'Flat 100 Off',
                'type' => 'fixed_amount',
                'value' => 100.00,
                'min_order_value' => 500.00,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('coupons', ['code' => 'FLAT100', 'type' => 'fixed_amount']);
    }

    /**
     * Test public coupon code validation for percentage calculation.
     */
    public function test_validate_percentage_coupon_calculation(): void
    {
        Coupon::create([
            'code' => 'SAVE20',
            'name' => '20% Off',
            'type' => 'percentage',
            'value' => 20.00,
            'max_discount' => 500.00,
            'min_order_value' => 1000.00,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'save20',
            'subtotal' => 2000.00,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_valid' => true,
                    'discount_amount' => 400.00,
                ],
            ]);
    }

    /**
     * Test percentage coupon maximum cap enforcement.
     */
    public function test_percentage_coupon_maximum_discount_cap(): void
    {
        Coupon::create([
            'code' => 'SAVE20',
            'name' => '20% Off',
            'type' => 'percentage',
            'value' => 20.00,
            'max_discount' => 500.00,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'SAVE20',
            'subtotal' => 4000.00, // 20% of 4000 = 800, capped at 500
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'discount_amount' => 500.00,
                ],
            ]);
    }

    /**
     * Test validation fails for expired coupon.
     */
    public function test_expired_coupon_validation_fails(): void
    {
        Coupon::create([
            'code' => 'EXPIRED',
            'name' => 'Old Promo',
            'type' => 'fixed_amount',
            'value' => 100.00,
            'start_date' => Carbon::now()->subDays(10),
            'end_date' => Carbon::now()->subDays(1),
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'EXPIRED',
            'subtotal' => 1000.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /**
     * Test validation fails if subtotal is below minimum order value.
     */
    public function test_coupon_min_order_value_validation_fails(): void
    {
        Coupon::create([
            'code' => 'MIN1000',
            'name' => 'Big Spender',
            'type' => 'fixed_amount',
            'value' => 200.00,
            'min_order_value' => 1000.00,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'MIN1000',
            'subtotal' => 500.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /**
     * Test validation fails when global usage limit reached.
     */
    public function test_global_usage_limit_reached_fails(): void
    {
        $coupon = Coupon::create([
            'code' => 'LIMITED',
            'name' => 'Exclusive 5 Uses',
            'type' => 'fixed_amount',
            'value' => 50.00,
            'usage_limit' => 1,
            'status' => 'active',
        ]);

        // Record 1 usage
        CouponUsage::create([
            'coupon_id' => $coupon->id,
            'user_id' => $this->customer->id,
            'discount_amount' => 50.00,
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'LIMITED',
            'subtotal' => 1000.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /**
     * Test product restriction filtering calculates discount only on matching items.
     */
    public function test_product_restriction_partial_discount_calculation(): void
    {
        $coupon = Coupon::create([
            'code' => 'HEADPHONESONLY',
            'name' => 'Headphones Discount',
            'type' => 'percentage',
            'value' => 10.00,
            'status' => 'active',
        ]);
        $coupon->products()->attach($this->product1->id);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'HEADPHONESONLY',
            'subtotal' => 1500.00,
            'items' => [
                ['product_id' => $this->product1->id, 'total' => 1000.00], // Eligible
                ['product_id' => $this->product2->id, 'total' => 500.00],  // Ineligible
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'eligible_subtotal' => 1000.00,
                    'discount_amount' => 100.00, // 10% of 1000
                ],
            ]);
    }

    /**
     * Test admin can view coupon performance report.
     */
    public function test_admin_can_view_coupon_performance_report(): void
    {
        $coupon = Coupon::create([
            'code' => 'REPORTTEST',
            'name' => 'Report Coupon',
            'type' => 'fixed_amount',
            'value' => 100.00,
            'usage_limit' => 10,
            'status' => 'active',
        ]);

        CouponUsage::create([
            'coupon_id' => $coupon->id,
            'user_id' => $this->customer->id,
            'discount_amount' => 100.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson("/api/v1/admin/coupons/{$coupon->id}/reports");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_uses' => 1,
                    'remaining_usage' => 9,
                    'total_discount' => 100.00,
                ],
            ]);
    }

    /**
     * Test admin can toggle coupon status.
     */
    public function test_admin_can_toggle_coupon_status(): void
    {
        $coupon = Coupon::create([
            'code' => 'TOGGLECODE',
            'name' => 'Toggle Coupon',
            'type' => 'fixed_amount',
            'value' => 50.00,
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/v1/admin/coupons/{$coupon->id}/status", [
                'status' => 'inactive',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'status' => 'inactive']);
    }
}
