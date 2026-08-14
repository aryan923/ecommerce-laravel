# Feature Specification: Module 27 — Admin Order Management

**Module Name:** Admin Order Management  
**Module ID:** 27  
**Specification File:** `specifications/feature.admin-orders.spec.md`  
**Plan File:** `plans/plan.admin-orders.md`  
**Version:** 1.2  
**Status:** In Progress  
**Base SRS References:** `Requirements/srs_apis.md`, `Requirements/admin_panel.md` (§12–§15), `Requirements/development_modules.md` (§Module 27)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview & Zero-Dependency Snapshot Architecture

The Admin Order Management module provides store administrators, order managers, and fulfillment agents with complete oversight of customer orders, multi-filtered order catalog grids, 360-degree order detail inspection, status workflow transitions (`pending_payment` $\rightarrow$ `confirmed` $\rightarrow$ `processing` $\rightarrow$ `shipped` $\rightarrow$ `delivered` / `cancelled`), shipment & courier tracking creation, audit logging, internal staff notes, automated inventory stock restoration upon cancellation, and printable packing slips/invoices.

### Zero-Relation Snapshot Guarantee
To guarantee that invoices, receipts, packing slips, order lists, and historical reports never break or alter when products, prices, taxes, variants, or customers are modified/deleted in the future, every order freezes complete self-contained snapshots:
1. **`order_items.snapshot_data`**: Product title, variant title, SKU, brand name, category name, HSN tax code, featured image URL, unit price, tax rate %, tax name, tax amount, discount amount, line total, and variant attributes array.
2. **`orders.tax_breakdown`**: Complete itemized tax summary (CGST/SGST/IGST rates and amounts).
3. **`orders.store_snapshot`**: Store legal business name, address, tax ID/GSTIN, support email/phone, logo URL.
4. **`orders.customer_snapshot`**: Customer name, email, phone, and user ID at order creation.
5. **`orders.currency_snapshot`**: Currency code, currency symbol, and conversion exchange rate.

---

## 2. Key Database Changes

- Add snapshot columns to `orders` table via migration `2026_08_14_000034_add_admin_notes_and_snapshots_to_orders_table.php`:
  - `admin_notes` (TEXT, nullable)
  - `tax_breakdown` (JSON, nullable)
  - `store_snapshot` (JSON, nullable)
  - `customer_snapshot` (JSON, nullable)
  - `currency_snapshot` (JSON, nullable)

---

## 3. API Endpoints

### 3.1 Admin Order APIs (`/api/v1/admin/orders/*`)
- `GET /api/v1/admin/orders/stats` — Executive order KPIs (total orders, pending_payment, paid, confirmed, processing, shipped, delivered, cancelled, failed, and total active revenue) (`permission:orders.view`)
- `GET /api/v1/admin/orders` — Paginated list of store orders with search (order #, customer name/email/phone, SKU), filters (status, payment_status, payment_method, date_from, date_to, min_amount, max_amount), and sorting (`permission:orders.view`)
- `GET /api/v1/admin/orders/{id}` — Full 360 order details (customer profile link, frozen product snapshots table, pricing calculations, payment gateway transaction, shipping & billing addresses, shipment tracking, audit log timeline, staff notes) (`permission:orders.view`)
- `POST /api/v1/admin/orders/{id}/status` — Status transition action (`confirm`, `mark_processing`, `mark_packed`, `mark_shipped`, `mark_delivered`, `cancel`) with mandatory audit logging in `order_histories` (`permission:orders.update`)
- `POST /api/v1/admin/orders/{id}/shipment` — Create shipment record, assign courier AWB/tracking URL, and transition order status to `shipped` (`permission:orders.update`)
- `POST /api/v1/admin/orders/{id}/notes` — Update internal staff reference notes (`permission:orders.update`)
- `POST /api/v1/admin/orders/{id}/refund` — Trigger order refund workflow (`permission:orders.refund`)

---

## 4. Business Rules & Workflow

1. **Status Transition Flow**:
   - `pending_payment` $\rightarrow$ `paid` / `confirmed` / `cancelled` / `failed`
   - `paid` / `confirmed` $\rightarrow$ `processing` / `cancelled`
   - `processing` $\rightarrow$ `shipped` / `cancelled`
   - `shipped` $\rightarrow$ `delivered` / `returned`
2. **Audit Logging Invariants**:
   - Every status transition creates an immutable entry in `order_histories` containing `order_id`, `user_id` (admin author), `status`, `comment`, and `created_at`.
3. **Inventory Stock Restoration**:
   - When an order is cancelled, the system iterates over all items in `order_items` and restores reserved stock in `inventories` for the corresponding product variants.
4. **Printable Packing Slip & Invoice Generator**:
   - Renders 100% frozen snapshot data (store tax details, customer address, product titles, SKUs, tax breakdowns) formatted for standard A4/Letter printing with zero DB relation dependencies.

---

## 5. Acceptance Criteria

- [ ] Migration `2026_08_14_000034_add_admin_notes_and_snapshots_to_orders_table.php` executed cleanly.
- [ ] `AdminOrderService.php` implements listing, stats, 360 detail queries with snapshot fallback, status transitions, shipment creation, audit logging, and inventory restoration.
- [ ] `OrderAdminController.php` implements all 7 REST endpoints with complete OpenAPI `@OA\*` annotations.
- [ ] Routes registered under `/api/v1/admin/orders/*` protected by Sanctum and Spatie permission middleware.
- [ ] React SPA interface built with responsive KPI cards, search & multi-filter toolbar, order table, 360 detail modal, timeline viewer, staff notes editor, and printable packing slip generator.
- [ ] Production Vite assets build cleanly (`npm run build`).
- [ ] Feature test suite `AdminOrderManagementTest.php` passes 100% green.
