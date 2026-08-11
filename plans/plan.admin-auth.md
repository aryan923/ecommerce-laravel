# Implementation Plan: Admin Authentication & RBAC Module

**Module Name:** Admin Authentication & RBAC  
**Module ID:** 03  
**Plan File:** `plans/plan.admin-auth.md`  
**Specification:** `specifications/feature.admin-auth.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 03 (Admin Authentication & Role-Based Access Control - RBAC) in the Laravel e-commerce backend platform. It encompasses database migrations for `admin_users`, `roles`, `permissions`, and pivot tables, Eloquent models, RBAC seeders, `CheckAdminPermission` middleware, `AdminAuthService`, form request validations, `AdminAuthController` with OpenAPI 3.0 annotations, routes, and unit testing.

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `admin_users`, `roles`, `permissions`, `role_permissions`, and `admin_user_roles`. Run `php artisan migrate`.
2. **Domain Models & Relationships**: Create `AdminUser`, `Role`, and `Permission` models with Eloquent relationships (`belongsToMany`).
3. **Database Seeders**: Implement `RbacSeeder` populating system permissions (`products.*`, `orders.*`, `customers.*`, `reports.*`, `settings.*`, etc.), default roles, and initial Super Admin user (`admin@example.com` / `SecretAdmin123!`).
4. **Permission Middleware**: Implement `CheckAdminPermission` middleware to inspect admin user roles/permissions and enforce HTTP 403 authorization checks.
5. **Validation Requests**: Create `AdminLoginRequest`.
6. **Service Layer**: Implement `AdminAuthService` handling admin login verification, Sanctum token issuance, role/permission compilation, and logout.
7. **Controller & OpenAPI Annotations**: Implement `AdminAuthController` extending `BaseController`, using `ApiResponseTrait`, and adding full OpenAPI `@OA` annotations targeting `http://localhost:8002`.
8. **Routes Registration**: Register `/api/v1/admin/auth/*` routes in `routes/api.php`.
9. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to compile Swagger docs.
10. **Automated Feature Testing**: Create `AdminAuthTest.php` feature tests validating admin login, profile fetching, RBAC permission middleware enforcement, and token invalidation on logout.

---

## 3. Architecture

- **Controllers**: `App\Http\Controllers\Api\V1\Admin\AdminAuthController` (extending `BaseController`)
- **Services**: `App\Services\AdminAuthService`
- **Models**: `App\Models\AdminUser`, `App\Models\Role`, `App\Models\Permission`
- **Form Requests**: `App\Http\Requests\Admin\AdminLoginRequest`
- **Middleware**: `App\Http\Middleware\CheckAdminPermission`
- **Seeders**: `Database\Seeders\RbacSeeder`
- **Database Tables**: `admin_users`, `roles`, `permissions`, `role_permissions`, `admin_user_roles`, `personal_access_tokens`

---

## 4. Task Breakdown

- [x] **Task 1: Create RBAC & Admin Users Migrations**
  - Path: `database/migrations/2026_08_11_000003_create_admin_users_table.php`
  - Path: `database/migrations/2026_08_11_000004_create_roles_table.php`
  - Path: `database/migrations/2026_08_11_000005_create_permissions_table.php`
  - Path: `database/migrations/2026_08_11_000006_create_rbac_pivot_tables.php`
  - Description: Create tables for `admin_users`, `roles`, `permissions`, `role_permissions`, and `admin_user_roles`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models & Relationships**
  - Path: `app/Models/AdminUser.php`
  - Path: `app/Models/Role.php`
  - Path: `app/Models/Permission.php`
  - Description: Define `AdminUser` with Sanctum trait, relationships (`roles`), and helper methods (`hasPermission`, `hasRole`, `isSuperAdmin`).

- [x] **Task 3: Implement Database RbacSeeder**
  - Path: `database/seeders/RbacSeeder.php`
  - Path: `database/seeders/DatabaseSeeder.php`
  - Description: Populate module permissions, default roles, and initial Super Admin account (`admin@example.com` / `SecretAdmin123!`).

- [x] **Task 4: Implement CheckAdminPermission Middleware**
  - Path: `app/Http/Middleware/CheckAdminPermission.php`
  - Description: Intercept requests, verify authenticated admin user holds required permission or Super Admin status, and throw 403 on denial.

- [x] **Task 5: Create AdminLoginRequest & AdminAuthService**
  - Path: `app/Http/Requests/Admin/AdminLoginRequest.php`
  - Path: `app/Services/AdminAuthService.php`
  - Description: Implement validation and business logic for admin login, token generation with admin abilities, and logout.

- [x] **Task 6: Implement AdminAuthController with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/AdminAuthController.php`
  - Description: Build admin auth endpoints (`login`, `me`, `logout`) extending `BaseController` with complete OpenAPI annotations.

- [x] **Task 7: Register Admin Auth Routes**
  - Path: `routes/api.php`
  - Description: Register route group `/api/v1/admin/auth` with public and protected admin endpoints.

- [x] **Task 8: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation containing all Admin Auth endpoints.

- [x] **Task 9: Automated Feature Testing**
  - Path: `tests/Feature/AdminAuthTest.php`
  - Description: Write comprehensive PHPUnit test suite covering admin login, profile fetching, RBAC permission middleware enforcement, customer vs admin guard isolation, and logout.
