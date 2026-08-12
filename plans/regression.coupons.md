# Regression Strategy: Coupons & Discounts Module

**Module Name:** Coupons & Discounts  
**Module ID:** 13  
**Regression File:** `plans/regression.coupons.md`  
**Specification:** `specifications/feature.coupons.spec.md`  
**Plan:** `plans/plan.coupons.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Coupons & Discounts impacts:
- **Module 12 Shopping Cart**: Coupon application, subtotal/grand_total recalculation, discount deduction, coupon removal.
- **Module 14 Tax / GST Engine**: Tax calculation after applying coupon discount vs before discount (depending on regional tax rules).
- **Module 15 Shipping Engine**: Free shipping coupon waiver overriding shipping rate tables.
- **Module 16 Checkout & Order Creation**: Converting active cart coupon into locked order coupon snapshot, logging `coupon_usages` entry.

---

## 2. Regression Scenarios

### REG-CPN-001: Cart Subtotal Recalculation Integration
- **Scenario**: Verify that applying, updating item quantity in cart, or removing an item in Cart Service triggers `CouponService::validateAndCalculate()` to recalculate discount, ensuring discount is updated or dropped if subtotal drops below `min_order_value`.
- **Priority**: Critical
- **Expected Result**: Cart subtotal changes automatically re-validate applied coupon eligibility.

### REG-CPN-002: Maximum Discount Cap Enforcement
- **Scenario**: Verify that percentage discount calculations strictly enforce `max_discount` limit regardless of cart subtotal size.
- **Priority**: High
- **Expected Result**: Calculated discount never exceeds `max_discount`.

### REG-CPN-003: Product / Category Restriction Partial Discounting
- **Scenario**: Verify that when cart contains mixed items (eligible and non-eligible), coupon discount applies exclusively to the eligible subtotal.
- **Priority**: High
- **Expected Result**: Non-eligible cart items do not receive discount deductions.

### REG-CPN-004: Atomic Usage Limit Incrementing
- **Scenario**: Verify that coupon usage limits are checked at validation and incremented upon order placement inside database transaction to prevent race conditions during high concurrency.
- **Priority**: Critical
- **Expected Result**: No over-subscription of limited-use coupons.

---

## 3. Smoke & Integration Test Suite

1. Run `php artisan test --filter=CouponTest` to verify all coupon functionality.
2. Run `php artisan test --filter=CartTest` to verify cart & coupon integration.
3. Run `php artisan test` across the whole application to ensure zero regressions.
4. Execute `php artisan l5-swagger:generate` to verify Swagger documentation builds cleanly.
