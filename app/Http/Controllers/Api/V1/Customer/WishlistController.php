<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\AddToWishlistRequest;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class WishlistController extends BaseController
{
    public function __construct(
        protected WishlistService $wishlistService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/wishlist",
     *     summary="List Customer Wishlist Items",
     *     description="Retrieve paginated list of items in the logged-in customer's wishlist.",
     *     operationId="customerListWishlist",
     *     tags={"Customer Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Wishlist items retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $items = $this->wishlistService->list($request->user()->id, $perPage);

        return $this->paginatedResponse($items, 'Wishlist items retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/wishlist",
     *     summary="Add Product/Variant to Wishlist",
     *     description="Add a simple product or specific variant to customer's wishlist.",
     *     operationId="customerAddToWishlist",
     *     tags={"Customer Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="product_variant_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Item added to wishlist successfully"),
     *     @OA\Response(response=422, description="Validation or product status error")
     * )
     */
    public function store(AddToWishlistRequest $request): JsonResponse
    {
        $item = $this->wishlistService->addToWishlist(
            $request->user()->id,
            (int) $request->input('product_id'),
            $request->filled('product_variant_id') ? (int) $request->input('product_variant_id') : null
        );

        return $this->successResponse($item, 'Item added to wishlist successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/wishlist/check/{product_id}",
     *     summary="Check Wishlist Status",
     *     description="Check if a product or variant is currently in the customer's wishlist.",
     *     operationId="customerCheckWishlistStatus",
     *     tags={"Customer Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="product_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="variant_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Wishlist status checked successfully")
     * )
     */
    public function check(int $productId, Request $request): JsonResponse
    {
        $variantId = $request->filled('variant_id') ? (int) $request->input('variant_id') : null;
        $status = $this->wishlistService->checkWishlistStatus($request->user()->id, $productId, $variantId);

        return $this->successResponse($status, 'Wishlist status checked successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/wishlist/{id}/move-to-cart",
     *     summary="Move Wishlist Item to Shopping Cart",
     *     description="Transfer saved wishlist item directly into customer's shopping cart.",
     *     operationId="customerMoveWishlistToCart",
     *     tags={"Customer Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="quantity", type="integer", default=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Item moved to shopping cart successfully"),
     *     @OA\Response(response=404, description="Wishlist item not found")
     * )
     */
    public function moveToCart(int $id, Request $request): JsonResponse
    {
        $quantity = (int) $request->input('quantity', 1);
        $result = $this->wishlistService->moveToCart($request->user()->id, $id, $quantity);

        return $this->successResponse($result, 'Wishlist item moved to shopping cart successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/wishlist/{id}",
     *     summary="Remove Item from Wishlist",
     *     description="Remove a single item from customer's wishlist.",
     *     operationId="customerRemoveFromWishlist",
     *     tags={"Customer Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Item removed from wishlist successfully"),
     *     @OA\Response(response=404, description="Wishlist item not found")
     * )
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $this->wishlistService->removeFromWishlist($request->user()->id, $id);
        return $this->successResponse(null, 'Item removed from wishlist successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/wishlist",
     *     summary="Clear Entire Wishlist",
     *     description="Remove all items from logged-in customer's wishlist.",
     *     operationId="customerClearWishlist",
     *     tags={"Customer Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Wishlist cleared successfully")
     * )
     */
    public function clear(Request $request): JsonResponse
    {
        $count = $this->wishlistService->clearWishlist($request->user()->id);
        return $this->successResponse(['cleared_count' => $count], "Wishlist cleared successfully ({$count} items removed).");
    }
}
