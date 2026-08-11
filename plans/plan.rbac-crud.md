# Implementation Plan: Admin CRUD APIs for RBAC Module

**Module Name:** Admin CRUD APIs for RBAC  
**Module ID:** 03.5  
**Plan File:** `plans/plan.rbac-crud.md`  
**Specification:** `specifications/feature.rbac-crud.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 03.5 (Admin CRUD APIs for RBAC) in the Laravel e-commerce backend platform. It encompasses Form Requests, Services (`AdminUserService`, `RoleService`), Controllers (`AdminUserController`, `RoleController`, `PermissionController`), OpenAPI 3.0 annotations, routes registration, and automated feature testing.

---

## 2. Development Strategy

1. **Validation Requests**: Create Form Requests (`StoreAdminUserRequest`, `UpdateAdminUserRequest`, `StoreRoleRequest`, `UpdateRoleRequest`).
2. **Service Layer**: Create `AdminUserService` and `RoleService` encapsulating business logic, password hashing, role sync, permission sync, self-deletion prevention, and system role deletion prevention.
3. **Controllers & OpenAPI Annotations**: Implement `AdminUserController`, `RoleController`, and `PermissionController` extending `BaseController`, using `ApiResponseTrait`, and adding full OpenAPI annotations targeting `http://localhost:8002`.
4. **Routes Registration**: Register routes under `/api/v1/admin/users`, `/api/v1/admin/roles`, and `/api/v1/admin/permissions` with `auth:sanctum` and `permission:<name>` middleware.
5. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to update Swagger docs.
6. **Automated Feature Testing**: Create `AdminUserCrudTest.php` and `RoleCrudTest.php` validating CRUD operations, status toggling, self-deletion blocking, system role protection, and permission authorization.

---

## 3. Architecture

- **Controllers**: 
  - `App\Http\Controllers\Api\V1\Admin\AdminUserController`
  - `App\Http\Controllers\Api\V1\Admin\RoleController`
  - `App\Http\Controllers\Api\V1\Admin\PermissionController`
- **Services**: 
  - `App\Services\AdminUserService`
  - `App\Services\RoleService`
- **Form Requests**: 
  - `App\Http\Requests\Admin\StoreAdminUserRequest`
  - `App\Http\Requests\Admin\UpdateAdminUserRequest`
  - `App\Http\Requests\Admin\StoreRoleRequest`
  - `App\Http\Requests\Admin\UpdateRoleRequest`
- **Middleware**: `auth:sanctum`, `permission:<name>`
- **Models**: `AdminUser`, `Role`, `Permission`

---

## 4. Task Breakdown

- [x] **Task 1: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/StoreAdminUserRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateAdminUserRequest.php`
  - Path: `app/Http/Requests/Admin/StoreRoleRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateRoleRequest.php`
  - Description: Implement validation rules for creating/updating staff users and roles.

- [x] **Task 2: Implement AdminUserService & RoleService**
  - Path: `app/Services/AdminUserService.php`
  - Path: `app/Services/RoleService.php`
  - Description: Implement business logic for staff CRUD, role CRUD, self-deletion guard, and system role deletion guard.

- [x] **Task 3: Implement Controllers with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/AdminUserController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/RoleController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/PermissionController.php`
  - Description: Create controller endpoints extending `BaseController` with complete OpenAPI annotations.

- [x] **Task 4: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register `/api/v1/admin/users`, `/api/v1/admin/roles`, and `/api/v1/admin/permissions` routes protected by `auth:sanctum` and `permission:<name>`.

- [x] **Task 5: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation for all RBAC CRUD endpoints.

- [x] **Task 6: Automated Feature Testing**
  - Path: `tests/Feature/AdminUserCrudTest.php`
  - Path: `tests/Feature/RoleCrudTest.php`
  - Description: Write comprehensive test suites validating staff CRUD, role CRUD, permission authorization, self-deletion prevention, and system role protection.
