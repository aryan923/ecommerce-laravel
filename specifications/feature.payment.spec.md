# Feature Specification: Payment Module

**Module Name:** Payment Module  
**Module ID:** 17  
**Specification File:** `specifications/feature.payment.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§30–§34, §95), `Requirements/admin_panel.md` (§14–§15), `Requirements/development_modules.md` (§Module 17)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Payment Module provides a flexible, gateway-independent payment integration and verification engine. It establishes a unified `PaymentService` architecture using the Strategy/Driver design pattern (`PaymentGatewayInterface`) to seamlessly handle multiple payment gateways (Razorpay, Stripe, Cash on Delivery, and extensible custom gateways).

The module covers payment initiation, gateway checkout session generation, frontend payment verification/callback handling, secure & idempotent webhook processing (`POST /api/v1/webhooks/payment/{gateway}`), COD rule validation (order value cap, fee, zone restriction), automatic order status synchronization (`pending_payment` $\rightarrow$ `paid`), and admin payment audit & manual reconciliation capabilities.

All API responses strictly adhere to `ApiResponseTrait` standards, outputting JSON on `http://localhost:8002` with OpenAPI 3.0 specifications.

---

## 2. Business Flow

```text
  Customer Initiates Payment
              │
              ▼
  POST /api/v1/payments/initiate
              │
              ├──────────────────────────────────┐
              ▼                                  ▼
      Online Payment Gateway                    Cash On Delivery (COD)
      (Razorpay / Stripe)                        │
              │                                  ▼
              ▼                          Validate COD Rules & Cap
    Create Gateway Order/Intent                  │
              │                                  ▼
              ▼                          Mark Order 'pending_payment'
    Return Gateway Token/ID                     & Payment 'pending'
              │                                  │
    Customer completes payment                   ▼
              │                          (Payment settled on delivery)
      ┌───────┴────────┐
      ▼                ▼
   Verify         Webhook Event
  Callback      (POST /webhooks/payment/{gateway})
      │                │
      └───────┬────────┘
              ▼
    Verify Signature & Log Webhook
              │
              ▼
    Update Payment -> 'captured'
    Update Order   -> 'paid'
```

### 2.1 Payment Initiation Flow (`POST /api/v1/payments/initiate`)
1. Customer or Checkout flow calls `POST /api/v1/payments/initiate` with `order_id` and `payment_method` (`razorpay`, `stripe`, `cod`).
2. `PaymentService` resolves the appropriate gateway driver via `PaymentGatewayFactory`.
3. System verifies order eligibility:
   - Order exists and belongs to authenticated user (or guest session).
   - Order status is `pending_payment`.
   - Payment amount equals `grand_total`.
4. Driver creates external payment session/order:
   - **Razorpay**: Calls Razorpay API to create `order_id` (e.g. `order_M123456789`).
   - **Stripe**: Calls Stripe API to create `PaymentIntent` or Checkout Session (`pi_123456789`).
   - **COD**: Validates COD availability for shipping postal code, verifies order value does not exceed `max_cod_limit`, records pending payment, and confirms order.
5. `payments` record is updated/created with gateway details, transaction reference, and status `initiated` or `pending`.
6. Returns gateway initialization payload (`gateway_order_id`, `key_id`, `amount`, `currency`).

### 2.2 Payment Verification / Callback Flow (`POST /api/v1/payments/verify`)
1. Frontend completes gateway popup/redirect and posts authorization tokens/signatures to `POST /api/v1/payments/verify`.
2. Gateway driver validates cryptographic signature:
   - **Razorpay**: Recomputes HMAC-SHA256 signature over `razorpay_order_id|razorpay_payment_id` using secret key.
   - **Stripe**: Fetches `PaymentIntent` status or verifies client secret.
3. Upon signature match:
   - Updates `payments` status to `captured`, logs `transaction_id` and gateway response.
   - Updates associated `orders` status from `pending_payment` to `paid` or `confirmed`.
   - Records order timeline event (`order_histories`).
4. Upon signature failure or rejected transaction:
   - Updates `payments` status to `failed`, logs failure reason.
   - Returns standardized error response.

### 2.3 Webhook Receiver & Idempotent Processing Flow (`POST /api/v1/webhooks/payment/{gateway}`)
1. Gateway asynchronously sends HTTP POST webhook to `/api/v1/webhooks/payment/{gateway}`.
2. **Signature Authentication**:
   - `WebhookVerificationMiddleware` verifies header signature (e.g., `X-Razorpay-Signature` or `Stripe-Signature`).
   - Rejects invalid requests with HTTP 401/400.
3. **Idempotency Guard**:
   - Checks `payment_webhooks` table for existing `provider` + `event_id`.
   - If `event_id` exists and `processing_status = 'processed'`, immediately returns HTTP 200 OK without re-processing (prevents duplicate capture / status updates).
4. **Event Dispatch & Order Sync**:
   - Logs webhook in `payment_webhooks` table (`processing_status = 'pending'`).
   - Processes event payload (`payment.authorized`, `payment.captured`, `payment.failed`, `charge.succeeded`).
   - Updates `payments` table and syncs `orders` status.
   - Marks `payment_webhooks` as `processed` with `processed_at` timestamp.

### 2.4 Cash on Delivery (COD) Rules Engine Flow
1. Evaluates COD configuration parameters:
   - `cod_enabled` (boolean, global switch).
   - `max_cod_amount` (e.g. ₹10,000 maximum order limit).
   - `cod_fee` (fixed surcharge added to order if configured).
   - `excluded_postal_codes` / `excluded_states` (restricted delivery zones).
2. If order exceeds limit or postal code is restricted, COD option is hidden/rejected.
3. For accepted COD orders: payment status is set to `pending`, and order status moves to `confirmed` for fulfillment. Payment is marked `captured` manually by Admin or delivery integration upon cash collection.

---

## 3. Functional Requirements

- **FR-PAY-001**: System shall implement a gateway-independent `PaymentGatewayInterface` supporting `RazorpayDriver`, `StripeDriver`, and `CodDriver`.
- **FR-PAY-002**: System shall provide active payment methods listing API (`GET /api/v1/payments/methods`) with COD eligibility check based on order value and delivery pin code.
- **FR-PAY-003**: System shall provide payment initiation API (`POST /api/v1/payments/initiate`) generating gateway orders/intents.
- **FR-PAY-004**: System shall provide payment verification API (`POST /api/v1/payments/verify`) to validate frontend payment callbacks via HMAC signature verification.
- **FR-PAY-005**: System shall provide a public webhook endpoint (`POST /api/v1/webhooks/payment/{gateway}`) for asynchronous status updates.
- **FR-PAY-006**: Webhook processing must be cryptographic signature verified, logged in `payment_webhooks`, and strictly idempotent based on provider `event_id`.
- **FR-PAY-007**: System shall automatically synchronize order status to `paid` or `confirmed` when payment status transitions to `captured`.
- **FR-PAY-008**: System shall support Cash on Delivery (COD) rules including maximum order cap (`max_cod_amount`) and zone restrictions.
- **FR-PAY-009**: System shall provide Admin Payment Management APIs (`GET /api/v1/admin/payments`, `GET /api/v1/admin/payments/{id}`) with filtering by status, gateway, and date range.
- **FR-PAY-010**: System shall provide Admin API to manually mark COD/Bank Transfer payments as paid (`POST /api/v1/admin/payments/{id}/mark-paid`).
- **FR-PAY-011**: System shall record all status transitions in `order_histories` timeline.
- **FR-PAY-012**: Every endpoint must include OpenAPI 3.0 (`@OA`) documentation annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Architecture**: Driver/Strategy Pattern (`App\Services\Payment\PaymentGatewayInterface`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table Modification / Migration: `payments`
Migration: `database/migrations/2026_08_11_000034_update_payments_table.php` (adds missing metadata fields to existing payments table if needed).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `order_id` | `foreignId` | FK -> `orders` | Associated Order FK |
| `gateway` | `string` | Index | Gateway provider (`razorpay`, `stripe`, `cod`) |
| `payment_method` | `string` | | Specific method (`card`, `upi`, `netbanking`, `cod`) |
| `transaction_id` | `string` | Nullable, Index | Gateway transaction/payment ID |
| `gateway_order_id` | `string` | Nullable, Index | Gateway order ID / PaymentIntent ID |
| `amount` | `decimal(12,2)` | | Transaction amount |
| `currency` | `string(3)` | Default `'INR'` | Currency code |
| `status` | `enum` | `['initiated', 'pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded', 'partially_refunded']`, Default `'pending'` | Payment status |
| `payload` | `json` | Nullable | Gateway raw response payload |
| `failure_reason` | `string` | Nullable | Reason for payment failure |
| `paid_at` | `timestamp` | Nullable | Payment completion timestamp |
| `timestamps` | `timestamps` | | Timestamps |

### 5.2 Table: `payment_webhooks`
Migration: `database/migrations/2026_08_11_000035_create_payment_webhooks_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `provider` | `string` | Index | Gateway provider (`razorpay`, `stripe`) |
| `event_id` | `string` | Index | Unique webhook event ID from gateway |
| `event_type` | `string` | | Event classification (e.g. `payment.captured`) |
| `payload` | `json` | | Raw webhook payload |
| `processing_status` | `enum` | `['pending', 'processed', 'failed', 'ignored']`, Default `'pending'` | Processing status |
| `attempt_count` | `integer` | Default `1` | Processing attempt counter |
| `processed_at` | `timestamp` | Nullable | Timestamp of completion |
| `error_message` | `text` | Nullable | Exception error details if failed |
| `timestamps` | `timestamps` | | Timestamps |

---

## 6. API Endpoints Specification

### 6.1 Public & Customer Payment Endpoints
- `GET /api/v1/payments/methods` — List active payment gateways & COD availability for postal code.
- `POST /api/v1/payments/initiate` — Create gateway order session (`order_id` / `payment_intent`).
- `POST /api/v1/payments/verify` — Verify gateway payment signature and confirm payment.

### 6.2 Webhook Receiver Endpoint
- `POST /api/v1/webhooks/payment/{gateway}` — Public secure webhook callback handler (signature verified, idempotent).

### 6.3 Admin Payment Endpoints (`auth:sanctum`)
- `GET /api/v1/admin/payments` — Admin payment transaction listing with filters (status, gateway, date).
- `GET /api/v1/admin/payments/{id}` — Admin payment details, transaction logs, and related webhooks.
- `POST /api/v1/admin/payments/{id}/mark-paid` — Admin manual mark as paid for COD/Bank transfer orders.

---

## 7. Validation Rules & Permissions

### 7.1 Form Request: `InitiatePaymentRequest`
- `order_id`: `required|exists:orders,id`
- `payment_method`: `required|string|in:razorpay,stripe,cod`

### 7.2 Form Request: `VerifyPaymentRequest`
- `order_id`: `required|exists:orders,id`
- `payment_method`: `required|string|in:razorpay,stripe`
- `razorpay_payment_id`: `required_if:payment_method,razorpay|string`
- `razorpay_order_id`: `required_if:payment_method,razorpay|string`
- `razorpay_signature`: `required_if:payment_method,razorpay|string`
- `payment_intent_id`: `required_if:payment_method,stripe|string`

### 7.3 Permissions
- Admin endpoints require Sanctum authentication (`auth:sanctum`) and Spatie permission `manage-payments`.

---

## 8. Edge Cases & Error Handling

- **Duplicate Webhook Delivery**: Guarded by `payment_webhooks` unique lookup on `(provider, event_id)`. Subsequent calls return HTTP 200 without duplicate execution.
- **Signature Verification Failure**: Rejects spoofed webhook/callback with HTTP 400/401 and logs warning.
- **Payment Initiated for Paid Order**: Rejects re-initiation if order status is already `paid`.
- **COD Amount Exceeded**: Returns clear validation message if cart grand total exceeds configured `max_cod_amount`.
- **Gateway Timeout / API Failure**: Catches SDK/HTTP exceptions and returns standardized error via `ApiResponseTrait`.

---

## 9. Verification & Acceptance Criteria

1. Database migrations run cleanly without errors.
2. `PaymentGatewayInterface` cleanly resolves Razorpay, Stripe, and COD drivers.
3. `POST /api/v1/payments/initiate` returns valid gateway initialization payloads.
4. `POST /api/v1/payments/verify` correctly validates HMAC signatures and transitions order status to `paid`.
5. Webhook receiver handles invalid signatures with 401/400 and handles duplicate webhooks idempotently.
6. Admin payment APIs list and show transaction histories correctly.
7. Swagger docs build cleanly via `php artisan l5-swagger:generate`.
