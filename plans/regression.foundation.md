# Regression Strategy: Foundation & Infrastructure Module

**Module Name:** Foundation & Infrastructure  
**Module ID:** 01  
**Regression File:** `plans/regression.foundation.md`  
**Specification:** `specifications/feature.foundation.spec.md`  
**Plan:** `plans/plan.foundation.md`  
**Version:** 1.3  
**Target Stack:** Laravel 12.x / PHP 8.4 / L5-Swagger (`http://localhost:8002`)  

---

## 1. Existing Affected Features

As the foundational module for the entire API backend, Module 01 affects:
- All future API controllers (`/api/v1/*`)
- All validation error responses across all modules
- All authentication and exception handling across Customer and Admin APIs
- OpenAPI / Swagger documentation generation across all modules targeting `http://localhost:8002`

---

## 2. Regression Scenarios

### REG-FND-001: Swagger Documentation Auto-Generation with Server Host
- **Scenario**: Verify that running `php artisan l5-swagger:generate` produces a valid OpenAPI 3.0 specification file (`storage/api-docs/api-docs.json`) configured with server host `http://localhost:8002` without parsing or annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: Clean execution of `l5-swagger:generate` and valid JSON generated with server URL `http://localhost:8002`.

### REG-FND-002: BaseController Trait & Annotation Compatibility
- **Scenario**: Verify that controllers extending `BaseController` successfully inherit OpenAPI `@OA\Info` definitions and `ApiResponseTrait` without trait collision or PHP 8.4 deprecations.
- **Priority**: Critical
- **Expected Result**: Clean execution and inheritance.

---

## 3. Smoke Test Suite

1. Run `php artisan l5-swagger:generate` to verify documentation generation.
2. Run `php artisan test --filter=FoundationTest` to verify health check, response formatting, exception handling, and Swagger UI.
3. Test curl request: `curl -i http://localhost:8002/api/documentation`.
