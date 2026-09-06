<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;

class DashboardController extends Controller
{
    public function stats()
    {
        $total           = Booking::count();
        $pending         = Booking::where('status', 'pending')->count();
        $confirmed       = Booking::where('status', 'confirmed')->count();
        $completed       = Booking::where('status', 'completed')->count();
        $cancelled       = Booking::where('status', 'cancelled')->count();
        $active_services = Service::where('status', 'active')->count();

        $recent = Booking::with(['client', 'service'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => compact('total', 'pending', 'confirmed', 'completed', 'cancelled', 'active_services'),
            'recent_bookings' => $recent,
        ]);
    }
}
