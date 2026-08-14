<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $table = 'inventory_transactions';

    public $timestamps = false;

    protected $fillable = [
        'inventory_id',
        'warehouse_id',
        'destination_warehouse_id',
        'product_variant_id',
        'sku',
        'previous_qty',
        'quantity_change',
        'new_qty',
        'unit_cost_price',
        'transaction_type',
        'reference_type',
        'reference_id',
        'admin_id',
        'remarks',
        'created_at',
    ];

    protected $casts = [
        'inventory_id' => 'integer',
        'warehouse_id' => 'integer',
        'destination_warehouse_id' => 'integer',
        'product_variant_id' => 'integer',
        'previous_qty' => 'integer',
        'quantity_change' => 'integer',
        'new_qty' => 'integer',
        'unit_cost_price' => 'decimal:2',
        'reference_id' => 'integer',
        'admin_id' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Relationship to parent Inventory record.
     */
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    /**
     * Relationship to Warehouse.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /**
     * Relationship to Destination Warehouse for transfers.
     */
    public function destinationWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'destination_warehouse_id');
    }

    /**
     * Relationship to ProductVariant.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Relationship to Admin User who performed adjustment.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'admin_id');
    }
}
