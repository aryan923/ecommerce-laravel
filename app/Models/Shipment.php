<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'provider',
        'courier_name',
        'awb_number',
        'tracking_number',
        'status',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public static function generateTrackingNumber(string $prefix = 'TRK'): string
    {
        do {
            $number = strtoupper($prefix . Str::random(10));
        } while (static::where('tracking_number', $number)->exists());

        return $number;
    }

    public function trackingLogs(): HasMany
    {
        return $this->hasMany(ShipmentTracking::class, 'shipment_id')->orderBy('occurred_at', 'desc');
    }
}
