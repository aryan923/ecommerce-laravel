# Feature Specification: Foundation & Infrastructure Module

**Module Name:** Foundation & Infrastructure  
**Module ID:** 01  
**Specification File:** `specifications/feature.foundation.spec.md`  
**Version:** 1.3  
**Status:** Draft / Updated with Local Server URL Configuration (`http://localhost:8002`)  
**Base SRS Document:** `Requirements/srs_apis.md` (§82, §84, §85, §86, §87, §98, §99, §100), `Requirements/development_modules.md` (§Module 01)  

---

## 1. Module Overview

The Foundation & Infrastructure module establishes the core technical standards, base components, standardized response handling, global exception translation, Swagger/OpenAPI documentation generator, and configuration setup for the entire E-Commerce Backend and Admin Panel API platform. It provides `App\Traits\ApiResponseTrait`, `App\Http\Controllers\Api\V1\BaseController`, global API exception formatting, OpenAPI 3.0 specification setup via L5-Swagger (`l5-swagger`), CORS rules, Sanctum multi-guard setup, and explicit **local server URL mapping to `http://localhost:8002`** targeting **Laravel 12.x** and **PHP 8.4**.

---

## 2. Business Flow

### 2.1 API Request & Response Lifecycle
1. API client submits an HTTP request to `/api/v1/*` endpoints with header `Accept: application/json`.
2. CORS middleware (`config/cors.php`) validates request origin.
3. Laravel Routing dispatches request to appropriate API Controller extending `BaseController`.
4. Controller / Service processes request and returns standardized JSON using `ApiResponseTrait`.
5. If an unhandled exception or validation error occurs anywhere in the stack, Laravel's Exception handler intercepts it, transforming it into a standardized JSON error response adhering to `ApiResponseTrait`.

### 2.2 Swagger API Documentation Lifecycle
1. Developers add OpenAPI 3.0 annotations (`@OA\Info`, `@OA\Server`, `@OA\Get`, `@OA\Post`, `@OA\Response`, `@OA\Schema`) to all controller endpoints upon completion.
2. The primary local server URL in OpenAPI specs is configured to `http://localhost:8002`.
3. System generates OpenAPI JSON/YAML spec file at `storage/api-docs/api-docs.json`.
4. Interactive Swagger UI is exposed at `/api/documentation` allowing clients and frontend developers to test all live API endpoints against `http://localhost:8002`.

---

## 3. Functional Requirements

- **FR-FND-001**: System shall provide a reusable trait `App\Traits\ApiResponseTrait` for all controllers to return uniform JSON responses.
- **FR-FND-002**: All API responses MUST contain `success` (boolean), `message` (string), `data` (object/array/null), and `errors` (object/array/null).
- **FR-FND-003**: System shall provide a `BaseController` under `App\Http\Controllers\Api\V1` extending Laravel's base `Controller` and using `ApiResponseTrait`.
- **FR-FND-004**: System shall globally intercept exceptions for `/api/*` routes and return standard JSON error responses instead of HTML error pages.
- **FR-FND-005**: System shall format Laravel `ValidationException` (HTTP 422) with a structured `errors` object mapping fields to error message arrays.
- **FR-FND-006**: System shall format `ModelNotFoundException` and `NotFoundHttpException` as HTTP 404 with standardized JSON payload.
- **FR-FND-007**: System shall format `AuthenticationException` as HTTP 401 with standardized JSON payload.
- **FR-FND-008**: System shall format `AuthorizationException` / `AccessDeniedHttpException` as HTTP 403 with standardized JSON payload.
- **FR-FND-009**: System shall configure Laravel Sanctum authentication guards for both Customer (`users`) and Admin (`admin_users`).
- **FR-FND-010**: System shall configure CORS headers to allow cross-origin requests from frontend SPA and Admin panel clients.
- **FR-FND-011**: System shall integrate L5-Swagger (`darkaonline/l5-swagger`) to auto-generate OpenAPI 3.0 documentation for ALL API endpoints upon completion.
- **FR-FND-012**: System shall expose interactive Swagger UI at `/api/documentation` for API exploration and testing.
- **FR-FND-013**: System shall configure `http://localhost:8002` as the explicit default local server URL in OpenAPI annotations and `L5_SWAGGER_CONST_HOST`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **API Documentation Generator**: `darkaonline/l5-swagger` (OpenAPI 3.0 annotations).
- **Default Local Server URL**: `http://localhost:8002`.
- **Exception Handler**: Configured in `bootstrap/app.php` / `app/Exceptions/Handler.php`.
- **API Base Route Prefix**: `/api/v1/`.
- **HTTP Status Codes**:
  - `200 OK`: Successful GET, PUT, PATCH, DELETE operations.
  - `201 Created`: Successful POST creation operations.
  - `400 Bad Request`: Malformed payload or invalid business request.
  - `401 Unauthorized`: Unauthenticated / invalid or expired Sanctum token.
  - `403 Forbidden`: Authenticated user lacks permission / restricted role.
  - `404 Not Found`: Resource or endpoint does not exist.
  - `422 Unprocessable Entity`: Form validation errors.
  - `429 Too Many Requests`: Rate limit exceeded.
  - `500 Internal Server Error`: Unexpected server exception.

---

## 5. Database Changes

No new database tables are created in Module 01. Existing migrations (`users`, `personal_access_tokens`, `failed_jobs`, `password_reset_tokens`) shall be verified for clean execution order via `php artisan migrate`.

---

## 6. API Requirements

### 6.1 Standard JSON Response Specifications

#### Success Response Envelope (HTTP 200 / 201)
```json
{
    "success": true,
    "message": "Resource retrieved successfully",
    "data": {
        "id": 1
    },
    "errors": null
}
```

#### Paginated Response Envelope (HTTP 200)
```json
{
    "success": true,
    "message": "Collection fetched successfully",
    "data": [
        { "id": 1 },
        { "id": 2 }
    ],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 50,
        "last_page": 4
    },
    "errors": null
}
```

#### Validation Error Response Envelope (HTTP 422)
```json
{
    "success": false,
    "message": "Validation failed",
    "data": null,
    "errors": {
        "email": [
            "The email field is required."
        ]
    }
}
```

#### General Error Response Envelope (HTTP 401 / 403 / 404 / 500)
```json
{
    "success": false,
    "message": "Resource not found",
    "data": null,
    "errors": null
}
```

### 6.2 Health Check Endpoint
`GET /api/v1/health`

**OpenAPI Annotation Requirement:** Must be documented with `@OA\Get` annotation referencing server `http://localhost:8002`.

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "E-Commerce API is healthy and operational",
    "data": {
        "status": "up",
        "timestamp": "2026-08-11T12:25:00Z",
        "environment": "local",
        "framework": "Laravel 10.x",
        "php_version": "8.2.33",
        "version": "1.0.0"
    },
    "errors": null
}
```

### 6.3 Swagger Documentation UI Endpoint
`GET /api/documentation`

---

## 7. UI Requirements

- **Interactive API Documentation UI**: Accessible at `/api/documentation` rendering OpenAPI 3.0 specification for API consumers targeting `http://localhost:8002`.

---

## 8. Validation Rules

- `Accept: application/json` header is expected on all incoming API requests.
- All request parameters MUST be validated via Form Request classes in subsequent modules, utilizing the global 422 JSON formatter.

---

## 9. Permission Rules

- `/api/v1/health` and `/api/documentation` are public.
- Base response standards apply universally to public and protected endpoints.

---

## 10. Business Rules

- No raw string or HTML response may be emitted by any API route under `/api/v1/*`.
- Debug stack traces in `500` error responses MUST only be visible when `APP_DEBUG=true`.
- **Mandatory Documentation Rule**: Every module MUST include OpenAPI annotations on every created or modified controller method.
- **Server URL Rule**: All OpenAPI definitions MUST target `http://localhost:8002` as the local server URL.

---

## 11. Error Handling

Global exception mapping:
- `ValidationException` → HTTP 422 JSON format.
- `AuthenticationException` → HTTP 401 JSON format.
- `AccessDeniedHttpException` → HTTP 403 JSON format.
- `NotFoundHttpException` / `ModelNotFoundException` → HTTP 404 JSON format.
- `MethodNotAllowedHttpException` → HTTP 405 JSON format.
- `Throwable` → HTTP 500 JSON format.

---

## 12. Acceptance Criteria

- [ ] `App\Traits\ApiResponseTrait` implemented with helper methods (`successResponse`, `errorResponse`, `validationErrorResponse`).
- [ ] `App\Http\Controllers\Api\V1\BaseController` created and using `ApiResponseTrait`.
- [ ] Exception handler configured returning standardized JSON responses.
- [ ] `/api/v1/health` route responds with HTTP 200 and health status payload.
- [ ] L5-Swagger package installed and configured (`config/l5-swagger.php`).
- [ ] BaseController annotated with `@OA\Info`, `@OA\Server(url="http://localhost:8002")`, and `@OA\SecurityScheme`.
- [ ] HealthController annotated with `@OA\Get` OpenAPI annotations.
- [ ] Interactive Swagger UI accessible at `http://localhost:8002/api/documentation`.
- [ ] `php artisan l5-swagger:generate` generates valid `api-docs.json` pointing to `http://localhost:8002`.
- [ ] Unit/Feature tests pass for health check, response formatting, 404/401 handlers, and Swagger documentation UI.

---

## 13. Edge Cases

- Client accesses `/api/documentation` when documentation is regenerating → Serves compiled `api-docs.json`.
- Client sends request to non-existent API route → Handled as 404 JSON.

---

## 14. Dependencies

- Laravel 10.x / 12.x core framework.
- `darkaonline/l5-swagger` package for OpenAPI 3.0 generation.
- Laravel Sanctum package.

---

## 15. Open Questions

- None. Requirements align fully with `instruction.md` and updated `Requirements/srs_apis.md`.
