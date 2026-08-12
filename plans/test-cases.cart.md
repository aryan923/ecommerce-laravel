# Test Cases: Shopping Cart Module

**Module Name:** Shopping Cart  
**Module ID:** 12  
**Test File:** `plans/test-cases.cart.md`  
**Specification:** `specifications/feature.cart.spec.md`  
**Plan:** `plans/plan.cart.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-CRT-001: Create Guest Cart & Add Simple Product
- **Preconditions**: Product ID 1 (Price: 100.00, Stock: 10).
- **Input**: `POST /api/v1/cart/items` with header `X-Session-ID: guest_session_123` and payload `product_id: 1, quantity: 2`.
- **Expected Result**: HTTP 201 Created, `cart` created with `session_id: guest_session_123`, `cart_items` total = 200.00, subtotal = 200.00.

### TC-CRT-002: Add Product Variant to Customer Cart
- **Preconditions**: Authenticated customer, Product ID 1, Variant ID 10 (Price: 150.00, Stock: 5).
- **Input**: `POST /api/v1/cart/items` with Bearer Token and payload `product_id: 1, product_variant_id: 10, quantity: 1`.
- **Expected Result**: HTTP 201 Created, unit price pulled from database variant (150.00), grand total = 150.00.

### TC-CRT-003: Server-Side Price Recalculation (Ignore Frontend Price Payload)
- **Input**: `POST /api/v1/cart/items` with payload `product_id: 1, unit_price: 1.00, quantity: 1`.
- **Expected Result**: System ignores user-submitted `unit_price: 1.00`, uses actual database price (100.00), total = 100.00.

### TC-CRT-004: Update Cart Item Quantity
- **Preconditions**: Cart contains item ID 5 (Quantity: 2).
- **Input**: `PUT /api/v1/cart/items/5` with payload `quantity: 4`.
- **Expected Result**: HTTP 200 OK, `cart_items` quantity updated to 4, cart subtotal recalculated.

### TC-CRT-005: Remove Item from Cart
- **Input**: `DELETE /api/v1/cart/items/5`.
- **Expected Result**: HTTP 200 OK, `cart_items` row deleted, cart totals updated.

### TC-CRT-006: Merge Guest Cart into Customer Cart Upon Login
- **Preconditions**: Guest Cart `guest_session_123` has Product 1 (Qty 2). Customer Cart has Product 2 (Qty 1).
- **Input**: Authenticated customer issues `POST /api/v1/cart/merge` with `session_id: guest_session_123`.
- **Expected Result**: HTTP 200 OK, customer cart now contains Product 1 (Qty 2) and Product 2 (Qty 1), guest cart deleted.

### TC-CRT-007: Pre-Checkout Cart Validation Success
- **Input**: `POST /api/v1/cart/validate`.
- **Expected Result**: HTTP 200 OK, returns `data: { is_valid: true, items_count: 2, grand_total: 350.00 }`.

---

## 2. Negative Test Scenarios

### TC-CRT-008: Add Quantity Exceeding Available Stock Failure
- **Preconditions**: Product Variant 10 has `available_qty = 3`.
- **Input**: `POST /api/v1/cart/items` with `quantity: 10`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Requested quantity (10) exceeds available stock (3)".

### TC-CRT-009: Add Inactive Product Validation Error
- **Preconditions**: Product ID 2 has `status = 'draft'` or `'inactive'`.
- **Input**: `POST /api/v1/cart/items` with `product_id: 2`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Target product is currently unavailable".

### TC-CRT-010: Apply Invalid Coupon Code Error
- **Input**: `POST /api/v1/cart/apply-coupon` with `coupon_code: INVALIDCODE`.
- **Expected Result**: HTTP 422 Unprocessable Entity.

### TC-CRT-011: Pre-Checkout Validation Flag Insufficient Stock
- **Preconditions**: Customer cart item has Qty 5, but stock dropped to 2 in database.
- **Input**: `POST /api/v1/cart/validate`.
- **Expected Result**: HTTP 200 OK with `is_valid: false` and item error `Requested quantity exceeds available stock`.
