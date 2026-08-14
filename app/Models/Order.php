<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'guest_email',
        'guest_name',
        'status',
        'currency',
        'subtotal',
        'discount_total',
        'tax_total',
        'shipping_total',
        'grand_total',
        'coupon_code',
        'payment_method',
        'shipping_address',
        'billing_address',
        'shipping_method_name',
        'idempotency_key',
        'admin_notes',
        'tax_breakdown',
        'store_snapshot',
        'customer_snapshot',
        'currency_snapshot',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'shipping_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'tax_breakdown' => 'array',
        'store_snapshot' => 'array',
        'customer_snapshot' => 'array',
        'currency_snapshot' => 'array',
    ];

    public static function generateOrderNumber(): string
    {
        $dateStr = Carbon::now()->format('Ymd');
        $random = str_pad((string) mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);

        do {
            $orderNumber = "ORD-{$dateStr}-{$random}";
            $random = str_pad((string) mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'order_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(OrderHistory::class, 'order_id')->orderBy('created_at', 'desc');
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'order_id')->orderBy('created_at', 'desc');
    }

    public function returns(): HasMany
    {
        return $this->hasMany(ReturnRequest::class, 'order_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'order_id');
    }
}
