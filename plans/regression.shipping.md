# Regression Strategy: Shipping Module

**Module Name:** Shipping Module  
**Module ID:** 15  
**Regression File:** `plans/regression.shipping.md`  
**Specification:** `specifications/feature.shipping.spec.md`  
**Plan:** `plans/plan.shipping.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Shipping Module impacts:
- **Module 12 Shopping Cart**: Cart estimated shipping fee calculation, free shipping coupon override.
- **Module 13 Coupons & Discounts**: `free_shipping` coupon type waiving calculated delivery fee.
- **Module 14 Tax / GST Engine**: Tax applicability on shipping fees.
- **Module 16 Checkout & Order Creation**: Converting selected shipping option into locked order shipping charge, creating shipment record upon order fulfillment.

---

## 2. Regression Scenarios

### REG-SHP-001: Free Shipping Coupon Override
- **Scenario**: Verify that when a valid `free_shipping` coupon is applied to cart, calculated shipping fee is set to 0.00 even if flat rate or weight rate normally applies.
- **Priority**: Critical
- **Expected Result**: Shipping charge strictly 0.00 when free shipping coupon active.

### REG-SHP-002: Zone Priority & Global Fallback Matching
- **Scenario**: Verify that specific state/postal code zones take precedence over global fallback zones (`is_global = true`), preventing incorrect rate application.
- **Priority**: High
- **Expected Result**: Most specific geographic zone rule matches first.

---

## 3. Smoke & Integration Test Suite

1. Run `php artisan test --filter=ShippingTest` to verify all shipping module tests.
2. Execute `php artisan l5-swagger:generate` to verify Swagger build.
