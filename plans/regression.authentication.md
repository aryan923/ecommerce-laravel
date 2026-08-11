# Regression Strategy: User Authentication (Customer) Module

**Module Name:** User Authentication (Customer)  
**Module ID:** 02  
**Regression File:** `plans/regression.authentication.md`  
**Specification:** `specifications/feature.authentication.spec.md`  
**Plan:** `plans/plan.authentication.md`  
**Version:** 1.2  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Since User Authentication is the core module for customer identity, the following foundation components and dependent modules are affected:

- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Exception Handler)
- Customer Profile & Addresses (Module 10)
- Shopping Cart (Module 12)
- Order Management (Module 18)

---

## 2. Regression Scenarios

### REG-AUTH-001: Foundation Exception Handler & Response Trait Compatibility
- **Scenario**: Verify that `AuthController` responses and validation errors properly utilize `ApiResponseTrait` and `Handler` without bypassing standard `{ success, message, data, errors }` format.
- **Priority**: Critical
- **Expected Result**: Clean JSON format across all auth endpoints.

### REG-AUTH-002: Sanctum Token Authentication & Guard Isolation
- **Scenario**: Verify that customer Sanctum tokens issued by `AuthController` validate properly under `auth:sanctum` middleware without interfering with admin guards.
- **Priority**: Critical
- **Expected Result**: Customer token authorizes customer routes; invalid/revoked token returns HTTP 401.

### REG-AUTH-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Auth endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/forgot-password`, and `/auth/reset-password`.

---

## 3. Smoke Test Suite

1. Execute `php artisan migrate` to ensure clean database state.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=AuthTest` to verify all authentication feature tests.
4. Perform end-to-end API verification: Register → Login → Fetch `/me` → Logout → Verify token invalidated.
