# Feature Specification: Admin Authentication & RBAC Module

**Module Name:** Admin Authentication & RBAC  
**Module ID:** 03  
**Specification File:** `specifications/feature.admin-auth.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§83, §84, §85, §86, §100), `Requirements/admin_panel.md` (§2, §34–§36, §48–§50), `Requirements/development_modules.md` (§Module 03)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Authentication & Role-Based Access Control (RBAC) module provides dedicated, secure token-based authentication and granular permission authorization for administrators and staff accessing the Admin Panel. As specified in SRS §84, Admin accounts are completely isolated from customer accounts using a dedicated `admin_users` table and Sanctum token guards. It includes role management (`roles`), permission definition (`permissions`), pivot mappings (`role_permissions`, `admin_user_roles`), permission check middleware (`CheckAdminPermission`), and admin auth endpoints (`login`, `me`, `logout`). All endpoints extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and generate OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Admin Login Flow
1. Administrator submits login credentials (`email` or `mobile`, and `password`) to `POST /api/v1/admin/auth/login`.
2. `AdminLoginRequest` validates input data.
3. System verifies credentials against `admin_users` database table.
4. System checks account status (`active`). If `inactive` or `disabled`, login is rejected with HTTP 403.
5. System updates `last_login_at` timestamp.
6. System issues a Sanctum Bearer Token with `role:admin` abilities.
7. System returns HTTP 200 OK with Bearer token, admin profile data, assigned roles, and granted permissions list.

### 2.2 Admin Profile Retrieval (`/me`) Flow
1. Authenticated admin sends `GET /api/v1/admin/auth/me` with Bearer token.
2. Sanctum middleware authenticates token against `admin_users`.
3. System returns current administrator details, role name, and complete permissions list.

### 2.3 Permission Verification Middleware Flow
1. Admin client requests a protected admin endpoint (e.g. `POST /api/v1/admin/products`).
2. `CheckAdminPermission` middleware intercepts request and inspects target permission (e.g., `products.create`).
3. If admin holds Super Admin role OR possesses the required permission via assigned roles, request proceeds to Controller.
4. If permission is lacking, middleware rejects request with HTTP 403 Forbidden ("You do not have permission to perform this action.").

### 2.4 Admin Logout Flow
1. Authenticated admin sends `POST /api/v1/admin/auth/logout`.
2. System revokes the active Sanctum token (or all admin tokens if `logout_all=true`).
3. Response returns HTTP 200 OK success message.

---

## 3. Functional Requirements

- **FR-ADM-001**: System shall maintain a dedicated `admin_users` table completely separated from customer `users`.
- **FR-ADM-002**: System shall support admin login using email (or mobile) and password.
- **FR-ADM-003**: System shall issue Sanctum Bearer Tokens upon successful admin authentication.
- **FR-ADM-004**: System shall support RBAC with configurable `roles` and module-action `permissions`.
- **FR-ADM-005**: System shall provide `CheckAdminPermission` middleware to enforce permission checks at the API controller/route level.
- **FR-ADM-006**: Super Admin role (`super_admin`) shall bypass individual permission checks and possess full system access.
- **FR-ADM-007**: System shall return assigned permissions array in admin login and `/me` responses to allow Admin Panel UI navigation filtering.
- **FR-ADM-008**: System shall track `last_login_at` and `last_login_ip` for audit logging.
- **FR-ADM-009**: System shall provide seeders for default system roles (`super_admin`, `store_manager`, `order_manager`, `product_manager`, `inventory_manager`, `customer_support`, `accountant`, `marketing_manager`), permissions, and initial Super Admin user (`admin@example.com` / `SecretAdmin123!`).
- **FR-ADM-010**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Post`, `@OA\Get`, `@OA\RequestBody`, `@OA\Response`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Authentication**: Laravel Sanctum (`Laravel\Sanctum\HasApiTokens`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Middleware**: `auth:sanctum` (configured for `admin_users` provider) and `permission:<name>`.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).
- **Rate Limiting**: `throttle:admin-login` (5 attempts per minute).

---

## 5. Database Changes

### 5.1 Create `admin_users` Table Migration
Migration: `database/migrations/2026_08_11_000003_create_admin_users_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `name` | `string` | | Full name |
| `email` | `string` | `unique` | Email address |
| `mobile` | `string` | `unique`, `nullable` | Mobile number |
| `password` | `string` | | Hashed password |
| `status` | `enum` | `['active', 'inactive', 'disabled']`, `default('active')` | Account status |
| `last_login_at` | `timestamp` | `nullable` | Last login timestamp |
| `last_login_ip` | `string` | `nullable` | Last login IP address |
| `remember_token` | `rememberToken` | | Session token |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `roles` Table Migration
Migration: `database/migrations/2026_08_11_000004_create_roles_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `name` | `string` | `unique` | Display name (e.g. "Store Manager") |
| `slug` | `string` | `unique` | Machine slug (e.g. "store_manager") |
| `description` | `string` | `nullable` | Description |
| `is_system` | `boolean` | `default(false)` | Flag preventing deletion of system roles |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.3 Create `permissions` Table Migration
Migration: `database/migrations/2026_08_11_000005_create_permissions_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `name` | `string` | `unique` | Permission key (e.g. "products.create") |
| `module` | `string` | `index` | Module area (e.g. "products", "orders") |
| `action` | `string` | | Action (e.g. "view", "create", "update", "delete") |
| `description` | `string` | `nullable` | Description |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.4 Create Pivot Tables Migration
Migration: `database/migrations/2026_08_11_000006_create_rbac_pivot_tables.php`
- `role_permissions`: `role_id` (foreign), `permission_id` (foreign), primary composite `(role_id, permission_id)`.
- `admin_user_roles`: `admin_user_id` (foreign), `role_id` (foreign), primary composite `(admin_user_id, role_id)`.

---

## 6. API Requirements

Base URL: `/api/v1/admin/auth`

### 6.1 Admin Login Endpoint
`POST /api/v1/admin/auth/login`

**Request Body:**
```json
{
    "login": "admin@example.com",
    "password": "SecretAdmin123!"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Admin login successful.",
    "data": {
        "admin": {
            "id": 1,
            "name": "Super Admin",
            "email": "admin@example.com",
            "status": "active",
            "roles": [
                { "id": 1, "name": "Super Admin", "slug": "super_admin" }
            ],
            "permissions": [
                "*"
            ]
        },
        "token": "3|sanctum_admin_token_string",
        "token_type": "Bearer"
    },
    "errors": null
}
```

### 6.2 Admin Profile Endpoint
`GET /api/v1/admin/auth/me`  
**Headers:** `Authorization: Bearer <admin_token>`

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Admin profile retrieved successfully.",
    "data": {
        "admin": {
            "id": 1,
            "name": "Super Admin",
            "email": "admin@example.com",
            "status": "active",
            "roles": ["super_admin"],
            "permissions": ["*"]
        }
    },
    "errors": null
}
```

### 6.3 Admin Logout Endpoint
`POST /api/v1/admin/auth/logout`  
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body (Optional):**
```json
{
    "logout_all": false
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Admin logged out successfully.",
    "data": null,
    "errors": null
}
```

---

## 7. UI Requirements

*N/A for backend API. All API endpoints must be documented in interactive Swagger UI at `http://localhost:8002/api/documentation` under `Admin Authentication` tag.*

---

## 8. Validation Rules

- `login`: `required|string`
- `password`: `required|string`

---

## 9. Permission Rules

- Public Admin Endpoints:
  - `POST /api/v1/admin/auth/login`
- Protected Admin Endpoints (`auth:sanctum` with `admin_users` provider):
  - `GET /api/v1/admin/auth/me`
  - `POST /api/v1/admin/auth/logout`
- Permission Check Rule: All non-auth admin endpoints in subsequent modules (Module 22–39) MUST be protected by `permission:<name>` middleware.

---

## 10. Business Rules

- Plaintext admin passwords MUST NEVER be logged or returned in responses.
- Backend MUST enforce permission authorization; hiding UI buttons on frontend is NOT security.
- Super Admin (`super_admin` role) automatically passes all permission checks.
- Admin token MUST NOT grant access to Customer API routes, and Customer token MUST NOT grant access to Admin API routes.

---

## 11. Error Handling

- **401 Unauthorized**: Missing/invalid Admin Sanctum token, or invalid login credentials.
- **403 Forbidden**: Account is `disabled` or `inactive`, or administrator lacks required permission.
- **422 Unprocessable Entity**: Form validation errors.
- **429 Too Many Requests**: Rate limit exceeded on admin login attempts.

---

## 12. Acceptance Criteria

- [ ] Migrations create `admin_users`, `roles`, `permissions`, `role_permissions`, and `admin_user_roles` tables cleanly.
- [ ] Seeders populate default roles, module permissions, and initial Super Admin user (`admin@example.com` / `SecretAdmin123!`).
- [ ] Admin login accepts email or mobile with password, issuing valid Sanctum token.
- [ ] Admin profile endpoint (`/me`) returns admin details, assigned roles, and permissions array.
- [ ] `CheckAdminPermission` middleware correctly grants access to Super Admin or authorized roles, and blocks unauthorized roles with HTTP 403.
- [ ] Admin logout revokes active token (or all tokens when `logout_all=true`).
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Admin Auth endpoints targeting `http://localhost:8002`.
- [ ] All unit/feature tests pass with 100% success rate.

---

## 13. Edge Cases

- Customer attempts to login using admin login endpoint (or vice versa) → Rejected with 401 Unauthorized.
- Admin account status set to `disabled` or `inactive` → Rejected with 403 Forbidden.
- Role/permission modified while admin has active session → Next request evaluates updated permissions dynamically.

---

## 14. Dependencies

- `Module 01: Foundation & Infrastructure` (`ApiResponseTrait`, `BaseController`, Exception Handler).
- `Laravel\Sanctum\HasApiTokens` package.

---

## 15. Open Questions

- None. Requirements align fully with `instruction.md`, `Requirements/srs_apis.md`, `Requirements/admin_panel.md`, and `Requirements/development_modules.md`.
