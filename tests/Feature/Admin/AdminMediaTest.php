<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Media;
use App\Models\Product;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminMediaTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
        Storage::fake('public');

        $this->admin = AdminUser::where('email', 'admin@example.com')->first() ?? AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_media_endpoints(): void
    {
        $response = $this->getJson('/api/v1/admin/media');
        $response->assertStatus(401);
    }

    public function test_admin_can_fetch_media_list(): void
    {
        Media::create([
            'disk' => 'public',
            'file_name' => 'test-image.jpg',
            'file_path' => 'media/2026/08/test-image.jpg',
            'url' => '/storage/media/2026/08/test-image.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 10240,
            'type' => 'main',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/media');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_admin_can_upload_single_media_file(): void
    {
        $file = UploadedFile::fake()->image('test_product.jpg', 600, 600);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/media/upload', [
                'file' => $file,
                'type' => 'main',
                'alt' => 'Sample Product Image',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'file_name' => 'test_product.jpg',
                    'type' => 'main',
                ]
            ]);

        $this->assertDatabaseHas('media', [
            'file_name' => 'test_product.jpg',
            'type' => 'main',
        ]);
    }

    public function test_admin_can_update_media_metadata(): void
    {
        $media = Media::create([
            'disk' => 'public',
            'file_name' => 'update-test.jpg',
            'file_path' => 'media/2026/08/update-test.jpg',
            'url' => '/storage/media/2026/08/update-test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 5120,
            'type' => 'main',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/media/{$media->id}", [
                'alt' => 'Updated Alt Text',
                'type' => 'banner',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'alt' => 'Updated Alt Text',
                    'type' => 'banner',
                ]
            ]);
    }

    public function test_admin_can_attach_and_detach_media(): void
    {
        $media = Media::create([
            'disk' => 'public',
            'file_name' => 'attach-test.jpg',
            'file_path' => 'media/2026/08/attach-test.jpg',
            'url' => '/storage/media/2026/08/attach-test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 4096,
            'type' => 'main',
        ]);

        $product = Product::create([
            'name' => 'Media Product',
            'slug' => 'media-product',
            'sku' => 'MED-001',
            'price' => 29.99,
            'status' => 'active',
        ]);

        // Attach
        $attachRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/media/attach', [
                'media_id' => $media->id,
                'model_type' => 'product',
                'model_id' => $product->id,
                'type' => 'gallery',
            ]);

        $attachRes->assertStatus(200);
        $this->assertDatabaseHas('product_images', [
            'media_id' => $media->id,
            'product_id' => $product->id,
        ]);

        // Detach
        $detachRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/media/detach', [
                'media_id' => $media->id,
                'model_type' => 'product',
                'model_id' => $product->id,
            ]);

        $detachRes->assertStatus(200);
        $this->assertDatabaseMissing('product_images', [
            'media_id' => $media->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_admin_can_delete_media_asset(): void
    {
        $media = Media::create([
            'disk' => 'public',
            'file_name' => 'delete-test.jpg',
            'file_path' => 'media/2026/08/delete-test.jpg',
            'url' => '/storage/media/2026/08/delete-test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 2048,
            'type' => 'main',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/media/{$media->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('media', [
            'id' => $media->id,
        ]);
    }

    public function test_admin_can_purge_unused_media(): void
    {
        Media::create([
            'disk' => 'public',
            'file_name' => 'orphan.jpg',
            'file_path' => 'media/2026/08/orphan.jpg',
            'url' => '/storage/media/2026/08/orphan.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'type' => 'main',
            'created_at' => now()->subDays(5),
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson('/api/v1/admin/media/unused', [
                'older_than_days' => 1,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
