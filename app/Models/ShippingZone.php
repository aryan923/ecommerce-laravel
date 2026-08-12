<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'countries',
        'states',
        'postal_codes',
        'is_global',
        'status',
    ];

    protected $casts = [
        'countries' => 'array',
        'states' => 'array',
        'postal_codes' => 'array',
        'is_global' => 'boolean',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'zone_id');
    }
}
