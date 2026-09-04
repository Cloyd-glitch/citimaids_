<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::withCount('bookings')
            ->selectRaw('clients.*, MAX(bookings.preferred_date) as last_booking_date')
            ->leftJoin('bookings', 'bookings.client_id', '=', 'clients.id')
            ->groupBy('clients.id')
            ->latest('clients.created_at');

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(function ($q) use ($s) {
                $q->where('clients.name', 'like', $s)
                  ->orWhere('clients.contact_number', 'like', $s)
                  ->orWhere('clients.email', 'like', $s);
            });
        }

        return response()->json($query->paginate(15));
    }

    public function show($id)
    {
        $client = Client::with(['bookings.service'])->findOrFail($id);
        return response()->json($client);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string|max:500',
        ]);

        $client = Client::create($validated);
        return response()->json(['message' => 'Client created.', 'client' => $client], 201);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(['message' => 'Client deleted.']);
    }
}
