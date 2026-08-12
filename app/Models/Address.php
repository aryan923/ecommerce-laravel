<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $table = 'addresses';

    protected $fillable = [
        'user_id',
        'name',
        'mobile',
        'line_1',
        'line_2',
        'landmark',
        'city',
        'state',
        'country',
        'postal_code',
        'type',
        'is_default_billing',
        'is_default_shipping',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'is_default_billing' => 'boolean',
        'is_default_shipping' => 'boolean',
    ];

    /**
     * Relationship to owner User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scope query for default shipping address.
     */
    public function scopeDefaultShipping(Builder $query): Builder
    {
        return $query->where('is_default_shipping', true);
    }

    /**
     * Scope query for default billing address.
     */
    public function scopeDefaultBilling(Builder $query): Builder
    {
        return $query->where('is_default_billing', true);
    }
}
