# Test Cases: Checkout & Order Creation Module

**Module Name:** Checkout & Order Creation  
**Module ID:** 16  
**Test File:** `plans/test-cases.checkout.md`  
**Specification:** `specifications/feature.checkout.spec.md`  
**Plan:** `plans/plan.checkout.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-CHK-001: Authenticated Customer Successful Checkout & Order Creation
- **Preconditions**: Authenticated customer with items in cart, valid shipping address (ID 1), shipping method (ID 1), payment method `cod`.
- **Input**: `POST /api/v1/checkout/process` with Bearer Token and payload:
  `shipping_address_id: 1, shipping_method_id: 1, payment_method: "cod"`.
- **Expected Result**: HTTP 201 Created, returns order details with `order_number` matching `ORD-YYYYMMDD-{id}`, `status: "pending_payment"`, `payments` record created, cart cleared.

### TC-CHK-002: Guest Customer Successful Checkout with Inline Address
- **Preconditions**: Guest session ID `guest_session_999` with item in cart.
- **Input**: `POST /api/v1/checkout/process` with header `X-Session-ID: guest_session_999` and payload:
  `guest_name: "Alice Smith", guest_email: "alice@example.com", shipping_address: {address_line1: "123 Main St", city: "Mumbai", state_code: "MH", postal_code: "400001"}, shipping_method_id: 1, payment_method: "cod"`.
- **Expected Result**: HTTP 201 Created, `orders` record created with `user_id = null`, guest email saved, cart cleared.

### TC-CHK-003: Item Snapshot Preservation Check
- **Preconditions**: Product 1 named "Smart Watch" priced 1000.00. Order created. Product 1 later updated to name "Smart Watch V2" and price 2000.00.
- **Input**: `GET /api/v1/orders/{order_number}`.
- **Expected Result**: `order_items` snapshot still contains original title "Smart Watch" and price 1000.00.

### TC-CHK-004: Atomic Stock Reservation Verification
- **Preconditions**: Product Variant 1 has `available_qty = 5`. Customer places order for quantity 2.
- **Input**: `POST /api/v1/checkout/process`.
- **Expected Result**: `inventory` available_qty reduced from 5 to 3 (`reserved_qty` updated according to inventory policy).

### TC-CHK-005: Idempotency Key Duplicate Request Protection
- **Input**: First request `POST /api/v1/checkout/process` with `X-Idempotency-Key: KEY-999-ABC`.
- **Action**: Repeat identical request `POST /api/v1/checkout/process` with `X-Idempotency-Key: KEY-999-ABC`.
- **Expected Result**: Second request returns HTTP 200 OK with the exact order created in the first request, without creating a second order or decrementing stock twice.

---

## 2. Negative & Edge Case Scenarios

### TC-CHK-006: Checkout with Empty Cart Fails
- **Preconditions**: Cart has 0 items.
- **Input**: `POST /api/v1/checkout/process`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Cannot checkout with an empty cart."

### TC-CHK-007: Checkout Out-of-Stock Item Fails & Rolls Back
- **Preconditions**: Item in cart has requested quantity 10, but inventory `available_qty = 2`.
- **Input**: `POST /api/v1/checkout/process`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Requested quantity exceeds available stock", database transaction rolled back, no order or payment created.
