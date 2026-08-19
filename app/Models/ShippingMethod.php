<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipping_zone_id',
        'name',
        'code',
        'carrier_name',
        'type',
        'calculation_type',
        'base_cost',
        'handling_fee',
        'min_free_shipping_amount',
        'estimated_days',
        'estimated_days_min',
        'estimated_days_max',
        'weight_limit',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'handling_fee' => 'decimal:2',
        'min_free_shipping_amount' => 'decimal:2',
        'weight_limit' => 'decimal:2',
        'estimated_days_min' => 'integer',
        'estimated_days_max' => 'integer',
        'sort_order' => 'integer',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'method_id');
    }
}
