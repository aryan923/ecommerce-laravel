# Test Cases: Inventory Management Module

**Module Name:** Inventory Management  
**Module ID:** 09  
**Test File:** `plans/test-cases.inventory.md`  
**Specification:** `specifications/feature.inventory.spec.md`  
**Plan:** `plans/plan.inventory.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / DB Transactions & Pessimistic Locking / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-INV-001: Manual Stock Addition Success & Audit Log Creation
- **Preconditions**: Authenticated admin with `inventory.adjust` permission, existing variant SKU "TSHIRT-BLK-M" with available stock 10.
- **Input**: `POST /api/v1/admin/inventory/adjust` with `product_variant_id: 1`, `adjustment_type: "add"`, `quantity: 50`, `remarks: "Stock replenishment shipment #402"`.
- **Expected Result**: HTTP 200 OK, `inventories.available_qty` updated from 10 to 60, new record inserted in `inventory_transactions` with `previous_qty: 10`, `quantity_change: 50`, `new_qty: 60`, `transaction_type: "manual_addition"`, and `admin_id`.

### TC-INV-002: Atomic Stock Reservation Success
- **Preconditions**: Available stock for variant ID 1 is 50.
- **Input**: `POST /api/v1/admin/inventory/reserve` with `product_variant_id: 1`, `quantity: 5`, `reference_id: 101` (order ID).
- **Expected Result**: HTTP 200 OK, `available_qty` drops from 50 to 45, `reserved_qty` increases from 0 to 5, transaction created with `transaction_type: "order_reservation"`.

### TC-INV-003: Atomic Stock Release Success
- **Preconditions**: Variant ID 1 has `available_qty: 45`, `reserved_qty: 5`.
- **Input**: `POST /api/v1/admin/inventory/release` with `product_variant_id: 1`, `quantity: 5`, `reference_id: 101`.
- **Expected Result**: HTTP 200 OK, `available_qty` restored from 45 to 50, `reserved_qty` decreased from 5 to 0, transaction created with `transaction_type: "order_cancellation"`.

### TC-INV-004: Stock Commitment / Order Shipment Success
- **Preconditions**: Variant ID 1 has `available_qty: 45`, `reserved_qty: 5`, `committed_qty: 0`.
- **Input**: `POST /api/v1/admin/inventory/commit` with `product_variant_id: 1`, `quantity: 5`, `reference_id: 101`.
- **Expected Result**: HTTP 200 OK, `reserved_qty` drops to 0, `committed_qty` increases to 5, transaction created with `transaction_type: "order_shipment"`.

### TC-INV-005: Low Stock & Out of Stock Alerts Fetch
- **Preconditions**: Variant A has `available_qty: 2`, `low_stock_threshold: 5`. Variant B has `available_qty: 0`.
- **Input**: `GET /api/v1/admin/inventory/alerts`.
- **Expected Result**: HTTP 200 OK, returns list containing both Variant A (low stock) and Variant B (out of stock).

### TC-INV-006: Inventory Dashboard Metrics Fetch
- **Input**: `GET /api/v1/admin/inventory/dashboard`.
- **Expected Result**: HTTP 200 OK, returns JSON containing `total_skus`, `total_stock_units`, `low_stock_count`, `out_of_stock_count`, `reserved_stock_count`.

---

## 2. Negative Test Scenarios

### TC-INV-007: Insufficient Stock Reservation Failure
- **Preconditions**: Available stock for variant ID 1 is 3.
- **Input**: `POST /api/v1/admin/inventory/reserve` with `product_variant_id: 1`, `quantity: 10`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Insufficient stock available for reservation."

### TC-INV-008: Deducting Stock Below Zero Validation Error
- **Preconditions**: Available stock for variant ID 1 is 5.
- **Input**: `POST /api/v1/admin/inventory/adjust` with `adjustment_type: "deduct"`, `quantity: 10`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Stock cannot be reduced below zero."

### TC-INV-009: Missing Mandatory Remarks on Manual Adjustment
- **Input**: `POST /api/v1/admin/inventory/adjust` with `adjustment_type: "add"`, `quantity: 10`, `remarks: ""`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `remarks`.

### TC-INV-010: Unauthorized Stock Adjustment Attempt
- **Preconditions**: User without `inventory.adjust` permission.
- **Input**: `POST /api/v1/admin/inventory/adjust`.
- **Expected Result**: HTTP 403 Forbidden.
