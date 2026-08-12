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
        Schema::create('tax_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_class_id')->constrained('tax_classes')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['cgst', 'sgst', 'igst', 'flat', 'standard'])->default('standard');
            $table->decimal('rate', 8, 4)->default(0.0000);
            $table->string('state_code', 10)->nullable()->index();
            $table->string('country_code', 2)->default('IN');
            $table->boolean('is_inclusive')->default(false);
            $table->unsignedInteger('priority')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};
