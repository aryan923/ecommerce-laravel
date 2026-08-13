# Regression Strategy: Returns & Refunds Module

**Module Name:** Returns & Refunds  
**Module ID:** 19  
**Regression File:** `plans/regression.returns-refunds.md`  
**Specification:** `specifications/feature.returns-refunds.spec.md`  
**Plan:** `plans/plan.returns-refunds.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Returns & Refunds Module impacts:
- **Module 16 Checkout & Order Creation**: Reading order line item snapshots and total amounts.
- **Module 17 Payment Module**: Updating payment status (`refunded` / `partially_refunded`) and gateway transaction logs.
- **Module 18 Order Management (Customer)**: Displaying return request history on customer order views.
- **Module 09 Inventory Management**: Restocking returned goods back into `inventories` available stock with `return` transaction records.

---

## 2. Regression Scenarios

### REG-RET-001: Financial Audit Record Immutability
- **Scenario**: Verify that refund records (`refunds`) and transaction histories are never deleted or truncated, preserving accounting auditability.
- **Priority**: Critical
- **Expected Result**: 100% database persistence for financial records.

### REG-RET-002: Restocking Quantity Accuracy
- **Scenario**: Verify that restocking a returned item updates `inventories.available_qty` and `stock_qty` accurately without double-counting or corrupting reserved quantities.
- **Priority**: Critical
- **Expected Result**: Inventory numbers match physical stock additions.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/ReturnRefundTest.php` to verify all return and refund tests.
2. Run `php vendor/bin/phpunit tests/Feature/PaymentTest.php` to verify payment integration.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
