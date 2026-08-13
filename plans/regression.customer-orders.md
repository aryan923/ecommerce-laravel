# Regression Strategy: Customer Order Management Module

**Module Name:** Order Management (Customer)  
**Module ID:** 18  
**Regression File:** `plans/regression.customer-orders.md`  
**Specification:** `specifications/feature.customer-orders.spec.md`  
**Plan:** `plans/plan.customer-orders.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Customer Order Management impacts:
- **Module 16 Checkout & Order Creation**: Reading order details created during checkout.
- **Module 17 Payment Module**: Reflecting payment status changes (`pending_payment` $\rightarrow$ `paid`) in customer order views and history timeline.
- **Module 09 Inventory Management**: Releasing stock (`InventoryService::releaseStock()`) on order cancellation.
- **Module 15 Shipping Module**: Rendering shipment courier AWB, tracking numbers, and progress timeline.

---

## 2. Regression Scenarios

### REG-ORD-001: Historical Item Snapshot Isolation
- **Scenario**: Verify that viewing order details (`GET /api/v1/customer/orders/{order_number}`) maintains original product title, SKU, and unit price even if products are updated/deleted in the catalog.
- **Priority**: Critical
- **Expected Result**: Line item snapshots remain 100% accurate to the purchase state.

### REG-ORD-002: Inventory Stock Release Consistency on Cancellation
- **Scenario**: Verify that cancelling an order in `confirmed` state correctly returns reserved inventory to available stock without creating inventory transaction discrepancies.
- **Priority**: Critical
- **Expected Result**: Stock totals and `inventory_transactions` logs remain balanced and accurate.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/CustomerOrderTest.php` to verify all customer order tests.
2. Run `php vendor/bin/phpunit tests/Feature/CheckoutTest.php` to verify checkout integration.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
