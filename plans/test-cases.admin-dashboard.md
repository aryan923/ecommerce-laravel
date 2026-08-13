# Test Cases: Admin Dashboard Module

**Module Name:** Admin Dashboard  
**Module ID:** 22  
**Test File:** `plans/test-cases.admin-dashboard.md`  
**Specification:** `specifications/feature.admin-dashboard.spec.md`  
**Plan:** `plans/plan.admin-dashboard.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-DASH-001: Fetch Admin Dashboard KPI Summary Metrics
- **Preconditions**: Admin authenticated. System has 5 orders, total revenue 5000.00, 2 customers, 1 low stock item.
- **Input**: `GET /api/v1/admin/dashboard/kpis`
- **Expected Result**: HTTP 200 OK, returns KPI JSON containing `total_revenue`, `today_revenue`, `total_orders`, `today_orders`, `total_customers`, `total_products`, `low_stock_count`, `pending_returns`, `pending_refunds`.

### TC-DASH-002: Fetch Sales Chart Data with Date Period Filter
- **Preconditions**: Admin authenticated. Delivered orders exist across last 7 days.
- **Input**: `GET /api/v1/admin/dashboard/sales-chart?period=last_7_days`
- **Expected Result**: HTTP 200 OK, returns time-series array grouped by date with `date`, `total_sales`, and `order_count`.

### TC-DASH-003: Fetch Order Lifecycle Status Count Distribution
- **Preconditions**: Orders exist in statuses `confirmed`, `shipped`, `delivered`, `cancelled`.
- **Input**: `GET /api/v1/admin/dashboard/order-stats`
- **Expected Result**: HTTP 200 OK, returns breakdown of order counts key-indexed by order status string.

### TC-DASH-004: Fetch Top Performing Products and Categories
- **Preconditions**: Product A sold 10 units (1000.00 revenue), Product B sold 2 units (200.00 revenue).
- **Input**: `GET /api/v1/admin/dashboard/top-performers`
- **Expected Result**: HTTP 200 OK, returns array ranking Product A first in top products.

---

## 2. Negative & Edge Case Scenarios

### TC-DASH-005: Unauthenticated Access to Dashboard Fails with 401
- **Preconditions**: No bearer token provided.
- **Input**: `GET /api/v1/admin/dashboard/kpis`
- **Expected Result**: HTTP 401 Unauthorized.

### TC-DASH-006: Sales Chart Handles Empty Date Range Gracefully
- **Preconditions**: No orders exist in selected custom date range.
- **Input**: `GET /api/v1/admin/dashboard/sales-chart?period=custom&start_date=2020-01-01&end_date=2020-01-02`
- **Expected Result**: HTTP 200 OK, returns empty chart data array without server errors.
