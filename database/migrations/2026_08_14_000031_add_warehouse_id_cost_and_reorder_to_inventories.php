<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaultWarehouseId = DB::table('warehouses')->where('is_default', true)->value('id')
            ?? DB::table('warehouses')->value('id');

        Schema::table('inventories', function (Blueprint $table) use ($defaultWarehouseId) {
            if (!Schema::hasColumn('inventories', 'warehouse_id')) {
                $table->foreignId('warehouse_id')->nullable()->after('id')->constrained('warehouses')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('inventories', 'cost_price')) {
                $table->decimal('cost_price', 12, 2)->default(0.00)->after('sku');
            }
            if (!Schema::hasColumn('inventories', 'reorder_qty')) {
                $table->integer('reorder_qty')->default(50)->after('low_stock_threshold');
            }
            if (!Schema::hasColumn('inventories', 'allow_backorder')) {
                $table->boolean('allow_backorder')->default(false)->after('reorder_qty');
            }
            if (!Schema::hasColumn('inventories', 'location_code')) {
                $table->string('location_code')->nullable()->after('allow_backorder');
            }
        });

        // Set existing records warehouse_id
        if ($defaultWarehouseId) {
            DB::table('inventories')->whereNull('warehouse_id')->update(['warehouse_id' => $defaultWarehouseId]);
        }

        // Schema modification for inventory_transactions
        Schema::table('inventory_transactions', function (Blueprint $table) use ($defaultWarehouseId) {
            if (!Schema::hasColumn('inventory_transactions', 'warehouse_id')) {
                $table->foreignId('warehouse_id')->nullable()->after('inventory_id')->constrained('warehouses')->nullOnDelete();
            }
            if (!Schema::hasColumn('inventory_transactions', 'destination_warehouse_id')) {
                $table->foreignId('destination_warehouse_id')->nullable()->after('warehouse_id')->constrained('warehouses')->nullOnDelete();
            }
        });

        if ($defaultWarehouseId) {
            DB::table('inventory_transactions')->whereNull('warehouse_id')->update(['warehouse_id' => $defaultWarehouseId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            if (Schema::hasColumn('inventories', 'warehouse_id')) {
                $table->dropForeign(['warehouse_id']);
                $table->dropColumn('warehouse_id');
            }
            if (Schema::hasColumn('inventories', 'cost_price')) {
                $table->dropColumn('cost_price');
            }
            if (Schema::hasColumn('inventories', 'reorder_qty')) {
                $table->dropColumn('reorder_qty');
            }
            if (Schema::hasColumn('inventories', 'allow_backorder')) {
                $table->dropColumn('allow_backorder');
            }
            if (Schema::hasColumn('inventories', 'location_code')) {
                $table->dropColumn('location_code');
            }
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_transactions', 'warehouse_id')) {
                $table->dropForeign(['warehouse_id']);
                $table->dropColumn('warehouse_id');
            }
            if (Schema::hasColumn('inventory_transactions', 'destination_warehouse_id')) {
                $table->dropForeign(['destination_warehouse_id']);
                $table->dropColumn('destination_warehouse_id');
            }
        });
    }
};
