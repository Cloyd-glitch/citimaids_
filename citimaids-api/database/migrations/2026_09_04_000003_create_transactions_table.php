<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->enum('type', ['charge', 'refund', 'void']);
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['success', 'failed', 'pending'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->string('description')->nullable();
            $table->foreignId('processed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('payment_id');
            $table->index('type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
