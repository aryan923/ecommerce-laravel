<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'gateway',
        'payment_method',
        'transaction_id',
        'gateway_order_id',
        'amount',
        'currency',
        'status',
        'payload',
        'failure_reason',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payload' => 'array',
        'paid_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function isCaptured(): bool
    {
        return $this->status === 'captured';
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['initiated', 'pending']);
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
