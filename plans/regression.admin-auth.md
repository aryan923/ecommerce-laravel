# Regression Strategy: Admin Authentication & RBAC Module

**Module Name:** Admin Authentication & RBAC  
**Module ID:** 03  
**Regression File:** `plans/regression.admin-auth.md`  
**Specification:** `specifications/feature.admin-auth.spec.md`  
**Plan:** `plans/plan.admin-auth.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Since Admin Authentication & RBAC establishes administrative security and permissions, the following existing and future modules depend on it:

- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Exception Handler)
- Module 02 User Authentication (Customer — Guard Isolation)
- All Admin API modules (Modules 22–39)

---

## 2. Regression Scenarios

### REG-ADM-001: Customer vs Admin Token Guard Isolation
- **Scenario**: Verify that Customer tokens issued from `users` table cannot authenticate against Admin routes, and Admin tokens issued from `admin_users` table cannot authenticate against Customer routes.
- **Priority**: Critical
- **Expected Result**: Complete guard isolation between `users` and `admin_users`.

### REG-ADM-002: Dynamic Permission Evaluation
- **Scenario**: Verify that permissions assigned via `role_permissions` and `admin_user_roles` are evaluated dynamically on every request without stale permission caching bugs.
- **Priority**: High
- **Expected Result**: Instant permission updates upon role modifications.

### REG-ADM-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Admin Auth endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with `/admin/auth/login`, `/admin/auth/me`, and `/admin/auth/logout`.

---

## 3. Smoke Test Suite

1. Execute `php artisan migrate:fresh --seed` to verify clean migration and seeding sequence.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=AdminAuthTest` to verify all admin authentication and RBAC feature tests.
4. Perform end-to-end API verification: Admin Login → Fetch `/me` → Test Permission Middleware → Admin Logout.
