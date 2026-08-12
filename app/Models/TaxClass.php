<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(TaxRate::class, 'tax_class_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'tax_class_id');
    }
}
