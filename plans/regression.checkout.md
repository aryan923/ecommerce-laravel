# Regression Strategy: Checkout & Order Creation Module

**Module Name:** Checkout & Order Creation  
**Module ID:** 16  
**Regression File:** `plans/regression.checkout.md`  
**Specification:** `specifications/feature.checkout.spec.md`  
**Plan:** `plans/plan.checkout.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Checkout & Order Creation impacts:
- **Module 09 Inventory Management**: Atomic stock reservation, decrementing `available_qty`, preventing overselling.
- **Module 12 Shopping Cart**: Cart resolution, cart clearing upon order placement, pre-checkout validation.
- **Module 13 Coupons & Discounts**: Coupon code validation, recording coupon usage log (`coupon_usages`).
- **Module 14 Tax / GST Engine**: Item tax calculation (CGST/SGST vs IGST).
- **Module 15 Shipping Module**: Selected shipping method validation, shipping charge calculation, initial shipment creation.

---

## 2. Regression Scenarios

### REG-CHK-001: Transaction Integrity on Inventory Lock Failure
- **Scenario**: Verify that if stock reservation fails mid-checkout for any item in a multi-item cart, the entire `DB::transaction` rolls back completely, ensuring no partial orders or orphan payment records are created.
- **Priority**: Critical
- **Expected Result**: 100% atomic rollback; no order, items, or payments created.

### REG-CHK-002: Historical Item Snapshot Isolation
- **Scenario**: Verify that updating product title, SKU, price, or deleting a product/variant in Admin panel does not alter existing order items or order confirmation receipts.
- **Priority**: Critical
- **Expected Result**: Historical `order_items` remain 100% untouched.

---

## 3. Smoke & Integration Test Suite

1. Run `php artisan test --filter=CheckoutTest` to verify all checkout tests.
2. Execute `php artisan l5-swagger:generate` to verify Swagger build.
