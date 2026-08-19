# Implementation Plan: Admin Tax / GST Management Module

**Module Name:** Admin Tax / GST Management  
**Module ID:** 31  
**Plan File:** `plans/plan.admin-tax.md`  
**Specification File:** `specifications/feature.admin-tax.spec.md`  
**Status:** In Plan Review  

---

## 1. Module Summary

This module implements comprehensive backend and frontend support for **Admin Tax / GST Management** (Module 31), allowing store administrators to configure tax classes, GST component rate breakdowns (CGST, SGST, IGST, UTGST), global tax calculation modes (`tax_inclusive` vs `tax_exclusive`), default tax classes, and audit logging for all tax configuration actions.

---

## 2. Development Strategy

1. **Permissions & Security**: Seed required Spatie permissions (`tax.view`, `tax.create`, `tax.update`, `tax.delete`, `tax.configure`).
2. **Database Verification**: Ensure `tax_classes` and `tax_rates` tables match specification requirements, and support setting `is_default` and audit logging.
3. **Backend Services & Controllers**:
   - `App\Services\TaxService`: Enhance with `setTaxClassDefault()`, `getTaxSettings()`, `updateTaxSettings()`, and `logTaxAudit()`.
   - `App\Http\Controllers\Api\V1\Admin\TaxClassController`: Implement CRUD & set-default endpoints.
   - `App\Http\Controllers\Api\V1\Admin\TaxRateController`: Implement CRUD endpoints for component rate tiers.
   - `App\Http\Controllers\Api\V1\Admin\TaxSettingController`: Implement tax mode configuration & audit retrieval.
4. **API Routes**: Register endpoints under `/api/v1/admin/tax-classes`, `/api/v1/admin/tax-rates`, and `/api/v1/admin/tax/settings`.
5. **Frontend UI**:
   - Update `resources/js/admin/pages/TaxesPage.jsx` with tabs for **Tax Classes**, **GST Component Rates**, **Global Tax Mode Settings**, and **Audit Logs**.
6. **Automated Testing & Build Verification**:
   - Create `tests/Feature/Admin/TaxManagementTest.php` to verify backend endpoints, RBAC permissions, and audit logging.
   - Run `npm run build` to verify frontend compilation.

---

## 3. Architecture

- **Models**: `TaxClass`, `TaxRate`, `SystemSetting`, `AuditLog`
- **Services**: `TaxService`, `AuditLogService`
- **Controllers**: `TaxClassController`, `TaxRateController`, `TaxSettingController`
- **Form Requests**: `StoreTaxClassRequest`, `UpdateTaxClassRequest`, `StoreTaxRateRequest`, `UpdateTaxRateRequest`, `UpdateTaxSettingsRequest`
- **Frontend Page**: `resources/js/admin/pages/TaxesPage.jsx`
- **Routing**: `routes/api.php` under `/api/v1/admin` with `auth:sanctum` and `permission:*` middleware.

---

## 4. Task Breakdown

- [x] **Task 1: Permissions & Seeder**: Ensure `tax.view`, `tax.create`, `tax.update`, `tax.delete`, `tax.configure` permissions exist in database seeder and are assigned to `super_admin`.
- [x] **Task 2: Form Requests**: Create validation request classes for Tax Class, Tax Rate, and Tax Settings endpoints.
- [x] **Task 3: Service Layer Enhancement**: Add methods for setting default tax class, managing store tax settings, and writing audit logs in `TaxService`.
- [x] **Task 4: Tax Class Controller**: Implement CRUD and `setDefault` action methods with `@OA` docblocks and `ApiResponseTrait`.
- [x] **Task 5: Tax Rate Controller**: Implement CRUD action methods for GST component rates with `@OA` docblocks.
- [x] **Task 6: Tax Settings Controller**: Implement `show` and `update` action methods for global tax mode (`tax_inclusive` / `tax_exclusive`) and origin GSTIN.
- [x] **Task 7: Route Registration**: Register all 12 API routes in `routes/api.php` under `/api/v1/admin`.
- [x] **Task 8: Frontend Taxes Page UI**: Update `resources/js/admin/pages/TaxesPage.jsx` with full interactive tabs, modals, and setting controls.
- [x] **Task 9: Automated Feature Tests**: Write `tests/Feature/Admin/TaxManagementTest.php` covering all endpoints, RBAC rules, default toggling, and audit log generation.
- [x] **Task 10: Build & Verification**: Run `npm run build` and `php artisan test --filter=TaxManagementTest` to verify 100% pass rate.
