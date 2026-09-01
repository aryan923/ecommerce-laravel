<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected string $adminToken;
    protected Brand $brand;
    protected Category $category;
    protected Product $product;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $this->brand = Brand::create(['name' => 'Admin Brand', 'slug' => 'admin-brand']);
        $this->category = Category::create(['name' => 'Admin Category', 'slug' => 'admin-category']);

        $this->product = Product::create([
            'brand_id' => $this->brand->id,
            'name' => 'Original Product',
            'slug' => 'original-product',
            'sku' => 'PRD-ORIG-01',
            'type' => 'simple',
            'status' => 'active',
            'price' => 1500.00,
        ]);
        $this->product->categories()->attach($this->category->id);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'PRD-ORIG-01-VAR1',
            'price' => 1500.00,
            'stock_qty' => 20,
        ]);

        Inventory::updateOrCreate(
            ['product_variant_id' => $this->variant->id],
            ['sku' => $this->variant->sku, 'available_qty' => 20]
        );
    }

    /**
     * Test admin can duplicate a product and its variants.
     */
    public function test_admin_can_duplicate_product_with_variants(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/products/{$this->product->id}/duplicate");

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Original Product (Copy)')
            ->assertJsonPath('data.status', 'draft');

        $duplicatedId = $response->json('data.id');
        $this->assertNotEquals($this->product->id, $duplicatedId);
        $this->assertDatabaseHas('products', [
            'id' => $duplicatedId,
            'name' => 'Original Product (Copy)',
        ]);
    }

    /**
     * Test admin can perform bulk status updates across products.
     */
    public function test_admin_can_perform_bulk_status_update(): void
    {
        $product2 = Product::create([
            'name' => 'Product 2',
            'slug' => 'product-2',
            'sku' => 'PRD-02',
            'status' => 'draft',
            'price' => 500.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products/bulk', [
                'product_ids' => [$this->product->id, $product2->id],
                'action' => 'deactivate',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.modified_count', 2);

        $this->assertEquals('inactive', $this->product->fresh()->status);
        $this->assertEquals('inactive', $product2->fresh()->status);
    }

    /**
     * Test admin can perform bulk category updates.
     */
    public function test_admin_can_perform_bulk_category_update(): void
    {
        $newCategory = Category::create(['name' => 'New Category', 'slug' => 'new-category']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products/bulk', [
                'product_ids' => [$this->product->id],
                'action' => 'update_category',
                'data' => ['category_id' => $newCategory->id],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue($this->product->categories->contains($newCategory->id));
    }

    /**
     * Test admin can perform bulk price and stock updates.
     */
    public function test_admin_can_perform_bulk_price_and_stock_update(): void
    {
        // Bulk update price
        $responsePrice = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products/bulk', [
                'product_ids' => [$this->product->id],
                'action' => 'update_price',
                'data' => ['price' => 1999.99],
            ]);

        $responsePrice->assertStatus(200);
        $this->assertEquals(1999.99, (float) $this->product->fresh()->price);

        // Bulk update stock
        $responseStock = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products/bulk', [
                'product_ids' => [$this->product->id],
                'action' => 'update_stock',
                'data' => ['stock_qty' => 50],
            ]);

        $responseStock->assertStatus(200);
        $this->assertEquals(50, $this->variant->fresh()->stock_qty);
    }

    /**
     * Test admin can import products.
     */
    public function test_admin_can_import_products(): void
    {
        $payload = [
            'products' => [
                [
                    'name' => 'Imported Phone 1',
                    'price' => 499.99,
                    'type' => 'simple',
                    'sku' => 'IMP-PH-01',
                    'stock_qty' => 15,
                ],
                [
                    'name' => 'Imported Phone 2',
                    'price' => 799.99,
                    'type' => 'simple',
                    'sku' => 'IMP-PH-02',
                    'stock_qty' => 10,
                ],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products/import', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('products', ['sku' => 'IMP-PH-01']);
        $this->assertDatabaseHas('products', ['sku' => 'IMP-PH-02']);
    }

    /**
     * Test duplicating non-existent product returns 404.
     */
    public function test_duplicate_non_existent_product_returns_404(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products/999999/duplicate');

        $response->assertStatus(404);
    }

    /**
     * Test admin can create and update related products for a product.
     */
    public function test_admin_can_manage_related_products(): void
    {
        $relProduct1 = Product::create([
            'name' => 'Related Product 1',
            'slug' => 'related-product-1',
            'sku' => 'REL-01',
            'type' => 'simple',
            'status' => 'active',
            'price' => 500.00,
        ]);
        $relProduct1->categories()->attach($this->category->id);

        $relProduct2 = Product::create([
            'name' => 'Related Product 2',
            'slug' => 'related-product-2',
            'sku' => 'REL-02',
            'type' => 'simple',
            'status' => 'active',
            'price' => 600.00,
        ]);
        $relProduct2->categories()->attach($this->category->id);

        // 1. Update product to set related_product_ids
        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/products/' . $this->product->id, [
                'name' => 'Updated Product with Related',
                'related_product_ids' => [$relProduct1->id, $relProduct2->id],
            ]);

        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('related_products', [
            'product_id' => $this->product->id,
            'related_product_id' => $relProduct1->id,
        ]);
        $this->assertDatabaseHas('related_products', [
            'product_id' => $this->product->id,
            'related_product_id' => $relProduct2->id,
        ]);

        // 2. Fetch product details and check related_products relation
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/products/' . $this->product->id);

        $showResponse->assertStatus(200)
            ->assertJsonCount(2, 'data.related_products');

        // 3. Create new product with related_product_ids directly
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/products', [
                'name' => 'New Product with Related',
                'type' => 'simple',
                'price' => 999.00,
                'category_ids' => [$this->category->id],
                'related_product_ids' => [$relProduct1->id],
            ]);

        $createResponse->assertStatus(201);
        $newProductId = $createResponse->json('data.id');
        $this->assertDatabaseHas('related_products', [
            'product_id' => $newProductId,
            'related_product_id' => $relProduct1->id,
        ]);
    }
}

