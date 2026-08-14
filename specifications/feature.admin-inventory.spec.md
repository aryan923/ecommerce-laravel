# Feature Specification: Module 25 — Admin Inventory Management

**Module Name:** Admin Inventory Management  
**Module ID:** 25  
**Specification File:** `specifications/feature.admin-inventory.spec.md`  
**Plan File:** `plans/plan.admin-inventory.md`  
**Version:** 2.0 (Merged & Comprehensive Scope)  
**Status:** Implemented & Verified  
**Base SRS References:** `Requirements/srs_apis.md` (§35–§37), `Requirements/admin_panel.md` (§10–§11), `Requirements/development_modules.md` (§Module 09 & §Module 25)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Inventory Management module provides store administrators, warehouse operators, and order services with complete, real-time stock control and transaction audit logging across simple products and product variants.

It includes:
1. **Full API Backward Compatibility**: Coexistence of both Module 09 core stock reservation/release APIs and Module 25 admin management APIs.
2. **Executive KPI Dashboard Metrics**: Summary KPI cards for Total SKUs, Available Units, Low-Stock Count, Out-of-Stock Count, Reserved & Damaged Stock Units, and Total Inventory Valuation ($).
3. **Per-SKU Stock Control & Breakdown**: Detailed stock grid displaying Available Qty, Reserved Qty, Committed Qty, Damaged Qty, Low-Stock Alert Limit, and Status Badges.
4. **Polymorphic Atomic Stock Adjustments**: Modal to Add (+), Deduct (-), Mark Damaged, or Set Absolute (=) stock while updating custom `low_stock_threshold` limits and logging audit reasons.
5. **Full Transaction Audit History**: Historical log tracking every stock movement (`manual_addition`, `manual_deduction`, `order_reservation`, `order_cancellation`, `order_shipment`, `return`, `damage`, `adjustment`) with previous, change, and new quantities.
6. **Low Stock Alerts & Filters**: Quick filtering by `in_stock`, `low_stock`, and `out_of_stock` states.
7. **Single SKU Detail Modal**: Inspection modal for detailed variant stock metrics and thresholds.
8. **CSV Data Export**: Streaming CSV file download of current inventory snapshot.
9. **React Admin UI**: Single-page dashboard at `/admin/inventory` with KPI cards, filters, adjustment modal, audit log modal, SKU detail modal, and export functionality.

---

## 2. API Endpoints

### 2.1 Admin Inventory APIs (`/api/v1/admin/inventory/*`)
- `GET /api/v1/admin/inventory/kpis` & `GET /api/v1/admin/inventory/dashboard` — Overview metrics (`permission:inventory.view`)
- `GET /api/v1/admin/inventory` — Paginated stock grid with search, stock status, category, and brand filters (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/alerts` & `GET /api/v1/admin/inventory/low-stock` — Low-stock and out-of-stock items (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/history` & `GET /api/v1/admin/inventory/transactions` — Paginated audit log of inventory transactions (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/{variant_id}` — Get single variant inventory detail (`permission:inventory.view`)
- `POST /api/v1/admin/inventory/adjust` — Polymorphic manual stock adjustment (`add`, `deduct`, `set`, `damage`) (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/reserve` — Atomic stock reservation endpoint (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/release` — Atomic stock release endpoint (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/commit` — Stock commitment / shipment endpoint (`permission:inventory.update`)
- `GET /api/v1/admin/inventory/export` — Stream CSV download of inventory snapshot (`permission:inventory.view`)

---

## 3. Acceptance Criteria

- [x] All 10 API endpoints co-exist and function cleanly in `InventoryController.php`.
- [x] `InventoryService.php` methods (`reserveStock`, `releaseStock`, `commitStock`, `adjustStock`, `getDashboardMetrics`, `getAlerts`, `getHistory`, `exportCsv`) preserve full backward compatibility with order/checkout services while serving admin UI needs.
- [x] `/admin/inventory` SPA view renders executive KPI cards, complete stock breakdown (Available, Reserved, Committed, Damaged), low-stock alert filters, adjustment modal, transaction audit history modal, SKU detail modal, and CSV export.
- [x] Vite production bundle builds cleanly (`npm run build`).
- [x] Feature test suites (`AdminInventoryManagementTest.php` and `InventoryTest.php`) pass 100% green via `vendor/bin/phpunit`.
