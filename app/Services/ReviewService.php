<?php

namespace App\Services;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class ReviewService
{
    /**
     * Submit verified purchase product review.
     *
     * @throws ValidationException|ModelNotFoundException
     */
    public function createReview(User $user, array $data): Review
    {
        $productId = (int) $data['product_id'];
        $orderId = (int) $data['order_id'];

        // Verify order exists, belongs to user, has status 'delivered', and contains product_id
        $deliveredOrder = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->where('status', 'delivered')
            ->whereHas('items', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            })
            ->first();

        if (!$deliveredOrder) {
            throw ValidationException::withMessages([
                'order' => ['Reviews can only be submitted for products in delivered orders.'],
            ]);
        }

        // Prevent duplicate review submissions for same user, order, and product
        $existingReview = Review::where('user_id', $user->id)
            ->where('order_id', $orderId)
            ->where('product_id', $productId)
            ->exists();

        if ($existingReview) {
            throw ValidationException::withMessages([
                'review' => ['You have already reviewed this product for this order.'],
            ]);
        }

        return Review::create([
            'product_id' => $productId,
            'user_id' => $user->id,
            'order_id' => $orderId,
            'rating' => (int) $data['rating'],
            'title' => $data['title'] ?? null,
            'review' => $data['review'],
            'images' => $data['images'] ?? null,
            'status' => 'pending',
        ]);
    }

    /**
     * Public get approved reviews and rating summary for a product.
     *
     * @throws ModelNotFoundException
     */
    public function getProductReviews(int $productId, array $filters = [], int $perPage = 15): array
    {
        $product = Product::findOrFail($productId);

        $query = Review::with(['user:id,name'])
            ->where('product_id', $product->id)
            ->where('status', 'approved');

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        $summaryQuery = Review::where('product_id', $product->id)->where('status', 'approved');
        $totalReviews = (int) $summaryQuery->count();
        $avgRating = $totalReviews > 0 ? round((float) $summaryQuery->avg('rating'), 2) : 0.0;

        $breakdown = [
            5 => (int) (clone $summaryQuery)->where('rating', 5)->count(),
            4 => (int) (clone $summaryQuery)->where('rating', 4)->count(),
            3 => (int) (clone $summaryQuery)->where('rating', 3)->count(),
            2 => (int) (clone $summaryQuery)->where('rating', 2)->count(),
            1 => (int) (clone $summaryQuery)->where('rating', 1)->count(),
        ];

        $paginatedReviews = $query->orderBy('id', 'desc')->paginate($perPage);

        return [
            'summary' => [
                'average_rating' => $avgRating,
                'total_reviews' => $totalReviews,
                'rating_breakdown' => $breakdown,
            ],
            'reviews' => $paginatedReviews,
        ];
    }

    /**
     * Get paginated customer's submitted reviews.
     */
    public function getCustomerReviews(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Review::with(['product:id,name,slug,sku'])
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    /**
     * Admin list review records with filters.
     */
    public function listAdminReviews(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Review::with(['product:id,name,sku', 'user:id,name,email', 'order:id,order_number']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('review', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
                  })
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Moderate review status by Admin.
     */
    public function updateReviewStatus(int $reviewId, string $status, ?string $notes = null, ?AdminUser $admin = null): Review
    {
        $review = Review::findOrFail($reviewId);

        $review->status = $status;
        $review->admin_notes = $notes ?? $review->admin_notes;
        $review->moderated_at = now();
        $review->moderated_by = $admin?->id;
        $review->save();

        return $review->fresh(['product', 'user', 'moderator']);
    }

    /**
     * Delete review by Admin.
     */
    public function deleteReview(int $reviewId): bool
    {
        $review = Review::findOrFail($reviewId);

        return (bool) $review->delete();
    }
}
