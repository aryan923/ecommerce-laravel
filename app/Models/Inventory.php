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
        'warehouse_id',
        'product_variant_id',
        'sku',
        'cost_price',
        'available_qty',
        'reserved_qty',
        'committed_qty',
        'damaged_qty',
        'returned_qty',
        'low_stock_threshold',
        'reorder_qty',
        'allow_backorder',
        'location_code',
    ];

    protected $casts = [
        'warehouse_id' => 'integer',
        'product_variant_id' => 'integer',
        'cost_price' => 'float',
        'available_qty' => 'integer',
        'reserved_qty' => 'integer',
        'committed_qty' => 'integer',
        'damaged_qty' => 'integer',
        'returned_qty' => 'integer',
        'low_stock_threshold' => 'integer',
        'reorder_qty' => 'integer',
        'allow_backorder' => 'boolean',
    ];

    /**
     * Relationship to Warehouse.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

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
