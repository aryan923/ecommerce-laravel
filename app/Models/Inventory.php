<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventories';

    protected $fillable = [
        'product_variant_id',
        'sku',
        'available_qty',
        'reserved_qty',
        'committed_qty',
        'damaged_qty',
        'returned_qty',
        'low_stock_threshold',
    ];

    protected $casts = [
        'product_variant_id' => 'integer',
        'available_qty' => 'integer',
        'reserved_qty' => 'integer',
        'committed_qty' => 'integer',
        'damaged_qty' => 'integer',
        'returned_qty' => 'integer',
        'low_stock_threshold' => 'integer',
    ];

    /**
     * Relationship to ProductVariant.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Relationship to InventoryTransactions audit log.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'inventory_id');
    }

    /**
     * Scope query for low stock items.
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('available_qty', '<=', 'low_stock_threshold')
                     ->where('available_qty', '>', 0);
    }

    /**
     * Scope query for out of stock items.
     */
    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->where('available_qty', '<=', 0);
    }
}
