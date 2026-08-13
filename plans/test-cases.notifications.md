# Test Cases: Notifications System Module

**Module Name:** Notifications System  
**Module ID:** 21  
**Test File:** `plans/test-cases.notifications.md`  
**Specification:** `specifications/feature.notifications.spec.md`  
**Plan:** `plans/plan.notifications.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-NOT-001: Admin Create Notification Template with Dynamic Variables
- **Preconditions**: Admin authenticated with `manage-notifications`.
- **Input**: `POST /api/v1/admin/notifications/templates` with payload:
  `{"event": "order_placed", "channel": "email", "subject": "Order Confirmation {{order_number}}", "body": "Hello {{customer_name}}, your order total is {{order_total}}.", "variables": ["customer_name", "order_number", "order_total"]}`
- **Expected Result**: HTTP 201 Created, template saved with status `true`.

### TC-NOT-002: Notification Dispatch Interpolates Variables and Creates Logs
- **Preconditions**: Active template for `order_placed` email exists.
- **Input**: Internal service call or `POST /api/v1/admin/notifications/test-dispatch` with payload:
  `{"event": "order_placed", "recipient": "john@example.com", "data": {"customer_name": "John Doe", "order_number": "ORD-1001", "order_total": "1500.00"}, "channels": ["email"]}`
- **Expected Result**: HTTP 200 OK, `notification_logs` record created with interpolated body "Hello John Doe, your order total is 1500.00." and status `sent`.

### TC-NOT-003: Customer Fetch and Mark In-App Notifications as Read
- **Preconditions**: Customer has an in-app notification in `notification_logs` (`channel = 'in_app'`).
- **Input**: `GET /api/v1/customer/notifications`, then `PATCH /api/v1/customer/notifications/1/read`
- **Expected Result**: `GET` returns list containing in-app notification; `PATCH` returns HTTP 200 OK with `read_at` timestamp set.

---

## 2. Negative & Edge Case Scenarios

### TC-NOT-004: Duplicate Notification Template for Same Event and Channel Fails
- **Preconditions**: Active template for `(event: 'order_placed', channel: 'email')` already exists.
- **Input**: `POST /api/v1/admin/notifications/templates` with `event: 'order_placed', channel: 'email'`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on duplicate template.

### TC-NOT-005: Notification Dispatch Uses Fallback Message when Template Not Configured
- **Preconditions**: No custom template configured for event `low_stock`.
- **Input**: Test dispatch for `low_stock`.
- **Expected Result**: System generates fallback notification message and creates `notification_logs` record without failing.
