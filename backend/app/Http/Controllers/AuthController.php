<?php
 
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue API tokens.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower(trim($request->email)))->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password credentials.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Eager load business relationship if available
        $business = $user->business;

        return response()->json([
            'success' => true,
            'token' => $token,
            'role' => $user->role,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'business' => $business ? [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'email' => $business->email,
                'website_url' => $business->website_url,
                'logo_url' => $business->logo_url,
                'cover_url' => $business->cover_url,
                'services' => $business->services ?? [],
                'promo_code' => $business->promo_code,
                'gmb_url' => $business->gmb_url,
            ] : null,
        ]);
    }

    /**
     * Revoke tokens and log out.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Return authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $business = $user->business;

        return response()->json([
            'success' => true,
            'role' => $user->role,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'business' => $business ? [
                'id' => $business->id,
                'name' => $business->name,
                'slug' => $business->slug,
                'email' => $business->email,
                'website_url' => $business->website_url,
                'logo_url' => $business->logo_url,
                'cover_url' => $business->cover_url,
                'services' => $business->services ?? [],
                'promo_code' => $business->promo_code,
                'gmb_url' => $business->gmb_url,
            ] : null,
        ]);
    }

    /**
     * Register a new business tenant and owner account.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:businesses,email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $slug = \Illuminate\Support\Str::slug($request->business_name);
        
        // Ensure slug uniqueness
        $originalSlug = $slug;
        $counter = 1;
        while (\App\Models\Business::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $result = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $slug) {
            $biz = \App\Models\Business::create([
                'name' => $request->business_name,
                'slug' => $slug,
                'email' => strtolower(trim($request->email)),
                'website_url' => null,
                'logo_url' => null,
                'cover_url' => null,
                'services' => [],
            ]);

            $user = User::create([
                'name' => $request->business_name . ' Owner',
                'email' => strtolower(trim($request->email)),
                'password' => Hash::make($request->password),
                'role' => 'tenant_owner',
                'business_id' => $biz->id,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'token' => $token,
                'role' => $user->role,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'business' => [
                    'id' => $biz->id,
                    'name' => $biz->name,
                    'slug' => $biz->slug,
                    'email' => $biz->email,
                    'website_url' => $biz->website_url,
                    'logo_url' => $biz->logo_url,
                    'cover_url' => $biz->cover_url,
                    'services' => [],
                    'promo_code' => $biz->promo_code,
                    'gmb_url' => $biz->gmb_url,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'token' => $result['token'],
            'role' => $result['role'],
            'user' => $result['user'],
            'business' => $result['business'],
        ], 201);
    }
}
