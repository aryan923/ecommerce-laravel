<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VariantTest extends TestCase
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
     * Test Cartesian matrix generation for variable product.
     */
    public function test_super_admin_can_generate_variant_matrix(): void
    {
        $category = Category::create(['name' => 'Apparel', 'status' => 'active']);
        $product = Product::create([
            'name' => 'T-Shirt',
            'type' => 'variable',
            'status' => 'active',
            'price' => 29.99,
        ]);
        $product->categories()->attach($category->id, ['is_primary' => true]);

        $colorAttr = Attribute::create(['name' => 'Color']);
        $redVal = AttributeValue::create(['attribute_id' => $colorAttr->id, 'value' => 'Red']);
        $blueVal = AttributeValue::create(['attribute_id' => $colorAttr->id, 'value' => 'Blue']);

        $sizeAttr = Attribute::create(['name' => 'Size']);
        $sVal = AttributeValue::create(['attribute_id' => $sizeAttr->id, 'value' => 'S']);
        $mVal = AttributeValue::create(['attribute_id' => $sizeAttr->id, 'value' => 'M']);

        $payload = [
            'attribute_value_ids' => [
                [$redVal->id, $blueVal->id],
                [$sVal->id, $mVal->id],
            ],
            'base_price' => 29.99,
            'base_stock' => 20,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson("/api/v1/admin/products/{$product->id}/variants/generate", $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'created_count' => 4,
                    'skipped_count' => 0,
                ],
            ]);

        $this->assertDatabaseCount('product_variants', 4);
    }

    /**
     * Test single variant creation manually.
     */
    public function test_super_admin_can_create_single_variant_manually(): void
    {
        $product = Product::create(['name' => 'Sneakers', 'type' => 'variable', 'price' => 80.00]);
        $colorAttr = Attribute::create(['name' => 'Color']);
        $blackVal = AttributeValue::create(['attribute_id' => $colorAttr->id, 'value' => 'Black']);

        $payload = [
            'sku' => 'SNK-BLK-42',
            'price' => 85.00,
            'stock_qty' => 10,
            'attribute_value_ids' => [$blackVal->id],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson("/api/v1/admin/products/{$product->id}/variants", $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'sku' => 'SNK-BLK-42',
                ],
            ]);

        $this->assertDatabaseHas('product_variants', ['sku' => 'SNK-BLK-42']);
    }

    /**
     * Test listing product variants.
     */
    public function test_super_admin_can_list_product_variants(): void
    {
        $product = Product::create(['name' => 'Jacket', 'type' => 'variable', 'price' => 120.00]);
        ProductVariant::create(['product_id' => $product->id, 'price' => 120.00]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson("/api/v1/admin/products/{$product->id}/variants");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Test updating a variant.
     */
    public function test_super_admin_can_update_variant(): void
    {
        $product = Product::create(['name' => 'Jeans', 'type' => 'variable', 'price' => 60.00]);
        $variant = ProductVariant::create(['product_id' => $product->id, 'price' => 60.00, 'stock_qty' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/variants/{$variant->id}", [
                'price' => 65.00,
                'sale_price' => 55.00,
                'stock_qty' => 15,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'stock_qty' => 15,
                ],
            ]);
    }

    /**
     * Test toggling variant status.
     */
    public function test_super_admin_can_toggle_variant_status(): void
    {
        $product = Product::create(['name' => 'Hat', 'type' => 'variable', 'price' => 20.00]);
        $variant = ProductVariant::create(['product_id' => $product->id, 'price' => 20.00, 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/v1/admin/variants/{$variant->id}/status", [
                'status' => 'inactive',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'inactive',
                ],
            ]);
    }

    /**
     * Test matrix generation skips existing combination pairs.
     */
    public function test_variant_matrix_generation_skips_existing_combinations(): void
    {
        $product = Product::create(['name' => 'Cap', 'type' => 'variable', 'price' => 15.00]);
        $colorAttr = Attribute::create(['name' => 'Color']);
        $whiteVal = AttributeValue::create(['attribute_id' => $colorAttr->id, 'value' => 'White']);

        // Generate matrix first time
        $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson("/api/v1/admin/products/{$product->id}/variants/generate", [
                'attribute_value_ids' => [[$whiteVal->id]],
            ]);

        // Generate matrix second time with same attributes
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson("/api/v1/admin/products/{$product->id}/variants/generate", [
                'attribute_value_ids' => [[$whiteVal->id]],
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'created_count' => 0,
                    'skipped_count' => 1,
                ],
            ]);
    }

    /**
     * Test public storefront product detail page includes active variants.
     */
    public function test_public_product_detail_includes_active_variants(): void
    {
        $product = Product::create([
            'name' => 'Variable Phone',
            'slug' => 'variable-phone',
            'type' => 'variable',
            'status' => 'active',
            'price' => 500.00,
        ]);
        $activeVar = ProductVariant::create(['product_id' => $product->id, 'price' => 500.00, 'status' => 'active']);
        ProductVariant::create(['product_id' => $product->id, 'price' => 500.00, 'status' => 'inactive']);

        $response = $this->getJson('/api/v1/products/variable-phone');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $variants = $response->json('data.product.variants');
        $this->assertCount(1, $variants);
        $this->assertEquals($activeVar->id, $variants[0]['id']);
    }

    /**
     * Test unauthorized admin cannot generate variants.
     */
    public function test_unauthorized_admin_cannot_generate_variants(): void
    {
        $product = Product::create(['name' => 'Forbidden Var', 'type' => 'variable', 'price' => 10.00]);
        $role = Role::where('slug', 'order_manager')->first();
        $staff = AdminUser::create([
            'name' => 'Order Staff',
            'email' => 'var.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('staff_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/products/{$product->id}/variants/generate", [
                'attribute_value_ids' => [[1]],
            ]);

        $response->assertStatus(403);
    }
}
