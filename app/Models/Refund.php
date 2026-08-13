<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'refund_number',
        'order_id',
        'payment_id',
        'return_id',
        'amount',
        'reason',
        'gateway',
        'gateway_refund_id',
        'status',
        'processed_by',
        'payload',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payload' => 'array',
        'completed_at' => 'datetime',
    ];

    public static function generateRefundNumber(): string
    {
        $dateStr = Carbon::now()->format('Ymd');
        $random = str_pad((string) mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);

        do {
            $refundNumber = "RFD-{$dateStr}-{$random}";
            $random = str_pad((string) mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('refund_number', $refundNumber)->exists());

        return $refundNumber;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

    public function returnRequest(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class, 'return_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'processed_by');
    }
}
