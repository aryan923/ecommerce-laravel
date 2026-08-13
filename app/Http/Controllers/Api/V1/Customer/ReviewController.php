<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Review\CreateReviewRequest;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends BaseController
{
    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customer/reviews",
     *     summary="Submit verified purchase product review",
     *     tags={"Customer Reviews"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id", "order_id", "rating", "review"},
     *             @OA\Property(property="product_id", type="integer", example=1),
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="rating", type="integer", example=5),
     *             @OA\Property(property="title", type="string", example="Great quality!"),
     *             @OA\Property(property="review", type="string", example="Exceeded my expectations, fast delivery.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Review submitted successfully (pending moderation)",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Review submitted successfully and is pending moderation."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Product not in delivered order or duplicate submission")
     * )
     */
    public function store(CreateReviewRequest $request): JsonResponse
    {
        $user = $request->user();
        $review = $this->reviewService->createReview($user, $request->validated());

        return $this->successResponse($review, 'Review submitted successfully and is pending moderation.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/reviews",
     *     summary="List authenticated customer's submitted reviews",
     *     tags={"Customer Reviews"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer reviews retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);

        $reviews = $this->reviewService->getCustomerReviews($user, $perPage);

        return $this->successResponse($reviews, 'Customer reviews retrieved successfully.');
    }
}
