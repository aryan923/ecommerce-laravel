# Regression Strategy: Admin CRUD APIs for RBAC Module

**Module Name:** Admin CRUD APIs for RBAC  
**Module ID:** 03.5  
**Regression File:** `plans/regression.rbac-crud.md`  
**Specification:** `specifications/feature.rbac-crud.spec.md`  
**Plan:** `plans/plan.rbac-crud.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

This module expands administrative control over RBAC and affects:
- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Exception Handler)
- Module 03 Admin Authentication & RBAC (`AdminUser`, `Role`, `Permission`, `CheckAdminPermission` middleware)
- All future Admin API modules (Modules 22–39) relying on role/permission assignments

---

## 2. Regression Scenarios

### REG-RBC-001: Immediate Permission Enforcement Upon Role Update
- **Scenario**: Verify that when a role's permissions are updated via `PUT /api/v1/admin/roles/{id}`, staff users assigned to that role immediately experience the new permissions on subsequent API requests.
- **Priority**: Critical
- **Expected Result**: Permission changes take effect dynamically without requiring server restart or token re-issuance.

### REG-RBC-002: System Role & Super Admin Safety Controls
- **Scenario**: Verify that system roles (`super_admin`, `store_manager`, etc.) cannot be deleted, and Super Admin accounts cannot self-delete or disable their own account.
- **Priority**: Critical
- **Expected Result**: System integrity rules strictly enforced.

### REG-RBC-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all staff, role, and permission CRUD endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with all RBAC CRUD endpoints.

---

## 3. Smoke Test Suite

1. Execute `php artisan migrate:fresh --seed` to verify clean database setup.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=AdminUserCrudTest` and `php artisan test --filter=RoleCrudTest`.
4. Perform end-to-end API verification: Create Staff → Assign Role → Modify Role Permissions → Test Access.
