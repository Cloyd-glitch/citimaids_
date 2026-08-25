<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::withCount('bookings')->latest()->paginate(15);
        return response()->json($clients);
    }

    public function show($id)
    {
        $client = Client::with(['bookings.service'])->findOrFail($id);
        return response()->json($client);
    }
}
