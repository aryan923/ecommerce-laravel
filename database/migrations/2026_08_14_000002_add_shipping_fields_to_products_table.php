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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'requires_shipping')) {
                $table->boolean('requires_shipping')->default(true)->after('featured');
            }
            if (!Schema::hasColumn('products', 'is_free_shipping')) {
                $table->boolean('is_free_shipping')->default(false)->after('requires_shipping');
            }
            if (!Schema::hasColumn('products', 'shipping_class_id')) {
                $table->foreignId('shipping_class_id')->nullable()->after('is_free_shipping')->constrained('shipping_methods')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'shipping_class_id')) {
                $table->dropForeign(['shipping_class_id']);
            }
            $table->dropColumn(array_filter([
                Schema::hasColumn('products', 'requires_shipping') ? 'requires_shipping' : null,
                Schema::hasColumn('products', 'is_free_shipping') ? 'is_free_shipping' : null,
                Schema::hasColumn('products', 'shipping_class_id') ? 'shipping_class_id' : null,
            ]));
        });
    }
};
