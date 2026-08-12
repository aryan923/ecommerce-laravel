<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'max_discount',
        'min_order_value',
        'start_date',
        'end_date',
        'usage_limit',
        'per_customer_limit',
        'is_first_order_only',
        'is_new_customer_only',
        'free_shipping',
        'status',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'usage_limit' => 'integer',
        'per_customer_limit' => 'integer',
        'is_first_order_only' => 'boolean',
        'is_new_customer_only' => 'boolean',
        'free_shipping' => 'boolean',
    ];

    /**
     * Mutator: Ensure coupon codes are stored in uppercase.
     */
    public function setCodeAttribute(string $value): void
    {
        $this->attributes['code'] = strtoupper(trim($value));
    }

    /**
     * Coupon Usages relationship.
     */
    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class, 'coupon_id');
    }

    /**
     * Applicable Products relationship.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'coupon_products');
    }

    /**
     * Applicable Categories relationship.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'coupon_categories');
    }

    /**
     * Applicable Brands relationship.
     */
    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class, 'coupon_brands');
    }

    /**
     * Applicable Customers relationship.
     */
    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'coupon_customers');
    }
}
