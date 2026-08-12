<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'estimated_days',
        'weight_limit',
        'status',
    ];

    protected $casts = [
        'weight_limit' => 'decimal:2',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(ShippingRate::class, 'method_id');
    }
}
