<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure shipping_zones has sort_order and description
        if (Schema::hasTable('shipping_zones')) {
            Schema::table('shipping_zones', function (Blueprint $table) {
                if (!Schema::hasColumn('shipping_zones', 'description')) {
                    $table->text('description')->nullable()->after('name');
                }
                if (!Schema::hasColumn('shipping_zones', 'sort_order')) {
                    $table->integer('sort_order')->default(0)->after('is_global');
                }
            });
        }

        // 2. Ensure shipping_methods has carrier_name, calculation_type, base_cost, handling_fee, min_free_shipping_amount, sort_order
        if (Schema::hasTable('shipping_methods')) {
            Schema::table('shipping_methods', function (Blueprint $table) {
                if (!Schema::hasColumn('shipping_methods', 'shipping_zone_id')) {
                    $table->foreignId('shipping_zone_id')->nullable()->after('id')->constrained('shipping_zones')->nullOnDelete();
                }
                if (!Schema::hasColumn('shipping_methods', 'code')) {
                    $table->string('code')->nullable()->after('name');
                }
                if (!Schema::hasColumn('shipping_methods', 'carrier_name')) {
                    $table->string('carrier_name')->nullable()->after('code');
                }
                if (!Schema::hasColumn('shipping_methods', 'calculation_type')) {
                    $table->string('calculation_type')->default('flat_rate')->after('carrier_name');
                }
                if (!Schema::hasColumn('shipping_methods', 'base_cost')) {
                    $table->decimal('base_cost', 10, 2)->default(0.00)->after('calculation_type');
                }
                if (!Schema::hasColumn('shipping_methods', 'handling_fee')) {
                    $table->decimal('handling_fee', 10, 2)->default(0.00)->after('base_cost');
                }
                if (!Schema::hasColumn('shipping_methods', 'min_free_shipping_amount')) {
                    $table->decimal('min_free_shipping_amount', 10, 2)->nullable()->after('handling_fee');
                }
                if (!Schema::hasColumn('shipping_methods', 'estimated_days_min')) {
                    $table->integer('estimated_days_min')->default(1)->after('min_free_shipping_amount');
                }
                if (!Schema::hasColumn('shipping_methods', 'estimated_days_max')) {
                    $table->integer('estimated_days_max')->default(7)->after('estimated_days_min');
                }
                if (!Schema::hasColumn('shipping_methods', 'sort_order')) {
                    $table->integer('sort_order')->default(0)->after('status');
                }
            });
        }

        // 3. Ensure shipments has shipment_number, tracking_url, notes
        if (Schema::hasTable('shipments')) {
            Schema::table('shipments', function (Blueprint $table) {
                if (!Schema::hasColumn('shipments', 'shipment_number')) {
                    $table->string('shipment_number')->nullable()->after('id');
                }
                if (!Schema::hasColumn('shipments', 'tracking_url')) {
                    $table->string('tracking_url')->nullable()->after('tracking_number');
                }
                if (!Schema::hasColumn('shipments', 'notes')) {
                    $table->text('notes')->nullable()->after('delivered_at');
                }
            });
        }

        // 4. Create shipment_items table if not exists
        if (!Schema::hasTable('shipment_items')) {
            Schema::create('shipment_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
                $table->unsignedBigInteger('order_item_id')->index();
                $table->integer('quantity')->default(1);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_items');
    }
};
