<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    protected CartService $cartService;
    protected TaxService $taxService;
    protected ShippingService $shippingService;
    protected CouponService $couponService;
    protected InventoryService $inventoryService;

    public function __construct(
        CartService $cartService,
        TaxService $taxService,
        ShippingService $shippingService,
        CouponService $couponService,
        InventoryService $inventoryService
    ) {
        $this->cartService = $cartService;
        $this->taxService = $taxService;
        $this->shippingService = $shippingService;
        $this->couponService = $couponService;
        $this->inventoryService = $inventoryService;
    }

    /**
     * Process checkout transactionally and create purchase order.
     *
     * @param array $data
     * @param User|null $user
     * @param string|null $sessionId
     * @param string|null $idempotencyHeader
     * @return Order
     * @throws ValidationException
     */
    public function processCheckout(array $data, ?User $user = null, ?string $sessionId = null, ?string $idempotencyHeader = null): Order
    {
        $idempotencyKey = $idempotencyHeader ?? ($data['idempotency_key'] ?? null);

        // 1. Idempotency Check
        if ($idempotencyKey) {
            $existingOrder = Order::with(['items', 'payments', 'histories'])
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existingOrder) {
                return $existingOrder;
            }
        }

        // 2. Fetch Cart
        $cart = $this->cartService->resolveCart($user?->id, $sessionId);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Cannot checkout with an empty cart.'],
            ]);
        }

        // 3. Resolve Addresses
        $shippingAddressData = $this->resolveAddress($data, 'shipping', $user);
        $billingAddressData = $this->resolveAddress($data, 'billing', $user) ?? $shippingAddressData;

        $shippingState = $shippingAddressData['state_code'] ?? 'MH';
        $shippingPostal = $shippingAddressData['postal_code'] ?? null;

        // 4. Server-Side Line Items Recalculation & Stock Check
        $lineItemsForTax = [];
        $totalWeight = 0.0;

        foreach ($cart->items as $item) {
            $product = $item->product;
            $variant = $item->variant;

            if (!$product || $product->status !== 'active') {
                throw ValidationException::withMessages([
                    'cart' => ["Product '{$item->product_id}' is unavailable."],
                ]);
            }

            $unitPrice = (float) ($variant?->price ?? $product->price);
            $lineItemsForTax[] = [
                'product_id' => $product->id,
                'amount' => $unitPrice,
                'quantity' => $item->quantity,
            ];

            $itemWeight = (float) ($variant?->weight ?? $product->weight ?? 0.5);
            $totalWeight += ($itemWeight * $item->quantity);
        }

        // 5. Calculate Tax
        $taxBreakdown = $this->taxService->calculateTax($lineItemsForTax, $shippingState);
        $subtotal = $taxBreakdown['subtotal'];
        $taxTotal = $taxBreakdown['total_tax'];

        // 6. Calculate Coupon Discount
        $couponCode = $data['coupon_code'] ?? $cart->coupon_code;
        $discountTotal = 0.00;

        if (!empty($couponCode)) {
            $couponResult = $this->couponService->calculateDiscount(
                $couponCode,
                $subtotal,
                $user?->id,
                $lineItemsForTax
            );
            if ($couponResult['is_valid']) {
                $discountTotal = (float) $couponResult['discount_amount'];
            }
        }

        // 7. Calculate Shipping Fee
        $shippingOptions = $this->shippingService->calculateShippingOptions(
            $shippingState,
            $shippingPostal,
            $subtotal,
            $totalWeight
        );

        $shippingTotal = 0.00;
        $shippingMethodName = 'Standard Shipping';
        $selectedMethodId = $data['shipping_method_id'] ?? null;

        if ($selectedMethodId && !empty($shippingOptions['available_methods'])) {
            foreach ($shippingOptions['available_methods'] as $opt) {
                if ($opt['method_id'] == $selectedMethodId) {
                    $shippingTotal = (float) $opt['fee'];
                    $shippingMethodName = $opt['method_name'];
                    break;
                }
            }
        } elseif (!empty($shippingOptions['available_methods'])) {
            $shippingTotal = (float) $shippingOptions['available_methods'][0]['fee'];
            $shippingMethodName = $shippingOptions['available_methods'][0]['method_name'];
        }

        // If coupon grants free shipping
        if (isset($couponResult) && ($couponResult['discount_type'] ?? '') === 'free_shipping') {
            $shippingTotal = 0.00;
        }

        $grandTotal = max(0.00, round($subtotal - $discountTotal + $taxTotal + $shippingTotal, 2));

        // 8. Execute Database Transaction
        return DB::transaction(function () use (
            $user,
            $data,
            $cart,
            $idempotencyKey,
            $subtotal,
            $discountTotal,
            $taxTotal,
            $shippingTotal,
            $grandTotal,
            $couponCode,
            $shippingAddressData,
            $billingAddressData,
            $shippingMethodName,
            $taxBreakdown
        ) {
            // Reserve Stock for each item
            foreach ($cart->items as $item) {
                $variantId = $item->product_variant_id ?? $item->product->variants->first()?->id;
                if ($variantId) {
                    $this->inventoryService->reserveStock($variantId, $item->quantity);
                }
            }

            // Create Order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user?->id,
                'guest_email' => $user ? null : ($data['guest_email'] ?? null),
                'guest_name' => $user ? null : ($data['guest_name'] ?? null),
                'status' => 'pending_payment',
                'currency' => 'INR',
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'shipping_total' => $shippingTotal,
                'grand_total' => $grandTotal,
                'coupon_code' => $couponCode,
                'payment_method' => $data['payment_method'] ?? 'cod',
                'shipping_address' => $shippingAddressData,
                'billing_address' => $billingAddressData,
                'shipping_method_name' => $shippingMethodName,
                'idempotency_key' => $idempotencyKey,
            ]);

            // Create Order Items Snapshots
            foreach ($cart->items as $index => $item) {
                $product = $item->product;
                $variant = $item->variant;
                $lineTax = $taxBreakdown['line_items'][$index]['line_tax_total'] ?? 0.00;
                $unitPrice = (float) ($variant?->price ?? $product->price);
                $lineTotal = round(($unitPrice * $item->quantity) + $lineTax, 2);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'sku' => $variant?->sku ?? $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $item->quantity,
                    'discount_amount' => 0.00,
                    'tax_amount' => $lineTax,
                    'total_amount' => $lineTotal,
                    'snapshot_data' => [
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'image' => $product->featured_image ?? null,
                        'attributes' => $variant?->attributes ?? null,
                    ],
                ]);
            }

            // Create Initial Payment Record
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $order->payment_method,
                'amount' => $grandTotal,
                'currency' => 'INR',
                'status' => 'pending',
            ]);

            // Create Timeline Log
            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $user?->id,
                'status' => 'pending_payment',
                'comment' => 'Order placed successfully.',
            ]);

            // Clear Cart
            $this->cartService->clearCart($cart);

            return $order->load(['items', 'payments', 'histories']);
        });
    }

    /**
     * Resolve shipping or billing address array.
     */
    protected function resolveAddress(array $data, string $type, ?User $user): ?array
    {
        $addressIdKey = "{$type}_address_id";
        $addressKey = "{$type}_address";

        if ($user && !empty($data[$addressIdKey])) {
            $addr = Address::where('user_id', $user->id)->find($data[$addressIdKey]);
            if ($addr) {
                return [
                    'name' => $addr->name,
                    'address_line1' => $addr->line_1 ?? $addr->address_line1,
                    'address_line2' => $addr->line_2 ?? $addr->address_line2,
                    'city' => $addr->city,
                    'state_code' => $addr->state ?? $addr->state_code,
                    'postal_code' => $addr->postal_code,
                    'country_code' => $addr->country ?? 'IN',
                    'phone' => $addr->mobile ?? $addr->phone,
                ];
            }
        }

        return $data[$addressKey] ?? null;
    }
}
