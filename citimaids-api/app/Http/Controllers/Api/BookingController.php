<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Client;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Public: list all bookings (admin) or with filters
    public function index(Request $request)
    {
        $query = Booking::with(['client', 'service', 'processedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('client', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

    // Public: customer submits a booking inquiry
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_number' => 'required|string|max:50',
            'email'          => 'nullable|email|max:255',
            'service_id'     => 'required|exists:services,id',
            'preferred_date' => 'required|date|after_or_equal:today',
            'address'        => 'required|string',
            'notes'          => 'nullable|string',
        ]);

        // Find or create client by contact number
        $client = Client::firstOrCreate(
            ['contact_number' => $validated['contact_number']],
            [
                'name'    => $validated['name'],
                'email'   => $validated['email'] ?? null,
                'address' => $validated['address'],
            ]
        );

        $booking = Booking::create([
            'client_id'      => $client->id,
            'service_id'     => $validated['service_id'],
            'preferred_date' => $validated['preferred_date'],
            'address'        => $validated['address'],
            'notes'          => $validated['notes'] ?? null,
            'status'         => 'pending',
        ]);

        return response()->json([
            'message'    => 'Booking request submitted successfully.',
            'booking_id' => $booking->id,
            'reference'  => 'CM-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT),
        ], 201);
    }

    public function show($id)
    {
        $booking = Booking::with(['client', 'service', 'processedBy', 'details.service'])->findOrFail($id);
        return response()->json($booking);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update([
            'status'               => $request->status,
            'processed_by_user_id' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Status updated.', 'booking' => $booking->load(['client', 'service'])]);
    }

    public function destroy($id)
    {
        Booking::findOrFail($id)->delete();
        return response()->json(['message' => 'Booking deleted.']);
    }
}
