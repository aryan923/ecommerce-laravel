# Test Cases: Module 34 — Admin Reports & Exports

## 1. Test Suite Summary
**Module Name**: Module 34 — Admin Reports & Exports  
**Layer**: Backend REST API & Frontend React SPA  
**Specification Reference**: `specifications/feature.admin-reports.spec.md`  

---

## 2. Test Cases Matrix

| Test ID | Domain | Category | Scenario | Expected Outcome |
|---|---|---|---|---|
| TC-REP-001 | Auth | Security | Unauthenticated request to `/api/v1/admin/reports/sales` | HTTP 401 Unauthorized |
| TC-REP-002 | Sales Report | API | GET `/api/v1/admin/reports/sales` with start_date & end_date | HTTP 200 with gross_sales, discounts, tax, shipping, refunds, net_sales |
| TC-REP-003 | Order Report | API | GET `/api/v1/admin/reports/orders` | HTTP 200 with total_orders, completed, pending, cancelled, returned breakdown |
| TC-REP-004 | Product Report | API | GET `/api/v1/admin/reports/products` with category_id filter | HTTP 200 with units_sold, revenue, stock, rating filtered by category |
| TC-REP-005 | Customer Report | API | GET `/api/v1/admin/reports/customers` | HTTP 200 with new_customers, returning_customers, lifetime_revenue, AOV |
| TC-REP-006 | Inventory Report | API | GET `/api/v1/admin/reports/inventory` | HTTP 200 with stock_valuation, low_stock_count, out_of_stock_count |
| TC-REP-007 | Tax Report | API | GET `/api/v1/admin/reports/tax` | HTTP 200 with taxable_amount, CGST, SGST, IGST, total_tax |
| TC-REP-008 | Export CSV | API / File | POST `/api/v1/admin/reports/export` with format=csv | HTTP 200 with streamed CSV headers and row data |
| TC-REP-009 | Export Queue | Async Queue | Trigger large export job (>1,000 items) | Job queued, HTTP 200, system notification created upon job completion |
| TC-REP-010 | SPA E2E | Playwright | Admin logs in, navigates to Reports page, switches tabs, applies date filter, clicks export CSV | Page title, KPI cards, tables render; export modal opens and triggers download |
