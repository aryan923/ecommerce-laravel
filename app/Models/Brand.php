<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'website',
        'status',
        'sort_order',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'logo_url',
        'banner_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = static::generateUniqueSlug($brand->name);
            }
        });

        static::updating(function ($brand) {
            if ($brand->isDirty('name') && !$brand->isDirty('slug')) {
                $brand->slug = static::generateUniqueSlug($brand->name, $brand->id);
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
     * Scope active brands.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Relationship to BrandImage attachment models.
     */
    public function brandImages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BrandImage::class, 'brand_id')->orderBy('sort_order');
    }

    /**
     * BelongsToMany relationship to Media assets via brand_images pivot table.
     */
    public function media(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'brand_images', 'brand_id', 'media_id')
                    ->withPivot(['id', 'type', 'sort_order', 'alt'])
                    ->withTimestamps();
    }

    public function getLogoUrlAttribute(): ?string
    {
        if ($this->relationLoaded('brandImages') && $this->brandImages->isNotEmpty()) {
            $img = $this->brandImages->firstWhere('type', 'logo') ?? $this->brandImages->firstWhere('type', 'main') ?? $this->brandImages->first();
            if ($img && $img->media) return $img->media->url;
        }

        $direct = $this->brandImages()->whereIn('type', ['logo', 'main'])->with('media')->first();
        if ($direct && $direct->media) return $direct->media->url;

        return null;
    }

    public function getBannerUrlAttribute(): ?string
    {
        if ($this->relationLoaded('brandImages') && $this->brandImages->isNotEmpty()) {
            $img = $this->brandImages->firstWhere('type', 'banner');
            if ($img && $img->media) return $img->media->url;
        }

        $direct = $this->brandImages()->where('type', 'banner')->with('media')->first();
        if ($direct && $direct->media) return $direct->media->url;

        return null;
    }
}
