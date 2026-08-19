<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for report exports table.
     */
    public function up(): void
    {
        if (!Schema::hasTable('report_exports')) {
            Schema::create('report_exports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('admin_id')->nullable()->constrained('admin_users')->nullOnDelete();
                $table->string('report_type'); // sales, orders, products, customers, inventory, tax
                $table->enum('format', ['csv', 'xlsx'])->default('csv');
                $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('completed');
                $table->string('file_path')->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->json('filters')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_exports');
    }
};
