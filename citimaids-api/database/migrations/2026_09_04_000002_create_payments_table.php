<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('AED');
            $table->enum('payment_method', [
                'adcb_pace_pay',
                'bank_transfer',
                'cash',
                'card',
            ]);
            $table->string('payment_link', 512)->nullable();
            $table->timestamp('payment_link_expires_at')->nullable();
            $table->enum('status', [
                'pending',
                'paid',
                'failed',
                'refunded',
                'expired',
            ])->default('pending');
            $table->string('reference_number')->unique();
            $table->string('external_reference')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('booking_id');
            $table->index('client_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
