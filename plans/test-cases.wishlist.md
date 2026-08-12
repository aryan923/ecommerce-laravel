# Test Cases: Wishlist Module

**Module Name:** Wishlist  
**Module ID:** 11  
**Test File:** `plans/test-cases.wishlist.md`  
**Specification:** `specifications/feature.wishlist.spec.md`  
**Plan:** `plans/plan.wishlist.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-WSH-001: Add Simple Product to Wishlist Success
- **Preconditions**: Authenticated customer, active product ID 1.
- **Input**: `POST /api/v1/wishlist` with `product_id: 1`.
- **Expected Result**: HTTP 201 Created, `wishlist_items` record inserted with `user_id`, `product_id: 1`, `product_variant_id: null`.

### TC-WSH-002: Add Product Variant to Wishlist Success
- **Preconditions**: Authenticated customer, product ID 1, variant ID 10.
- **Input**: `POST /api/v1/wishlist` with `product_id: 1`, `product_variant_id: 10`.
- **Expected Result**: HTTP 201 Created, `wishlist_items` record inserted with `user_id`, `product_id: 1`, `product_variant_id: 10`.

### TC-WSH-003: Duplicate Add Idempotency Check
- **Preconditions**: Product ID 1 already in customer's wishlist.
- **Input**: `POST /api/v1/wishlist` with `product_id: 1`.
- **Expected Result**: HTTP 200/201 OK, returns existing record without throwing database duplicate key error or creating duplicate rows.

### TC-WSH-004: List Customer Wishlist Items with Stock & Price Details
- **Input**: `GET /api/v1/wishlist`.
- **Expected Result**: HTTP 200 OK, returns saved wishlist items with eager loaded product name, slug, price, main image URL, and stock status.

### TC-WSH-005: Check Product Wishlist Status
- **Input**: `GET /api/v1/wishlist/check/1`.
- **Expected Result**: HTTP 200 OK, returns `data: { is_in_wishlist: true, wishlist_item_id: X }`.

### TC-WSH-006: Remove Item from Wishlist Success
- **Preconditions**: Wishlist item ID 5 exists for customer.
- **Input**: `DELETE /api/v1/wishlist/5`.
- **Expected Result**: HTTP 200 OK, record removed from `wishlist_items`.

### TC-WSH-007: Clear All Wishlist Items Success
- **Preconditions**: Customer has 3 saved wishlist items.
- **Input**: `DELETE /api/v1/wishlist`.
- **Expected Result**: HTTP 200 OK, all 3 wishlist items for the customer deleted.

---

## 2. Negative Test Scenarios

### TC-WSH-008: Add Non-Existent Product Validation Error
- **Input**: `POST /api/v1/wishlist` with `product_id: 99999`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `product_id`.

### TC-WSH-009: Add Inactive Product Validation Error
- **Preconditions**: Product ID 2 has `status = 'draft'` or `'inactive'`.
- **Input**: `POST /api/v1/wishlist` with `product_id: 2`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Product is not available".

### TC-WSH-010: Cross-Customer Wishlist Deletion Security Prevention
- **Preconditions**: Customer A owns Wishlist Item ID 1. Customer B attempts deletion.
- **Input**: Customer B issues `DELETE /api/v1/wishlist/1`.
- **Expected Result**: HTTP 404 Not Found, preventing unauthorized deletion of other customers' wishlist items.

### TC-WSH-011: Unauthenticated Wishlist Access Attempt
- **Input**: `GET /api/v1/wishlist` without Bearer token.
- **Expected Result**: HTTP 401 Unauthorized.
