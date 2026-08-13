<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicProductReviewController extends BaseController
{
    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/products/{product_id}/reviews",
     *     summary="Public listing of approved product reviews and rating summary",
     *     tags={"Public Product Reviews"},
     *     @OA\Parameter(name="product_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="rating", in="query", required=false, description="Filter by rating (1-5)", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(
     *         response=200,
     *         description="Approved reviews and summary retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Approved product reviews retrieved successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function index(int $productId, Request $request): JsonResponse
    {
        $filters = $request->only(['rating']);
        $perPage = (int) $request->input('per_page', 15);

        $result = $this->reviewService->getProductReviews($productId, $filters, $perPage);

        return $this->successResponse($result, 'Approved product reviews retrieved successfully.');
    }
}
