# Regression Strategy: Admin Dashboard Module

**Module Name:** Admin Dashboard  
**Module ID:** 22  
**Regression File:** `plans/regression.admin-dashboard.md`  
**Specification:** `specifications/feature.admin-dashboard.spec.md`  
**Plan:** `plans/plan.admin-dashboard.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Admin Dashboard Module impacts:
- **Module 16 Checkout & Order Creation**: Aggregating sales revenue and order counts.
- **Module 17 Payment Module**: Reading captured payment amounts for revenue totals.
- **Module 18 Customer Order Management**: Categorizing order status distribution.
- **Module 19 Returns & Refunds**: Counting pending return and refund requests.
- **Module 09 Inventory Management**: Monitoring low stock inventory thresholds.

---

## 2. Regression Scenarios

### REG-DASH-001: Revenue Aggregation Precision
- **Scenario**: Verify that revenue calculations exclude cancelled or unpaid orders and accurately sum captured payment totals.
- **Priority**: Critical
- **Expected Result**: 100% financial accuracy for revenue totals.

### REG-DASH-002: Query Performance Isolation
- **Scenario**: Verify that dashboard query aggregations do not lock active database tables or block concurrent checkout/order operations.
- **Priority**: Critical
- **Expected Result**: Non-blocking read operations across all dashboard endpoints.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/AdminDashboardTest.php` to verify all dashboard tests.
2. Run `php vendor/bin/phpunit tests/Feature/CheckoutTest.php` to verify checkout data integration.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
