<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::withCount('bookings');

        // Admin (authenticated) sees all; public customers only see active
        if (! $request->user()) {
            $query->where('status', 'active');
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price'  => 'nullable|numeric|min:0',
            'icon'        => 'nullable|string|max:100',
            'status'      => 'in:active,inactive',
        ]);

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'base_price'  => 'nullable|numeric|min:0',
            'icon'        => 'nullable|string|max:100',
            'status'      => 'in:active,inactive',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy($id)
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Service deleted.']);
    }
}
