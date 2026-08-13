# Implementation Plan: Module 17 — Payment Module

**Module Name:** Payment Module  
**Module ID:** 17  
**Plan File:** `plans/plan.payment.md`  
**Specification File:** `specifications/feature.payment.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 17 (Payment Module) to provide a gateway-independent payment processing engine. This includes database migrations for `payment_webhooks` and updates to `payments` table; Eloquent models (`Payment`, `PaymentWebhook`); driver abstraction (`PaymentGatewayInterface`, `RazorpayDriver`, `StripeDriver`, `CodDriver`); core business service (`PaymentService`); controllers for customer payments, webhooks, and admin payment management; OpenAPI 3.0 annotations; and automated feature tests.

---

## 2. User Review Required

> [!NOTE]
> - Payment architecture uses the Strategy / Driver Pattern (`PaymentGatewayInterface`) allowing easy extension for future gateways.
> - Supported payment drivers: `razorpay`, `stripe`, `cod`.
> - Webhooks (`POST /api/v1/webhooks/payment/{gateway}`) enforce cryptographic signature verification and idempotent processing via `payment_webhooks` table (`event_id` deduplication).
> - Successful payment capture automatically synchronizes order status to `paid` or `confirmed` and logs an event in `order_histories`.

---

## 3. Open Questions

*None at this time. SRS specifications (§30–§34, §95) and Module Roadmap fully define payment initiation, verification, webhooks, COD caps, and admin management.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000034_update_payments_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000034_update_payments_table.php) — Migration to add missing `gateway`, `gateway_order_id`, `failure_reason`, and `paid_at` fields to `payments`.
- **[NEW]** [`database/migrations/2026_08_11_000035_create_payment_webhooks_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000035_create_payment_webhooks_table.php) — Migration for `payment_webhooks` table.

### Model Layer
- **[MODIFY]** [`app/Models/Payment.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Payment.php) — Enhance Eloquent model with casts, relations to `Order`, and payment status helper methods.
- **[NEW]** [`app/Models/PaymentWebhook.php`](file:///d:/Projects/ecommerce_laravel/app/Models/PaymentWebhook.php) — Eloquent model for webhook event logging.

### Driver & Service Layer
- **[NEW]** [`app/Services/Payment/PaymentGatewayInterface.php`](file:///d:/Projects/ecommerce_laravel/app/Services/Payment/PaymentGatewayInterface.php) — Interface for gateway drivers (`initiate`, `verify`, `handleWebhook`).
- **[NEW]** [`app/Services/Payment/Drivers/RazorpayDriver.php`](file:///d:/Projects/ecommerce_laravel/app/Services/Payment/Drivers/RazorpayDriver.php) — Razorpay API integration & HMAC-SHA256 signature verification.
- **[NEW]** [`app/Services/Payment/Drivers/StripeDriver.php`](file:///d:/Projects/ecommerce_laravel/app/Services/Payment/Drivers/StripeDriver.php) — Stripe PaymentIntent integration & signature verification.
- **[NEW]** [`app/Services/Payment/Drivers/CodDriver.php`](file:///d:/Projects/ecommerce_laravel/app/Services/Payment/Drivers/CodDriver.php) — Cash on Delivery validation & order confirmation engine.
- **[NEW]** [`app/Services/Payment/PaymentService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/Payment/PaymentService.php) — Central service managing gateway resolution, initiation, verification, status sync with `orders`, and idempotent webhook logging.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Payment/InitiatePaymentRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Payment/InitiatePaymentRequest.php)
- **[NEW]** [`app/Http/Requests/Payment/VerifyPaymentRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Payment/VerifyPaymentRequest.php)

### Controller & Middleware Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/PaymentController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/PaymentController.php) — Customer payment methods, initiation, and verification endpoints with OpenAPI 3.0 annotations.
- **[NEW]** [`app/Http/Controllers/Api/V1/WebhookController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/WebhookController.php) — Public webhook receiver for Razorpay / Stripe events.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/PaymentAdminController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/PaymentAdminController.php) — Admin payment transaction listing, details, and manual mark-paid.

### Routes Layer
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register `/v1/payments/*`, `/v1/webhooks/payment/{gateway}`, and `/v1/admin/payments/*` routes.

### Test Layer
- **[NEW]** [`tests/Feature/PaymentTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/PaymentTest.php) — Comprehensive test suite covering initiation, signature verification, COD cap, idempotent webhooks, and admin actions.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000034_update_payments_table.php`
  - Path: `database/migrations/2026_08_11_000035_create_payment_webhooks_table.php`
  - Description: Create migrations for `payments` updates and `payment_webhooks`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models**
  - Path: `app/Models/Payment.php`
  - Path: `app/Models/PaymentWebhook.php`
  - Description: Update `Payment` model and implement `PaymentWebhook` model with fillables, casts, and relations.

- [x] **Task 3: Implement Gateway Driver Architecture**
  - Path: `app/Services/Payment/PaymentGatewayInterface.php`
  - Path: `app/Services/Payment/Drivers/RazorpayDriver.php`
  - Path: `app/Services/Payment/Drivers/StripeDriver.php`
  - Path: `app/Services/Payment/Drivers/CodDriver.php`
  - Description: Implement strategy interface and concrete driver implementations.

- [x] **Task 4: Implement Central PaymentService**
  - Path: `app/Services/Payment/PaymentService.php`
  - Description: Implement initiation, HMAC signature verification, order status synchronization (`pending_payment` $\rightarrow$ `paid`), and idempotent webhook handler.

- [x] **Task 5: Implement Form Requests & Controllers**
  - Path: `app/Http/Requests/Payment/InitiatePaymentRequest.php`
  - Path: `app/Http/Requests/Payment/VerifyPaymentRequest.php`
  - Path: `app/Http/Controllers/Api/V1/Customer/PaymentController.php`
  - Path: `app/Http/Controllers/Api/V1/WebhookController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/PaymentAdminController.php`
  - Description: Build controllers with OpenAPI annotations using `BaseController` and `ApiResponseTrait`.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Add routes under `/api/v1/payments`, `/api/v1/webhooks`, and `/api/v1/admin/payments`.

- [x] **Task 7: Generate Swagger Docs**
  - Command: `php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 8: Feature Testing**
  - Path: `tests/Feature/PaymentTest.php`
  - Command: `php vendor/bin/phpunit tests/Feature/PaymentTest.php`
  - Description: Verify payment initiation, callback verification, COD limit validation, idempotent webhooks, and admin actions.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `php vendor/bin/phpunit tests/Feature/PaymentTest.php`
2. Full Suite Test:
   `php vendor/bin/phpunit`

### Manual Verification
1. Verify `GET /api/v1/payments/methods` lists available gateways.
2. Verify `POST /api/v1/payments/initiate` produces gateway orders.
3. Verify `POST /api/v1/webhooks/payment/razorpay` processes duplicate event IDs idempotently without double-capturing payments.
