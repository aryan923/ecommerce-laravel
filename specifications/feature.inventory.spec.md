# Feature Specification: Inventory Management Module

**Module Name:** Inventory Management  
**Module ID:** 09  
**Specification File:** `specifications/feature.inventory.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§35–§37), `Requirements/admin_panel.md` (§10–§11), `Requirements/development_modules.md` (§Module 09)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / DB Transactions & Pessimistic Locking (`lockForUpdate`) / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Inventory Management module provides SKU/variant-level stock tracking, atomic stock reservation during checkout to prevent overselling, manual stock adjustments (addition, deduction, reconciliation, damage reporting), low-stock alert thresholds, an immutable audit log (`inventory_transactions`) for every stock movement, and an Admin Inventory Dashboard.

All API endpoints extend `BaseController`, utilize `ApiResponseTrait`, execute on `http://localhost:8002`, and MUST include full OpenAPI 3.0 annotations for live Swagger documentation generation via `php artisan l5-swagger:generate`.

---

## 2. Business Flow

### 2.1 Admin Stock Management & Adjustment Flow
1. Admin views the Inventory Dashboard via `GET /api/v1/admin/inventory/dashboard` or lists stock across SKUs via `GET /api/v1/admin/inventory`.
2. Admin adjusts stock for a SKU/variant via `POST /api/v1/admin/inventory/adjust`.
3. Admin specifies `product_variant_id`, `adjustment_type` (`add`, `deduct`, `set`, `damage`), `quantity` change, optional `low_stock_threshold`, and mandatory `reason` / `remarks`.
4. System executes a database transaction with pessimistic row-locking (`DB::transaction` with `lockForUpdate()`) to prevent race conditions.
5. System updates `inventories` record (`available_qty`, `damaged_qty`, `low_stock_threshold`) and inserts an immutable record into `inventory_transactions` capturing `previous_qty`, `quantity_change`, `new_qty`, `transaction_type`, `admin_id`, and timestamps.

### 2.2 Order Placement Stock Reservation & Release Flow (Atomic Operations)
1. Customer initiates order placement. System invokes `POST /api/v1/admin/inventory/reserve` (or internal `InventoryService::reserveStock()`).
2. System locks target SKU `inventories` record, verifies `available_qty >= requested_qty`. If sufficient, decreases `available_qty` by requested quantity and increases `reserved_qty` by requested quantity.
3. Transaction record inserted with `transaction_type = 'order_reservation'` and `reference_id = order_id`.
4. If payment fails or order is canceled, system invokes `POST /api/v1/admin/inventory/release` (or internal `InventoryService::releaseStock()`), decrementing `reserved_qty` and restoring `available_qty`.
5. Upon order fulfillment/shipment, system invokes `POST /api/v1/admin/inventory/commit` (or `commitStock()`), decrementing `reserved_qty` and incrementing `committed_qty` with `transaction_type = 'order_shipment'`.

### 2.3 Low Stock Monitoring & Alerting Flow
1. Admin queries low stock & out-of-stock items via `GET /api/v1/admin/inventory/alerts`.
2. System returns items where `available_qty <= low_stock_threshold` or `available_qty = 0`.

---

## 3. Functional Requirements

- **FR-INV-001**: System shall maintain inventory at variant/SKU level (`product_variants` table association). Simple products reference their default variant.
- **FR-INV-002**: System shall track stock quantities: `available_qty`, `reserved_qty`, `committed_qty`, `damaged_qty`, `returned_qty`, and `low_stock_threshold`.
- **FR-INV-003**: System shall calculate available stock formula: `Available = Physical Quantity - Reserved Quantity`.
- **FR-INV-004**: System shall support atomic stock reservations during order placement using database transactions and pessimistic row locking (`lockForUpdate()`) to prevent overselling.
- **FR-INV-005**: System shall record an immutable inventory transaction log (`inventory_transactions` table) for every stock movement.
- **FR-INV-006**: System shall record transaction details: SKU, variant ID, previous quantity, quantity change, new quantity, transaction type, reference type/ID, admin ID, remarks, and timestamp.
- **FR-INV-007**: System shall support manual stock adjustments by Admin (`add`, `deduct`, `set`, `damage`).
- **FR-INV-008**: System shall support setting and updating per-variant `low_stock_threshold` limits.
- **FR-INV-009**: System shall provide low stock & out-of-stock alerts API (`GET /api/v1/admin/inventory/alerts`).
- **FR-INV-010**: System shall provide Inventory Dashboard metrics API (`GET /api/v1/admin/inventory/dashboard`).
- **FR-INV-011**: System shall provide paginated audit trail history API (`GET /api/v1/admin/inventory/history`).
- **FR-INV-012**: System shall restrict all Admin Inventory APIs with Sanctum authentication and RBAC permissions (`inventory.view`, `inventory.update`, `inventory.adjust`).
- **FR-INV-013**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Concurrency & Atomicity**: `DB::transaction()` combined with `lockForUpdate()` query locking on target `inventories` row.
- **Middleware**: `auth:sanctum` and `permission:<name>` for Admin APIs.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `inventories` Table Migration
Migration File: `database/migrations/2026_08_11_000016_create_inventories_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `product_variant_id` | `unsignedBigInteger` | `unique`, `foreign` | Foreign key referencing `product_variants(id)` |
| `sku` | `string` | `unique`, `index` | SKU code |
| `available_qty` | `integer` | `default(0)`, `index` | Current available stock count |
| `reserved_qty` | `integer` | `default(0)` | Stock reserved for pending orders |
| `committed_qty` | `integer` | `default(0)` | Stock sold/fulfilled |
| `damaged_qty` | `integer` | `default(0)` | Damaged or written-off stock |
| `returned_qty` | `integer` | `default(0)` | Returned stock count |
| `low_stock_threshold` | `integer` | `default(10)` | Threshold triggering low stock alert |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `inventory_transactions` Table Migration
Migration File: `database/migrations/2026_08_11_000017_create_inventory_transactions_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `inventory_id` | `unsignedBigInteger` | `foreign` | Foreign key referencing `inventories(id)` |
| `product_variant_id` | `unsignedBigInteger` | `index` | Foreign key referencing `product_variants(id)` |
| `sku` | `string` | `index` | Variant SKU code |
| `previous_qty` | `integer` | | Available stock before transaction |
| `quantity_change` | `integer` | | Quantity added (+) or deducted (-) |
| `new_qty` | `integer` | | Available stock after transaction |
| `transaction_type` | `enum` | `['purchase', 'manual_addition', 'manual_deduction', 'order_reservation', 'order_cancellation', 'order_shipment', 'return', 'damage', 'adjustment']`, `index` | Classification of stock movement |
| `reference_type` | `string` | `nullable` | Associated entity model type (e.g. `Order`, `PurchaseOrder`) |
| `reference_id` | `unsignedBigInteger` | `nullable` | Associated entity ID |
| `admin_id` | `unsignedBigInteger` | `nullable`, `foreign` | Admin user who performed adjustment |
| `remarks` | `text` | `nullable` | Reason / comments |
| `created_at` | `timestamp` | `index` | Transaction timestamp |

---

## 6. API Requirements

### 6.1 Admin Inventory APIs (`/api/v1/admin/inventory`)
- `GET /api/v1/admin/inventory` — List paginated inventory records with SKU search, stock status, and variant details (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/dashboard` — Overview metrics (total SKUs, total stock units, low-stock count, out-of-stock count, reserved stock count) (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/alerts` — List low-stock and out-of-stock items (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/history` — Paginated audit log of inventory transactions (`permission:inventory.view`)
- `GET /api/v1/admin/inventory/{variant_id}` — Get single variant inventory detail (`permission:inventory.view`)
- `POST /api/v1/admin/inventory/adjust` — Manual stock adjustment (`add`, `deduct`, `set`, `damage`) (`permission:inventory.adjust`)
- `POST /api/v1/admin/inventory/reserve` — Atomic stock reservation endpoint (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/release` — Atomic stock release endpoint (`permission:inventory.update`)
- `POST /api/v1/admin/inventory/commit` — Stock commitment / shipment endpoint (`permission:inventory.update`)

---

## 7. Validation Rules

### 7.1 Stock Adjustment Request (`AdjustInventoryRequest`)
- `product_variant_id`: `required|exists:product_variants,id`
- `adjustment_type`: `required|in:add,deduct,set,damage`
- `quantity`: `required|integer|min:0`
- `low_stock_threshold`: `nullable|integer|min:0`
- `remarks`: `required|string|max:500`

### 7.2 Stock Reservation Request (`ReserveInventoryRequest`)
- `product_variant_id`: `required|exists:product_variants,id`
- `quantity`: `required|integer|min:1`
- `reference_id`: `nullable|integer`
- `remarks`: `nullable|string|max:255`

---

## 8. Permission Rules

| API Endpoint | HTTP Method | Required Permission |
| :--- | :--- | :--- |
| `/api/v1/admin/inventory` | `GET` | `inventory.view` |
| `/api/v1/admin/inventory/dashboard` | `GET` | `inventory.view` |
| `/api/v1/admin/inventory/alerts` | `GET` | `inventory.view` |
| `/api/v1/admin/inventory/history` | `GET` | `inventory.view` |
| `/api/v1/admin/inventory/{variant_id}` | `GET` | `inventory.view` |
| `/api/v1/admin/inventory/adjust` | `POST` | `inventory.adjust` |
| `/api/v1/admin/inventory/reserve` | `POST` | `inventory.update` |
| `/api/v1/admin/inventory/release` | `POST` | `inventory.update` |
| `/api/v1/admin/inventory/commit` | `POST` | `inventory.update` |

---

## 9. Business Rules

1. **Non-Negative Available Stock**: Available quantity MUST NOT drop below 0. Attempts to deduct or reserve more than `available_qty` throw an HTTP 422 `Insufficient stock` validation error.
2. **Pessimistic Concurrency Locking**: All stock modification methods MUST wrap calculations inside `DB::transaction()` and execute `Inventory::where('product_variant_id', $variantId)->lockForUpdate()->first()`.
3. **Immutable Audit Trail**: Every stock change MUST generate a corresponding `InventoryTransaction` record. Delete/update operations on `inventory_transactions` are strictly prohibited.
4. **Automatic Inventory Sync on Variant Creation**: Creating a `ProductVariant` automatically triggers `Inventory` record initialization with `available_qty = 0`.

---

## 10. Acceptance Criteria

- [ ] Migrations `2026_08_11_000016_create_inventories_table.php` and `2026_08_11_000017_create_inventory_transactions_table.php` execute cleanly.
- [ ] `Inventory` and `InventoryTransaction` Eloquent models created with proper relationships.
- [ ] `ProductVariant` observer or creation hook initializes `Inventory` record automatically.
- [ ] `InventoryService` encapsulates atomic stock reservation, release, commit, and manual adjustments with `lockForUpdate()`.
- [ ] All 9 Inventory API endpoints implemented in `InventoryController` with complete OpenAPI 3.0 annotations.
- [ ] `php artisan l5-swagger:generate` completes with zero errors.
- [ ] Automated feature test suite `InventoryTest.php` passes with 100% success rate.
