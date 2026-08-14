<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'tax_class_id',
        'requires_shipping',
        'is_free_shipping',
        'shipping_class_id',
        'shipping_fee',
        'name',
        'slug',
        'sku',
        'type',
        'status',
        'featured',
        'short_description',
        'description',
        'price',
        'sale_price',
        'cost_price',
        'tax_class',
        'weight',
        'length',
        'width',
        'height',
        'download_url',
        'download_limit',
        'download_expiry_days',
        'seo_title',
        'seo_description',
        'meta_keywords',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'requires_shipping' => 'boolean',
        'is_free_shipping' => 'boolean',
        'shipping_fee' => 'decimal:2',
        'tax_class' => 'array',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'download_limit' => 'integer',
        'download_expiry_days' => 'integer',
    ];

    protected $appends = [
        'effective_price',
        'is_on_sale',
        'main_image_url',
        'gallery_image_urls',
        'image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
            if (empty($product->sku)) {
                $product->sku = static::generateUniqueSku();
            }
        });

        static::updating(function ($product) {
            if ($product->isDirty('name') && !$product->isDirty('slug')) {
                $product->slug = static::generateUniqueSlug($product->name, $product->id);
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

    public static function generateUniqueSku(?string $prefix = 'PRD'): string
    {
        do {
            $sku = strtoupper($prefix . '-' . Str::random(8));
        } while (static::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Relationship to Brand.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    /**
     * Relationship to TaxClass.
     */
    public function taxClass(): BelongsTo
    {
        return $this->belongsTo(TaxClass::class, 'tax_class_id');
    }

    /**
     * Relationship to Shipping Method / Shipping Class.
     */
    public function shippingClass(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class, 'shipping_class_id');
    }

    /**
     * Relationship to Categories pivot.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_categories')
            ->withPivot('is_primary');
    }

    /**
     * Relationship to Primary Category.
     */
    public function primaryCategory(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_categories')
            ->wherePivot('is_primary', true);
    }

    /**
     * Relationship to product variants.
     */
    public function variants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    /**
     * Relationship to ProductImage attachment models.
     */
    public function productImages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('sort_order');
    }

    /**
     * BelongsToMany relationship to Media assets via product_images pivot table.
     */
    public function media(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'product_images', 'product_id', 'media_id')
                    ->withPivot(['id', 'type', 'sort_order', 'alt'])
                    ->withTimestamps();
    }

    /**
     * Get main image URL attribute.
     */
    public function getMainImageUrlAttribute(): ?string
    {
        // 1. Try productImages relationship with eager loaded media
        if ($this->relationLoaded('productImages') && $this->productImages->isNotEmpty()) {
            $mainImg = $this->productImages->firstWhere('type', 'main') ?? $this->productImages->first();
            if ($mainImg && $mainImg->media && !empty($mainImg->media->url)) {
                return $mainImg->media->url;
            }
        }

        // 2. Try media pivot relationship
        if ($this->relationLoaded('media') && $this->media->isNotEmpty()) {
            $main = $this->media->first(fn($m) => $m->pivot && $m->pivot->type === 'main') ?? $this->media->first();
            if ($main && !empty($main->url)) return $main->url;
        }

        // 3. Query directly
        $mainProductImg = $this->productImages()->where('type', 'main')->with('media')->first() ?? $this->productImages()->with('media')->first();
        if ($mainProductImg && $mainProductImg->media && !empty($mainProductImg->media->url)) {
            return $mainProductImg->media->url;
        }

        return null;
    }

    /**
     * Get gallery image URLs array attribute.
     */
    public function getGalleryImageUrlsAttribute(): array
    {
        if ($this->relationLoaded('productImages') && $this->productImages->isNotEmpty()) {
            return $this->productImages
                ->where('type', 'gallery')
                ->map(fn($pi) => $pi->media ? $pi->media->url : null)
                ->filter()
                ->values()
                ->toArray();
        }

        return $this->productImages()
            ->where('type', 'gallery')
            ->with('media')
            ->get()
            ->map(fn($pi) => $pi->media ? $pi->media->url : null)
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * Get primary image URL attribute.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->main_image_url;
    }

    /**
     * Get effective price attribute.
     */
    public function getEffectivePriceAttribute(): float
    {
        if ($this->sale_price !== null && $this->sale_price > 0 && $this->sale_price < $this->price) {
            return (float) $this->sale_price;
        }

        return (float) $this->price;
    }

    /**
     * Get is on sale boolean attribute.
     */
    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null && $this->sale_price > 0 && $this->sale_price < $this->price;
    }

    /**
     * Scope active products.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope featured products.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id');
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id')->where('status', 'approved');
    }
}
