<?php
 
namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Get the active services list for the logged-in tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->business_id) {
            return response()->json(['message' => 'No business associated with this account.'], 400);
        }

        $business = Business::findOrFail($user->business_id);
        return response()->json($business->services ?? []);
    }

    /**
     * Add a service to the tenant's services list.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        if (! $user->business_id) {
            return response()->json(['message' => 'No business associated with this account.'], 400);
        }

        $business = Business::findOrFail($user->business_id);
        $services = $business->services ?? [];

        $name = trim($request->name);
        if (in_array($name, $services)) {
            return response()->json(['message' => 'Service already exists.'], 422);
        }

        $services[] = $name;
        $business->update(['services' => $services]);

        return response()->json($business);
    }

    /**
     * Remove a service from the tenant's services list.
     */
    public function destroy(Request $request, string $name): JsonResponse
    {
        $user = $request->user();
        if (! $user->business_id) {
            return response()->json(['message' => 'No business associated with this account.'], 400);
        }

        $business = Business::findOrFail($user->business_id);
        $services = $business->services ?? [];

        $decodedName = rawurldecode($name);
        $filtered = array_values(array_filter($services, fn ($s) => $s !== $decodedName));

        $business->update(['services' => $filtered]);

        return response()->json($business);
    }
}
