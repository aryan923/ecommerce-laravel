<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * Get paginated admin coupon listing with filters and sorting.
     */
    public function getAdminCouponsList(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Coupon::query()->withCount('usages');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'code', 'name', 'created_at', 'start_date', 'end_date', 'uses_count'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'uses_count') {
                $query->orderBy('usages_count', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        } else {
            $query->orderBy('id', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Validate a coupon code and calculate applicable discount.
     *
     * @param string $code
     * @param float $subtotal
     * @param array $items Array of ['product_id' => int, 'total' => float]
     * @param int|null $userId
     * @return array
     * @throws ValidationException
     */
    public function validateAndCalculate(string $code, float $subtotal = 0.0, array $items = [], ?int $userId = null): array
    {
        $code = strtoupper(trim($code));
        $coupon = Coupon::with(['products', 'categories', 'brands', 'customers'])
            ->where('code', $code)
            ->first();

        if (!$coupon) {
            throw ValidationException::withMessages([
                'code' => ['Invalid coupon code.'],
            ]);
        }

        if ($coupon->status !== 'active') {
            throw ValidationException::withMessages([
                'code' => ['This coupon is currently inactive.'],
            ]);
        }

        $now = Carbon::now();

        if ($coupon->start_date && $now->lt($coupon->start_date)) {
            throw ValidationException::withMessages([
                'code' => ['This coupon is not active yet.'],
            ]);
        }

        if ($coupon->end_date && $now->gt($coupon->end_date)) {
            throw ValidationException::withMessages([
                'code' => ['This coupon has expired.'],
            ]);
        }

        // Global usage limit check
        if ($coupon->usage_limit !== null) {
            $totalUsages = $coupon->usages()->count();
            if ($totalUsages >= $coupon->usage_limit) {
                throw ValidationException::withMessages([
                    'code' => ['Coupon usage limit has been reached.'],
                ]);
            }
        }

        // Per-customer limit check
        if ($userId && $coupon->per_customer_limit !== null) {
            $userUsages = $coupon->usages()->where('user_id', $userId)->count();
            if ($userUsages >= $coupon->per_customer_limit) {
                throw ValidationException::withMessages([
                    'code' => ['You have reached your maximum usage limit for this coupon.'],
                ]);
            }
        }

        // Customer specific targeting restriction
        if ($coupon->customers->isNotEmpty()) {
            if (!$userId || !$coupon->customers->pluck('id')->contains($userId)) {
                throw ValidationException::withMessages([
                    'code' => ['This coupon is not valid for your account.'],
                ]);
            }
        }

        // First order / New customer check
        if (($coupon->is_first_order_only || $coupon->is_new_customer_only) && $userId) {
            $hasPriorOrders = CouponUsage::where('user_id', $userId)->exists();
            if ($hasPriorOrders) {
                throw ValidationException::withMessages([
                    'code' => ['This coupon is valid for first-time customers only.'],
                ]);
            }
        }

        // Item-level restriction filtering
        $hasRestrictions = $coupon->products->isNotEmpty() || $coupon->categories->isNotEmpty() || $coupon->brands->isNotEmpty();
        $eligibleSubtotal = $subtotal;

        if ($hasRestrictions && !empty($items)) {
            $allowedProductIds = $coupon->products->pluck('id')->toArray();
            $allowedCategoryIds = $coupon->categories->pluck('id')->toArray();
            $allowedBrandIds = $coupon->brands->pluck('id')->toArray();

            $eligibleSubtotal = 0.0;

            foreach ($items as $item) {
                $productId = $item['product_id'] ?? null;
                $itemTotal = (float) ($item['total'] ?? 0.0);

                if (!$productId) {
                    continue;
                }

                $product = Product::find($productId);
                if (!$product) {
                    continue;
                }

                $isEligible = false;

                if (!empty($allowedProductIds) && in_array($productId, $allowedProductIds)) {
                    $isEligible = true;
                }
                if (!empty($allowedCategoryIds) && $product->category_id && in_array($product->category_id, $allowedCategoryIds)) {
                    $isEligible = true;
                }
                if (!empty($allowedBrandIds) && $product->brand_id && in_array($product->brand_id, $allowedBrandIds)) {
                    $isEligible = true;
                }

                if ($isEligible) {
                    $eligibleSubtotal += $itemTotal;
                }
            }
        }

        // Check minimum order value
        if ($coupon->min_order_value > 0 && $eligibleSubtotal < (float) $coupon->min_order_value) {
            throw ValidationException::withMessages([
                'code' => ["Minimum order subtotal of {$coupon->min_order_value} required for this coupon."],
            ]);
        }

        // Discount calculation
        $discountAmount = 0.00;
        $isFreeShipping = (bool) $coupon->free_shipping || $coupon->type === 'free_shipping';

        if ($coupon->type === 'percentage') {
            $rawDiscount = $eligibleSubtotal * ((float) $coupon->value / 100.0);
            $discountAmount = $coupon->max_discount !== null ? min($rawDiscount, (float) $coupon->max_discount) : $rawDiscount;
        } elseif ($coupon->type === 'fixed_amount') {
            $discountAmount = min((float) $coupon->value, $eligibleSubtotal);
        }

        $discountAmount = round(max(0, $discountAmount), 2);

        return [
            'is_valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
                'free_shipping' => $isFreeShipping,
            ],
            'eligible_subtotal' => round($eligibleSubtotal, 2),
            'discount_amount' => $discountAmount,
            'free_shipping' => $isFreeShipping,
        ];
    }

    /**
     * Create a new coupon and sync restriction pivots.
     */
    public function createCoupon(array $data): Coupon
    {
        $coupon = Coupon::create($data);

        $this->syncRestrictions($coupon, $data);

        return $coupon->load(['products', 'categories', 'brands', 'customers']);
    }

    /**
     * Update existing coupon and sync restriction pivots.
     */
    public function updateCoupon(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($data);

        $this->syncRestrictions($coupon, $data);

        return $coupon->load(['products', 'categories', 'brands', 'customers']);
    }

    /**
     * Toggle coupon status.
     */
    public function toggleStatus(Coupon $coupon, string $status): Coupon
    {
        $coupon->update(['status' => $status]);
        return $coupon;
    }

    /**
     * Delete/archive a coupon.
     */
    public function deleteCoupon(Coupon $coupon): bool
    {
        return $coupon->update(['status' => 'archived']);
    }

    /**
     * Generate coupon performance & usage report.
     */
    public function getReport(Coupon $coupon): array
    {
        $usages = CouponUsage::where('coupon_id', $coupon->id)
            ->with(['user:id,first_name,last_name,email'])
            ->orderBy('used_at', 'desc')
            ->get();

        $totalUses = $usages->count();
        $totalDiscount = (float) $usages->sum('discount_amount');

        $orderIds = $usages->pluck('order_id')->filter()->unique();
        $totalRevenue = 0.00;
        if ($orderIds->isNotEmpty()) {
            $totalRevenue = (float) Order::whereIn('id', $orderIds)->sum('grand_total');
        }

        $remainingUsage = null;
        if ($coupon->usage_limit !== null) {
            $remainingUsage = max(0, $coupon->usage_limit - $totalUses);
        }

        $recentUsages = $usages->take(10)->map(function ($usage) {
            $userName = 'Guest/Deleted User';
            if ($usage->user) {
                $name = trim(($usage->user->first_name ?? '') . ' ' . ($usage->user->last_name ?? ''));
                $userName = $name !== '' ? $name : ($usage->user->email ?? 'User');
            }

            return [
                'id' => $usage->id,
                'order_id' => $usage->order_id,
                'user_id' => $usage->user_id,
                'customer_name' => $userName,
                'discount_amount' => (float) $usage->discount_amount,
                'used_at' => $usage->used_at ? $usage->used_at->toIso8601String() : null,
            ];
        })->values();

        return [
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'status' => $coupon->status,
            ],
            'metrics' => [
                'total_uses' => $totalUses,
                'total_discount_amount' => round($totalDiscount, 2),
                'orders_count' => $orderIds->count(),
                'total_revenue_generated' => round($totalRevenue, 2),
                'remaining_uses' => $remainingUsage,
            ],
            'recent_usages' => $recentUsages,
        ];
    }

    /**
     * Record usage of a coupon.
     */
    public function recordUsage(Coupon $coupon, ?int $userId, ?int $orderId, float $discountAmount): CouponUsage
    {
        $usage = CouponUsage::create([
            'coupon_id' => $coupon->id,
            'user_id' => $userId,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount,
            'used_at' => Carbon::now(),
        ]);

        $coupon->increment('uses_count');

        return $usage;
    }

    /**
     * Helper to sync restriction pivot tables.
     */
    protected function syncRestrictions(Coupon $coupon, array $data): void
    {
        if (array_key_exists('product_ids', $data)) {
            $coupon->products()->sync($data['product_ids'] ?? []);
        }
        if (array_key_exists('category_ids', $data)) {
            $coupon->categories()->sync($data['category_ids'] ?? []);
        }
        if (array_key_exists('brand_ids', $data)) {
            $coupon->brands()->sync($data['brand_ids'] ?? []);
        }
        if (array_key_exists('user_ids', $data)) {
            $coupon->customers()->sync($data['user_ids'] ?? []);
        }
    }
}
