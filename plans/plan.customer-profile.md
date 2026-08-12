# Implementation Plan: Customer Profile & Address Management Module

**Module Name:** Customer Profile & Address Management  
**Module ID:** 10  
**Plan File:** `plans/plan.customer-profile.md`  
**Specification:** `specifications/feature.customer-profile.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan outlines the implementation strategy for Module 10 (Customer Profile & Address Management) in the Laravel e-commerce backend platform. It encompasses database migration for the `addresses` table, `Address` Eloquent model, updates to `User` model, Form Request validation classes, Service Layer (`CustomerProfileService`), Customer Controllers (`CustomerProfileController`, `AddressController`), OpenAPI 3.0 annotations, API route registrations, and automated feature testing (`CustomerProfileTest.php`).

---

## 2. Development Strategy

1. **Database Layer**: Create migration for `addresses` table (`2026_08_11_000018_create_addresses_table.php`). Run `php artisan migrate`.
2. **Domain Models & Relationships**: Build `Address` Eloquent model with `belongsTo(User::class)` and active scopes. Update `User` model with `addresses()` relationship.
3. **Form Request Validation**: Create Form Requests (`UpdateProfileRequest`, `ChangePasswordRequest`, `AddressRequest`).
4. **Service Layer**: Implement `CustomerProfileService` encapsulating profile updates, password hashing checks, address CRUD, default billing/shipping address exclusivity demotion, and ownership verification.
5. **Controller & OpenAPI Annotations**: Implement `CustomerProfileController` (3 endpoints) and `AddressController` (7 endpoints) with full OpenAPI 3.0 annotations targeting `http://localhost:8002`.
6. **Route Registration**: Register `/api/v1/customer/*` routes in `routes/api.php` guarded by `auth:sanctum`.
7. **Swagger Regeneration**: Run `php artisan l5-swagger:generate` to compile updated OpenAPI documentation.
8. **Automated Feature Testing**: Create `CustomerProfileTest.php` validating profile fetch, profile update, password change, address CRUD, default address exclusivity, cross-customer isolation, and Sanctum authentication enforcement.

---

## 3. Architecture

- **Controllers**:
  - `App\Http\Controllers\Api\V1\Customer\CustomerProfileController`
  - `App\Http\Controllers\Api\V1\Customer\AddressController`
- **Services**: `App\Services\CustomerProfileService`
- **Form Requests**:
  - `App\Http\Requests\Customer\UpdateProfileRequest`
  - `App\Http\Requests\Customer\ChangePasswordRequest`
  - `App\Http\Requests\Customer\AddressRequest`
- **Models**: `Address`, `User`
- **Database Tables**: `users`, `addresses`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migration**
  - Path: `database/migrations/2026_08_11_000018_create_addresses_table.php`
  - Description: Create `addresses` table with FK constraints to `users(id)`, address fields (`line_1`, `line_2`, `city`, `state`, `country`, `postal_code`), address `type` enum, and default flags (`is_default_billing`, `is_default_shipping`). Execute `php artisan migrate`.

- [x] **Task 2: Create Address Model & Update User Model**
  - Path: `app/Models/Address.php`
  - Path: `app/Models/User.php`
  - Description: Implement `Address` model with relationships, fillables, and type scopes. Add `addresses()`, `defaultShippingAddress()`, and `defaultBillingAddress()` relationships to `User` model.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Customer/UpdateProfileRequest.php`
  - Path: `app/Http/Requests/Customer/ChangePasswordRequest.php`
  - Path: `app/Http/Requests/Customer/AddressRequest.php`
  - Description: Implement request validation rules for customer profile updates, password changes, and address creation/updates.

- [x] **Task 4: Implement CustomerProfileService**
  - Path: `app/Services/CustomerProfileService.php`
  - Description: Implement business logic for updating customer profile, validating and hashing new passwords, handling address CRUD, enforcing single default billing/shipping address exclusivity, and cross-customer isolation.

- [x] **Task 5: Implement Controllers with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Customer/CustomerProfileController.php`
  - Path: `app/Http/Controllers/Api/V1/Customer/AddressController.php`
  - Description: Create controllers for profile management (profile view, update, change-password) and address management (index, store, show, update, destroy, setDefaultShipping, setDefaultBilling) extending `BaseController` and `ApiResponseTrait` with full `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register customer profile and address routes guarded by `auth:sanctum`.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Execute `php artisan l5-swagger:generate` to compile Swagger documentation for all Customer Profile & Address endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/CustomerProfileTest.php`
  - Description: Create PHPUnit feature test suite covering profile fetching, profile updates, password changes with current password check, address CRUD operations, default billing/shipping exclusivity, and cross-customer security isolation.
