<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->nullable()->after('status');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])->default('unpaid')->after('total_amount');
            $table->string('payment_method')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['total_amount', 'payment_status', 'payment_method']);
        });
    }
};
