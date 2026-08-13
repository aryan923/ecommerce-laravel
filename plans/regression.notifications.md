# Regression Strategy: Notifications System Module

**Module Name:** Notifications System  
**Module ID:** 21  
**Regression File:** `plans/regression.notifications.md`  
**Specification:** `specifications/feature.notifications.spec.md`  
**Plan:** `plans/plan.notifications.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Notifications System Module impacts:
- **Module 16 Checkout & Order Creation**: Triggering `order_placed` notifications asynchronously.
- **Module 17 Payment Module**: Triggering `payment_success` and `payment_failed` notifications.
- **Module 18 Order Management**: Triggering `order_shipped` and `order_delivered` notifications.
- **Module 19 Returns & Refunds**: Triggering `return_approved` and `refund_completed` notifications.
- **Module 09 Inventory Management**: Triggering `low_stock` notifications.

---

## 2. Regression Scenarios

### REG-NOT-001: Async Non-Blocking Execution
- **Scenario**: Verify that notification dispatch failures (e.g. invalid recipient or mail server timeout) do NOT crash primary business transactions (checkout, payment, order cancellation).
- **Priority**: Critical
- **Expected Result**: Primary business flows succeed 100%; notification failure logged in `notification_logs`.

### REG-NOT-002: In-App User Isolation
- **Scenario**: Verify that customer in-app notifications (`GET /api/v1/customer/notifications`) expose strictly the authenticated customer's notifications.
- **Priority**: Critical
- **Expected Result**: No cross-tenant notification exposure.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/NotificationTest.php` to verify all notification tests.
2. Run `php vendor/bin/phpunit tests/Feature/CheckoutTest.php` to verify checkout integration.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
