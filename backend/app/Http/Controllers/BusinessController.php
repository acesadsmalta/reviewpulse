<?php
 
namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BusinessController extends Controller
{
    /**
     * Admin route: List all businesses with reviews metadata.
     */
    public function index(): JsonResponse
    {
        $businesses = Business::withCount('reviews')->with('users')->latest()->get();

        // Retrieve users for each business to display their password hash/mock info
        $businesses->each(function ($biz) {
            $user = $biz->users->first();
            $biz->password_raw = '[Encrypted]'; // For security, but for compat, return a mock/user reference
            $biz->owner_email = $user ? $user->email : $biz->email;
        });

        return response()->json($businesses);
    }

    /**
     * Admin route: Onboard a new business tenant and create their manager account.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:businesses,slug'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:businesses,email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'website_url' => ['nullable', 'string', 'max:512'],
            'logo_url' => ['nullable', 'string', 'max:512'],
            'cover_url' => ['nullable', 'string', 'max:512'],
        ]);

        $slug = Str::slug($request->slug);

        $business = DB::transaction(function () use ($request, $slug) {
            $biz = Business::create([
                'name' => $request->name,
                'slug' => $slug,
                'email' => strtolower(trim($request->email)),
                'website_url' => $request->website_url,
                'logo_url' => $request->logo_url,
                'cover_url' => $request->cover_url,
                'services' => [],
            ]);

            User::create([
                'name' => $request->name . ' Owner',
                'email' => strtolower(trim($request->email)),
                'password' => Hash::make($request->password),
                'role' => 'tenant_owner',
                'business_id' => $biz->id,
            ]);

            return $biz;
        });

        return response()->json($business, 201);
    }

    /**
     * Admin route: Fetch detailed info of a business.
     */
    public function show(string $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $user = User::where('business_id', $id)->first();
        $business->owner_user = $user;

        return response()->json($business);
    }

    /**
     * Admin route: Update business details and optionally password.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $business = Business::findOrFail($id);

        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'owner_name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('businesses', 'slug')->ignore($business->id)],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('businesses', 'email')->ignore($business->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'website_url' => ['nullable', 'string', 'max:512'],
            'logo_url' => ['nullable', 'string', 'max:512'],
            'cover_url' => ['nullable', 'string', 'max:512'],
            'services' => ['nullable', 'array'],
            'promo_code' => ['nullable', 'string', 'max:255'],
            'gmb_url' => ['nullable', 'string', 'max:512'],
        ]);

        DB::transaction(function () use ($request, $business) {
            $updates = $request->only(['name', 'website_url', 'logo_url', 'cover_url', 'services', 'promo_code', 'gmb_url']);
            
            if ($request->has('slug')) {
                $updates['slug'] = Str::slug($request->slug);
            }
            if ($request->has('email')) {
                $updates['email'] = strtolower(trim($request->email));
            }

            $business->update($updates);

            // Update user details if user exists
            $user = User::where('business_id', $business->id)->first();
            if ($user) {
                $userUpdates = [];
                if ($request->has('owner_name')) {
                    $userUpdates['name'] = $request->owner_name;
                }
                if ($request->has('email')) {
                    $userUpdates['email'] = strtolower(trim($request->email));
                }
                if ($request->has('password') && $request->password) {
                    $userUpdates['password'] = Hash::make($request->password);
                }
                if (!empty($userUpdates)) {
                    $user->update($userUpdates);
                }
            }
        });

        return response()->json($business);
    }

    /**
     * Admin route: Delete a business and its linked user manager.
     */
    public function destroy(string $id): JsonResponse
    {
        $business = Business::findOrFail($id);

        DB::transaction(function () use ($business) {
            // Delete associated user accounts first
            User::where('business_id', $business->id)->delete();
            $business->delete();
        });

        return response()->json(['success' => true, 'message' => 'Business deleted successfully.']);
    }

    /**
     * Public route: Fetch branding data for the customer feedback portal.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $business = Business::where('slug', strtolower(trim($slug)))->firstOrFail();

        return response()->json($business);
    }

    /**
     * Public/Admin route: Extract branding files from corporate websites.
     */
    public function scrapeBranding(Request $request): JsonResponse
    {
        $request->validate([
            'website_url' => ['required', 'string'],
        ]);

        $url = trim($request->website_url);
        if (!preg_match("~^(?:f|ht)tps?://~i", $url)) {
            $url = "https://" . $url;
        }

        try {
            $urlObj = parse_url($url);
            $domain = isset($urlObj['host']) ? preg_replace('/^www\./i', '', $urlObj['host']) : $url;
            
            $logoUrl = "https://logo.clearbit.com/" . $domain;
            $coverUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop";

            // Make a quick curl call to extract tags
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            ])->timeout(4)->get($url);

            if ($response->successful()) {
                $html = $response->body();

                // Look for og:image
                if (preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches) ||
                    preg_match('/<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']/i', $html, $matches) ||
                    preg_match('/<meta[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
                    $rawCover = $matches[1];
                    if (str_starts_with($rawCover, 'http')) {
                        $coverUrl = $rawCover;
                    } elseif (str_starts_with($rawCover, '//')) {
                        $coverUrl = "https:" . $rawCover;
                    } else {
                        $coverUrl = rtrim($url, '/') . '/' . ltrim($rawCover, '/');
                    }
                }

                // Look for shortcut icons
                if (preg_match('/<link[^>]*rel=["\'](?:shortcut )?icon["\'][^>]*href=["\']([^"\']+)["\']/i', $html, $matches) ||
                    preg_match('/<link[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\'](?:shortcut )?icon["\']/i', $html, $matches) ||
                    preg_match('/<link[^>]*rel=["\']apple-touch-icon["\'][^>]*href=["\']([^"\']+)["\']/i', $html, $matches)) {
                    $rawLogo = $matches[1];
                    if (str_starts_with($rawLogo, 'http')) {
                        $logoUrl = $rawLogo;
                    } elseif (str_starts_with($rawLogo, '//')) {
                        $logoUrl = "https:" . $rawLogo;
                    } else {
                        $logoUrl = rtrim($url, '/') . '/' . ltrim($rawLogo, '/');
                    }
                }
            }

            return response()->json([
                'logo_url' => $logoUrl,
                'cover_url' => $coverUrl
            ]);
        } catch (\Exception $e) {
            // Fallback gracefully on parsing errors
            return response()->json([
                'logo_url' => "https://logo.clearbit.com/" . ($domain ?? 'example.com'),
                'cover_url' => "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
            ]);
        }
    }

    public function publicPortals(): JsonResponse
    {
        $businesses = Business::select('id', 'name', 'slug', 'logo_url', 'cover_url')->latest()->get();
        return response()->json($businesses);
    }

    /**
     * Authenticated route: Upload a file/image and return its public URL.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'], // Max 5MB
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('uploads', 'public');
            $url = asset('storage/' . $path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No file uploaded.'
        ], 400);
    }

    /**
     * Public route: Proxy an image URL to bypass browser canvas CORS limitations.
     */
    public function proxyImage(Request $request)
    {
        $url = $request->query('url');
        if (!$url) {
            return response()->json(['error' => 'URL is required'], 400);
        }

        // 1. If it's a local storage URL, read it directly from disk to avoid PHP single-thread deadlock
        if (str_contains($url, '/storage/')) {
            $parts = explode('/storage/', $url);
            $path = end($parts);
            
            // Clean path query parameters if any (e.g. ?t=123)
            $path = explode('?', $path)[0];

            $fullPath = storage_path('app/public/' . urldecode($path));
            if (file_exists($fullPath)) {
                $mimeType = mime_content_type($fullPath) ?: 'image/png';
                return response()->file($fullPath, ['Content-Type' => $mimeType]);
            }
        }

        // 2. Otherwise, fetch it via HTTP client without SSL verification
        try {
            $response = Http::withoutVerifying()->timeout(10)->get($url);
            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?: 'image/png';
                return response($response->body(), 200)
                    ->header('Content-Type', $contentType);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to proxy image: ' . $e->getMessage()], 500);
        }

        return response()->json(['error' => 'Failed to retrieve image'], 404);
    }
}

