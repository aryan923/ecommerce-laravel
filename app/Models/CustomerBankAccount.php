<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerBankAccount extends Model
{
    use HasFactory;

    protected $table = 'customer_bank_accounts';

    protected $fillable = [
        'user_id',
        'account_holder_name',
        'bank_name',
        'account_number',
        'ifsc_code',
        'account_type',
        'upi_id',
        'is_default',
        'is_verified',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_verified' => 'boolean',
    ];

    protected $appends = [
        'masked_account_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get masked account number representation for secure list displays (e.g. •••• 5678).
     */
    public function getMaskedAccountNumberAttribute(): string
    {
        $len = strlen($this->account_number ?? '');
        if ($len <= 4) {
            return $this->account_number ?? '';
        }

        return str_repeat('•', max(0, $len - 4)) . ' ' . substr($this->account_number, -4);
    }

    /**
     * Export complete bank details snapshot array for immutable freezing in returns/refunds.
     */
    public function toSnapshot(): array
    {
        return [
            'id' => $this->id,
            'account_holder_name' => $this->account_holder_name,
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,
            'masked_account_number' => $this->masked_account_number,
            'ifsc_code' => $this->ifsc_code,
            'account_type' => $this->account_type,
            'upi_id' => $this->upi_id,
        ];
    }
}
