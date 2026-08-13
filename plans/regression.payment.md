# Regression Strategy: Payment Module

**Module Name:** Payment Module  
**Module ID:** 17  
**Regression File:** `plans/regression.payment.md`  
**Specification:** `specifications/feature.payment.spec.md`  
**Plan:** `plans/plan.payment.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Payment Module impacts:
- **Module 16 Checkout & Order Creation**: Creation of initial `payments` record, transition of order status (`pending_payment` $\rightarrow$ `paid` / `confirmed`).
- **Module 18 Order Management (Customer)**: Order tracking status updates and payment history visibility.
- **Module 09 Inventory Management**: Inventory reservation commitment vs release on payment failure.
- **Module 21 Notifications System**: Dispatching `OrderPaid` and `PaymentFailed` notification triggers.

---

## 2. Regression Scenarios

### REG-PAY-001: Order Status Synchronization Consistency
- **Scenario**: Verify that when a payment is marked `captured` (via callback, webhook, or admin action), `orders.status` is consistently updated without corrupting order totals, items, or inventory.
- **Priority**: Critical
- **Expected Result**: Order status moves cleanly to `paid` or `confirmed`, and history timeline entry is appended.

### REG-PAY-002: Webhook Duplicate Event Protection
- **Scenario**: Simulate multiple concurrent webhook requests for the same event ID (`evt_concurrent_123`).
- **Priority**: Critical
- **Expected Result**: Exactly one request processes the state transition; concurrent retries hit the idempotency check and return 200 OK without race conditions.

### REG-PAY-003: Inventory Release on Payment Failure / Abandonment
- **Scenario**: Verify that if a payment transitions to `failed` or expires without capture, inventory reservation can be safely released or flagged for cancellation.
- **Priority**: High
- **Expected Result**: Stock numbers remain accurate.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/PaymentTest.php` to verify all payment tests.
2. Run `php vendor/bin/phpunit tests/Feature/CheckoutTest.php` to verify no regression in checkout integration.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
