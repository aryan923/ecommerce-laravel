# Test Cases: Admin Authentication & RBAC Module

**Module Name:** Admin Authentication & RBAC  
**Module ID:** 03  
**Test File:** `plans/test-cases.admin-auth.md`  
**Specification:** `specifications/feature.admin-auth.spec.md`  
**Plan:** `plans/plan.admin-auth.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-ADM-001: Super Admin Login Success
- **Preconditions**: Super Admin user exists in `admin_users` table via seeder.
- **Input**: `POST /api/v1/admin/auth/login` with `login: "admin@example.com"` and `password: "SecretAdmin123!"`.
- **Expected Result**: HTTP 200 OK, returns Sanctum Bearer token, admin details, role `super_admin`, and permissions array containing `*`.

### TC-ADM-002: Fetch Admin Profile (`/me`)
- **Preconditions**: Super Admin is authenticated with valid Bearer token.
- **Input**: `GET /api/v1/admin/auth/me` with `Authorization: Bearer <admin_token>`.
- **Expected Result**: HTTP 200 OK, returns admin details, assigned roles, and permissions list.

### TC-ADM-003: CheckAdminPermission Middleware Allowed (Super Admin)
- **Preconditions**: Super Admin token provided.
- **Input**: Request endpoint protected by `permission:products.create`.
- **Expected Result**: Passes permission check and executes request successfully.

### TC-ADM-004: CheckAdminPermission Middleware Allowed (Role Permission)
- **Preconditions**: Admin user with `product_manager` role possessing `products.create` permission.
- **Input**: Request endpoint protected by `permission:products.create`.
- **Expected Result**: Passes permission check and executes request successfully.

### TC-ADM-005: Admin Logout Success
- **Preconditions**: Valid admin Bearer token provided.
- **Input**: `POST /api/v1/admin/auth/logout`.
- **Expected Result**: HTTP 200 OK, admin token deleted from `personal_access_tokens` table.

---

## 2. Negative Test Scenarios

### TC-ADM-006: Admin Login with Incorrect Password
- **Input**: `POST /api/v1/admin/auth/login` with wrong password.
- **Expected Result**: HTTP 401 Unauthorized, message "Invalid admin credentials".

### TC-ADM-007: Admin Login with Disabled Account Status
- **Preconditions**: Admin user status set to `disabled`.
- **Input**: Correct login credentials.
- **Expected Result**: HTTP 403 Forbidden, message "Your admin account is disabled or inactive".

### TC-ADM-008: CheckAdminPermission Middleware Denied
- **Preconditions**: Admin user with `order_manager` role (no `products.delete` permission).
- **Input**: Request endpoint protected by `permission:products.delete`.
- **Expected Result**: HTTP 403 Forbidden, message "You do not have permission to perform this action".

### TC-ADM-009: Guard Isolation (Customer Token Accessing Admin Endpoint)
- **Preconditions**: Customer Bearer token generated via customer Auth API.
- **Input**: `GET /api/v1/admin/auth/me` with Customer Bearer token.
- **Expected Result**: HTTP 401 Unauthorized.

---

## 3. Security & Validation Tests

- **TC-ADM-010**: Admin login fails when `login` or `password` is missing (HTTP 422).
- **TC-ADM-011**: Admin Bearer token cannot be reused after calling `/logout` endpoint (HTTP 401).
- **TC-ADM-012**: Rate limiting triggers after 5 failed admin login attempts per minute (HTTP 429 Too Many Requests).
- **TC-ADM-013**: Interactive Swagger UI at `http://localhost:8002/api/documentation` contains all Admin Auth endpoints (`/admin/auth/login`, `/admin/auth/me`, `/admin/auth/logout`).
