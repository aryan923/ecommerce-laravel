<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Banner;
use App\Models\Page;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $staff;

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

        $this->staff = AdminUser::create([
            'name' => 'Regular Staff',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
    }

    public function test_public_can_fetch_active_banners()
    {
        Banner::create([
            'title' => 'Summer Sale',
            'image_desktop' => '/banners/summer.jpg',
            'placement' => 'home_hero',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Banner::create([
            'title' => 'Inactive Banner',
            'image_desktop' => '/banners/inactive.jpg',
            'placement' => 'home_hero',
            'is_active' => false,
            'sort_order' => 2,
        ]);

        $response = $this->getJson('/api/v1/banners?placement=home_hero');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Summer Sale');
    }

    public function test_public_cannot_see_expired_banners()
    {
        Banner::create([
            'title' => 'Past Sale',
            'image_desktop' => '/banners/past.jpg',
            'placement' => 'home_hero',
            'is_active' => true,
            'starts_at' => now()->subDays(10),
            'ends_at' => now()->subDays(2),
        ]);

        $response = $this->getJson('/api/v1/banners');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_public_can_fetch_published_page_by_slug()
    {
        Page::create([
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'content' => '<h1>Privacy Policy</h1><p>Store terms...</p>',
            'seo_title' => 'Privacy Policy | Store',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/pages/privacy-policy');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Privacy Policy');
    }

    public function test_public_cannot_fetch_draft_page()
    {
        Page::create([
            'title' => 'Secret Draft',
            'slug' => 'secret-draft',
            'content' => '<p>Draft</p>',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/v1/pages/secret-draft');

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_create_banner()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/banners', [
                'title' => 'New Year Banner',
                'image_desktop' => '/banners/newyear.jpg',
                'placement' => 'home_hero',
                'sort_order' => 1,
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'New Year Banner');

        $this->assertDatabaseHas('banners', [
            'title' => 'New Year Banner',
            'placement' => 'home_hero',
        ]);
    }

    public function test_admin_can_reorder_banners()
    {
        $b1 = Banner::create(['title' => 'B1', 'image_desktop' => '/b1.jpg', 'placement' => 'home_hero', 'sort_order' => 1]);
        $b2 = Banner::create(['title' => 'B2', 'image_desktop' => '/b2.jpg', 'placement' => 'home_hero', 'sort_order' => 2]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/banners/reorder', [
                'orders' => [
                    ['id' => $b1->id, 'sort_order' => 10],
                    ['id' => $b2->id, 'sort_order' => 5],
                ]
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals(10, $b1->fresh()->sort_order);
        $this->assertEquals(5, $b2->fresh()->sort_order);
    }

    public function test_admin_can_create_cms_page_with_auto_slug()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/pages', [
                'title' => 'About Our Brand',
                'content' => '<p>About info</p>',
                'status' => 'published',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'about-our-brand');

        $this->assertDatabaseHas('pages', [
            'slug' => 'about-our-brand',
            'status' => 'published',
        ]);
    }

    public function test_page_slug_must_be_unique()
    {
        Page::create([
            'title' => 'Existing Page',
            'slug' => 'terms-of-service',
            'content' => '<p>Existing</p>',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/pages', [
                'title' => 'New Page',
                'slug' => 'terms-of-service',
                'content' => '<p>Duplicate slug</p>',
                'status' => 'published',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_unauthenticated_user_cannot_access_admin_banners()
    {
        $response = $this->getJson('/api/v1/admin/banners');

        $response->assertStatus(401);
    }
}
