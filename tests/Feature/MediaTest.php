<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Media;
use App\Models\Product;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected string $superAdminToken;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed(RbacSeeder::class);

        $this->superAdmin = AdminUser::where('email', 'admin@example.com')->first();
        $this->superAdminToken = $this->superAdmin->createToken('admin_token')->plainTextToken;
    }

    /**
     * Test admin can upload a single image file.
     */
    public function test_admin_can_upload_single_media_file(): void
    {
        $file = UploadedFile::fake()->image('banner.jpg', 800, 600)->size(500);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/media/upload', [
                'file' => $file,
                'alt' => 'Hero Banner',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Media file uploaded successfully.',
                'data' => [
                    'file_name' => 'banner.jpg',
                    'width' => 800,
                    'height' => 600,
                    'alt' => 'Hero Banner',
                ],
            ]);

        $this->assertDatabaseHas('media', [
            'file_name' => 'banner.jpg',
            'width' => 800,
            'height' => 600,
        ]);

        $media = Media::first();
        Storage::disk('public')->assertExists($media->file_path);
    }

    /**
     * Test admin can batch upload multiple media files.
     */
    public function test_admin_can_upload_batch_media_files(): void
    {
        $files = [
            UploadedFile::fake()->image('img1.jpg', 400, 400),
            UploadedFile::fake()->image('img2.png', 500, 500),
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/media/upload', [
                'files' => $files,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Media batch uploaded successfully.',
            ]);

        $this->assertDatabaseCount('media', 2);
    }

    /**
     * Test dimension validation failure (dimensions < 100x100).
     */
    public function test_admin_cannot_upload_invalid_dimension_image(): void
    {
        $smallFile = UploadedFile::fake()->image('tiny.jpg', 50, 50);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/media/upload', [
                'file' => $smallFile,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /**
     * Test admin can list media library with filters.
     */
    public function test_admin_can_list_media_library_with_filters(): void
    {
        Media::create([
            'file_name' => 'product-photo.jpg',
            'file_path' => 'media/2026/08/photo1.jpg',
            'disk' => 'public',
            'url' => 'http://localhost:8002/storage/media/2026/08/photo1.jpg',
            'type' => 'main',
            'mime_type' => 'image/jpeg',
            'size' => 102400,
            'alt' => 'Wireless Headphones',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/media?search=Headphones&type=main');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => ['total' => 1],
            ]);
    }

    /**
     * Test attaching media to product enforces single main image exclusivity.
     */
    public function test_attaching_media_demotes_existing_main_image(): void
    {
        $product = Product::create([
            'name' => 'Smart Watch',
            'slug' => 'smart-watch',
            'sku' => 'SW-001',
            'type' => 'simple',
            'status' => 'active',
            'price' => 199.99,
        ]);

        $media1 = Media::create([
            'model_type' => 'product',
            'model_id' => $product->id,
            'file_name' => 'watch1.jpg',
            'file_path' => 'media/watch1.jpg',
            'disk' => 'public',
            'url' => 'http://localhost/watch1.jpg',
            'type' => 'main',
            'mime_type' => 'image/jpeg',
            'size' => 50000,
        ]);

        $media2 = Media::create([
            'file_name' => 'watch2.jpg',
            'file_path' => 'media/watch2.jpg',
            'disk' => 'public',
            'url' => 'http://localhost/watch2.jpg',
            'type' => 'gallery',
            'mime_type' => 'image/jpeg',
            'size' => 60000,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/media/attach', [
                'media_id' => $media2->id,
                'model_type' => 'product',
                'model_id' => $product->id,
                'type' => 'main',
            ]);

        $response->assertStatus(200);

        $this->assertEquals('gallery', $media1->fresh()->type);
        $this->assertEquals('main', $media2->fresh()->type);
        $this->assertEquals($product->id, $media2->fresh()->model_id);
    }

    /**
     * Test bulk reordering gallery media items.
     */
    public function test_admin_can_bulk_sort_media_items(): void
    {
        $m1 = Media::create([
            'file_name' => 'm1.jpg', 'file_path' => 'm1.jpg', 'disk' => 'public',
            'url' => 'http://localhost/m1.jpg', 'mime_type' => 'image/jpeg', 'size' => 1000, 'sort_order' => 0,
        ]);
        $m2 = Media::create([
            'file_name' => 'm2.jpg', 'file_path' => 'm2.jpg', 'disk' => 'public',
            'url' => 'http://localhost/m2.jpg', 'mime_type' => 'image/jpeg', 'size' => 1000, 'sort_order' => 1,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/media/sort', [
                'items' => [
                    ['id' => $m1->id, 'sort_order' => 5],
                    ['id' => $m2->id, 'sort_order' => 2],
                ],
            ]);

        $response->assertStatus(200);

        $this->assertEquals(5, $m1->fresh()->sort_order);
        $this->assertEquals(2, $m2->fresh()->sort_order);
    }

    /**
     * Test media deletion cleans up storage file.
     */
    public function test_admin_can_delete_media_and_cleanup_disk_file(): void
    {
        $file = UploadedFile::fake()->image('delete-me.jpg', 300, 300);

        $uploadResponse = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/media/upload', ['file' => $file]);

        $mediaId = $uploadResponse->json('data.id');
        $media = Media::find($mediaId);

        Storage::disk('public')->assertExists($media->file_path);

        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/media/{$mediaId}");

        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('media', ['id' => $mediaId]);
        Storage::disk('public')->assertMissing($media->file_path);
    }

    /**
     * Test deleting attached media without force flag returns 422 warning.
     */
    public function test_deleting_attached_media_requires_force_flag(): void
    {
        $product = Product::create([
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'sku' => 'LP-100',
            'type' => 'simple',
            'status' => 'active',
            'price' => 1299.99,
        ]);

        $media = Media::create([
            'model_type' => 'product',
            'model_id' => $product->id,
            'file_name' => 'laptop.jpg',
            'file_path' => 'laptop.jpg',
            'disk' => 'public',
            'url' => 'http://localhost/laptop.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1000,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/media/{$media->id}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['media']);

        // Force delete
        $forceResponse = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/media/{$media->id}?force=true");

        $forceResponse->assertStatus(200);
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
    }
}
