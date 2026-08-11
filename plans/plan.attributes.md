# Implementation Plan: Attributes & Attribute Values Module

**Module Name:** Attributes & Attribute Values  
**Module ID:** 05  
**Plan File:** `plans/plan.attributes.md`  
**Specification:** `specifications/feature.attributes.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 05 (Attributes & Attribute Values) in the Laravel e-commerce backend platform. It encompasses database migrations for `attributes` and `attribute_values`, Eloquent models (`Attribute`, `AttributeValue`), Form Requests, Service Layer (`AttributeService`), Admin Controllers (`AttributeController`, `AttributeValueController`), Public Controller (`PublicAttributeController`), OpenAPI 3.0 annotations, routes registration, and automated feature testing.

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `attributes` and `attribute_values` tables. Run `php artisan migrate`.
2. **Domain Models & Relationships**: Create `Attribute` (with `values` relationship, code generator, filterable and active scopes) and `AttributeValue` (with `attribute` relationship).
3. **Validation Requests**: Create Form Requests (`StoreAttributeRequest`, `UpdateAttributeRequest`, `StoreAttributeValueRequest`, `UpdateAttributeValueRequest`).
4. **Service Layer**: Create `AttributeService` (handling attribute CRUD, value CRUD, active filterable storefront queries).
5. **Controllers & OpenAPI Annotations**: Implement Admin Controllers (`AttributeController`, `AttributeValueController`) and Public Storefront Controller (`PublicAttributeController`) with complete OpenAPI `@OA` annotations targeting `http://localhost:8002`.
6. **Routes Registration**: Register `/api/v1/admin/attributes`, `/api/v1/admin/attribute-values` (protected by `auth:sanctum` and `permission:<name>`) and `/api/v1/attributes` (public) in `routes/api.php`.
7. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to update Swagger docs.
8. **Automated Feature Testing**: Create `AttributeTest.php` validating attribute CRUD, value CRUD, status toggling, public filterable queries, and permission authorization.

---

## 3. Architecture

- **Controllers**:
  - `App\Http\Controllers\Api\V1\Admin\AttributeController`
  - `App\Http\Controllers\Api\V1\Admin\AttributeValueController`
  - `App\Http\Controllers\Api\V1\PublicAttributeController`
- **Services**: `App\Services\AttributeService`
- **Form Requests**:
  - `App\Http\Requests\Admin\StoreAttributeRequest`
  - `App\Http\Requests\Admin\UpdateAttributeRequest`
  - `App\Http\Requests\Admin\StoreAttributeValueRequest`
  - `App\Http\Requests\Admin\UpdateAttributeValueRequest`
- **Models**: `Attribute`, `AttributeValue`
- **Database Tables**: `attributes`, `attribute_values`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000009_create_attributes_table.php`
  - Path: `database/migrations/2026_08_11_000010_create_attribute_values_table.php`
  - Description: Create tables for `attributes` and `attribute_values`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models & Relationships**
  - Path: `app/Models/Attribute.php`
  - Path: `app/Models/AttributeValue.php`
  - Description: Build `Attribute` model with `values` relationship, code generator, and active/filterable scopes. Build `AttributeValue` model.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/StoreAttributeRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateAttributeRequest.php`
  - Path: `app/Http/Requests/Admin/StoreAttributeValueRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateAttributeValueRequest.php`
  - Description: Create request classes with validation rules for attributes and attribute values.

- [x] **Task 4: Implement AttributeService**
  - Path: `app/Services/AttributeService.php`
  - Description: Implement business logic for attribute CRUD, status toggling, attribute value CRUD, and public filterable attribute queries.

- [x] **Task 5: Implement Controllers with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/AttributeController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/AttributeValueController.php`
  - Path: `app/Http/Controllers/Api/V1/PublicAttributeController.php`
  - Description: Implement admin CRUD controllers and public storefront controller with complete OpenAPI annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register admin attribute routes (`auth:sanctum` + `permission:<name>`) and public attribute route.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation for all Attribute endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/AttributeTest.php`
  - Description: Write comprehensive PHPUnit feature test suite validating attribute CRUD, value CRUD, status toggling, public filterable queries, and permission authorization.
