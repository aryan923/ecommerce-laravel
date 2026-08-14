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
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('idempotency_key');
            }
            if (!Schema::hasColumn('orders', 'tax_breakdown')) {
                $table->json('tax_breakdown')->nullable()->after('admin_notes');
            }
            if (!Schema::hasColumn('orders', 'store_snapshot')) {
                $table->json('store_snapshot')->nullable()->after('tax_breakdown');
            }
            if (!Schema::hasColumn('orders', 'customer_snapshot')) {
                $table->json('customer_snapshot')->nullable()->after('store_snapshot');
            }
            if (!Schema::hasColumn('orders', 'currency_snapshot')) {
                $table->json('currency_snapshot')->nullable()->after('customer_snapshot');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'admin_notes',
                'tax_breakdown',
                'store_snapshot',
                'customer_snapshot',
                'currency_snapshot',
            ]);
        });
    }
};
