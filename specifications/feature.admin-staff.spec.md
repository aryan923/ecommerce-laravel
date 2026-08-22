# Module Specification: Admin Staff, Roles & Permissions (Module 38)

## 1. Module Overview

The **Admin Staff, Roles & Permissions** module (Module 38) provides complete management of administrative users (staff), configurable roles, and granular module/action-based permission matrices for the e-commerce system. 

It ensures that access control is enforced across all admin APIs and UI interfaces. Super Administrators can manage staff accounts, assign or revoke roles, toggle staff active/disabled status, trigger password/access resets, create custom roles, and configure module permission matrices. All administrative staff, role, and permission modifications are audit-logged for security and compliance.

---

## 2. Business Flow

```
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                        SUPER ADMIN / AUTHORIZED STAFF                   │
   └───────────────────────────────────┬─────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐                     ┌───────────────────────────────┐
│     STAFF MANAGEMENT FLOW     │                     │     ROLE & PERMISSION FLOW    │
└───────────┬───────────────────┘                     └───────────┬───────────────────┘
            │                                                     │
            ├─► List & Filter Staff Users                         ├─► List Configured Roles
            ├─► Create Staff Account                              ├─► View Grouped Permissions Matrix
            ├─► Edit Staff Details & Roles                        ├─► Create Custom Role & Permissions
            ├─► Toggle Status (Active / Disabled)                 ├─► Update Role Permissions Matrix
            ├─► Reset Access / Password                           └─► Delete Unassigned Custom Role
            └─► Audit Log Recorded for all changes
```

---

## 3. Functional Requirements

### 3.1 Staff User Management (Admin CRUD)
- **Staff List & Filtering**:
  - Paginated list of staff members displaying Name, Email, Mobile, Primary Role, Status (`active`, `inactive`, `disabled`), Last Login Timestamp, and Last Login IP Address.
  - Search staff by Name, Email, or Mobile.
  - Filter staff by Status (`active`, `inactive`, `disabled`) and Role ID.
- **Create Staff Account**:
  - Super Admin or staff with `staff.create` permission can create staff accounts with Name, Email, Mobile (optional), Password, Status, and assigned Role IDs (`role_ids`).
- **Edit Staff Account**:
  - Update Name, Email, Mobile, assigned Roles, and Status.
  - Super Admin account cannot be disabled or stripped of the `super_admin` role by another staff member.
- **Status Control**:
  - Activate, deactivate, or disable staff accounts immediately invalidating active tokens.
- **Access Reset**:
  - Trigger password reset or dispatch credentials reset notification for staff members.

### 3.2 Role & Permission Management
- **Pre-Configured System Roles**:
  - `super_admin` (Full unrestricted system access, bypasses permission checks).
  - `store_manager`, `order_manager`, `product_manager`, `inventory_manager`, `customer_support`, `accountant`, `marketing_manager`.
- **Custom Role CRUD**:
  - Super Admin or staff with `roles.create` / `roles.update` can create and edit custom roles with Name, Slug, Description, and assigned Permission IDs (`permission_ids`).
  - Protection against deleting system roles (`super_admin`) or roles currently assigned to active staff members.
- **Granular Permission Matrix**:
  - Module-action based permissions grouped logically by feature area (Products, Categories, Brands, Attributes, Inventory, Orders, Customers, Coupons, Shipping, Taxes, Reports, Reviews, CMS, Notifications, Staff, Roles, Settings).
  - Grouped view API endpoint (`GET /api/v1/admin/permissions`) returning permissions grouped by module key.

### 3.3 Security & Audit Logging
- All staff creation, edit, status toggle, access reset, role creation, role edit, and permission matrix changes are automatically audit logged in the `settings_audit_logs` / system activity table.

---

## 4. Technical Requirements

- **Framework**: Laravel 11.x REST API layer with Sanctum token authentication.
- **Frontend Framework**: React 18 with Inertia/Vite Admin Dashboard component layout.
- **Service Layer**: Decoupled `AdminUserService` and `RoleService` encapsulating DB transactions, caching, and audit trail dispatching.
- **RBAC Middleware**: Enforced via `permission:permission_name` middleware on API routes.
- **Password Security**: Passwords hashed using bcrypt via Laravel `hashed` attribute cast.

---

## 5. Database Changes

### Existing Tables (Leveraged & Enhanced)

#### `admin_users`
- `id` (bigint, primary key)
- `name` (string)
- `email` (string, unique)
- `mobile` (string, nullable)
- `password` (string, hashed)
- `status` (string, default: `active`)
- `last_login_at` (timestamp, nullable)
- `last_login_ip` (string, nullable)
- `created_at`, `updated_at` (timestamps)

#### `roles`
- `id` (bigint, primary key)
- `name` (string)
- `slug` (string, unique)
- `description` (string, nullable)
- `created_at`, `updated_at` (timestamps)

#### `permissions`
- `id` (bigint, primary key)
- `name` (string, unique e.g., `products.create`)
- `module` (string e.g., `products`)
- `action` (string e.g., `create`)
- `description` (string, nullable)
- `created_at`, `updated_at` (timestamps)

#### `admin_user_roles` (Pivot)
- `admin_user_id` (foreign key -> `admin_users.id`, cascade delete)
- `role_id` (foreign key -> `roles.id`, cascade delete)

#### `role_permissions` (Pivot)
- `role_id` (foreign key -> `roles.id`, cascade delete)
- `permission_id` (foreign key -> `permissions.id`, cascade delete)

---

## 6. API Requirements

### 6.1 Staff Management Endpoints

#### 1. List Staff Members
- **GET** `/api/v1/admin/users`
- **Query Params**: `page` (int), `per_page` (int), `search` (string), `status` (string), `role_id` (int)
- **Response**: `200 OK` (Paginated list of staff members with `roles`)

#### 2. Create Staff Member
- **POST** `/api/v1/admin/users`
- **Body**: `{ name, email, mobile, password, status, role_ids }`
- **Response**: `201 Created`

#### 3. View Staff Details
- **GET** `/api/v1/admin/users/{id}`
- **Response**: `200 OK`

#### 4. Update Staff Member
- **PUT** `/api/v1/admin/users/{id}`
- **Body**: `{ name, email, mobile, password (optional), status, role_ids }`
- **Response**: `200 OK`

#### 5. Reset Staff Access / Password
- **POST** `/api/v1/admin/users/{id}/reset-access`
- **Body**: `{ new_password (optional) }`
- **Response**: `200 OK`

#### 6. Delete Staff Member
- **DELETE** `/api/v1/admin/users/{id}`
- **Response**: `200 OK`

---

### 6.2 Role & Permission Endpoints

#### 7. List Roles
- **GET** `/api/v1/admin/roles`
- **Response**: `200 OK` (List of roles with `permissions_count` and `staff_count`)

#### 8. Create Custom Role
- **POST** `/api/v1/admin/roles`
- **Body**: `{ name, description, permission_ids }`
- **Response**: `201 Created`

#### 9. View Role Details
- **GET** `/api/v1/admin/roles/{id}`
- **Response**: `200 OK` (Role with `permissions` and assigned `adminUsers`)

#### 10. Update Role & Permissions
- **PUT** `/api/v1/admin/roles/{id}`
- **Body**: `{ name, description, permission_ids }`
- **Response**: `200 OK`

#### 11. Delete Custom Role
- **DELETE** `/api/v1/admin/roles/{id}`
- **Response**: `200 OK`

#### 12. List Grouped Permissions Matrix
- **GET** `/api/v1/admin/permissions`
- **Response**: `200 OK` (List of permissions grouped by `module`)

---

## 7. UI Requirements (`StaffManagementPage.jsx`)

### 7.1 Screens & Layout
- **Page Container**: Standard admin wrapper (`staff-page-container`).
- **Page Header**: Title "Staff & Role Access Control", description, Refresh button, and **"+ Add Staff Member"** / **"+ Create Role"** action buttons.
- **Top 4-Cards KPI Grid**:
  1. Total Staff Accounts (Count, Active/Disabled subtext)
  2. Active Roles Configured (Count, Super Admin status)
  3. Total Permission Nodes (Count, Module count)
  4. Security & Audit (Logged admin actions count)
- **Integrated Dashboard Card with Segmented Tabs**:
  - Tab 1: **Staff Members** (Data table with search, role filter, status badges, action icons for edit, status toggle, reset access, delete).
  - Tab 2: **Roles & Permissions** (Cards/Table view of roles with permissions tags, staff count, edit matrix modal, delete custom role).
  - Tab 3: **Permission Matrix Overview** (Grouped visual checklist of system permissions by module).
- **Modals**:
  - Staff Create/Edit Modal.
  - Role Create/Edit Modal with visual checkbox grid grouped by module.
  - Staff Reset Access Confirmation Modal.

---

## 8. Validation Rules

- `name`: `required|string|max:255`
- `email`: `required|email|max:255|unique:admin_users,email,{id}`
- `mobile`: `nullable|string|max:30`
- `password`: `nullable|string|min:8|max:100` (required on store)
- `status`: `required|string|in:active,inactive,disabled`
- `role_ids`: `required|array|min:1`
- `role_ids.*`: `exists:roles,id`
- `role.name`: `required|string|max:255|unique:roles,name,{id}`
- `permission_ids`: `required|array|min:1`
- `permission_ids.*`: `exists:permissions,id`

---

## 9. Permission Rules

- View Staff & Roles: `staff.view` or `roles.view` or `isSuperAdmin()`
- Create Staff: `staff.create` or `isSuperAdmin()`
- Update Staff: `staff.update` or `isSuperAdmin()`
- Delete Staff: `staff.delete` or `isSuperAdmin()`
- Manage Roles: `roles.create` / `roles.update` / `roles.delete` or `isSuperAdmin()`

---

## 10. Business Rules

1. Super Admin role (`super_admin`) cannot be deleted or renamed.
2. A staff member cannot remove the `super_admin` role from themselves or disable their own account while logged in.
3. System roles assigned to active staff members cannot be deleted until all assigned staff are reassigned to another role.
4. Changing a staff member's status to `disabled` immediately revokes API Sanctum tokens for that user.
5. All role and permission changes trigger an audit log record.

---

## 11. Acceptance Criteria

1. Administrator can view, search, and filter all staff members.
2. Administrator can create a new staff account and assign multiple roles.
3. Administrator can toggle staff status (`active` / `disabled`).
4. Administrator can reset staff password and revoke active sessions.
5. Administrator can view, create, edit, and delete custom roles with specific permission assignments.
6. Module permission matrix displays all permissions grouped cleanly by module.
7. Automated feature tests (`AdminStaffManagementTest`) pass with 100% assertions.
