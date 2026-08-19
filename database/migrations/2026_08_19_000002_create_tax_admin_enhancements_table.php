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
        Schema::table('tax_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('tax_classes', 'code')) {
                $table->string('code', 50)->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('tax_classes', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('is_default');
            }
        });

        if (!Schema::hasTable('tax_settings')) {
            Schema::create('tax_settings', function (Blueprint $table) {
                $table->id();
                $table->enum('pricing_mode', ['tax_inclusive', 'tax_exclusive'])->default('tax_exclusive');
                $table->unsignedBigInteger('default_tax_class_id')->nullable();
                $table->string('store_gstin', 20)->nullable();
                $table->string('store_state_code', 10)->default('MH');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('tax_audit_logs')) {
            Schema::create('tax_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('action');
                $table->string('model_type')->nullable();
                $table->unsignedBigInteger('model_id')->nullable();
                $table->json('old_values')->nullable();
                $table->json('new_values')->nullable();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_audit_logs');
        Schema::dropIfExists('tax_settings');
        Schema::table('tax_classes', function (Blueprint $table) {
            if (Schema::hasColumn('tax_classes', 'code')) {
                $table->dropColumn('code');
            }
            if (Schema::hasColumn('tax_classes', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
