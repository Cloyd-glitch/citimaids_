<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name'        => 'Home Cleaning',
                'description' => 'Regular and deep cleaning for your home.',
                'base_price'  => 35.00,
                'icon'        => 'home',
                'status'      => 'active',
            ],
            [
                'name'        => 'Office Cleaning',
                'description' => 'Maintain a clean office environment.',
                'base_price'  => 45.00,
                'icon'        => 'briefcase',
                'status'      => 'active',
            ],
            [
                'name'        => 'Villa Cleaning',
                'description' => 'Premium cleaning service for villas and large properties.',
                'base_price'  => 80.00,
                'icon'        => 'building',
                'status'      => 'active',
            ],
            [
                'name'        => 'Deep Cleaning',
                'description' => 'Thorough cleaning for areas that need extra care.',
                'base_price'  => 60.00,
                'icon'        => 'sparkles',
                'status'      => 'active',
            ],
            [
                'name'        => 'Carpet & Sofa Cleaning',
                'description' => 'Professional carpet and upholstery cleaning.',
                'base_price'  => 50.00,
                'icon'        => 'sofa',
                'status'      => 'active',
            ],
            [
                'name'        => 'Window & Glass Cleaning',
                'description' => 'Crystal-clear window and glass surface cleaning.',
                'base_price'  => 40.00,
                'icon'        => 'window',
                'status'      => 'active',
            ],
            [
                'name'        => 'Move-in / Move-out Cleaning',
                'description' => 'Complete cleaning for moving in or out.',
                'base_price'  => 70.00,
                'icon'        => 'truck',
                'status'      => 'active',
            ],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(['name' => $service['name']], $service);
        }
    }
}
