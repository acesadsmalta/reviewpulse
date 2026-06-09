<?php
 
namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReviewController extends Controller
{
    /**
     * Admin route: List all global reviews.
     */
    public function globalIndex(Request $request): JsonResponse
    {
        $query = Review::with('business')->latest();

        if ($request->has('business_id') && $request->business_id !== 'all') {
            $query->where('business_id', $request->business_id);
        }
        if ($request->has('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('reviewer_name', 'like', $search)
                  ->orWhere('reviewer_email', 'like', $search)
                  ->orWhere('comment', 'like', $search);
            });
        }

        return response()->json($query->get());
    }

    /**
     * Tenant route: List all reviews for the current logged-in tenant.
     */
    public function tenantIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->business_id) {
            return response()->json(['message' => 'No business associated with this account.'], 400);
        }

        $query = Review::where('business_id', $user->business_id)->latest();

        if ($request->has('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('reviewer_name', 'like', $search)
                  ->orWhere('reviewer_email', 'like', $search)
                  ->orWhere('comment', 'like', $search);
            });
        }

        return response()->json($query->get());
    }

    /**
     * Public route: Customer submits a new review.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'business_id' => ['required', 'uuid', 'exists:businesses,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
            'reviewer_name' => ['required', 'string', 'max:255'],
            'reviewer_email' => ['required', 'string', 'email', 'max:255'],
            'reviewer_phone' => ['nullable', 'string', 'max:255'],
            'service' => ['nullable', 'string', 'max:255'],
        ]);

        // Calculate default sentiment status
        $rating = (int) $request->rating;
        $status = 'Pending';
        if ($rating >= 4) {
            $status = 'Voucher Sent';
        } elseif ($rating <= 2) {
            $status = 'Alert Triggered';
        }

        $review = Review::create([
            'business_id' => $request->business_id,
            'rating' => $rating,
            'comment' => $request->comment ?? '',
            'reviewer_name' => $request->reviewer_name,
            'reviewer_email' => strtolower(trim($request->reviewer_email)),
            'reviewer_phone' => $request->reviewer_phone ?? '',
            'service' => $request->service ?? 'General Service',
            'status' => $status,
        ]);

        return response()->json($review, 201);
    }

    /**
     * Authenticated route: Reply to a review.
     */
    public function reply(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reply_text' => ['required', 'string', 'min:1'],
        ]);

        $review = Review::findOrFail($id);
        $user = $request->user();

        // Enforce strict security access authorization check:
        // Must be superadmin OR the business owner associated with the review
        if ($user->role !== 'superadmin' && $user->business_id !== $review->business_id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $review->update([
            'admin_reply' => $request->reply_text,
            'replied_at' => Carbon::now(),
        ]);

        return response()->json($review);
    }
}
