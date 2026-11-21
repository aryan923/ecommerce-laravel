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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('image_desktop', 1024);
            $table->string('image_mobile', 1024)->nullable();
            $table->string('link_url', 1024)->nullable();
            $table->string('button_text', 100)->nullable();
            $table->enum('placement', ['home_hero', 'category_banner', 'sidebar', 'footer', 'popup'])->default('home_hero');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admin_users')->nullOnDelete();
            $table->timestamps();

            $table->index(['placement', 'is_active', 'sort_order'], 'idx_banners_placement_active');
            $table->index(['starts_at', 'ends_at'], 'idx_banners_dates');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
