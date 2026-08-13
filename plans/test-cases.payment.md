# Test Cases: Payment Module

**Module Name:** Payment Module  
**Module ID:** 17  
**Test File:** `plans/test-cases.payment.md`  
**Specification:** `specifications/feature.payment.spec.md`  
**Plan:** `plans/plan.payment.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-PAY-001: List Payment Methods with COD Verification
- **Preconditions**: COD configured with `max_cod_amount = 10000.00`. Order subtotal is 2500.00.
- **Input**: `GET /api/v1/payments/methods?amount=2500.00&postal_code=400001`
- **Expected Result**: HTTP 200 OK, returns list of active methods (`razorpay`, `stripe`, `cod`), with `cod.available = true`.

### TC-PAY-002: Initiate Razorpay Payment
- **Preconditions**: Order `ORD-20260812-1001` exists with `status = 'pending_payment'`, grand total 1500.00.
- **Input**: `POST /api/v1/payments/initiate` with payload `{"order_id": 1, "payment_method": "razorpay"}`
- **Expected Result**: HTTP 200 OK, returns `gateway_order_id`, `amount: 1500.00`, `currency: "INR"`, updates `payments` record to `status = 'initiated'`.

### TC-PAY-003: Verify Razorpay Payment Callback with Valid Signature
- **Preconditions**: Payment initiated for order 1. Gateway returns valid `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
- **Input**: `POST /api/v1/payments/verify` with valid signature payload.
- **Expected Result**: HTTP 200 OK, `payments.status` transitions to `captured`, `orders.status` transitions to `paid`, timeline event recorded in `order_histories`.

### TC-PAY-004: Process Razorpay Webhook Event Idempotently
- **Preconditions**: Gateway posts `payment.captured` webhook event with header `X-Razorpay-Signature` and `event_id: "evt_test_001"`.
- **Input**: `POST /api/v1/webhooks/payment/razorpay` (First Call).
- **Expected Result**: HTTP 200 OK, `payment_webhooks` record created with `processing_status = 'processed'`, `payments.status` updated to `captured`, `orders.status` updated to `paid`.
- **Action**: Repeat identical request `POST /api/v1/webhooks/payment/razorpay` with `event_id: "evt_test_001"` (Second Call).
- **Expected Result**: HTTP 200 OK, webhook recognized as already processed, skips duplicate execution without throwing errors or creating duplicate transactions.

### TC-PAY-005: Admin Manual Mark-Paid for COD Order
- **Preconditions**: COD order placed with `payments.status = 'pending'`, `orders.status = 'confirmed'`. Admin authenticated with `manage-payments` permission.
- **Input**: `POST /api/v1/admin/payments/1/mark-paid` with `{"transaction_id": "COD-CASH-999"}`
- **Expected Result**: HTTP 200 OK, `payments.status` updated to `captured`, `paid_at` timestamp set, `orders.status` updated to `paid`.

---

## 2. Negative & Edge Case Scenarios

### TC-PAY-006: Verify Payment with Invalid Signature Fails
- **Preconditions**: Order 1 payment initiated.
- **Input**: `POST /api/v1/payments/verify` with tampered `razorpay_signature`.
- **Expected Result**: HTTP 400 Bad Request / 422 Unprocessable Entity, error message "Invalid payment signature", `payments.status` set to `failed`.

### TC-PAY-007: COD Initiation Fails When Order Value Exceeds Cap
- **Preconditions**: `max_cod_amount = 5000.00`. Order grand total is 7500.00.
- **Input**: `POST /api/v1/payments/initiate` with `{"order_id": 1, "payment_method": "cod"}`
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Order amount exceeds maximum allowed limit for Cash on Delivery."

### TC-PAY-008: Webhook Rejection on Missing/Invalid Gateway Signature
- **Input**: `POST /api/v1/webhooks/payment/razorpay` with missing signature header.
- **Expected Result**: HTTP 401 Unauthorized / 400 Bad Request, webhook payload ignored.

### TC-PAY-009: Prevent Re-initiating Payment for Already Paid Order
- **Preconditions**: Order 1 has `orders.status = 'paid'`.
- **Input**: `POST /api/v1/payments/initiate` with `{"order_id": 1, "payment_method": "razorpay"}`
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Order has already been paid."
