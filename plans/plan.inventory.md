# Implementation Plan: Inventory Management Module

**Module Name:** Inventory Management  
**Module ID:** 09  
**Plan File:** `plans/plan.inventory.md`  
**Specification:** `specifications/feature.inventory.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / DB Transactions & Pessimistic Locking / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan outlines the implementation strategy for Module 09 (Inventory Management) in the Laravel e-commerce backend platform. It encompasses database migrations for `inventories` and `inventory_transactions` tables, `Inventory` and `InventoryTransaction` Eloquent models, Form Request validation classes, Service Layer (`InventoryService`) with atomic pessimistic locking, Admin Inventory Controller (`InventoryController`), OpenAPI 3.0 annotations, API route registrations, and automated feature testing (`InventoryTest.php`).

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `inventories` (`2026_08_11_000016_create_inventories_table.php`) and `inventory_transactions` (`2026_08_11_000017_create_inventory_transactions_table.php`). Run `php artisan migrate`.
2. **Domain Models & Observers**: Build `Inventory` and `InventoryTransaction` Eloquent models. Attach model observer or event listener on `ProductVariant` creation to initialize `Inventory` row with `available_qty = 0`.
3. **Form Request Validation**: Create Form Requests (`AdjustInventoryRequest`, `ReserveInventoryRequest`).
4. **Service Layer**: Implement `InventoryService` encapsulating `DB::transaction()` and `lockForUpdate()` for atomic operations (`adjust`, `reserve`, `release`, `commit`, `getDashboardMetrics`, `getAlerts`, `getHistory`).
5. **Controller & OpenAPI Annotations**: Implement `InventoryController` providing 9 Admin APIs with full OpenAPI 3.0 annotations targeting `http://localhost:8002`.
6. **Route Registration**: Register `/api/v1/admin/inventory` routes in `routes/api.php` guarded by `auth:sanctum` and RBAC permissions (`permission:inventory.*`).
7. **Swagger Regeneration**: Run `php artisan l5-swagger:generate` to compile updated OpenAPI documentation.
8. **Automated Feature Testing**: Create `InventoryTest.php` validating stock adjustments, atomic reservation & release, insufficient stock handling, concurrency safety, audit logging, low stock alerts, and RBAC permissions.

---

## 3. Architecture

- **Controllers**: `App\Http\Controllers\Api\V1\Admin\InventoryController`
- **Services**: `App\Services\InventoryService`
- **Form Requests**:
  - `App\Http\Requests\Admin\AdjustInventoryRequest`
  - `App\Http\Requests\Admin\ReserveInventoryRequest`
- **Models**: `Inventory`, `InventoryTransaction`, `ProductVariant`, `Product`
- **Database Tables**: `inventories`, `inventory_transactions`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000016_create_inventories_table.php`
  - Path: `database/migrations/2026_08_11_000017_create_inventory_transactions_table.php`
  - Description: Create `inventories` and `inventory_transactions` tables with FK constraints and composite indexes. Execute `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models & ProductVariant Observer Hook**
  - Path: `app/Models/Inventory.php`
  - Path: `app/Models/InventoryTransaction.php`
  - Path: `app/Models/ProductVariant.php`
  - Description: Implement `Inventory` and `InventoryTransaction` models with relationships. Hook `ProductVariant` `created` event to auto-create `Inventory` record.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/AdjustInventoryRequest.php`
  - Path: `app/Http/Requests/Admin/ReserveInventoryRequest.php`
  - Description: Implement request validation rules for stock adjustments and atomic stock reservations.

- [x] **Task 4: Implement InventoryService with Pessimistic Locking**
  - Path: `app/Services/InventoryService.php`
  - Description: Implement core business logic using `DB::transaction()` and `lockForUpdate()` for stock adjustment, reservation, release, commit, audit logging, dashboard metrics, and low stock alerts.

- [x] **Task 5: Implement InventoryController with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/InventoryController.php`
  - Description: Create controller with 9 Admin endpoints (`index`, `dashboard`, `alerts`, `history`, `show`, `adjust`, `reserve`, `release`, `commit`) extending `BaseController` and `ApiResponseTrait` with full `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register admin inventory routes guarded by `auth:sanctum` and `permission:inventory.*`.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Execute `php artisan l5-swagger:generate` to compile Swagger documentation for all Inventory endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/InventoryTest.php`
  - Description: Create PHPUnit feature test suite covering stock adjustments, atomic reservation & release, insufficient stock validation, audit logging, low stock alerts, and RBAC permissions.
