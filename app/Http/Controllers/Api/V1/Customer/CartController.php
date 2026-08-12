<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\AddToCartRequest;
use App\Http\Requests\Customer\ApplyCouponRequest;
use App\Http\Requests\Customer\MergeCartRequest;
use App\Http\Requests\Customer\UpdateCartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class CartController extends BaseController
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Resolve active cart instance helper.
     */
    protected function getCart(Request $request)
    {
        $userId = $request->user('sanctum')?->id;
        $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id');

        return $this->cartService->resolveCart($userId, $sessionId);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/cart",
     *     summary="View Shopping Cart",
     *     description="Retrieve active shopping cart item breakdown and calculated totals for guest or customer.",
     *     operationId="customerGetCart",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Shopping cart retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        return $this->successResponse($cart, 'Shopping cart retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cart/items",
     *     summary="Add Product/Variant to Cart",
     *     description="Add a simple product or product variant to shopping cart.",
     *     operationId="customerAddToCart",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id","quantity"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="product_variant_id", type="integer"),
     *             @OA\Property(property="quantity", type="integer", default=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Item added to cart successfully"),
     *     @OA\Response(response=422, description="Stock limit or validation error")
     * )
     */
    public function addItem(AddToCartRequest $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $updatedCart = $this->cartService->addItem(
            $cart,
            (int) $request->input('product_id'),
            $request->filled('product_variant_id') ? (int) $request->input('product_variant_id') : null,
            (int) $request->input('quantity', 1)
        );

        return $this->successResponse($updatedCart, 'Item added to cart successfully.', 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/cart/items/{id}",
     *     summary="Update Cart Item Quantity",
     *     description="Modify quantity of an item in shopping cart.",
     *     operationId="customerUpdateCartItem",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"quantity"},
     *             @OA\Property(property="quantity", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Cart item updated successfully"),
     *     @OA\Response(response=422, description="Stock limit error")
     * )
     */
    public function updateItem(int $id, UpdateCartItemRequest $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $updatedCart = $this->cartService->updateItem($cart, $id, (int) $request->input('quantity'));

        return $this->successResponse($updatedCart, 'Cart item updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cart/items/{id}",
     *     summary="Remove Item from Cart",
     *     description="Remove a single item from shopping cart.",
     *     operationId="customerRemoveCartItem",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Item removed from cart successfully")
     * )
     */
    public function removeItem(int $id, Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $updatedCart = $this->cartService->removeItem($cart, $id);

        return $this->successResponse($updatedCart, 'Item removed from cart successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cart",
     *     summary="Clear Shopping Cart",
     *     description="Remove all items from shopping cart.",
     *     operationId="customerClearCart",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Shopping cart cleared successfully")
     * )
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $clearedCart = $this->cartService->clearCart($cart);

        return $this->successResponse($clearedCart, 'Shopping cart cleared successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cart/apply-coupon",
     *     summary="Apply Coupon Code",
     *     description="Apply promotional coupon code to shopping cart.",
     *     operationId="customerApplyCoupon",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"coupon_code"},
     *             @OA\Property(property="coupon_code", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Coupon applied successfully"),
     *     @OA\Response(response=422, description="Invalid coupon code")
     * )
     */
    public function applyCoupon(ApplyCouponRequest $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $updatedCart = $this->cartService->applyCoupon($cart, $request->input('coupon_code'));

        return $this->successResponse($updatedCart, 'Coupon applied successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/cart/remove-coupon",
     *     summary="Remove Coupon Code",
     *     description="Remove applied coupon code from shopping cart.",
     *     operationId="customerRemoveCoupon",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Coupon removed successfully")
     * )
     */
    public function removeCoupon(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $updatedCart = $this->cartService->removeCoupon($cart);

        return $this->successResponse($updatedCart, 'Coupon removed successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cart/merge",
     *     summary="Merge Guest Cart into Customer Cart",
     *     description="Merge guest session cart into logged-in customer cart.",
     *     operationId="customerMergeCart",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"session_id"},
     *             @OA\Property(property="session_id", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Guest cart merged successfully")
     * )
     */
    public function merge(MergeCartRequest $request): JsonResponse
    {
        $userId = $request->user('sanctum')->id;
        $sessionId = $request->input('session_id');

        $mergedCart = $this->cartService->mergeGuestCart($userId, $sessionId);

        return $this->successResponse($mergedCart, 'Guest cart merged successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/cart/validate",
     *     summary="Validate Cart Pre-Checkout",
     *     description="Verify product active status, stock availability, and coupon validity pre-checkout.",
     *     operationId="customerValidateCart",
     *     tags={"Shopping Cart"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="X-Session-ID", in="header", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Cart validated successfully")
     * )
     */
    public function validateCart(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $validation = $this->cartService->validateCartForCheckout($cart);

        return $this->successResponse($validation, 'Cart validation completed.');
    }
}
