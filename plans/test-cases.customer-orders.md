# Test Cases: Customer Order Management Module

**Module Name:** Order Management (Customer)  
**Module ID:** 18  
**Test File:** `plans/test-cases.customer-orders.md`  
**Specification:** `specifications/feature.customer-orders.spec.md`  
**Plan:** `plans/plan.customer-orders.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-ORD-001: Customer Order Listing Scoped to Authenticated User
- **Preconditions**: User 1 has 3 orders. User 2 has 2 orders. User 1 authenticated.
- **Input**: `GET /api/v1/customer/orders`
- **Expected Result**: HTTP 200 OK, returns paginated array of 3 orders belonging exclusively to User 1.

### TC-ORD-002: Customer Filter Order List by Status
- **Preconditions**: Customer has orders with statuses `pending_payment`, `paid`, `cancelled`.
- **Input**: `GET /api/v1/customer/orders?status=paid`
- **Expected Result**: HTTP 200 OK, returns array containing only orders with `status = 'paid'`.

### TC-ORD-003: Customer Fetch Order Detail with Item Snapshots & History
- **Preconditions**: Customer order `ORD-20260813-1001` exists with items and history timeline logs.
- **Input**: `GET /api/v1/customer/orders/ORD-20260813-1001`
- **Expected Result**: HTTP 200 OK, returns full order details including line item snapshots, shipping address, payment status, and history timeline.

### TC-ORD-004: Customer Order Tracking Timeline Step Progress
- **Preconditions**: Order `ORD-20260813-1001` has status `shipped` with a shipment record.
- **Input**: `GET /api/v1/customer/orders/ORD-20260813-1001/tracking`
- **Expected Result**: HTTP 200 OK, returns progress step index (e.g. step 5 `Shipped`), courier name, AWB/tracking number, and historical tracking events.

### TC-ORD-005: Customer Cancel Eligible Order and Release Stock
- **Preconditions**: Order `ORD-20260813-1001` has status `confirmed` with reserved variant stock (`reserved_qty = 2`).
- **Input**: `POST /api/v1/customer/orders/ORD-20260813-1001/cancel` with payload `{"reason": "changed_mind", "comments": "No longer needed"}`
- **Expected Result**: HTTP 200 OK, `orders.status` transitions to `cancelled`, reserved inventory released (`reserved_qty` decremented/restored), timeline event logged in `order_histories`.

---

## 2. Negative & Edge Case Scenarios

### TC-ORD-006: Customer Accessing Another User's Order Returns 404
- **Preconditions**: Order `ORD-20260813-9999` belongs to User 2. User 1 authenticated.
- **Input**: `GET /api/v1/customer/orders/ORD-20260813-9999`
- **Expected Result**: HTTP 404 Not Found, error message "Order not found or unauthorized access."

### TC-ORD-007: Cancel Shipped Order Fails
- **Preconditions**: Order `ORD-20260813-1001` has status `shipped`.
- **Input**: `POST /api/v1/customer/orders/ORD-20260813-1001/cancel` with payload `{"reason": "changed_mind"}`
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Orders that are already packed or shipped cannot be cancelled."

### TC-ORD-008: Cancel Already Cancelled Order Fails
- **Preconditions**: Order `ORD-20260813-1001` has status `cancelled`.
- **Input**: `POST /api/v1/customer/orders/ORD-20260813-1001/cancel` with payload `{"reason": "changed_mind"}`
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Order is already cancelled."
