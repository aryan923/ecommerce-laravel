# Implementation Plan: Module 39 — Admin Audit Logs

**Module Name:** Admin Audit Logs & Activity Trail  
**Layer:** Admin API & Admin React Panel  
**Priority:** Medium  
**SRS References:** §85, admin_panel.md §37, §54, development_modules.md Module 39  
**Spec File:** [`specifications/feature.admin-audit-logs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.admin-audit-logs.spec.md)  
**Plan File:** [`plans/plan.admin-audit-logs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.admin-audit-logs.md)  
**Test Cases File:** [`plans/test-cases.admin-audit-logs.md`](file:///d:/Projects/ecommerce_laravel/plans/test-cases.admin-audit-logs.md)  
**Regression File:** [`plans/regression.admin-audit-logs.md`](file:///d:/Projects/ecommerce_laravel/plans/regression.admin-audit-logs.md)  

---

## 1. Executive Summary

The **Admin Audit Logs** implementation provides an enterprise-grade activity tracking system for the ecommerce store. It establishes a centralized database table (`audit_logs`), a static/singleton helper service (`AuditLogService`), API endpoints for search/filter/export, and an executive React dashboard (`AuditLogsPage.jsx`) with interactive JSON diff inspection.

---

## 2. Architecture & Components

```
d:\Projects\ecommerce_laravel\
├── database/
│   └── migrations/
│       └── 2026_08_22_000001_create_audit_logs_table.php
├── app/
│   ├── Models/
│   │   └── AuditLog.php
│   ├── Services/
│   │   └── AuditLogService.php
│   └── Http/
│       └── Controllers/
│           └── Api/
│               └── V1/
│                   └── Admin/
│                       └── AdminAuditLogController.php
├── routes/
│   └── api.php
├── resources/
│   └── js/
│       └── admin/
│           ├── pages/
│           │   └── AuditLogsPage.jsx
│           └── App.jsx
└── tests/
    └── Feature/
        └── Admin/
            └── AdminAuditLogTest.php
```

---

## 3. Implementation Task Breakdown

### Phase 1: Database & Model Layer
- [ ] **Task 1**: Create Migration `database/migrations/2026_08_22_000001_create_audit_logs_table.php` with `actor_id`, `actor_name`, `actor_email`, `action`, `module`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, timestamps, and compound indexes.
- [ ] **Task 2**: Create Eloquent Model `app/Models/AuditLog.php` with `casts` (`old_values` => 'array', `new_values` => 'array'), fillable attributes, and `belongsTo` relationship to `AdminUser`.

### Phase 2: Service Layer & Event Hooks
- [ ] **Task 3**: Create Service `app/Services/AuditLogService.php` with method `log($module, $action, $entityType = null, $entityId = null, $oldValues = null, $newValues = null)`. Automatically resolves Sanctum auth user, IP address, and User-Agent.
- [ ] **Task 4**: Wire `AuditLogService` into critical controllers and services:
  - `AdminUserService` & `RoleService` (Staff & RBAC changes).
  - `StoreSettingsService` & `TaxService` (Settings & Tax changes).
  - Product, Order, Inventory, Refund, Coupon controllers.

### Phase 3: API Layer & Controllers
- [ ] **Task 5**: Create Controller `app/Http/Controllers/Api/V1/Admin/AdminAuditLogController.php` using `App\Traits\ApiResponseTrait`:
  - `index(Request $request)`: Paginated query with search, module, action, actor, date range filtering.
  - `show($id)`: Detailed audit entry with payload diffs.
  - `export(Request $request)`: CSV file download stream.
  - `modules()`: Dynamic dropdown filter metadata.
- [ ] **Task 6**: Register API endpoints in `routes/api.php` under `auth:sanctum` and `permission:audit-logs.view` / `permission:audit-logs.export`. Register RBAC permissions in `database/seeders/RbacSeeder.php`.

### Phase 4: Frontend Admin UI
- [ ] **Task 7**: Create React Page `resources/js/admin/pages/AuditLogsPage.jsx`:
  - 4 Executive KPI metric cards (Total Logs, Today's Events, Active Admin Actors, Security Actions).
  - Filter Toolbar: Date Range Picker (`date_from`, `date_to`), Module Selector, Action Selector, Search Input, Clear Filters button, CSV Export button.
  - Audit Logs Data Table: Paginated grid with formatted timestamps, actor pill badges, action tags, entity preview, and "View Payload Diff" button.
  - Modal Payload Diff Inspector: Side-by-side or tree diff comparing `old_values` vs `new_values`.
- [ ] **Task 8**: Register `/audit-logs` route and sidebar link in `resources/js/admin/App.jsx`.

### Phase 5: Testing & Build Verification
- [ ] **Task 9**: Create Feature Test Suite `tests/Feature/Admin/AdminAuditLogTest.php` testing listing, filtering, export, unauthorized access, and automatic audit creation on staff/role edits.
- [ ] **Task 10**: Run `npm run build` and `php artisan test --filter=AdminAuditLogTest` to verify 100% clean passage.

---

## 4. Verification Plan

### Automated Tests
- Command: `docker exec ecom-panel-app php artisan test --filter=AdminAuditLogTest`

### Manual & Build Verification
- Command: `npm run build`
