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
        if (!Schema::hasTable('hsn_codes')) {
            Schema::create('hsn_codes', function (Blueprint $table) {
                $table->id();
                $table->string('code', 20)->unique();
                $table->string('description')->nullable();
                $table->enum('type', ['hsn', 'sac'])->default('hsn'); // hsn = goods, sac = services
                $table->foreignId('tax_class_id')->nullable()->constrained('tax_classes')->onDelete('set null');
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();
            });
        }

        // Add shipping & fee tax settings columns to tax_settings if not present
        if (Schema::hasTable('tax_settings')) {
            Schema::table('tax_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('tax_settings', 'shipping_tax_mode')) {
                    $table->enum('shipping_tax_mode', ['same_as_items', 'fixed_class', 'exempt'])->default('same_as_items')->after('pricing_mode');
                }
                if (!Schema::hasColumn('tax_settings', 'shipping_tax_class_id')) {
                    $table->foreignId('shipping_tax_class_id')->nullable()->constrained('tax_classes')->onDelete('set null')->after('shipping_tax_mode');
                }
                if (!Schema::hasColumn('tax_settings', 'cod_fee_taxable')) {
                    $table->boolean('cod_fee_taxable')->default(false)->after('shipping_tax_class_id');
                }
                if (!Schema::hasColumn('tax_settings', 'cod_fee_tax_class_id')) {
                    $table->foreignId('cod_fee_tax_class_id')->nullable()->constrained('tax_classes')->onDelete('set null')->after('cod_fee_taxable');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hsn_codes');

        if (Schema::hasTable('tax_settings')) {
            Schema::table('tax_settings', function (Blueprint $table) {
                $table->dropColumn(['shipping_tax_mode', 'shipping_tax_class_id', 'cod_fee_taxable', 'cod_fee_tax_class_id']);
            });
        }
    }
};
