# Test Cases: Coupons & Discounts Module

**Module Name:** Coupons & Discounts  
**Module ID:** 13  
**Test File:** `plans/test-cases.coupons.md`  
**Specification:** `specifications/feature.coupons.spec.md`  
**Plan:** `plans/plan.coupons.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-CPN-001: Admin Create Percentage Coupon
- **Preconditions**: Authenticated Admin with `manage-coupons` permission.
- **Input**: `POST /api/v1/admin/coupons` with payload:
  `code: "SAVE20", name: "20% Off Sale", type: "percentage", value: 20.00, max_discount: 500.00, min_order_value: 1000.00`.
- **Expected Result**: HTTP 201 Created, code stored as `"SAVE20"`, `status: "active"`.

### TC-CPN-002: Admin Create Fixed Amount Coupon
- **Input**: `POST /api/v1/admin/coupons` with payload:
  `code: "FLAT100", name: "Flat 100 Off", type: "fixed_amount", value: 100.00, min_order_value: 500.00`.
- **Expected Result**: HTTP 201 Created.

### TC-CPN-003: Admin Create Free Shipping Coupon
- **Input**: `POST /api/v1/admin/coupons` with payload:
  `code: "FREESHIP", name: "Free Delivery", type: "free_shipping", free_shipping: true`.
- **Expected Result**: HTTP 201 Created.

### TC-CPN-004: Validate Percentage Coupon Calculation
- **Preconditions**: Coupon `"SAVE20"` (20% off, max 500). Cart subtotal: 2000.00.
- **Input**: `POST /api/v1/coupons/validate` with payload `code: "SAVE20", subtotal: 2000.00`.
- **Expected Result**: HTTP 200 OK, `is_valid: true`, `discount_amount: 400.00`.

### TC-CPN-005: Validate Percentage Coupon Maximum Cap
- **Preconditions**: Coupon `"SAVE20"` (20% off, max 500). Cart subtotal: 4000.00 (20% of 4000 = 800, but capped at 500).
- **Input**: `POST /api/v1/coupons/validate` with payload `code: "SAVE20", subtotal: 4000.00`.
- **Expected Result**: HTTP 200 OK, `is_valid: true`, `discount_amount: 500.00`.

### TC-CPN-006: Admin Toggle Coupon Status
- **Input**: `PATCH /api/v1/admin/coupons/1/status` with `status: "inactive"`.
- **Expected Result**: HTTP 200 OK, coupon status updated to `"inactive"`.

### TC-CPN-007: Admin View Coupon Performance Report
- **Input**: `GET /api/v1/admin/coupons/1/reports`.
- **Expected Result**: HTTP 200 OK, returns `total_uses`, `total_discount`, `orders_generated`, `revenue_generated`, `remaining_usage`.

---

## 2. Negative & Edge Case Scenarios

### TC-CPN-008: Apply Expired Coupon Failure
- **Preconditions**: Coupon `"EXPIRED"` had `end_date: 2026-01-01`.
- **Input**: `POST /api/v1/coupons/validate` with code `"EXPIRED"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, `is_valid: false`, message "Coupon has expired".

### TC-CPN-009: Apply Coupon Below Minimum Order Subtotal Failure
- **Preconditions**: Coupon `"MIN500"` requires `min_order_value: 500.00`. Cart subtotal is 300.00.
- **Input**: `POST /api/v1/coupons/validate` with code `"MIN500", subtotal: 300.00`.
- **Expected Result**: HTTP 422 Unprocessable Entity, message "Minimum order subtotal of 500.00 required".

### TC-CPN-010: Exceed Global Usage Limit Failure
- **Preconditions**: Coupon `"LIMITED"` has `usage_limit: 5` and 5 usages already recorded.
- **Input**: `POST /api/v1/coupons/validate` with code `"LIMITED"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, message "Coupon usage limit reached".

### TC-CPN-011: Exceed Per-Customer Limit Failure
- **Preconditions**: Coupon `"ONCEPERUSER"` has `per_customer_limit: 1`. Authenticated Customer has 1 usage.
- **Input**: `POST /api/v1/coupons/validate` with Bearer Token and code `"ONCEPERUSER"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, message "Per-customer usage limit reached".

### TC-CPN-012: First Order Only Coupon Violation
- **Preconditions**: Coupon `"WELCOME"` has `is_first_order_only: true`. Customer already has 1 past order.
- **Input**: `POST /api/v1/coupons/validate` with Bearer Token and code `"WELCOME"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, message "Coupon is valid for first orders only".

### TC-CPN-013: Product Restriction Filtering
- **Preconditions**: Coupon `"SHIRTSONLY"` restricted to Product ID 1. Cart has Product 1 (100.00) and Product 2 (200.00).
- **Input**: `POST /api/v1/coupons/validate` with items `[{product_id: 1, total: 100}, {product_id: 2, total: 200}]`.
- **Expected Result**: Discount calculated ONLY against Product 1 subtotal (100.00).
