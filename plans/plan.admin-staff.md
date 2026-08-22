# Implementation Plan: Admin Staff, Roles & Permissions (Module 38)

This plan details the technical steps required to complete **Module 38 — Admin Staff, Roles & Permissions** in accordance with [`specifications/feature.admin-staff.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.admin-staff.spec.md).

---

## 1. User Review Required

> [!IMPORTANT]
> - **Super Admin Protection**: Deleting or disabling the built-in `super_admin` role or primary Super Admin user account is strictly prohibited at both API and Database validation layers.
> - **Token Revocation**: Disabling a staff account automatically purges all Sanctum tokens to prevent unauthorized ongoing API access.

---

## 2. Proposed Implementation Tasks

### Task 1: Audit & Enhance RBAC Seeders & Permissions
- Verify `database/seeders/RbacSeeder.php` seeds all necessary permissions for staff (`staff.view`, `staff.create`, `staff.update`, `staff.delete`) and roles (`roles.view`, `roles.create`, `roles.update`, `roles.delete`).
- Ensure all permissions are mapped to correct module keys.

### Task 2: Service Layer Methods (`AdminUserService` & `RoleService`)
- Enhance [`AdminUserService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/AdminUserService.php) to support staff filtering, paginated retrieval, user creation with role syncing, user updates, status toggles, password reset, and Sanctum token revoking upon disable.
- Enhance [`RoleService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/RoleService.php) to support listing roles with `permissions_count` & `staff_count`, custom role creation/updates with permission syncing, and unassigned custom role deletion.

### Task 3: Form Requests & API Controllers
- Update [`StoreAdminUserRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreAdminUserRequest.php) and [`UpdateAdminUserRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/UpdateAdminUserRequest.php).
- Update [`StoreRoleRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreRoleRequest.php) and [`UpdateRoleRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/UpdateRoleRequest.php).
- Verify OpenAPI annotations in [`AdminUserController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/AdminUserController.php), [`RoleController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/RoleController.php), and [`PermissionController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/PermissionController.php).

### Task 4: API Route Registration
- Ensure API routes in [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) support staff CRUD, status toggle, reset access, roles CRUD, and grouped permissions list with appropriate RBAC middleware.

### Task 5: Admin React Frontend UI (`StaffPage.jsx`)
- Create [`resources/js/admin/pages/StaffPage.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/pages/StaffPage.jsx) following the exact layout, margins, paddings, enclosed filter toolbar, and card styling as `CustomerListPage.jsx`, `InventoryPage.jsx`, and `SettingsPage.jsx`.
- Implement Executive 4-KPI Grid (Total Staff, Configured Roles, Permission Nodes, Logged Actions).
- Implement Segmented Tabs Navigation:
  - Tab 1: **Staff Members** (Data table with search, role dropdown filter, status badges, edit modal, status toggle, reset password modal).
  - Tab 2: **Roles & Permissions** (Card grid of roles with permission count, assigned staff count, edit matrix modal, delete custom role).
  - Tab 3: **Permission Matrix Overview** (Visual checklist grouped by module key).
- Register `/staff` route in [`resources/js/admin/App.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/App.jsx).

### Task 6: Feature Test Suite & Verification
- Create automated feature test [`tests/Feature/Admin/AdminStaffManagementTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/Admin/AdminStaffManagementTest.php).
- Verify staff creation, role assignment, status updates, role CRUD, permission matrix retrieval, token revocation, and super admin protections.
- Run `npm run build` to confirm frontend asset compilation.

---

## Task Checklist

- [ ] Task 1: Audit & Enhance RBAC Seeders & Permissions
- [ ] Task 2: Service Layer Methods (`AdminUserService` & `RoleService`)
- [ ] Task 3: Form Requests & API Controllers
- [ ] Task 4: API Route Registration
- [ ] Task 5: Admin React Frontend UI (`StaffPage.jsx` & route in `App.jsx`)
- [ ] Task 6: Feature Test Suite & Verification

---

## Verification Plan

### Automated Tests
- Command: `docker exec ecom-panel-app php artisan test --filter=AdminStaffManagementTest`
- Expected Outcome: All assertions pass cleanly.

### Frontend Compilation
- Command: `npm run build`
- Expected Outcome: Vite build succeeds with exit code 0.
