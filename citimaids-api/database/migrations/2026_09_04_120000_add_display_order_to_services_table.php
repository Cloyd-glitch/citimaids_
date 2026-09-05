<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedInteger('display_order')->default(0)->after('status');
        });

        // Seed existing rows with sequential order based on current id ordering
        $services = DB::table('services')->orderBy('id')->get();
        foreach ($services as $index => $service) {
            DB::table('services')
                ->where('id', $service->id)
                ->update(['display_order' => $index + 1]);
        }
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('display_order');
        });
    }
};
