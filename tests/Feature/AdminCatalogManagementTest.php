<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->token = $this->admin->createToken('admin_token')->plainTextToken;
    }

    public function test_admin_can_create_category_with_parent_id_and_sort_order(): void
    {
        $parent = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/admin/categories', [
                'name' => 'Headphones',
                'parent_id' => $parent->id,
                'sort_order' => 10,
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.parent_id', $parent->id)
            ->assertJsonPath('data.sort_order', 10);

        $this->assertDatabaseHas('categories', [
            'name' => 'Headphones',
            'parent_id' => $parent->id,
        ]);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::create(['name' => 'Old Category', 'slug' => 'old-category', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/admin/categories/{$category->id}", [
                'name' => 'Updated Category',
                'status' => 'inactive',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
            'status' => 'inactive',
        ]);
    }

    public function test_admin_can_create_brand_with_logo_and_seo(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/admin/brands', [
                'name' => 'AudioTech',
                'logo_url' => 'https://cdn.example.com/logo.png',
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'AudioTech');

        $this->assertDatabaseHas('brands', [
            'name' => 'AudioTech',
        ]);
    }

    public function test_admin_can_update_brand(): void
    {
        $brand = Brand::create(['name' => 'Old Brand', 'slug' => 'old-brand', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/admin/brands/{$brand->id}", [
                'name' => 'New Brand Name',
                'status' => 'active',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'name' => 'New Brand Name',
        ]);
    }

    public function test_admin_can_create_attribute_and_attribute_value(): void
    {
        $attrResponse = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/admin/attributes', [
                'name' => 'Color',
            ]);

        $attrResponse->assertStatus(201)
            ->assertJsonPath('success', true);

        $attributeId = $attrResponse->json('data.id');

        $valResponse = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/admin/attributes/{$attributeId}/values", [
                'value' => 'Navy Blue',
            ]);

        $valResponse->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('attribute_values', [
            'attribute_id' => $attributeId,
            'value' => 'Navy Blue',
        ]);
    }

    public function test_admin_can_delete_category(): void
    {
        $category = Category::create(['name' => 'To Delete', 'slug' => 'to-delete', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->deleteJson("/api/v1/admin/categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/admin/categories', [
            'name' => 'Forbidden Category',
        ]);

        $response->assertStatus(401);
    }
}
