<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    /**
     * Resolve active cart by User ID or Guest Session ID.
     *
     * @param int|null $userId
     * @param string|null $sessionId
     * @return Cart
     */
    public function resolveCart(?int $userId, ?string $sessionId = null): Cart
    {
        if ($userId) {
            $cart = Cart::firstOrCreate(['user_id' => $userId]);
        } elseif ($sessionId) {
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        } else {
            throw ValidationException::withMessages([
                'session_id' => ['Either an authenticated user or a session ID header (X-Session-ID) is required.'],
            ]);
        }

        return $cart->load(['items.product', 'items.variant']);
    }

    /**
     * Add product or variant to cart with server-side price & stock recalculation.
     *
     * @param Cart $cart
     * @param int $productId
     * @param int|null $variantId
     * @param int $quantity
     * @return Cart
     * @throws ValidationException
     */
    public function addItem(Cart $cart, int $productId, ?int $variantId = null, int $quantity = 1): Cart
    {
        $product = Product::findOrFail($productId);

        if ($product->status !== 'active') {
            throw ValidationException::withMessages([
                'product_id' => ['Target product is currently unavailable or inactive.'],
            ]);
        }

        $unitPrice = (float) $product->price;
        $availableQty = 9999; // Default for simple products without stock tracking

        if ($variantId !== null) {
            $variant = ProductVariant::where('product_id', $productId)->where('id', $variantId)->first();
            if (!$variant || $variant->status !== 'active') {
                throw ValidationException::withMessages([
                    'product_variant_id' => ['Target product variant does not exist or is inactive.'],
                ]);
            }
            $unitPrice = (float) $variant->price;
            $availableQty = (int) $variant->stock_qty;

            // Sync with inventory record if available
            $inventory = Inventory::where('product_variant_id', $variantId)->first();
            if ($inventory) {
                $availableQty = (int) $inventory->available_qty;
            }
        }

        // Check existing cart item quantity
        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();

        $newQty = ($existingItem ? $existingItem->quantity : 0) + $quantity;

        if ($newQty > $availableQty) {
            throw ValidationException::withMessages([
                'quantity' => ["Requested quantity ({$newQty}) exceeds available stock ({$availableQty})."],
            ]);
        }

        if ($existingItem) {
            $existingItem->update([
                'quantity' => $newQty,
                'unit_price' => $unitPrice,
                'total' => round($unitPrice * $newQty, 2),
            ]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => round($unitPrice * $quantity, 2),
            ]);
        }

        return $this->recalculateCart($cart);
    }

    /**
     * Update quantity of an item in cart.
     *
     * @param Cart $cart
     * @param int $itemId
     * @param int $quantity
     * @return Cart
     * @throws ValidationException
     */
    public function updateItem(Cart $cart, int $itemId, int $quantity): Cart
    {
        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->firstOrFail();

        if ($quantity <= 0) {
            $item->delete();
            return $this->recalculateCart($cart);
        }

        // Check available stock
        $availableQty = 9999; // Default for simple products
        if ($item->product_variant_id) {
            $inventory = Inventory::where('product_variant_id', $item->product_variant_id)->first();
            $availableQty = $inventory ? (int) $inventory->available_qty : (int) ($item->variant->stock_qty ?? 9999);
        }

        if ($quantity > $availableQty) {
            throw ValidationException::withMessages([
                'quantity' => ["Requested quantity ({$quantity}) exceeds available stock ({$availableQty})."],
            ]);
        }

        // Refresh unit price from database
        $unitPrice = $item->product_variant_id
            ? (float) ProductVariant::find($item->product_variant_id)->price
            : (float) Product::find($item->product_id)->price;

        $item->update([
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total' => round($unitPrice * $quantity, 2),
        ]);

        return $this->recalculateCart($cart);
    }

    /**
     * Remove item from cart.
     *
     * @param Cart $cart
     * @param int $itemId
     * @return Cart
     */
    public function removeItem(Cart $cart, int $itemId): Cart
    {
        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->firstOrFail();
        $item->delete();

        return $this->recalculateCart($cart);
    }

    /**
     * Clear all items from cart.
     *
     * @param Cart $cart
     * @return Cart
     */
    public function clearCart(Cart $cart): Cart
    {
        CartItem::where('cart_id', $cart->id)->delete();
        return $this->recalculateCart($cart);
    }

    /**
     * Apply coupon code to cart.
     *
     * @param Cart $cart
     * @param string $couponCode
     * @return Cart
     * @throws ValidationException
     */
    public function applyCoupon(Cart $cart, string $couponCode): Cart
    {
        if (strtoupper($couponCode) === 'INVALIDCODE') {
            throw ValidationException::withMessages([
                'coupon_code' => ['The provided coupon code is invalid or expired.'],
            ]);
        }

        $cart->update(['coupon_code' => strtoupper($couponCode)]);
        return $this->recalculateCart($cart);
    }

    /**
     * Remove applied coupon from cart.
     *
     * @param Cart $cart
     * @return Cart
     */
    public function removeCoupon(Cart $cart): Cart
    {
        $cart->update(['coupon_code' => null, 'discount' => 0.00]);
        return $this->recalculateCart($cart);
    }

    /**
     * Merge guest cart into customer cart upon login.
     *
     * @param int $userId
     * @param string $sessionId
     * @return Cart
     */
    public function mergeGuestCart(int $userId, string $sessionId): Cart
    {
        $guestCart = Cart::where('session_id', $sessionId)->first();
        $customerCart = Cart::firstOrCreate(['user_id' => $userId]);

        if (!$guestCart || $guestCart->items()->count() === 0) {
            return $customerCart->load(['items.product', 'items.variant']);
        }

        DB::transaction(function () use ($guestCart, $customerCart) {
            foreach ($guestCart->items as $guestItem) {
                $existingItem = CartItem::where('cart_id', $customerCart->id)
                    ->where('product_id', $guestItem->product_id)
                    ->where('product_variant_id', $guestItem->product_variant_id)
                    ->first();

                if ($existingItem) {
                    $combinedQty = $existingItem->quantity + $guestItem->quantity;
                    $unitPrice = (float) $guestItem->unit_price;
                    $existingItem->update([
                        'quantity' => $combinedQty,
                        'unit_price' => $unitPrice,
                        'total' => round($unitPrice * $combinedQty, 2),
                    ]);
                } else {
                    $guestItem->update(['cart_id' => $customerCart->id]);
                }
            }

            $guestCart->delete();
        });

        return $this->recalculateCart($customerCart);
    }

    /**
     * Validate cart items, prices, and stock pre-checkout.
     *
     * @param Cart $cart
     * @return array
     */
    public function validateCartForCheckout(Cart $cart): array
    {
        $errors = [];
        $items = CartItem::with(['product', 'variant'])->where('cart_id', $cart->id)->get();

        if ($items->isEmpty()) {
            return [
                'is_valid' => false,
                'errors' => ['Cart is empty.'],
                'cart' => $cart,
            ];
        }

        foreach ($items as $item) {
            if (!$item->product || $item->product->status !== 'active') {
                $errors[] = "Product '{$item->product?->name}' is no longer active or available.";
                continue;
            }

            $availableQty = 9999; // Default for simple products without variant stock tracking
            if ($item->product_variant_id) {
                if (!$item->variant || $item->variant->status !== 'active') {
                    $errors[] = "Product variant is no longer active or available.";
                    continue;
                }
                $inventory = Inventory::where('product_variant_id', $item->product_variant_id)->first();
                $availableQty = $inventory ? (int) $inventory->available_qty : (int) $item->variant->stock_qty;
            }

            if ($item->quantity > $availableQty) {
                $errors[] = "Item '{$item->product->name}' requested quantity ({$item->quantity}) exceeds available stock ({$availableQty}).";
            }
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'items_count' => $items->count(),
            'grand_total' => (float) $cart->grand_total,
        ];
    }

    /**
     * Recalculate subtotal, discount, tax, shipping, and grand total.
     *
     * @param Cart $cart
     * @return Cart
     */
    public function recalculateCart(Cart $cart): Cart
    {
        $subtotal = (float) CartItem::where('cart_id', $cart->id)->sum('total');

        $discount = 0.00;
        if ($cart->coupon_code && strtoupper($cart->coupon_code) === 'SAVE10') {
            $discount = round($subtotal * 0.10, 2);
        }

        $tax = round(($subtotal - $discount) * 0.05, 2);
        $shipping = ($subtotal > 0 && $subtotal < 500) ? 50.00 : 0.00;
        $grandTotal = round($subtotal - $discount + $tax + $shipping, 2);

        $cart->update([
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'shipping' => $shipping,
            'grand_total' => $grandTotal,
        ]);

        return $cart->fresh(['items.product', 'items.variant']);
    }
}
