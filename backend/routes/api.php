<?php
 
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/public/businesses/{slug}', [BusinessController::class, 'showBySlug']);
Route::get('/public/portals', [BusinessController::class, 'publicPortals']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::post('/public/reviews/{id}/gmb-click', [ReviewController::class, 'trackGmbClick']);
Route::post('/public/scrape-branding', [BusinessController::class, 'scrapeBranding']);
Route::get('/proxy-image', [BusinessController::class, 'proxyImage']);

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/upload', [BusinessController::class, 'upload']);
    
    // Shared Review Reply Endpoint (performs inner controller policy check)
    Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);

    /*
     * Super Admin Restricted Routes
     */
    Route::middleware('role:superadmin')->group(function () {
        Route::get('/admin/businesses', [BusinessController::class, 'index']);
        Route::post('/admin/businesses', [BusinessController::class, 'store']);
        Route::get('/admin/businesses/{id}', [BusinessController::class, 'show']);
        Route::put('/admin/businesses/{id}', [BusinessController::class, 'update']);
        Route::delete('/admin/businesses/{id}', [BusinessController::class, 'destroy']);
        Route::get('/admin/reviews', [ReviewController::class, 'globalIndex']);
    });

    /*
     * Business Tenant restricted Routes
     */
    Route::middleware('role:tenant_owner')->group(function () {
        Route::get('/dashboard/reviews', [ReviewController::class, 'tenantIndex']);
        Route::get('/dashboard/campaigns', [CampaignController::class, 'index']);
        Route::post('/dashboard/campaigns', [CampaignController::class, 'store']);
        Route::get('/dashboard/services', [ServiceController::class, 'index']);
        Route::post('/dashboard/services', [ServiceController::class, 'store']);
        Route::delete('/dashboard/services/{name}', [ServiceController::class, 'destroy']);
        
        // Let business owner update their own branding profile securely by passing user's business_id
        Route::put('/dashboard/profile', function (\Illuminate\Http\Request $request) {
            $businessId = $request->user()->business_id;
            return app(BusinessController::class)->update($request, $businessId);
        });
    });

});
