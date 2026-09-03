<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ClientBookingSeeder extends Seeder
{
    public function run(): void
    {
        if (Client::count() > 0) {
            $this->command->info('Clients already exist — skipping.');
            return;
        }

        $clients = [];
        $data = [
            ['Sarah Ahmed',   '+971-501234567', 'sarah.ahmed@example.com',   'Villa 1, Al Reem Island, Abu Dhabi'],
            ['Fatima Hassan',  '+971-502345678', 'fatima.hassan@example.com',  'Apt 301, Marina Square, Abu Dhabi'],
            ['Maria Santos',   '+971-503456789', 'maria.santos@example.com',   'Villa 12, Saadiyat Island, Abu Dhabi'],
            ['Priya Sharma',   '+971-504567890', 'priya.sharma@example.com',   'Flat 705, Al Raha Beach, Abu Dhabi'],
            ['Aisha Khan',     '+971-505678901', 'aisha.khan@example.com',     'Villa 8, Khalifa City, Abu Dhabi'],
        ];

        foreach ($data as $row) {
            $clients[] = Client::create([
                'name'           => $row[0],
                'contact_number' => $row[1],
                'email'          => $row[2],
                'address'        => $row[3],
            ]);
        }

        $services = Service::all();
        if ($services->isEmpty()) {
            $this->command->warn('No services found — cannot create bookings.');
            return;
        }

        $statuses = ['pending', 'confirmed', 'completed', 'completed', 'completed', 'completed', 'confirmed', 'pending'];

        foreach (range(0, 7) as $i) {
            Booking::create([
                'client_id'      => $clients[$i % count($clients)]->id,
                'service_id'     => $services[$i % $services->count()]->id,
                'preferred_date' => now()->subDays(rand(0, 30))->toDateString(),
                'address'        => $clients[$i % count($clients)]->address,
                'notes'          => 'Sample booking ' . ($i + 1),
                'status'         => $statuses[$i],
            ]);
        }

        $this->command->info('ClientBookingSeeder: Created ' . Client::count() . ' clients, ' . Booking::count() . ' bookings.');
    }
}
