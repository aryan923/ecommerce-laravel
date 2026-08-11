# Feature Specification: Admin CRUD APIs for RBAC Module

**Module Name:** Admin CRUD APIs for RBAC  
**Module ID:** 03.5  
**Specification File:** `specifications/feature.rbac-crud.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§83, §84, §85, §100), `Requirements/admin_panel.md` (§34, §35, §36, §51, §54), `Requirements/development_modules.md` (§Module 03.5)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin CRUD APIs for RBAC module provides administrative endpoints for managing admin staff accounts (`admin_users`), roles (`roles`), and permissions (`permissions`). It enables Super Administrators and authorized Staff Managers to list, create, view, update, enable/disable, and delete admin users and role definitions. All endpoints are protected by `auth:sanctum` and permission middleware (`permission:staff.*`, `permission:roles.*`), extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and MUST include OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Admin Staff Management Flow
1. Super Admin navigates to Admin Staff list in Admin Panel.
2. App calls `GET /api/v1/admin/users` (protected by `permission:staff.view`).
3. Super Admin submits create staff form (`name`, `email`, `mobile`, `password`, `role_ids`) to `POST /api/v1/admin/users` (`permission:staff.create`).
4. System creates record in `admin_users` table and attaches selected role IDs in `admin_user_roles` pivot.
5. Super Admin updates staff details or assigned roles via `PUT /api/v1/admin/users/{id}` (`permission:staff.update`).
6. Super Admin toggles staff active/disabled status via `PATCH /api/v1/admin/users/{id}/status`.
7. Super Admin deletes staff account via `DELETE /api/v1/admin/users/{id}` (`permission:staff.delete`). System prevents self-deletion of currently logged-in Super Admin.

### 2.2 Role Management Flow
1. Admin calls `GET /api/v1/admin/roles` (`permission:roles.view`). System returns roles list with permission counts and assigned staff counts.
2. Admin creates a new custom role with selected permissions via `POST /api/v1/admin/roles` (`permission:roles.create`).
3. Admin updates role name, description, and permissions list via `PUT /api/v1/admin/roles/{id}` (`permission:roles.update`).
4. Admin deletes custom role via `DELETE /api/v1/admin/roles/{id}` (`permission:roles.delete`). System blocks deletion of system roles (`is_system=true`) or roles currently assigned to active staff.

### 2.3 Permissions Listing Flow
1. Admin calls `GET /api/v1/admin/permissions` (`permission:roles.view`).
2. System returns all registered system permissions grouped by module (`products`, `orders`, `customers`, etc.) for rendering role creation/edit checkboxes in Admin Panel UI.

---

## 3. Functional Requirements

- **FR-RBC-001**: System shall provide CRUD APIs for managing `admin_users` (`index`, `store`, `show`, `update`, `destroy`, `toggleStatus`).
- **FR-RBC-002**: System shall provide CRUD APIs for managing `roles` (`index`, `store`, `show`, `update`, `destroy`).
- **FR-RBC-003**: System shall provide a permissions list API (`GET /api/v1/admin/permissions`) grouped by module.
- **FR-RBC-004**: System shall enforce `permission:staff.view`, `permission:staff.create`, `permission:staff.update`, `permission:staff.delete` on admin staff endpoints.
- **FR-RBC-005**: System shall enforce `permission:roles.view`, `permission:roles.create`, `permission:roles.update`, `permission:roles.delete` on role management endpoints.
- **FR-RBC-006**: System shall prevent administrators from deleting their own active account.
- **FR-RBC-007**: System shall prevent deletion of system roles (`is_system=true`).
- **FR-RBC-008**: System shall validate uniqueness of `email`, `mobile`, and role `name`/`slug`.
- **FR-RBC-009**: System shall automatically hash staff passwords upon creation or update.
- **FR-RBC-010**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`, `@OA\RequestBody`, `@OA\Response`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Authentication**: Laravel Sanctum (`auth:sanctum` with `admin_users` guard).
- **Authorization**: `permission:<name>` middleware.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

No new tables are required. Utilizes existing database schema established in Module 03:
- `admin_users`
- `roles`
- `permissions`
- `role_permissions` (pivot)
- `admin_user_roles` (pivot)

---

## 6. API Requirements

Base URL: `/api/v1/admin`

### 6.1 Admin Staff Management Endpoints
- `GET /api/v1/admin/users` — List staff with search, status filter, and pagination
- `POST /api/v1/admin/users` — Create new admin staff user
- `GET /api/v1/admin/users/{id}` — View single admin staff details
- `PUT /api/v1/admin/users/{id}` — Update admin staff user and assigned roles
- `PATCH /api/v1/admin/users/{id}/status` — Enable or disable admin staff account
- `DELETE /api/v1/admin/users/{id}` — Delete admin staff account

### 6.2 Role Management Endpoints
- `GET /api/v1/admin/roles` — List roles with permission and staff count
- `POST /api/v1/admin/roles` — Create new role with permissions
- `GET /api/v1/admin/roles/{id}` — View single role details with permissions
- `PUT /api/v1/admin/roles/{id}` — Update role name, description, and permissions
- `DELETE /api/v1/admin/roles/{id}` — Delete custom role

### 6.3 Permissions Endpoint
- `GET /api/v1/admin/permissions` — List all permissions grouped by module

---

## 7. Validation Rules

### Staff Validation
- `name`: `required|string|max:150`
- `email`: `required|email|max:255|unique:admin_users,email,{id}`
- `mobile`: `nullable|string|max:20|unique:admin_users,mobile,{id}`
- `password`: `required_without:id|nullable|string|min:8`
- `role_ids`: `required|array`
- `role_ids.*`: `exists:roles,id`
- `status`: `sometimes|in:active,inactive,disabled`

### Role Validation
- `name`: `required|string|max:100|unique:roles,name,{id}`
- `description`: `nullable|string|max:255`
- `permission_ids`: `required|array`
- `permission_ids.*`: `exists:permissions,id`

---

## 8. Permission Rules

- Staff Endpoints:
  - `GET /api/v1/admin/users` → `permission:staff.view`
  - `POST /api/v1/admin/users` → `permission:staff.create`
  - `GET /api/v1/admin/users/{id}` → `permission:staff.view`
  - `PUT /api/v1/admin/users/{id}` → `permission:staff.update`
  - `PATCH /api/v1/admin/users/{id}/status` → `permission:staff.update`
  - `DELETE /api/v1/admin/users/{id}` → `permission:staff.delete`
- Role Endpoints:
  - `GET /api/v1/admin/roles` → `permission:roles.view`
  - `POST /api/v1/admin/roles` → `permission:roles.create`
  - `GET /api/v1/admin/roles/{id}` → `permission:roles.view`
  - `PUT /api/v1/admin/roles/{id}` → `permission:roles.update`
  - `DELETE /api/v1/admin/roles/{id}` → `permission:roles.delete`
- Permissions Endpoint:
  - `GET /api/v1/admin/permissions` → `permission:roles.view`

---

## 9. Error Handling

- **401 Unauthorized**: Unauthenticated request.
- **403 Forbidden**: User lacks required permission or attempts forbidden action (deleting self, deleting system role).
- **404 Not Found**: Staff or role ID does not exist.
- **422 Unprocessable Entity**: Validation failure.

---

## 10. Acceptance Criteria

- [ ] Admin staff CRUD APIs implemented with pagination, search, and status filter.
- [ ] Role CRUD APIs implemented with permission association.
- [ ] Permissions listing API returns all system permissions grouped by module.
- [ ] System prevents admin from deleting their own active account.
- [ ] System prevents deletion of system roles (`is_system=true`).
- [ ] All endpoints protected by Sanctum and `permission:<name>` middleware.
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec for all RBAC CRUD endpoints targeting `http://localhost:8002`.
- [ ] 100% test coverage with all feature tests passing.

---

## 11. Dependencies

- `Module 01: Foundation & Infrastructure`
- `Module 03: Admin Authentication & RBAC`
