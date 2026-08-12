# Regression Strategy: Shopping Cart Module

**Module Name:** Shopping Cart  
**Module ID:** 12  
**Regression File:** `plans/regression.cart.md`  
**Specification:** `specifications/feature.cart.spec.md`  
**Plan:** `plans/plan.cart.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Shopping Cart Management impacts:
- Module 06 Product Catalog (Product prices, status checks)
- Module 07 Product Variants (Variant unit prices & stock availability)
- Module 09 Inventory Management (Checking `inventories.available_qty` vs cart item quantity)
- Module 11 Wishlist (Move wishlist item to cart operation)
- Module 13 Checkout & Order Creation (Cart snapshot conversion to order items)

---

## 2. Regression Scenarios

### REG-CRT-001: Server-Side Unit Price Tampering Immunity
- **Scenario**: Verify that sending arbitrary `unit_price`, `subtotal`, or `discount` values in HTTP request body is ignored by the service layer, guaranteeing 100% financial calculation security.
- **Priority**: Critical
- **Expected Result**: Prices always match database records.

### REG-CRT-002: Guest-to-Customer Cart Merge Stock Limit Enforcement
- **Scenario**: Verify that when merging guest cart items into customer cart, total merged quantities do not exceed available stock in `inventories`.
- **Priority**: High
- **Expected Result**: Merged quantities capped at available stock limit.

### REG-CRT-003: Pre-Checkout Stock & Price Validation
- **Scenario**: Verify that `POST /api/v1/cart/validate` correctly detects out-of-stock items, price changes, or inactive products before proceeding to order creation.
- **Priority**: Critical
- **Expected Result**: Out-of-stock or changed price items flagged accurately.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all existing application test suites pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=CartTest`.
4. Perform end-to-end API verification: Guest Add Item → Fetch Guest Cart → Log In Customer → Merge Guest Cart → Update Quantity → Apply Coupon → Validate Cart → Clear Cart.
