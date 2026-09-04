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

        // Public customers only see active services
        if ($request->has('public')) {
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
llable|numeric|min:0',
            'icon'          => 'nullable|string|max:100',
            'status'        => 'in:active,inactive',
            'display_order' => 'nullable|integer|min:1',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy($id)
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Service deleted.']);
    }

    /**
     * Batch-update display_order for all services.
     * Expects body: { "order": [{ "id": 3 }, { "id": 1 }, { "id": 5 }, ...] }
     * The array position (0-based) determines the new display_order value.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'order'         => 'required|array|min:1',
            'order.*.id'    => 'required|integer|exists:services,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $item) {
                Service::where('id', $item['id'])
                    ->update(['display_order' => $index + 1]);
            }
        });

        return response()->json(['message' => 'Service order updated.']);
    }
}
