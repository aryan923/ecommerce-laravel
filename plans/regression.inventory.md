# Regression Strategy: Inventory Management Module

**Module Name:** Inventory Management  
**Module ID:** 09  
**Regression File:** `plans/regression.inventory.md`  
**Specification:** `specifications/feature.inventory.spec.md`  
**Plan:** `plans/plan.inventory.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / DB Transactions & Pessimistic Locking / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Inventory Management impacts multiple core storefront and administrative capabilities:
- Module 06 Product Catalog (Product stock status display, out-of-stock badges)
- Module 07 Product Variants (Per-variant SKU stock link)
- Module 10 Cart & Checkout (Atomic stock validation & reservation before payment)
- Module 11 Order Management (Stock deduction on shipment, stock release on order cancellation)
- Module 12 Return & Refund Management (Returned stock restoration)
- Module 16 Reports & Analytics (Inventory valuation & turnover reports)

---

## 2. Regression Scenarios

### REG-INV-001: Atomic Stock Reservation Concurrency Protection
- **Scenario**: Verify that concurrent order placement requests for the last remaining stock unit lock the target `inventories` row using `lockForUpdate()`, allowing exactly one reservation to succeed while rejecting subsequent attempts with HTTP 422 Insufficient Stock.
- **Priority**: Critical
- **Expected Result**: Single successful reservation; zero overselling.

### REG-INV-002: Immutable Audit Log Transaction Audit Trail
- **Scenario**: Verify that every stock movement (`add`, `deduct`, `reserve`, `release`, `commit`) records an immutable transaction row in `inventory_transactions` capturing exact `previous_qty`, `quantity_change`, `new_qty`, `transaction_type`, and `admin_id`.
- **Priority**: High
- **Expected Result**: Full mathematical audit trail consistency across all inventory items.

### REG-INV-003: Auto-Initialization of Inventory on Variant Creation
- **Scenario**: Verify that creating a new `ProductVariant` automatically initializes a corresponding `inventories` record with `available_qty = 0` and default threshold.
- **Priority**: High
- **Expected Result**: 1:1 `ProductVariant` to `Inventory` mapping maintained automatically.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all existing application test suites pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=InventoryTest`.
4. Perform end-to-end API verification: Create Variant → Initialize Stock → Manual Stock Addition → Reserve Stock → Release Stock → Verify Transaction History & Dashboard Metrics.
