# Feature Specification: Module 25 — Multi-Warehouse & Multi-Currency Admin Inventory Management

**Module Name:** Multi-Warehouse & Multi-Currency Admin Inventory Management  
**Module ID:** 25  
**Specification File:** `specifications/feature.admin-inventory.spec.md`  
**Plan File:** `plans/plan.admin-inventory.md`  
**Version:** 3.0 (Enterprise Multi-Warehouse & Multi-Currency Scope)  
**Status:** Implemented & Verified  
**Base SRS References:** `Requirements/srs_apis.md` (§35–§37), `Requirements/admin_panel.md` (§10–§11), `Requirements/development_modules.md` (§Module 09 & §Module 25)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Inventory Management module provides store administrators, warehouse operators, and order services with complete, real-time stock control, multi-warehouse locations, inter-warehouse transfers, bulk CSV audits, multi-currency asset valuation, and transaction audit logging across simple products and product variants.

It includes:
1. **Full API Backward Compatibility**: Coexistence of both Module 09 core stock reservation/release APIs and Module 25 admin management APIs.
2. **Multi-Warehouse Architecture**: CRUD operations for warehouse fulfillment centers (`warehouses` table) with default primary warehouse assignment.
3. **Inter-Warehouse Stock Transfers**: Atomic stock transfers (`POST /api/v1/admin/inventory/transfer`) between source and destination warehouses with transaction audit logging.
4. **Bulk CSV Stock Audits & Download Template**: Bulk upload stock level audits (`POST /api/v1/admin/inventory/import`) and sample template download (`GET /api/v1/admin/inventory/sample-template`).
5. **Executive KPI Dashboard & COGS Valuation**: Summary KPI metrics for Total SKUs, Available Units, Low Stock, Out of Stock, Total Cost Asset Value (COGS), Total Retail Value, Potential Margin, and Damaged Inventory Loss.
6. **Multi-Currency Support**: Integration with `resources/js/admin/utils/currency.js` for dynamic currency formatting (`INR ₹`, `USD $`, `EUR €`, `GBP £`).
7. **Per-SKU Stock Control & Unit Costs**: Detailed stock grid displaying Available Qty, Reserved Qty, Unit Cost (`cost_price`), Low-Stock Limit, Reorder Qty, Backorder Flag, and Storage Location Code.
8. **Polymorphic Atomic Stock Adjustments**: Modal to Add (+), Deduct (-), Mark Damaged, Set Absolute (=), or Transfer stock between warehouses.
9. **Unified Global Transaction Audit History Modal**: Comprehensive audit log modal with search filters by SKU/Product, Warehouse, Transaction Type, Date, and Admin Author.
10. **CSV Data Export**: Streaming CSV file download of current inventory snapshot per warehouse.
11. **Streamlined React Admin UI**: Single-page dashboard at `/admin/inventory` featuring single primary "Adjust Stock" action per row, interactive KPI filters, currency switcher, warehouse modal, bulk import modal, and audit logs modal.

---

## 2. API Endpoints

### 2.1 Admin Warehouse APIs (`/api/v1/admin/warehouses/*`)
- `GET /api/v1/admin/warehouses` — List all warehouse locations (`permission:inventory.view`)
- `POST /api/v1/admin/warehouses` — Create a new warehouse location (`permission:inventory.update`)
- `GET /api/v1/admin/warehouses/{id}` — Get single warehouse detail (`permission:inventory.view`)
- `PUT /api/v1/admin/warehouses/{id}` — Update warehouse details (`permission:inventory.update`)
- `DELETE /api/v1/admin/warehouses/{id}` — Delete non-default empty warehouse (`permission:inventory.update`)
- `POST /api/v1/admin/warehouses/{id}/default` — Set default primary warehouse (`permission:inventory.update`)

### 2.2 Admin Inventory APIs (`/api/v1/admin/inventory/*`)
- `GET /api/v1/admin/inventory/kpis` & `GET /api/v1/admin/inventory/dashboard` — Overview metrics with COGS valuation and warehouse filters (`permission:inventory.view`)
- `GET /api/v1/admin/inventory` — Paginated stock grid with search, stock status, category, brand, warehouse, and sorting filters (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/alerts` & `GET /api/v1/admin/inventory/low-stock` — Low-stock and out-of-stock items (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/history` & `GET /api/v1/admin/inventory/transactions` — Paginated audit log of inventory transactions (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/{variant_id}` — Get single variant inventory detail (`permission:inventory.view`)
- `POST /api/v1/admin/inventory/adjust` — Polymorphic stock adjustment (`add`, `deduct`, `set`, `damage`) (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/transfer` — Atomic inter-warehouse stock transfer (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/import` — Bulk CSV stock audit import (`permission:inventory.update`)
- `GET /api/v1/admin/inventory/sample-template` — Download sample CSV import template (`permission:inventory.view`)
- `POST /api/v1/admin/inventory/reserve` — Atomic stock reservation endpoint (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/release` — Atomic stock release endpoint (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/commit` — Stock commitment / shipment endpoint (`permission:inventory.update`)
- `GET /api/v1/admin/inventory/export` — Stream CSV download of inventory snapshot (`permission:inventory.view`)

---

## 3. Acceptance Criteria

- [x] All 19 API endpoints co-exist and function cleanly in `InventoryController.php` and `WarehouseController.php` with full OpenAPI `@OA\*` annotations.
- [x] Bulk CSV import safely strips UTF-8 BOM markers, parses SKU/Qty/Cost/Location, updates stock levels, and logs transactions.
- [x] Sample CSV import template endpoint (`GET /api/v1/admin/inventory/sample-template`) streams ready-to-fill sample CSV template.
- [x] `InventoryService.php` methods preserve full backward compatibility with order/checkout services while serving admin UI needs.
- [x] `/admin/inventory` SPA view renders executive KPI cards, currency switcher, warehouse toolbar filter, bulk import modal, warehouse management modal, unified audit log modal, and single primary "Adjust Stock" action button per row.
- [x] Vite production bundle builds cleanly (`cmd.exe /c "npm run build"`).
- [x] Feature test suites (`AdminWarehouseManagementTest.php`, `AdminInventoryManagementTest.php`, and `InventoryTest.php`) verify multi-warehouse CRUD, transfers, and CSV import.
