<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'tax_class_id',
        'name',
        'type',
        'rate',
        'state_code',
        'country_code',
        'is_inclusive',
        'priority',
        'status',
    ];

    protected $casts = [
        'rate' => 'float',
        'is_inclusive' => 'boolean',
        'priority' => 'integer',
    ];

    public function taxClass(): BelongsTo
    {
        return $this->belongsTo(TaxClass::class, 'tax_class_id');
    }
}
