# Regression Testing Strategy: Module 34 — Admin Reports & Exports

## 1. Regression Scope & Risk Assessment
**Module Name**: Module 34 — Admin Reports & Exports  
**Impact Radius**:
- Order Management & Sales Transactions (`orders`, `order_items`, `order_statuses`)
- Product Catalog & Inventory Levels (`products`, `categories`, `inventory_logs`)
- Customer Accounts & Analytics (`users`)
- Tax Configuration & Calculations (`taxes`)
- Admin Notifications (`notification_logs`)

---

## 2. Regression Protection Checklist

- [ ] **Order Aggregations**: Ensure order total calculations in Sales and Order reports do not modify actual database order records.
- [ ] **Inventory Counts**: Ensure stock valuation calculations use read-only queries and do not alter stock levels.
- [ ] **Customer Privacy**: Ensure customer reports mask or summarize sensitive credentials.
- [ ] **Existing Feature Suite Test Run**:
  - `docker exec ecom-panel-app php artisan test`
  - `npx playwright test`
