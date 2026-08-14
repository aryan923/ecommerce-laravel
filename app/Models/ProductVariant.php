<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'barcode',
        'price',
        'sale_price',
        'cost_price',
        'stock_qty',
        'weight',
        'length',
        'width',
        'height',
        'image',
        'download_url',
        'download_limit',
        'download_expiry_days',
        'status',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock_qty' => 'integer',
        'download_limit' => 'integer',
        'download_expiry_days' => 'integer',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    protected $appends = [
        'effective_price',
        'is_on_sale',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($variant) {
            if (empty($variant->sku)) {
                $variant->sku = static::generateUniqueSku();
            }
        });

        static::created(function ($variant) {
            $defaultWh = Warehouse::getDefaultWarehouse();
            Inventory::firstOrCreate(
                [
                    'product_variant_id' => $variant->id,
                    'warehouse_id' => $defaultWh?->id,
                ],
                [
                    'sku' => $variant->sku,
                    'cost_price' => $variant->cost_price ?? 0.00,
                    'available_qty' => $variant->stock_qty ?? 0,
                    'reserved_qty' => 0,
                    'committed_qty' => 0,
                    'damaged_qty' => 0,
                    'returned_qty' => 0,
                    'low_stock_threshold' => 10,
                    'reorder_qty' => 50,
                ]
            );
        });
    }

    /**
     * Relationship to primary Inventory record.
     */
    public function inventory(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Inventory::class, 'product_variant_id');
    }

    /**
     * Relationship to multi-warehouse Inventories.
     */
    public function inventories(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Inventory::class, 'product_variant_id');
    }

    public static function generateUniqueSku(?string $prefix = 'VAR'): string
    {
        do {
            $sku = strtoupper($prefix . '-' . Str::random(8));
        } while (static::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Relationship to parent Product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Relationship to Attribute Values pivot.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'product_variant_attribute_values')
            ->with('attribute');
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
     * Scope active variants.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
