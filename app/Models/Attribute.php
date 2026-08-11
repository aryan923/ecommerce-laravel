<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Attribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'is_filterable',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'is_filterable' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($attribute) {
            if (empty($attribute->code)) {
                $attribute->code = static::generateUniqueCode($attribute->name);
            }
        });

        static::updating(function ($attribute) {
            if ($attribute->isDirty('name') && !$attribute->isDirty('code')) {
                $attribute->code = static::generateUniqueCode($attribute->name, $attribute->id);
            }
        });
    }

    public static function generateUniqueCode(string $name, ?int $ignoreId = null): string
    {
        $code = Str::slug($name, '_');
        $originalCode = $code;
        $count = 1;

        while (static::where('code', $code)->where('id', '!=', $ignoreId)->exists()) {
            $code = "{$originalCode}_{$count}";
            $count++;
        }

        return $code;
    }

    /**
     * Relationship to attribute values.
     */
    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class, 'attribute_id')->orderBy('sort_order', 'asc');
    }

    /**
     * Scope active attributes.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope filterable attributes.
     */
    public function scopeFilterable(Builder $query): Builder
    {
        return $query->where('is_filterable', true);
    }
}
