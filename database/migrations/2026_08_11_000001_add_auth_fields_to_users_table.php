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
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('mobile')->nullable()->unique()->after('email');
            $table->timestamp('mobile_verified_at')->nullable()->after('email_verified_at');
            $table->string('profile_image')->nullable()->after('remember_token');
            $table->date('date_of_birth')->nullable()->after('profile_image');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending_verification'])->default('active')->after('gender');
            $table->enum('role', ['customer', 'admin', 'staff', 'vendor'])->default('customer')->after('status');
            $table->boolean('terms_accepted')->default(false)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'mobile',
                'mobile_verified_at',
                'profile_image',
                'date_of_birth',
                'gender',
                'status',
                'role',
                'terms_accepted',
            ]);
        });
    }
};
