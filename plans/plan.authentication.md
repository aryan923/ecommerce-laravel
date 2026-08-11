# Implementation Plan: User Authentication (Customer) Module

**Module Name:** User Authentication (Customer)  
**Module ID:** 02  
**Plan File:** `plans/plan.authentication.md`  
**Specification:** `specifications/feature.authentication.spec.md`  
**Version:** 1.2  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 02 (User Authentication - Customer) in the Laravel e-commerce backend platform. It encompasses database migrations, models, services, form request validations, controller endpoints with OpenAPI 3.0 annotations, routes, and unit testing.

---

## 2. Development Strategy

1. **Database Layer**: Update `users` table migration and create `otps` table migration. Run `php artisan migrate`.
2. **Domain Models**: Update `User` model with traits and attributes; create `Otp` model.
3. **Validation Requests**: Create Form Request classes (`RegisterRequest`, `LoginRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`).
4. **Service Layer**: Implement `AuthService` handling registration, dual-identifier login check, token creation/revocation, OTP generation, and password reset.
5. **Controller & OpenAPI Annotations**: Implement `AuthController` extending `BaseController`, using `ApiResponseTrait`, and adding full OpenAPI `@OA\Post`, `@OA\Get`, `@OA\RequestBody`, `@OA\Response` annotations targeting `http://localhost:8002`.
6. **Routes Registration**: Register `/api/v1/auth/*` routes in `routes/api.php`.
7. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to compile Swagger docs.
8. **Automated Feature Testing**: Create `AuthTest.php` feature tests validating registration, dual-identifier login, profile fetching, logout token revocation, and password reset.

---

## 3. Architecture

- **Controllers**: `App\Http\Controllers\Api\V1\AuthController` (extending `BaseController`)
- **Services**: `App\Services\AuthService`
- **Models**: `App\Models\User`, `App\Models\Otp`
- **Form Requests**: 
  - `App\Http\Requests\Auth\RegisterRequest`
  - `App\Http\Requests\Auth\LoginRequest`
  - `App\Http\Requests\Auth\ForgotPasswordRequest`
  - `App\Http\Requests\Auth\ResetPasswordRequest`
- **Middleware**: `auth:sanctum` for protected routes (`/me`, `/logout`)
- **OpenAPI / Swagger**: L5-Swagger annotations on `AuthController`
- **Database Tables**: `users`, `otps`, `personal_access_tokens`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000001_add_auth_fields_to_users_table.php`
  - Path: `database/migrations/2026_08_11_000002_create_otps_table.php`
  - Description: Add `first_name`, `last_name`, `mobile`, `status`, `role`, `terms_accepted` to `users` and create `otps` table. Run `php artisan migrate`.

- [x] **Task 2: Update User Model & Create Otp Model**
  - Path: `app/Models/User.php`
  - Path: `app/Models/Otp.php`
  - Description: Add fillable attributes, hidden fields, casts, and helper methods to `User` and `Otp` models.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Auth/RegisterRequest.php`
  - Path: `app/Http/Requests/Auth/LoginRequest.php`
  - Path: `app/Http/Requests/Auth/ForgotPasswordRequest.php`
  - Path: `app/Http/Requests/Auth/ResetPasswordRequest.php`
  - Description: Implement validation rules according to specification.

- [x] **Task 4: Implement AuthService**
  - Path: `app/Services/AuthService.php`
  - Description: Implement business logic for registration, dual-identifier login check, token creation/revocation, OTP generation, and password reset.

- [x] **Task 5: Implement AuthController with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/AuthController.php`
  - Description: Build API controller endpoints (`register`, `login`, `me`, `logout`, `forgotPassword`, `resetPassword`) extending `BaseController` and containing complete OpenAPI annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register route group `/api/v1/auth` with public and `auth:sanctum` protected endpoints.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation containing all Auth endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/AuthTest.php`
  - Description: Write comprehensive PHPUnit test suite covering happy paths, negative tests, validation errors, token invalidation, and password reset.
