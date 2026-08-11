# Test Cases: Admin CRUD APIs for RBAC Module

**Module Name:** Admin CRUD APIs for RBAC  
**Module ID:** 03.5  
**Test File:** `plans/test-cases.rbac-crud.md`  
**Specification:** `specifications/feature.rbac-crud.spec.md`  
**Plan:** `plans/plan.rbac-crud.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-RBC-001: List Admin Users Success
- **Preconditions**: Authenticated admin with `staff.view` permission.
- **Input**: `GET /api/v1/admin/users?page=1&per_page=10`.
- **Expected Result**: HTTP 200 OK, paginated list of staff members with roles.

### TC-RBC-002: Create Admin Staff Success
- **Preconditions**: Authenticated admin with `staff.create` permission.
- **Input**: `POST /api/v1/admin/users` with valid `name`, `email`, `password`, `role_ids`.
- **Expected Result**: HTTP 201 Created, record inserted in `admin_users` and `admin_user_roles`.

### TC-RBC-003: Update Admin Staff Success
- **Preconditions**: Existing staff member ID.
- **Input**: `PUT /api/v1/admin/users/{id}` with updated `name` and `role_ids`.
- **Expected Result**: HTTP 200 OK, staff record updated.

### TC-RBC-004: Toggle Staff Status Success
- **Input**: `PATCH /api/v1/admin/users/{id}/status` with `status: "disabled"`.
- **Expected Result**: HTTP 200 OK, staff status updated to `disabled`.

### TC-RBC-005: List Roles Success
- **Input**: `GET /api/v1/admin/roles`.
- **Expected Result**: HTTP 200 OK, returns list of roles with permission count and staff count.

### TC-RBC-006: Create Custom Role Success
- **Input**: `POST /api/v1/admin/roles` with `name: "Catalog Manager"`, `slug: "catalog_manager"`, `permission_ids: [1, 2, 3]`.
- **Expected Result**: HTTP 201 Created, role created and permissions synced.

### TC-RBC-007: List Permissions Grouped by Module
- **Input**: `GET /api/v1/admin/permissions`.
- **Expected Result**: HTTP 200 OK, returns permissions grouped by module (`products`, `orders`, `customers`, etc.).

---

## 2. Negative Test Scenarios

### TC-RBC-008: Prevent Admin Self-Deletion
- **Preconditions**: Super Admin authenticated as ID 1.
- **Input**: `DELETE /api/v1/admin/users/1`.
- **Expected Result**: HTTP 403 Forbidden, message "You cannot delete your own account".

### TC-RBC-009: Prevent Deletion of System Roles
- **Preconditions**: `super_admin` role (`is_system=true`).
- **Input**: `DELETE /api/v1/admin/roles/{super_admin_id}`.
- **Expected Result**: HTTP 403 Forbidden, message "System roles cannot be deleted".

### TC-RBC-010: Create Staff with Duplicate Email
- **Input**: `POST /api/v1/admin/users` with existing email.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `email`.

### TC-RBC-011: Unauthorized Access Without Permission
- **Preconditions**: Admin user with `orders.view` permission (no `staff.create`).
- **Input**: `POST /api/v1/admin/users`.
- **Expected Result**: HTTP 403 Forbidden, message "You do not have permission to perform this action".

---

## 3. Security & Validation Tests

- **TC-RBC-012**: Deleting non-existent staff ID returns HTTP 404.
- **TC-RBC-013**: Updating role without permission returns HTTP 403.
- **TC-RBC-014**: Swagger UI contains all RBAC CRUD endpoints (`/admin/users`, `/admin/roles`, `/admin/permissions`).
