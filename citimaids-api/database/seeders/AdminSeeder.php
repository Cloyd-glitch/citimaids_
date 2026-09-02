<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@citimaids.com'],
            [
                'name'     => 'Admin',
                'password' => 'admin123',
                'role'     => 'admin',
            ]
        );
    }
}
