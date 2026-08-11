# Implementation Plan: Foundation & Infrastructure Module

**Module Name:** Foundation & Infrastructure  
**Module ID:** 01  
**Plan File:** `plans/plan.foundation.md`  
**Specification:** `specifications/feature.foundation.spec.md`  
**Version:** 1.3  
**Target Stack:** Laravel 12.x / PHP 8.4 / Swagger OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** In Progress / Updated with Local Server URL `http://localhost:8002`  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing the Foundation & Infrastructure module (Module 01) including core API traits, base controller, global exception handler, health check endpoint, CORS configuration, Sanctum multi-guard setup, and **L5-Swagger OpenAPI 3.0 API Documentation Generator targeting `http://localhost:8002`** to satisfy SRS requirement: *"All APIs should create a swagger documentation after completion. Local server: http://localhost:8002"*.

---

## 2. Development Strategy

1. **API Response Trait**: Build `App\Traits\ApiResponseTrait` providing reusable helper methods for JSON responses (`successResponse`, `errorResponse`, `validationErrorResponse`).
2. **Base Controller**: Create `App\Http\Controllers\Api\V1\BaseController` utilizing `ApiResponseTrait` and base `@OA\Info` and `@OA\Server(url="http://localhost:8002")` OpenAPI annotations.
3. **Health Check Endpoint**: Create `HealthController` and `/api/v1/health` route with `@OA\Get` annotations returning health metrics.
4. **Global Exception Handler**: Configure exception rendering in `app/Exceptions/Handler.php` to catch API exceptions (`ValidationException`, `ModelNotFoundException`, `AuthenticationException`, etc.) and format them as standard JSON.
5. **CORS & Sanctum Config**: Update `config/cors.php` and `config/auth.php` for Sanctum guards.
6. **L5-Swagger OpenAPI Setup**: Install `darkaonline/l5-swagger`, publish configuration, set `L5_SWAGGER_CONST_HOST=http://localhost:8002`, generate API spec file (`php artisan l5-swagger:generate`), and expose `/api/documentation`.
7. **Automated Testing**: Implement `FoundationTest.php` feature tests to verify API response formats, health check, error handlers, and Swagger UI accessibility on `http://localhost:8002`.

---

## 3. Architecture

- **Target Stack**: Laravel 12.x / PHP 8.4 / MySQL 8.0 / L5-Swagger
- **Local Server URL**: `http://localhost:8002`
- **Traits**: `App\Traits\ApiResponseTrait`
- **Controllers**: 
  - `App\Http\Controllers\Api\V1\BaseController`
  - `App\Http\Controllers\Api\V1\HealthController`
- **Exception Handler**: `app/Exceptions/Handler.php`
- **Configuration Files**: `config/cors.php`, `config/auth.php`, `config/l5-swagger.php`
- **Routes**: `routes/api.php`
- **Swagger Documentation**: `/api/documentation` (Spec: `storage/api-docs/api-docs.json`)
- **Feature Tests**: `tests/Feature/FoundationTest.php`

---

## 4. Task Breakdown

- [x] **Task 1: Create ApiResponseTrait**
  - Path: `app/Traits/ApiResponseTrait.php`
  - Description: Implement `successResponse()`, `errorResponse()`, `validationErrorResponse()`, and `paginatedResponse()` methods compatible with PHP 8.4 type system.

- [x] **Task 2: Create BaseController with Server URL**
  - Path: `app/Http/Controllers/Api/V1/BaseController.php`
  - Description: Create abstract base API controller extending Laravel's `Controller` and using `ApiResponseTrait`. Include base OpenAPI `@OA\Info`, `@OA\Server(url="http://localhost:8002")`, and `@OA\SecurityScheme` annotations.

- [x] **Task 3: Implement Health Check Controller & Route**
  - Path: `app/Http/Controllers/Api/V1/HealthController.php`
  - Path: `routes/api.php`
  - Description: Implement `HealthController` returning system health status at `GET /api/v1/health` with OpenAPI `@OA\Get` annotations.

- [x] **Task 4: Update Global Exception Handler for API Routes**
  - Path: `app/Exceptions/Handler.php`
  - Description: Intercept API exceptions (Validation, ModelNotFound, Unauthenticated, Unauthorized, 500) and convert them to standard JSON responses using `ApiResponseTrait`.

- [x] **Task 5: Update CORS & Auth Configuration**
  - Path: `config/cors.php`
  - Path: `config/auth.php`
  - Description: Tune CORS origins, headers, and set up Sanctum auth guards.

- [x] **Task 6: Install & Configure L5-Swagger API Documentation (http://localhost:8002)**
  - Path: `config/l5-swagger.php`
  - Path: `storage/api-docs/api-docs.json`
  - Description: Install `darkaonline/l5-swagger` via Composer, publish config, configure `L5_SWAGGER_CONST_HOST=http://localhost:8002`, add `@OA` annotations to controllers, and execute `php artisan l5-swagger:generate`.

- [x] **Task 7: Implement Foundation Feature Tests (including Swagger UI)**
  - Path: `tests/Feature/FoundationTest.php`
  - Description: Write PHPUnit/Pest tests checking health endpoint, success payload format, validation error formatting, 404 formatting, 401 formatting, and `/api/documentation` accessibility.
