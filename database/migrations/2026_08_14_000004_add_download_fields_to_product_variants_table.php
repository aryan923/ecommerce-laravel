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
        Schema::table('product_variants', function (Blueprint $table) {
            if (!Schema::hasColumn('product_variants', 'download_url')) {
                $table->text('download_url')->nullable()->after('image');
            }
            if (!Schema::hasColumn('product_variants', 'download_limit')) {
                $table->integer('download_limit')->nullable()->after('download_url');
            }
            if (!Schema::hasColumn('product_variants', 'download_expiry_days')) {
                $table->integer('download_expiry_days')->nullable()->after('download_limit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn(array_filter([
                Schema::hasColumn('product_variants', 'download_url') ? 'download_url' : null,
                Schema::hasColumn('product_variants', 'download_limit') ? 'download_limit' : null,
                Schema::hasColumn('product_variants', 'download_expiry_days') ? 'download_expiry_days' : null,
            ]));
        });
    }
};
