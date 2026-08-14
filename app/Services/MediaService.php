<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\BrandImage;
use App\Models\Category;
use App\Models\CategoryImage;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaService
{
    /**
     * Upload a single media file to storage and persist media record.
     *
     * @param UploadedFile $file
     * @param array $attributes
     * @return Media
     * @throws ValidationException
     */
    public function upload(UploadedFile $file, array $attributes = []): Media
    {
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType();
        $isRasterImage = in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

        $width = null;
        $height = null;

        if ($isRasterImage) {
            $imageInfo = @getimagesize($file->getRealPath());
            if ($imageInfo === false) {
                throw ValidationException::withMessages([
                    'file' => ['The uploaded image file appears to be corrupted or invalid.'],
                ]);
            }
            $width = $imageInfo[0];
            $height = $imageInfo[1];

            if ($width < 100 || $height < 100) {
                throw ValidationException::withMessages([
                    'file' => ['Image pixel dimensions must be at least 100x100 pixels.'],
                ]);
            }
            if ($width > 5000 || $height > 5000) {
                throw ValidationException::withMessages([
                    'file' => ['Image pixel dimensions must not exceed 5000x5000 pixels.'],
                ]);
            }
        }

        $defaultDisk = config('filesystems.default');
        $disk = $defaultDisk === 's3' ? 's3' : 'public';
        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . Str::random(8) . '.' . $extension;
        $folderPath = 'media/' . date('Y/m');

        $filePath = Storage::disk($disk)->putFileAs($folderPath, $file, $filename);
        $url = '/storage/' . ltrim($filePath, '/');

        $modelType = $attributes['model_type'] ?? null;
        $modelId = isset($attributes['model_id']) ? (int) $attributes['model_id'] : null;
        $type = $attributes['type'] ?? 'gallery';

        if ($modelType && $modelId) {
            $this->validateEntityExists($modelType, $modelId);
            if ($type === 'main') {
                $this->demoteExistingMainImage($modelType, $modelId);
            }
        }

        return Media::create([
            'model_type' => $modelType,
            'model_id' => $modelId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'disk' => $disk,
            'url' => $url,
            'type' => $type,
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'alt' => $attributes['alt'] ?? null,
            'sort_order' => $attributes['sort_order'] ?? 0,
        ]);
    }

    /**
     * Upload multiple files.
     *
     * @param array $files
     * @param array $attributes
     * @return array
     */
    public function uploadMultiple(array $files, array $attributes = []): array
    {
        $uploaded = [];
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploaded[] = $this->upload($file, $attributes);
            }
        }

        return $uploaded;
    }

    /**
     * List and search media records with pagination and filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Media::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('alt', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['mime_type'])) {
            $query->where('mime_type', 'like', "%{$filters['mime_type']}%");
        }

        if (!empty($filters['model_type'])) {
            $query->where('model_type', $filters['model_type']);
        }

        if (!empty($filters['model_id'])) {
            $query->where('model_id', (int) $filters['model_id']);
        }

        if (!empty($filters['unattached_only']) && (bool) $filters['unattached_only']) {
            $query->whereNull('model_type')->whereNull('model_id');
        }

        // When listing the central media library repository (no entity filter specified),
        // group by file_path to show unique media assets without duplicate cards.
        if (empty($filters['model_type']) && empty($filters['model_id'])) {
            $query->whereIn('id', function ($subQuery) {
                $subQuery->selectRaw('MIN(id)')->from('media')->groupBy('file_path');
            });
        }

        return $query->orderBy('sort_order', 'asc')
                     ->orderBy('id', 'desc')
                     ->paginate($perPage);
    }

    /**
     * Attach an existing media asset to a target model entity.
     *
     * @param int $mediaId
     * @param string $modelType
     * @param int $modelId
     * @param string|null $type
     * @param string|null $alt
     * @return Media
     * @throws ValidationException
     */
    public function attach(int $mediaId, string $modelType, int $modelId, ?string $type = null, ?string $alt = null): Media
    {
        $media = Media::findOrFail($mediaId);
        $this->validateEntityExists($modelType, $modelId);

        $normalizedModelType = strtolower($modelType);
        $targetType = $type ?? 'gallery';

        if (in_array($normalizedModelType, ['product', 'products', Product::class])) {
            if ($targetType === 'main') {
                ProductImage::where('product_id', $modelId)->where('type', 'main')->delete();
                ProductImage::create([
                    'product_id' => $modelId,
                    'media_id' => $mediaId,
                    'type' => 'main',
                    'alt' => $alt ?? $media->alt,
                ]);
            } else {
                ProductImage::firstOrCreate(
                    ['product_id' => $modelId, 'media_id' => $mediaId, 'type' => 'gallery'],
                    ['alt' => $alt ?? $media->alt]
                );
            }
        } elseif (in_array($normalizedModelType, ['category', 'categories', Category::class])) {
            $catType = in_array($targetType, ['banner', 'thumbnail']) ? $targetType : 'thumbnail';
            CategoryImage::where('category_id', $modelId)->where('type', $catType)->delete();
            CategoryImage::create([
                'category_id' => $modelId,
                'media_id' => $mediaId,
                'type' => $catType,
                'alt' => $alt ?? $media->alt,
            ]);
        } elseif (in_array($normalizedModelType, ['brand', 'brands', Brand::class])) {
            $brandType = in_array($targetType, ['banner', 'logo']) ? $targetType : 'logo';
            BrandImage::where('brand_id', $modelId)->where('type', $brandType)->delete();
            BrandImage::create([
                'brand_id' => $modelId,
                'media_id' => $mediaId,
                'type' => $brandType,
                'alt' => $alt ?? $media->alt,
            ]);
        }

        return $media;
    }

    /**
     * Detach a media asset from its model entity.
     *
     * @param int $mediaId
     * @param string|null $modelType
     * @param int|null $modelId
     * @param string|null $type
     * @return Media
     */
    public function detach(int $mediaId, ?string $modelType = null, ?int $modelId = null, ?string $type = null): Media
    {
        $media = Media::findOrFail($mediaId);

        if ($modelType && $modelId) {
            $normalizedModelType = strtolower($modelType);
            if (in_array($normalizedModelType, ['product', 'products', Product::class])) {
                $q = ProductImage::where('product_id', $modelId)->where('media_id', $mediaId);
                if ($type) $q->where('type', $type);
                $q->delete();
            } elseif (in_array($normalizedModelType, ['category', 'categories', Category::class])) {
                $q = CategoryImage::where('category_id', $modelId)->where('media_id', $mediaId);
                if ($type) $q->where('type', $type);
                $q->delete();
            } elseif (in_array($normalizedModelType, ['brand', 'brands', Brand::class])) {
                $q = BrandImage::where('brand_id', $modelId)->where('media_id', $mediaId);
                if ($type) $q->where('type', $type);
                $q->delete();
            }
        }

        return $media;
    }

    /**
     * Update media asset metadata.
     *
     * @param Media $media
     * @param array $data
     * @return Media
     */
    public function updateMetadata(Media $media, array $data): Media
    {
        if (isset($data['type']) && $data['type'] === 'main' && $media->model_type && $media->model_id) {
            $this->demoteExistingMainImage($media->model_type, $media->model_id);
        }

        $media->update(array_filter([
            'alt' => $data['alt'] ?? $media->alt,
            'type' => $data['type'] ?? $media->type,
            'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : $media->sort_order,
        ], fn ($val) => $val !== null));

        return $media;
    }

    /**
     * Bulk update gallery sort order indexes.
     *
     * @param array $items
     * @return bool
     */
    public function sort(array $items): bool
    {
        foreach ($items as $item) {
            if (isset($item['id'], $item['sort_order'])) {
                Media::where('id', (int) $item['id'])->update(['sort_order' => (int) $item['sort_order']]);
            }
        }

        return true;
    }

    /**
     * Delete media record and remove physical file from storage disk.
     *
     * @param Media $media
     * @param bool $force
     * @return bool
     * @throws ValidationException
     */
    public function delete(Media $media, bool $force = false): bool
    {
        if ($media->model_type && $media->model_id && !$force) {
            throw ValidationException::withMessages([
                'media' => ["Media #{$media->id} is actively attached to {$media->model_type} #{$media->model_id}. Supply force=true to delete."],
            ]);
        }

        return (bool) $media->delete();
    }

    /**
     * Purge unattached media records.
     *
     * @param int $olderThanDays
     * @return int
     */
    public function purgeUnused(int $olderThanDays = 1): int
    {
        $unattached = Media::whereNull('model_type')
            ->whereNull('model_id')
            ->where('created_at', '<=', now()->subDays($olderThanDays))
            ->get();

        $count = 0;
        foreach ($unattached as $media) {
            if ($media->delete()) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Validate target entity existence in database.
     *
     * @param string $modelType
     * @param int $modelId
     * @return void
     * @throws ValidationException
     */
    protected function validateEntityExists(string $modelType, int $modelId): void
    {
        $morphMap = Relation::morphMap();
        $modelClass = $morphMap[$modelType] ?? match ($modelType) {
            'product' => Product::class,
            'category' => Category::class,
            'brand' => Brand::class,
            default => null,
        };

        if (!$modelClass || !class_exists($modelClass)) {
            throw ValidationException::withMessages([
                'model_type' => ["Invalid model_type [{$modelType}]."],
            ]);
        }

        if (!$modelClass::where('id', $modelId)->exists()) {
            throw ValidationException::withMessages([
                'model_id' => ["Target {$modelType} with ID {$modelId} does not exist."],
            ]);
        }
    }

    /**
     * Ensure single main image exclusivity per entity.
     *
     * @param string $modelType
     * @param int $modelId
     * @return void
     */
    protected function demoteExistingMainImage(string $modelType, int $modelId): void
    {
        Media::where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->where('type', 'main')
            ->update(['type' => 'gallery']);
    }
}
