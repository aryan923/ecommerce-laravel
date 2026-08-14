<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'model_type',
        'model_id',
        'file_name',
        'file_path',
        'disk',
        'url',
        'type',
        'mime_type',
        'size',
        'width',
        'height',
        'alt',
        'sort_order',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Boot model listeners for physical storage cleanup.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (Media $media) {
            if ($media->file_path && Storage::disk($media->disk)->exists($media->file_path)) {
                Storage::disk($media->disk)->delete($media->file_path);
            }
        });
    }

    /**
     * Get the parent imageable model (Product, Category, Brand, Banner, etc.).
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'model_type', 'model_id');
    }

    /**
     * Scope query to main image type.
     */
    public function scopeMain(Builder $query): Builder
    {
        return $query->where('type', 'main');
    }

    /**
     * Scope query to gallery image type.
     */
    public function scopeGallery(Builder $query): Builder
    {
        return $query->where('type', 'gallery');
    }

    /**
     * Scope query by target model.
     */
    public function scopeByModel(Builder $query, string $modelType, int $modelId): Builder
    {
        return $query->where('model_type', $modelType)->where('model_id', $modelId);
    }

    /**
     * Get normalized relative asset URL.
     */
    public function getUrlAttribute(?string $value): string
    {
        if ($value) {
            if (str_starts_with($value, 'http://localhost/storage/')) {
                return str_replace('http://localhost/storage/', '/storage/', $value);
            }
            if (str_starts_with($value, 'http://127.0.0.1/storage/')) {
                return str_replace('http://127.0.0.1/storage/', '/storage/', $value);
            }
            return $value;
        }

        if ($this->file_path) {
            return '/storage/' . ltrim($this->file_path, '/');
        }

        return '';
    }
}
