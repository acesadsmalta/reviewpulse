<?php
 
namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    /**
     * List all campaigns for the logged-in tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->business_id) {
            return response()->json(['message' => 'No business associated with this account.'], 400);
        }

        // Return campaigns specific only to this tenant
        $campaigns = Campaign::where('business_id', $user->business_id)->latest()->get();

        return response()->json($campaigns);
    }

    /**
     * Create a new campaign for the logged-in tenant.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'required', 'string', 'in:Active,Complete,Paused'],
        ]);

        $user = $request->user();
        if (! $user->business_id) {
            return response()->json(['message' => 'No business associated with this account.'], 400);
        }

        $campaign = Campaign::create([
            'business_id' => $user->business_id,
            'name' => $request->name,
            'status' => $request->status ?? 'Active',
            'sent' => 0,
            'pending' => 0,
        ]);

        return response()->json($campaign, 201);
    }
}
