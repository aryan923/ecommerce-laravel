<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Review\UpdateReviewStatusRequest;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewAdminController extends BaseController
{
    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/reviews",
     *     summary="Admin list reviews with pagination & filters",
     *     tags={"Admin Reviews"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="rating", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Paginated review list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'rating', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $reviews = $this->reviewService->listAdminReviews($filters, $perPage);

        return $this->successResponse($reviews, 'Reviews list retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/reviews/{id}",
     *     summary="Fetch admin review details",
     *     tags={"Admin Reviews"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Review details retrieved")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $review = Review::with(['product', 'user', 'order', 'moderator'])->findOrFail($id);

        return $this->successResponse($review, 'Review details retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/reviews/{id}/status",
     *     summary="Moderate review status (approve, reject, hide, pending)",
     *     tags={"Admin Reviews"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"approved", "rejected", "hidden", "pending"}, example="approved"),
     *             @OA\Property(property="notes", type="string", example="Verified review content")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Review status updated")
     * )
     */
    public function updateStatus(int $id, UpdateReviewStatusRequest $request): JsonResponse
    {
        $admin = $request->user();
        $updatedReview = $this->reviewService->updateReviewStatus(
            $id,
            $request->input('status'),
            $request->input('notes'),
            $admin
        );

        return $this->successResponse($updatedReview, 'Review status updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/reviews/{id}",
     *     summary="Delete review by Admin",
     *     tags={"Admin Reviews"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Review deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $this->reviewService->deleteReview($id);

        return $this->successResponse(null, 'Review deleted successfully.');
    }
}
