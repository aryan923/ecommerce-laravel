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
        Schema::table('returns', function (Blueprint $table) {
            $table->foreignId('bank_account_id')->nullable()->after('user_id')->constrained('customer_bank_accounts')->nullOnDelete();
            $table->json('bank_details_snapshot')->nullable()->after('images');
            $table->timestamp('restocked_at')->nullable()->after('rejected_at');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->enum('refund_channel', ['original_gateway', 'bank_transfer', 'store_credit', 'manual_cash'])
                ->default('original_gateway')
                ->after('gateway');
            $table->foreignId('bank_account_id')->nullable()->after('return_id')->constrained('customer_bank_accounts')->nullOnDelete();
            $table->json('bank_details_snapshot')->nullable()->after('payload');
            $table->string('transaction_reference', 100)->nullable()->after('gateway_refund_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('returns', function (Blueprint $table) {
            $table->dropForeign(['bank_account_id']);
            $table->dropColumn(['bank_account_id', 'bank_details_snapshot', 'restocked_at']);
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->dropForeign(['bank_account_id']);
            $table->dropColumn(['refund_channel', 'bank_account_id', 'bank_details_snapshot', 'transaction_reference']);
        });
    }
};
