# Regression Strategy: Wishlist Module

**Module Name:** Wishlist  
**Module ID:** 11  
**Regression File:** `plans/regression.wishlist.md`  
**Specification:** `specifications/feature.wishlist.spec.md`  
**Plan:** `plans/plan.wishlist.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Wishlist Management impacts:
- Module 06 Product Catalog (Displaying "In Wishlist" heart icons on product cards and detail pages)
- Module 07 Product Variants (Variant selection for wishlist items)
- Module 10 Customer Profile & Addresses (Customer account dashboard saved items)
- Module 12 Cart & Checkout (Move wishlist item to cart integration)

---

## 2. Regression Scenarios

### REG-WSH-001: Idempotency & Composite Unique Constraint Integrity
- **Scenario**: Verify that concurrent or duplicate "Add to Wishlist" requests for the same `(user_id, product_id, product_variant_id)` tuple return HTTP 200/201 cleanly without throwing SQL 1062 duplicate key exceptions.
- **Priority**: Critical
- **Expected Result**: Clean idempotent handling without SQL exceptions.

### REG-WSH-002: Cross-Customer Isolation Security Audit
- **Scenario**: Verify that customers cannot view, remove, or clear another customer's saved wishlist items.
- **Priority**: Critical
- **Expected Result**: Zero data leakage across customer account boundaries.

### REG-WSH-003: Move to Cart Atomicity
- **Scenario**: Verify that moving an item from wishlist to cart creates/updates the cart entry and removes the item from `wishlist_items` cleanly inside a database transaction.
- **Priority**: High
- **Expected Result**: Wishlist item transferred to cart and removed from wishlist simultaneously.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all existing application test suites pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=WishlistTest`.
4. Perform end-to-end API verification: Register Customer → Add Simple Product to Wishlist → Add Variant to Wishlist → Query Wishlist → Check Wishlist Status → Remove Item → Clear Wishlist.
