# Implementation Plan: Product Variants Module

**Module Name:** Product Variants  
**Module ID:** 07  
**Plan File:** `plans/plan.product-variants.md`  
**Specification:** `specifications/feature.product-variants.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 07 (Product Variants) in the Laravel e-commerce backend platform. It encompasses database migrations for `product_variants` and `product_variant_attribute_values` pivot, Eloquent model (`ProductVariant`), Form Requests, Service Layer (`VariantService`), Admin Controller (`VariantController`), update to `ProductService` & `Product` model for storefront detail integration, OpenAPI 3.0 annotations, routes registration, and automated feature testing.

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `product_variants` and `product_variant_attribute_values` pivot. Run `php artisan migrate`.
2. **Domain Models & Relationships**: Create `ProductVariant` model (with `product` relationship, `attributeValues` pivot relationship, SKU auto-generator, active scope, and effective price accessor). Update `Product` model to add `variants` relationship.
3. **Validation Requests**: Create Form Requests (`GenerateVariantMatrixRequest`, `StoreVariantRequest`, `UpdateVariantRequest`).
4. **Service Layer**: Create `VariantService` (handling Cartesian product matrix generation, single variant creation, update, status toggle, deletion, and variant list queries). Update `ProductService` to include active variants in storefront product detail API.
5. **Controllers & OpenAPI Annotations**: Implement Admin Controller (`VariantController`) with complete OpenAPI `@OA` annotations targeting `http://localhost:8002`.
6. **Routes Registration**: Register `/api/v1/admin/products/{product_id}/variants`, `/api/v1/admin/products/{product_id}/variants/generate`, and `/api/v1/admin/variants/{id}` (protected by `auth:sanctum` and `permission:<name>`) in `routes/api.php`.
7. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to update Swagger docs.
8. **Automated Feature Testing**: Create `VariantTest.php` validating matrix generation, single variant CRUD, status toggling, duplicate matrix avoidance, storefront variant inclusion, and permission authorization.

---

## 3. Architecture

- **Controllers**:
  - `App\Http\Controllers\Api\V1\Admin\VariantController`
- **Services**: `App\Services\VariantService`
- **Form Requests**:
  - `App\Http\Requests\Admin\GenerateVariantMatrixRequest`
  - `App\Http\Requests\Admin\StoreVariantRequest`
  - `App\Http\Requests\Admin\UpdateVariantRequest`
- **Models**: `ProductVariant`, `Product`, `AttributeValue`
- **Database Tables**: `product_variants`, `product_variant_attribute_values`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000013_create_product_variants_table.php`
  - Path: `database/migrations/2026_08_11_000014_create_product_variant_attribute_values_table.php`
  - Description: Create tables for `product_variants` and `product_variant_attribute_values` pivot. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Model & Update Product Model**
  - Path: `app/Models/ProductVariant.php`
  - Path: `app/Models/Product.php`
  - Description: Build `ProductVariant` model with `product` and `attributeValues` relationships. Update `Product` model with `variants` relationship.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/GenerateVariantMatrixRequest.php`
  - Path: `app/Http/Requests/Admin/StoreVariantRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateVariantRequest.php`
  - Description: Create request classes for matrix generation and variant store/update.

- [x] **Task 4: Implement VariantService & Update ProductService**
  - Path: `app/Services/VariantService.php`
  - Path: `app/Services/ProductService.php`
  - Description: Implement Cartesian product algorithm, variant CRUD, status toggling, and update `ProductService` to return active variants on public product detail page.

- [x] **Task 5: Implement Controllers with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/VariantController.php`
  - Description: Implement admin variant controller with matrix generation and CRUD endpoints with complete OpenAPI annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register admin variant routes (`auth:sanctum` + `permission:<name>`).

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation for all Variant endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/VariantTest.php`
  - Description: Write comprehensive PHPUnit feature test suite validating matrix generation, manual variant creation, price/stock updates, status toggling, storefront detail integration, and permission authorization.
