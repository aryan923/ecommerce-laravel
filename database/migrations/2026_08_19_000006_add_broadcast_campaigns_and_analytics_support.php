<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for notification campaigns & logs enhancements.
     */
    public function up(): void
    {
        if (!Schema::hasTable('notification_campaigns')) {
            Schema::create('notification_campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->enum('channel', ['email', 'sms', 'push', 'in_app'])->default('email');
                $table->string('target_segment')->default('all'); // all, verified_buyers, active, inactive
                $table->string('subject')->nullable();
                $table->text('content');
                $table->unsignedInteger('recipients_count')->default(0);
                $table->enum('status', ['draft', 'sending', 'completed', 'failed'])->default('completed');
                $table->foreignId('created_by')->nullable()->constrained('admin_users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_campaigns');
    }
};
