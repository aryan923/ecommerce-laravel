<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Category;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
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
     * Test Super Admin can create a root category.
     */
    public function test_super_admin_can_create_root_category(): void
    {
        $payload = [
            'name' => 'Electronics',
            'description' => 'Gadgets and hardware',
            'status' => 'active',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/categories', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Category created successfully.',
                'data' => [
                    'name' => 'Electronics',
                    'slug' => 'electronics',
                ],
            ]);
    }

    /**
     * Test Super Admin can create a sub-category.
     */
    public function test_super_admin_can_create_sub_category(): void
    {
        $root = Category::create(['name' => 'Computers', 'status' => 'active']);

        $payload = [
            'name' => 'Laptops',
            'parent_id' => $root->id,
            'status' => 'active',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/categories', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Laptops',
                    'parent_id' => $root->id,
                ],
            ]);
    }

    /**
     * Test Super Admin can list category tree.
     */
    public function test_super_admin_can_list_categories_tree(): void
    {
        $root = Category::create(['name' => 'Apparel', 'status' => 'active']);
        Category::create(['name' => 'Men Shirts', 'parent_id' => $root->id, 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/categories?tree=true');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Category tree retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'children'],
                ],
            ]);
    }

    /**
     * Test Super Admin can reorder categories.
     */
    public function test_super_admin_can_reorder_categories(): void
    {
        $cat1 = Category::create(['name' => 'Cat 1', 'sort_order' => 0]);
        $cat2 = Category::create(['name' => 'Cat 2', 'sort_order' => 1]);

        $payload = [
            'orders' => [
                ['id' => $cat1->id, 'sort_order' => 10],
                ['id' => $cat2->id, 'sort_order' => 5],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/categories/reorder', $payload);

        $response->assertStatus(200);

        $this->assertEquals(10, $cat1->fresh()->sort_order);
        $this->assertEquals(5, $cat2->fresh()->sort_order);
    }

    /**
     * Test category update prevents self-parenting loop.
     */
    public function test_category_update_prevents_self_parenting_loop(): void
    {
        $cat = Category::create(['name' => 'Self Cat']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/categories/{$cat->id}", [
                'parent_id' => $cat->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    /**
     * Test category deletion is blocked if sub-categories exist.
     */
    public function test_category_deletion_blocked_if_children_exist(): void
    {
        $parent = Category::create(['name' => 'Parent Cat']);
        Category::create(['name' => 'Child Cat', 'parent_id' => $parent->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/categories/{$parent->id}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    /**
     * Test public storefront can fetch active category tree.
     */
    public function test_public_can_fetch_active_category_tree(): void
    {
        Category::create(['name' => 'Active Public Cat', 'status' => 'active']);
        Category::create(['name' => 'Inactive Cat', 'status' => 'inactive']);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Active Public Cat', $names);
        $this->assertNotContains('Inactive Cat', $names);
    }

    /**
     * Test public storefront can fetch category details by slug.
     */
    public function test_public_can_fetch_active_category_by_slug(): void
    {
        $cat = Category::create(['name' => 'Smartphones', 'status' => 'active']);

        $response = $this->getJson("/api/v1/categories/{$cat->slug}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Smartphones',
                    'slug' => 'smartphones',
                ],
            ]);
    }

    /**
     * Test unauthorized admin cannot create category.
     */
    public function test_unauthorized_admin_cannot_create_category(): void
    {
        $role = Role::where('slug', 'order_manager')->first();
        $staff = AdminUser::create([
            'name' => 'Order Staff',
            'email' => 'order.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('staff_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/categories', [
                'name' => 'Forbidden Category',
            ]);

        $response->assertStatus(403);
    }
}
