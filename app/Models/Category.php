<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'status',
        'sort_order',
        'seo_title',
        'seo_description',
        'meta_keywords',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'parent_id' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'banner_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = static::generateUniqueSlug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = static::generateUniqueSlug($category->name, $category->id);
            }
        });
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (static::where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    /**
     * Parent category relationship.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Child sub-categories relationship.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order', 'asc');
    }

    /**
     * Scope root categories (top-level).
     */
    public function scopeRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope active categories.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Relationship to CategoryImage attachment models.
     */
    public function categoryImages(): HasMany
    {
        return $this->hasMany(CategoryImage::class, 'category_id')->orderBy('sort_order');
    }

    /**
     * BelongsToMany relationship to Media assets via category_images pivot table.
     */
    public function media(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'category_images', 'category_id', 'media_id')
                    ->withPivot(['id', 'type', 'sort_order', 'alt'])
                    ->withTimestamps();
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('categoryImages') && $this->categoryImages->isNotEmpty()) {
            $img = $this->categoryImages->firstWhere('type', 'thumbnail') ?? $this->categoryImages->first();
            if ($img && $img->media) return $img->media->url;
        }

        $direct = $this->categoryImages()->where('type', 'thumbnail')->with('media')->first();
        if ($direct && $direct->media) return $direct->media->url;

        return null;
    }

    public function getBannerUrlAttribute(): ?string
    {
        if ($this->relationLoaded('categoryImages') && $this->categoryImages->isNotEmpty()) {
            $img = $this->categoryImages->firstWhere('type', 'banner');
            if ($img && $img->media) return $img->media->url;
        }

        $direct = $this->categoryImages()->where('type', 'banner')->with('media')->first();
        if ($direct && $direct->media) return $direct->media->url;

        return null;
    }
}
