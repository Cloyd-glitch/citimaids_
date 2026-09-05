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
                'name'          => 'Home Cleaning Abu Dhabi',
                'description'   => 'Complete residential cleaning tailored to your residence with trained professionals.',
                'base_price'    => 35.00,
                'icon'          => 'home',
                'status'        => 'active',
                'display_order' => 1,
            ],
            [
                'name'          => 'Office Cleaning',
                'description'   => 'Spotless, hygienic, and productive commercial workspaces across Abu Dhabi.',
                'base_price'    => 45.00,
                'icon'          => 'briefcase',
                'status'        => 'active',
                'display_order' => 2,
            ],
            [
                'name'          => 'Apartment Cleaning Services',
                'description'   => 'Specialized apartment and flat cleaning for modern urban living in Abu Dhabi.',
                'base_price'    => 35.00,
                'icon'          => 'home',
                'status'        => 'active',
                'display_order' => 3,
            ],
            [
                'name'          => 'Villa Cleaning Abu Dhabi',
                'description'   => 'Specialized estate cleaning designed for spacious luxury villas across Abu Dhabi.',
                'base_price'    => 80.00,
                'icon'          => 'building',
                'status'        => 'active',
                'display_order' => 4,
            ],
            [
                'name'          => 'Move In and Move Out Cleaning',
                'description'   => 'Guaranteed handover cleaning to secure tenancy deposits or prepare a fresh move.',
                'base_price'    => 350.00,
                'icon'          => 'truck',
                'status'        => 'active',
                'display_order' => 5,
            ],
            [
                'name'          => 'General Cleaning',
                'description'   => 'Routine, flexible housekeeping and maintenance cleaning to keep your property tidy.',
                'base_price'    => 35.00,
                'icon'          => 'sparkles',
                'status'        => 'active',
                'display_order' => 6,
            ],
            [
                'name'          => 'Deep Cleaning Services',
                'description'   => 'Intensive restorative scrub and antibacterial mist for homes requiring detailed sanitation.',
                'base_price'    => 60.00,
                'icon'          => 'sparkles',
                'status'        => 'active',
                'display_order' => 7,
            ],
            [
                'name'          => 'Carpet Cleaning',
                'description'   => 'Industrial steam extraction and deep shampooing for rugs and wall-to-wall carpeting.',
                'base_price'    => 40.00,
                'icon'          => 'sofa',
                'status'        => 'active',
                'display_order' => 8,
            ],
            [
                'name'          => 'Sofa Cleaning',
                'description'   => 'Deep upholstery steam sanitization for fabric and leather sofas and chairs.',
                'base_price'    => 50.00,
                'icon'          => 'sofa',
                'status'        => 'active',
                'display_order' => 9,
            ],
            [
                'name'          => 'Window Cleaning Abu Dhabi',
                'description'   => 'Streak-free window washing for apartments, luxury villas, and retail fronts.',
                'base_price'    => 40.00,
                'icon'          => 'window',
                'status'        => 'active',
                'display_order' => 10,
            ],
            [
                'name'          => 'Glass Cleaning',
                'description'   => 'Specialized polishing for glass partitions, balustrades, shower cubicles, and mirrors.',
                'base_price'    => 35.00,
                'icon'          => 'window',
                'status'        => 'active',
                'display_order' => 11,
            ],
            [
                'name'          => 'Ironing & Baby Sitting',
                'description'   => 'Professional garment pressing, laundry folding, and domestic child supervision.',
                'base_price'    => 40.00,
                'icon'          => 'sparkles',
                'status'        => 'active',
                'display_order' => 12,
            ],
            [
                'name'          => 'Baby & Pet Sitting',
                'description'   => 'Compassionate, vetted in-home care for your children and beloved pets.',
                'base_price'    => 45.00,
                'icon'          => 'sparkles',
                'status'        => 'active',
                'display_order' => 13,
            ],
            [
                'name'          => 'Building Cleaning Services',
                'description'   => 'Turnkey facility cleaning for residential towers, lobbies, corridors, and exterior grounds.',
                'base_price'    => 150.00,
                'icon'          => 'building',
                'status'        => 'active',
                'display_order' => 14,
            ],
            [
                'name'          => 'Landscape Contractor',
                'description'   => 'Turnkey landscaping solutions, irrigation systems, and outdoor living design for villas.',
                'base_price'    => 200.00,
                'icon'          => 'building',
                'status'        => 'active',
                'display_order' => 15,
            ],
            [
                'name'          => 'Garden Maintenance',
                'description'   => 'Lawn care, precision hedging, palm frond pruning, and soil enrichment across Abu Dhabi.',
                'base_price'    => 120.00,
                'icon'          => 'sparkles',
                'status'        => 'active',
                'display_order' => 16,
            ],
            [
                'name'          => 'Swimming Pool Maintenance',
                'description'   => 'Water chemistry testing, backwash, vacuuming, and mechanical inspection for pristine pools.',
                'base_price'    => 150.00,
                'icon'          => 'sparkles',
                'status'        => 'active',
                'display_order' => 17,
            ],
        ];

        // 1. Seed or update each of the official CitiMaids services
        $officialModels = [];
        foreach ($services as $service) {
            $officialModels[$service['name']] = Service::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }

        // 2. Map any legacy development placeholder bookings to the official services
        $legacyMappings = [
            'Home Cleaning'             => 'Home Cleaning Abu Dhabi',
            'Villa Cleaning'            => 'Villa Cleaning Abu Dhabi',
            'Deep Cleaning'             => 'Deep Cleaning Services',
            'Carpet & Sofa Cleaning'    => 'Carpet Cleaning',
            'Window & Glass Cleaning'   => 'Window Cleaning Abu Dhabi',
            'Move-in / Move-out Cleaning' => 'Move In and Move Out Cleaning',
        ];

        foreach ($legacyMappings as $oldName => $officialName) {
            $oldService = Service::where('name', $oldName)->first();
            $targetService = $officialModels[$officialName] ?? null;

            if ($oldService && $targetService) {
                // Reassign bookings
                \App\Models\Booking::where('service_id', $oldService->id)
                    ->update(['service_id' => $targetService->id]);

                // Reassign booking details if any
                \App\Models\BookingDetail::where('service_id', $oldService->id)
                    ->update(['service_id' => $targetService->id]);

                // Remove legacy placeholder service
                $oldService->delete();
            }
        }
    }
}

