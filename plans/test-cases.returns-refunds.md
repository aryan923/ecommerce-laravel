# Test Cases: Returns & Refunds Module

**Module Name:** Returns & Refunds  
**Module ID:** 19  
**Test File:** `plans/test-cases.returns-refunds.md`  
**Specification:** `specifications/feature.returns-refunds.spec.md`  
**Plan:** `plans/plan.returns-refunds.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-RET-001: Customer Submit Return Request for Delivered Order
- **Preconditions**: Customer order `ORD-20260813-1001` has status `delivered` (delivered 2 days ago). Item quantity = 2.
- **Input**: `POST /api/v1/customer/returns` with payload:
  `{"order_id": 1, "reason": "defective", "description": "Item screen flickering", "items": [{"order_item_id": 1, "quantity": 1}]}`
- **Expected Result**: HTTP 201 Created, returns `return_number` formatted as `RET-YYYYMMDD-{id}`, status `requested`, return item record created.

### TC-RET-002: Admin View and Update Return Status to Approved & Quality Check Pass
- **Preconditions**: Return request `RET-20260813-1001` exists with status `requested`. Admin authenticated with `manage-returns` permission.
- **Input**: `POST /api/v1/admin/returns/1/status` with `{"status": "approved", "notes": "Approved for return pickup"}`
- **Expected Result**: HTTP 200 OK, return status updated to `approved`, `approved_at` timestamp set, history timeline logged.

### TC-RET-003: Admin Restock Returned Item into Inventory
- **Preconditions**: Return request 1 is `received` / `quality_check`. Item variant has `available_qty = 10`.
- **Input**: `POST /api/v1/admin/returns/1/restock`
- **Expected Result**: HTTP 200 OK, `InventoryService::adjustStock()` executed with type `'add'`, variant available quantity increases from 10 to 11, `inventory_transactions` logged with type `return`.

### TC-RET-004: Admin Process Full Refund via Payment Gateway / Manual
- **Preconditions**: Return request 1 is `approved_for_refund`. Payment amount = 1000.00. Admin authenticated with `manage-refunds`.
- **Input**: `POST /api/v1/admin/refunds/process` with payload:
  `{"order_id": 1, "return_id": 1, "amount": 1000.00, "gateway": "manual", "reason": "Full customer return refund"}`
- **Expected Result**: HTTP 201 Created, returns `refund_number` formatted as `RFD-YYYYMMDD-{id}`, `payments.status` transitions to `refunded`, `returns.status` transitions to `refunded`.

---

## 2. Negative & Edge Case Scenarios

### TC-RET-005: Return Request Fails for Non-Delivered Order
- **Preconditions**: Customer order has status `shipped` or `confirmed`.
- **Input**: `POST /api/v1/customer/returns`
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Return requests can only be submitted for delivered orders."

### TC-RET-006: Return Request Fails Exceeding 7-Day Return Window
- **Preconditions**: Customer order was delivered 10 days ago (exceeding 7-day policy limit).
- **Input**: `POST /api/v1/customer/returns`
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Return request window (7 days) has expired for this order."

### TC-RET-007: Return Quantity Exceeds Purchased Item Quantity
- **Preconditions**: Customer purchased 1 unit of product item.
- **Input**: `POST /api/v1/customer/returns` with requested quantity 5.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Return quantity cannot exceed purchased item quantity."

### TC-RET-008: Processing Partial Refund Updates Payment Status to Partially Refunded
- **Preconditions**: Total order payment = 1000.00. Admin processes partial refund of 300.00.
- **Input**: `POST /api/v1/admin/refunds/process` with `amount = 300.00`.
- **Expected Result**: HTTP 201 Created, `payments.status` updated to `partially_refunded`.
