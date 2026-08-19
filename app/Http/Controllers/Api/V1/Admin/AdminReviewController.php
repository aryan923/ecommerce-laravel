<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReviewController extends Controller
{
    /**
     * Get review summary statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $totalReviews = Review::count();
        $pendingReviews = Review::where('status', 'pending')->count();
        $approvedReviews = Review::where('status', 'approved')->count();
        $rejectedReviews = Review::where('status', 'rejected')->count();
        $hiddenReviews = Review::where('status', 'hidden')->count();
        $flaggedReviews = Review::where('is_flagged', true)->count();

        $avgRating = Review::where('status', 'approved')->avg('rating') ?? Review::avg('rating') ?? 0;

        $ratingBreakdown = [
            '5_star' => Review::where('rating', 5)->count(),
            '4_star' => Review::where('rating', 4)->count(),
            '3_star' => Review::where('rating', 3)->count(),
            '2_star' => Review::where('rating', 2)->count(),
            '1_star' => Review::where('rating', 1)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Review statistics retrieved successfully.',
            'data' => [
                'total_reviews' => $totalReviews,
                'pending_reviews' => $pendingReviews,
                'approved_reviews' => $approvedReviews,
                'rejected_reviews' => $rejectedReviews,
                'hidden_reviews' => $hiddenReviews,
                'flagged_reviews' => $flaggedReviews,
                'average_rating' => round((float)$avgRating, 2),
                'rating_breakdown' => $ratingBreakdown,
            ],
            'errors' => null,
        ]);
    }

    /**
     * Build filtered query for index & CSV export.
     */
    private function buildFilteredQuery(Request $request)
    {
        $query = Review::with([
            'product:id,name,sku,slug,thumbnail',
            'user:id,name,email',
            'order:id,order_number,status,created_at',
            'repliedBy:id,name,email',
            'moderator:id,name,email'
        ]);

        // Filter by Status
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        // Filter by Star Rating
        if ($request->filled('rating')) {
            $query->where('rating', (int)$request->query('rating'));
        }

        // Filter by Target Product ID
        if ($request->filled('product_id')) {
            $query->where('product_id', (int)$request->query('product_id'));
        }

        // Filter by Flagged / Spam
        if ($request->filled('flagged')) {
            if ($request->query('flagged') === 'yes' || $request->query('flagged') === '1') {
                $query->where('is_flagged', true);
            } elseif ($request->query('flagged') === 'no' || $request->query('flagged') === '0') {
                $query->where('is_flagged', false);
            }
        }

        // Filter by Verified Purchase Only
        if ($request->filled('verified')) {
            if ($request->query('verified') === 'yes' || $request->query('verified') === '1') {
                $query->whereNotNull('order_id');
            } elseif ($request->query('verified') === 'no' || $request->query('verified') === '0') {
                $query->whereNull('order_id');
            }
        }

        // Filter by Attached Photos / Media
        if ($request->filled('has_images')) {
            if ($request->query('has_images') === 'yes' || $request->query('has_images') === '1') {
                $query->whereNotNull('images')->where('images', '!=', '[]')->where('images', '!=', 'null');
            } elseif ($request->query('has_images') === 'no' || $request->query('has_images') === '0') {
                $query->where(function ($q) {
                    $q->whereNull('images')
                      ->orWhere('images', '[]')
                      ->orWhere('images', 'null');
                });
            }
        }

        // Filter by Date Period Range
        if ($request->filled('period')) {
            $period = $request->query('period');
            if ($period === 'today') {
                $query->whereDate('created_at', now()->today());
            } elseif ($period === 'last_7_days') {
                $query->where('created_at', '>=', now()->subDays(7));
            } elseif ($period === 'last_30_days') {
                $query->where('created_at', '>=', now()->subDays(30));
            } elseif ($period === 'last_90_days') {
                $query->where('created_at', '>=', now()->subDays(90));
            }
        } elseif ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->query('from_date'));
            if ($request->filled('to_date')) {
                $query->whereDate('created_at', '<=', $request->query('to_date'));
            }
        }

        // Search Query
        if ($request->filled('search')) {
            $searchTerm = '%' . trim($request->query('search')) . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                  ->orWhere('review', 'like', $searchTerm)
                  ->orWhereHas('user', function ($uq) use ($searchTerm) {
                      $uq->where('name', 'like', $searchTerm)
                        ->orWhere('email', 'like', $searchTerm);
                  })
                  ->orWhereHas('product', function ($pq) use ($searchTerm) {
                      $pq->where('name', 'like', $searchTerm)
                        ->orWhere('sku', 'like', $searchTerm);
                  });
            });
        }

        // Sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = strtolower($request->query('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSortColumns = ['id', 'created_at', 'rating', 'status'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Display a paginated listing of customer reviews with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $this->buildFilteredQuery($request);
        $perPage = min((int)$request->query('per_page', 12), 100);
        $reviews = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Reviews fetched successfully.',
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'errors' => null,
        ]);
    }

    /**
     * Display a specific review detail with relationships & audit log trail.
     */
    public function show($id): JsonResponse
    {
        $review = Review::with([
            'product:id,name,sku,slug,thumbnail,price,average_rating',
            'user:id,name,email,mobile,status',
            'order:id,order_number,status,grand_total,created_at',
            'moderator:id,name,email',
            'repliedBy:id,name,email'
        ])->find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review record not found.',
                'data' => null,
                'errors' => ['id' => ['Review not found.']],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review detail retrieved successfully.',
            'data' => $review,
            'errors' => null,
        ]);
    }

    /**
     * Update the moderation status of a specific review.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review record not found.',
                'data' => null,
                'errors' => ['id' => ['Review not found.']],
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,approved,rejected,hidden',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $review->status;
        $newStatus = $request->input('status');
        $adminUser = $request->user();

        $review->status = $newStatus;
        if ($request->has('admin_notes')) {
            $review->admin_notes = $request->input('admin_notes');
        }
        $review->moderated_by = $adminUser ? $adminUser->id : null;
        $review->moderated_at = now();
        $review->save();

        if (class_exists(AuditLog::class)) {
            AuditLog::create([
                'user_id' => $adminUser ? $adminUser->id : null,
                'action' => 'review_status_updated',
                'module' => 'reviews',
                'entity_type' => Review::class,
                'entity_id' => $review->id,
                'old_values' => ['status' => $oldStatus],
                'new_values' => [
                    'status' => $newStatus,
                    'admin_notes' => $review->admin_notes
                ],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Review moderation status updated to '{$newStatus}'.",
            'data' => $review->fresh(['product', 'user', 'moderator', 'repliedBy']),
            'errors' => null,
        ]);
    }

    /**
     * Post or update official store reply to customer review.
     */
    public function postReply(Request $request, $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review record not found.',
                'data' => null,
                'errors' => ['id' => ['Review not found.']],
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'admin_reply' => 'required|string|min:2|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422);
        }

        $adminUser = $request->user();
        $review->admin_reply = $request->input('admin_reply');
        $review->replied_at = now();
        $review->replied_by = $adminUser ? $adminUser->id : null;
        $review->save();

        if (class_exists(AuditLog::class)) {
            AuditLog::create([
                'user_id' => $adminUser ? $adminUser->id : null,
                'action' => 'review_admin_reply_posted',
                'module' => 'reviews',
                'entity_type' => Review::class,
                'entity_id' => $review->id,
                'old_values' => null,
                'new_values' => ['admin_reply' => $review->admin_reply],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Official store reply saved successfully.',
            'data' => $review->fresh(['product', 'user', 'moderator', 'repliedBy']),
            'errors' => null,
        ]);
    }

    /**
     * Delete official store reply.
     */
    public function deleteReply(Request $request, $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review record not found.',
                'data' => null,
                'errors' => ['id' => ['Review not found.']],
            ], 404);
        }

        $review->admin_reply = null;
        $review->replied_at = null;
        $review->replied_by = null;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'Official store reply removed.',
            'data' => $review->fresh(['product', 'user', 'moderator', 'repliedBy']),
            'errors' => null,
        ]);
    }

    /**
     * Toggle flagged / spam status on a review.
     */
    public function toggleFlag(Request $request, $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review record not found.',
                'data' => null,
                'errors' => ['id' => ['Review not found.']],
            ], 404);
        }

        $review->is_flagged = !$review->is_flagged;
        $review->flag_reason = $review->is_flagged ? ($request->input('flag_reason') ?? 'Flagged by administrator for review') : null;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => $review->is_flagged ? 'Review flagged for spam/profanity.' : 'Review flag removed.',
            'data' => $review->fresh(['product', 'user', 'moderator', 'repliedBy']),
            'errors' => null,
        ]);
    }

    /**
     * Export reviews as CSV file.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $query = $this->buildFilteredQuery($request);
        $fileName = 'review_moderation_export_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            // CSV Column Headers
            fputcsv($handle, [
                'Review ID',
                'Product Name',
                'Product SKU',
                'Customer Name',
                'Customer Email',
                'Verified Buyer',
                'Rating',
                'Title',
                'Review Content',
                'Status',
                'Flagged',
                'Flag Reason',
                'Store Official Reply',
                'Replied Date',
                'Submitted Date'
            ]);

            $query->chunk(200, function ($reviews) use ($handle) {
                foreach ($reviews as $r) {
                    fputcsv($handle, [
                        $r->id,
                        $r->product ? $r->product->name : 'N/A',
                        $r->product ? $r->product->sku : 'N/A',
                        $r->user ? $r->user->name : 'Anonymous',
                        $r->user ? $r->user->email : 'N/A',
                        $r->order_id ? 'Yes' : 'No',
                        $r->rating,
                        $r->title ?? '',
                        $r->review ?? '',
                        ucfirst($r->status),
                        $r->is_flagged ? 'Yes' : 'No',
                        $r->flag_reason ?? '',
                        $r->admin_reply ?? '',
                        $r->replied_at ? $r->replied_at->toDateTimeString() : '',
                        $r->created_at ? $r->created_at->toDateTimeString() : '',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Bulk update moderation status for multiple review IDs.
     */
    public function bulkStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:reviews,id',
            'status' => 'required|string|in:pending,approved,rejected,hidden',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ids = $request->input('ids');
        $newStatus = $request->input('status');
        $notes = $request->input('admin_notes');
        $adminUser = $request->user();

        DB::transaction(function () use ($ids, $newStatus, $notes, $adminUser, $request) {
            Review::whereIn('id', $ids)->update([
                'status' => $newStatus,
                'admin_notes' => $notes,
                'moderated_by' => $adminUser ? $adminUser->id : null,
                'moderated_at' => now(),
                'updated_at' => now(),
            ]);

            if (class_exists(AuditLog::class)) {
                AuditLog::create([
                    'user_id' => $adminUser ? $adminUser->id : null,
                    'action' => 'reviews_bulk_status_updated',
                    'module' => 'reviews',
                    'entity_type' => Review::class,
                    'entity_id' => null,
                    'old_values' => ['review_ids' => $ids],
                    'new_values' => ['status' => $newStatus, 'count' => count($ids)],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($ids) . " reviews successfully updated to '{$newStatus}'.",
            'data' => [
                'updated_ids' => $ids,
                'status' => $newStatus,
            ],
            'errors' => null,
        ]);
    }

    /**
     * Delete a review record.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review record not found.',
                'data' => null,
                'errors' => ['id' => ['Review not found.']],
            ], 404);
        }

        $adminUser = $request->user();
        $reviewId = $review->id;

        $review->delete();

        if (class_exists(AuditLog::class)) {
            AuditLog::create([
                'user_id' => $adminUser ? $adminUser->id : null,
                'action' => 'review_deleted',
                'module' => 'reviews',
                'entity_type' => Review::class,
                'entity_id' => $reviewId,
                'old_values' => ['title' => $review->title, 'rating' => $review->rating],
                'new_values' => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
            'data' => ['id' => $reviewId],
            'errors' => null,
        ]);
    }

    /**
     * Bulk delete review records.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:reviews,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'data' => null,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ids = $request->input('ids');
        $adminUser = $request->user();

        DB::transaction(function () use ($ids, $adminUser, $request) {
            Review::whereIn('id', $ids)->delete();

            if (class_exists(AuditLog::class)) {
                AuditLog::create([
                    'user_id' => $adminUser ? $adminUser->id : null,
                    'action' => 'reviews_bulk_deleted',
                    'module' => 'reviews',
                    'entity_type' => Review::class,
                    'entity_id' => null,
                    'old_values' => ['review_ids' => $ids],
                    'new_values' => ['deleted_count' => count($ids)],
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($ids) . ' reviews deleted successfully.',
            'data' => ['deleted_ids' => $ids],
            'errors' => null,
        ]);
    }
}
