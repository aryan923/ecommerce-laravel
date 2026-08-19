<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'warehouse_id',
        'shipment_number',
        'provider',
        'courier_name',
        'awb_number',
        'tracking_number',
        'tracking_url',
        'status',
        'notes',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public static function generateShipmentNumber(string $prefix = 'SHP'): string
    {
        do {
            $number = strtoupper($prefix . '-' . date('Y') . '-' . mt_rand(10000, 99999));
        } while (static::where('shipment_number', $number)->exists());

        return $number;
    }

    public static function generateTrackingNumber(string $prefix = 'TRK'): string
    {
        do {
            $number = strtoupper($prefix . Str::random(10));
        } while (static::where('tracking_number', $number)->exists());

        return $number;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShipmentItem::class, 'shipment_id');
    }

    public function trackingLogs(): HasMany
    {
        return $this->hasMany(ShipmentTracking::class, 'shipment_id')->orderBy('occurred_at', 'desc');
    }
}
