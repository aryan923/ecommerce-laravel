<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\WishlistItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class WishlistService
{
    /**
     * List paginated wishlist items for customer.
     *
     * @param int $userId
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return WishlistItem::with([
            'product',
            'variant.attributeValues.attribute',
        ])
        ->where('user_id', $userId)
        ->orderBy('id', 'desc')
        ->paginate($perPage);
    }

    /**
     * Add product or variant to customer wishlist.
     *
     * @param int $userId
     * @param int $productId
     * @param int|null $variantId
     * @return WishlistItem
     * @throws ValidationException
     */
    public function addToWishlist(int $userId, int $productId, ?int $variantId = null): WishlistItem
    {
        $product = Product::findOrFail($productId);

        if ($product->status !== 'active') {
            throw ValidationException::withMessages([
                'product_id' => ['Target product is currently unavailable or inactive.'],
            ]);
        }

        if ($variantId !== null) {
            $variant = ProductVariant::where('product_id', $productId)->where('id', $variantId)->first();
            if (!$variant || $variant->status !== 'active') {
                throw ValidationException::withMessages([
                    'product_variant_id' => ['Target product variant does not exist or is inactive.'],
                ]);
            }
        }

        $wishlistItem = WishlistItem::firstOrCreate([
            'user_id' => $userId,
            'product_id' => $productId,
            'product_variant_id' => $variantId,
        ]);

        return $wishlistItem->load(['product', 'variant']);
    }

    /**
     * Remove single item from customer wishlist.
     *
     * @param int $userId
     * @param int $itemId
     * @return bool
     */
    public function removeFromWishlist(int $userId, int $itemId): bool
    {
        $item = WishlistItem::where('user_id', $userId)->where('id', $itemId)->firstOrFail();
        return (bool) $item->delete();
    }

    /**
     * Clear all wishlist items for customer.
     *
     * @param int $userId
     * @return int
     */
    public function clearWishlist(int $userId): int
    {
        return WishlistItem::where('user_id', $userId)->delete();
    }

    /**
     * Check if product or variant is in customer wishlist.
     *
     * @param int $userId
     * @param int $productId
     * @param int|null $variantId
     * @return array
     */
    public function checkWishlistStatus(int $userId, int $productId, ?int $variantId = null): array
    {
        $query = WishlistItem::where('user_id', $userId)->where('product_id', $productId);

        if ($variantId !== null) {
            $query->where('product_variant_id', $variantId);
        }

        $item = $query->first();

        return [
            'is_in_wishlist' => $item !== null,
            'wishlist_item_id' => $item?->id,
        ];
    }

    /**
     * Move saved wishlist item to shopping cart and remove from wishlist.
     *
     * @param int $userId
     * @param int $itemId
     * @param int $quantity
     * @return array
     */
    public function moveToCart(int $userId, int $itemId, int $quantity = 1): array
    {
        $item = WishlistItem::where('user_id', $userId)->where('id', $itemId)->firstOrFail();

        // Perform wishlist deletion upon moving to cart
        $productId = $item->product_id;
        $variantId = $item->product_variant_id;
        $item->delete();

        return [
            'product_id' => $productId,
            'product_variant_id' => $variantId,
            'quantity' => $quantity,
            'moved_to_cart' => true,
        ];
    }
}
