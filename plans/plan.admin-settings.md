# Implementation Plan: Admin Store Settings Module

**Module Name:** Admin Store Settings  
**Module ID:** 37  
**Plan File:** `plans/plan.admin-settings.md`  
**Specification File:** `specifications/feature.admin-settings.spec.md`  
**Status:** In Plan Review  

---

## 1. Module Summary

This module implements complete backend and frontend support for **Admin Store Settings** (Module 37), enabling store administrators to manage global store settings (general store info, localization, commerce rules, SEO configuration, integration summaries) and multi-currency options (exchange rates, symbols, default currency toggles), accompanied by audit logging and Spatie permission controls.

---

## 2. Development Strategy

1. **Permissions & Database Migration**:
   - Seed Spatie permissions: `settings.view`, `settings.update`, `settings.configure`, `currency.view`, `currency.manage`.
   - Create migration for `store_settings` and `settings_audit_logs` tables.
   - Verify `currencies` table schema supports `exchange_rate`, `decimal_places`, `symbol`, and `is_default`.
2. **Backend Models & Services**:
   - Create `StoreSetting` and `SettingsAuditLog` Eloquent models.
   - Implement `App\Services\StoreSettingsService` to manage key-value settings caching, group fetching, bulk updates, default currency toggles, and audit logging.
3. **Form Requests & Validation**:
   - Create `UpdateSettingsGroupRequest`, `StoreCurrencyRequest`, `UpdateCurrencyRequest`.
4. **Controllers & API Routes**:
   - Create `App\Http\Controllers\Api\V1\Admin\StoreSettingController` and `CurrencyController`.
   - Register endpoints in `routes/api.php` under `/api/v1/admin/settings` and `/api/v1/admin/currencies`.
   - Add `@OA` OpenAPI docblocks for documentation.
5. **Frontend Admin UI**:
   - Implement `resources/js/admin/pages/SettingsPage.jsx` featuring tabs for General, Localization, Commerce, SEO, Currencies, and Audit Logs.
6. **Testing & Verification**:
   - Create `tests/Feature/Admin/StoreSettingsManagementTest.php` covering group settings API, currency CRUD, default currency switching, RBAC permissions, and audit logs.
   - Run `npm run build` to verify frontend compilation.

---

## 3. Architecture

- **Models**: `StoreSetting`, `Currency`, `SettingsAuditLog`
- **Services**: `StoreSettingsService`
- **Controllers**: `StoreSettingController`, `CurrencyController`
- **Form Requests**: `UpdateSettingsGroupRequest`, `StoreCurrencyRequest`, `UpdateCurrencyRequest`
- **Frontend Page**: `resources/js/admin/pages/SettingsPage.jsx`
- **Routing**: `routes/api.php` under `/api/v1/admin` with `auth:sanctum` and `permission:*` middleware.

---

## 4. Task Breakdown

- [x] **Task 1: Permissions & Database Seeding**: Seed `settings.view`, `settings.update`, `settings.configure`, `currency.view`, `currency.manage` permissions in database seeder and assign to `super_admin`.
- [x] **Task 2: Database Migrations & Models**: Create migration for `store_settings` and `settings_audit_logs` tables, and create `StoreSetting` and `SettingsAuditLog` models.
- [x] **Task 3: Service Layer Implementation**: Implement `StoreSettingsService` for caching, retrieving grouped settings, updating setting groups, managing currency defaults, and logging audits.
- [x] **Task 4: Validation Form Requests**: Create `UpdateSettingsGroupRequest`, `StoreCurrencyRequest`, and `UpdateCurrencyRequest` with full field rules.
- [x] **Task 5: Store Setting Controller**: Implement `show`, `showGroup`, `updateGroup`, and `auditLogs` endpoints using `ApiResponseTrait` and `@OA` annotations.
- [x] **Task 6: Currency Controller**: Implement `index`, `store`, `show`, `update`, `destroy`, and `setDefault` endpoints with `@OA` annotations.
- [x] **Task 7: API Route Registration**: Register all 10 settings & currency routes in `routes/api.php` under `/api/v1/admin`.
- [x] **Task 8: Frontend Settings Page UI**: Create `resources/js/admin/pages/SettingsPage.jsx` with tabbed navigation, dynamic form controls, currency CRUD modal, and audit log panel.
- [x] **Task 9: Feature Test Suite**: Write `tests/Feature/Admin/StoreSettingsManagementTest.php` to verify all endpoints, validation, RBAC rules, and currency default toggles.
- [x] **Task 10: Build & Verification**: Run `npm run build` and `php artisan test --filter=StoreSettingsManagementTest` to ensure 100% test success and clean build.
