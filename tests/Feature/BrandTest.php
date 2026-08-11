<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandTest extends TestCase
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
     * Test Super Admin can create a brand.
     */
    public function test_super_admin_can_create_brand(): void
    {
        $payload = [
            'name' => 'Nike',
            'website' => 'https://nike.com',
            'status' => 'active',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/brands', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Brand created successfully.',
                'data' => [
                    'name' => 'Nike',
                    'slug' => 'nike',
                ],
            ]);
    }

    /**
     * Test Super Admin can update a brand.
     */
    public function test_super_admin_can_update_brand(): void
    {
        $brand = Brand::create(['name' => 'Adidas', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/brands/{$brand->id}", [
                'name' => 'Adidas Originals',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Adidas Originals',
                ],
            ]);
    }

    /**
     * Test Super Admin can toggle brand status.
     */
    public function test_super_admin_can_toggle_brand_status(): void
    {
        $brand = Brand::create(['name' => 'Puma', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->patchJson("/api/v1/admin/brands/{$brand->id}/status", [
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
     * Test Super Admin can delete a brand.
     */
    public function test_super_admin_can_delete_brand(): void
    {
        $brand = Brand::create(['name' => 'Reebok', 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/brands/{$brand->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
    }

    /**
     * Test public storefront can fetch active brands list.
     */
    public function test_public_can_fetch_active_brands(): void
    {
        Brand::create(['name' => 'Sony', 'status' => 'active']);
        Brand::create(['name' => 'Inactive Brand', 'status' => 'inactive']);

        $response = $this->getJson('/api/v1/brands');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Sony', $names);
        $this->assertNotContains('Inactive Brand', $names);
    }

    /**
     * Test public storefront can fetch active brand details by slug.
     */
    public function test_public_can_fetch_active_brand_by_slug(): void
    {
        $brand = Brand::create(['name' => 'Samsung', 'status' => 'active']);

        $response = $this->getJson("/api/v1/brands/{$brand->slug}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Samsung',
                    'slug' => 'samsung',
                ],
            ]);
    }

    /**
     * Test unauthorized admin cannot create brand.
     */
    public function test_unauthorized_admin_cannot_create_brand(): void
    {
        $role = Role::where('slug', 'order_manager')->first();
        $staff = AdminUser::create([
            'name' => 'Order Staff',
            'email' => 'brand.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('staff_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/brands', [
                'name' => 'Forbidden Brand',
            ]);

        $response->assertStatus(403);
    }
}
