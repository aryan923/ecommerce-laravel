<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected string $superAdminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = AdminUser::where('email', 'admin@example.com')->first();
        $this->superAdminToken = $this->superAdmin->createToken('admin_token')->plainTextToken;
    }

    /**
     * Test Super Admin can create a simple physical product.
     */
    public function test_super_admin_can_create_simple_product(): void
    {
        $category = Category::create(['name' => 'Audio', 'status' => 'active']);
        $brand = Brand::create(['name' => 'SonyBrand', 'status' => 'active']);

        $payload = [
            'name' => 'Sony Noise Cancelling Headphones',
            'type' => 'simple',
            'status' => 'active',
            'brand_id' => $brand->id,
            'category_ids' => [$category->id],
            'primary_category_id' => $category->id,
            'price' => 299.99,
            'sale_price' => 249.99,
            'tax_class' => ['standard', 'gst_18'],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/products', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Product created successfully.',
                'data' => [
                    'name' => 'Sony Noise Cancelling Headphones',
                    'type' => 'simple',
                    'status' => 'active',
                ],
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Sony Noise Cancelling Headphones',
            'brand_id' => $brand->id,
        ]);
    }

    /**
     * Test Super Admin can create a digital product.
     */
    public function test_super_admin_can_create_digital_product(): void
    {
        $category = Category::create(['name' => 'E-Books', 'status' => 'active']);

        $payload = [
            'name' => 'Mastering Laravel E-Book',
            'type' => 'digital',
            'status' => 'active',
            'category_ids' => [$category->id],
            'price' => 29.99,
            'download_url' => 'https://example.com/downloads/laravel-guide.pdf',
            'download_limit' => 3,
            'download_expiry_days' => 30,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/products', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Mastering Laravel E-Book',
                    'type' => 'digital',
                    'download_limit' => 3,
                ],
            ]);
    }

    /**
     * Test digital product creation validates download_url presence.
     */
    public function test_digital_product_requires_download_url(): void
    {
        $category = Category::create(['name' => 'Software']);

        $payload = [
            'name' => 'Invalid Digital Product',
            'type' => 'digital',
            'price' => 19.99,
            'category_ids' => [$category->id],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/products', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['download_url']);
    }

    /**
     * Test sale_price must be less than regular price.
     */
    public function test_product_creation_validates_sale_price_lower_than_price(): void
    {
        $category = Category::create(['name' => 'Gadgets']);

        $payload = [
            'name' => 'Overpriced Product',
            'type' => 'simple',
            'price' => 100.00,
            'sale_price' => 150.00,
            'category_ids' => [$category->id],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/products', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sale_price']);
    }

    /**
     * Test Super Admin can list products with multi-filters.
     */
    public function test_super_admin_can_list_products_with_filters(): void
    {
        $cat = Category::create(['name' => 'Laptops']);
        Product::create(['name' => 'Gaming Laptop', 'type' => 'simple', 'status' => 'active', 'price' => 1200]);
        Product::create(['name' => 'Office Laptop', 'type' => 'simple', 'status' => 'inactive', 'price' => 600]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/products?status=active&min_price=1000');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Gaming Laptop', $response->json('data.0.name'));
    }

    /**
     * Test Super Admin can update product details.
     */
    public function test_super_admin_can_update_product(): void
    {
        $category = Category::create(['name' => 'Initial Cat']);
        $product = Product::create(['name' => 'Original Name', 'type' => 'simple', 'price' => 50.00]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/products/{$product->id}", [
                'name' => 'Updated Product Name',
                'price' => 60.00,
                'category_ids' => [$category->id],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Updated Product Name',
                ],
            ]);
    }

    /**
     * Test Super Admin can toggle product status.
     */
    public function test_super_admin_can_toggle_product_status(): void
    {
        $product = Product::create(['name' => 'Draft Product', 'type' => 'simple', 'status' => 'draft', 'price' => 10]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/v1/admin/products/{$product->id}/status", [
                'status' => 'active',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'active',
                ],
            ]);
    }

    /**
     * Test public storefront can fetch active products catalog.
     */
    public function test_public_can_fetch_active_products_catalog(): void
    {
        $cat = Category::create(['name' => 'Mobile Phones', 'slug' => 'mobile-phones', 'status' => 'active']);
        $activeProd = Product::create(['name' => 'Active Phone', 'type' => 'simple', 'status' => 'active', 'price' => 500]);
        $activeProd->categories()->attach($cat->id, ['is_primary' => true]);

        Product::create(['name' => 'Draft Phone', 'type' => 'simple', 'status' => 'draft', 'price' => 400]);

        $response = $this->getJson('/api/v1/products?category=mobile-phones');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Active Phone', $names);
        $this->assertNotContains('Draft Phone', $names);
    }

    /**
     * Test public storefront can fetch product details by slug with breadcrumbs.
     */
    public function test_public_can_fetch_product_details_by_slug_with_breadcrumbs(): void
    {
        $parentCat = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'status' => 'active']);
        $subCat = Category::create(['name' => 'Audio', 'slug' => 'audio', 'parent_id' => $parentCat->id, 'status' => 'active']);

        $product = Product::create([
            'name' => 'Bluetooth Speaker',
            'slug' => 'bluetooth-speaker',
            'type' => 'simple',
            'status' => 'active',
            'price' => 80.00,
        ]);
        $product->categories()->attach($subCat->id, ['is_primary' => true]);

        $response = $this->getJson('/api/v1/products/bluetooth-speaker');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'product' => [
                        'name' => 'Bluetooth Speaker',
                        'slug' => 'bluetooth-speaker',
                    ],
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'product',
                    'primary_category',
                    'breadcrumbs',
                    'related_products',
                ],
            ]);
    }

    /**
     * Test unauthorized admin cannot create product.
     */
    public function test_unauthorized_admin_cannot_create_product(): void
    {
        $role = Role::where('slug', 'order_manager')->first();
        $staff = AdminUser::create([
            'name' => 'Order Staff',
            'email' => 'prod.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('staff_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/products', [
                'name' => 'Forbidden Product',
                'type' => 'simple',
                'price' => 10.00,
                'category_ids' => [1],
            ]);

        $response->assertStatus(403);
    }
}
