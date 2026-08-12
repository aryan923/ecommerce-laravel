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
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('shipping_zones')->cascadeOnDelete();
            $table->foreignId('method_id')->constrained('shipping_methods')->cascadeOnDelete();
            $table->enum('rate_type', ['flat_rate', 'weight_based', 'order_value_based', 'free_shipping'])->default('flat_rate');
            $table->decimal('min_value', 12, 2)->default(0.00);
            $table->decimal('max_value', 12, 2)->nullable();
            $table->decimal('rate_value', 12, 2)->default(0.00);
            $table->decimal('free_threshold', 12, 2)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
