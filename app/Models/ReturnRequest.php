<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReturnRequest extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $fillable = [
        'return_number',
        'order_id',
        'user_id',
        'status',
        'reason',
        'description',
        'images',
        'admin_notes',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'images' => 'array',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public static function generateReturnNumber(): string
    {
        $dateStr = Carbon::now()->format('Ymd');
        $random = str_pad((string) mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);

        do {
            $returnNumber = "RET-{$dateStr}-{$random}";
            $random = str_pad((string) mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('return_number', $returnNumber)->exists());

        return $returnNumber;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'return_id');
    }
}
