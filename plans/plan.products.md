# Implementation Plan: Product Catalog Module

**Module Name:** Product Catalog  
**Module ID:** 06  
**Plan File:** `plans/plan.products.md`  
**Specification:** `specifications/feature.products.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 06 (Product Catalog) in the Laravel e-commerce backend platform. It encompasses database migrations for `products` and `product_categories` pivot, Eloquent model (`Product`), Form Requests, Service Layer (`ProductService`), Admin Controller (`ProductController`), Public Storefront Controller (`PublicProductController`), OpenAPI 3.0 annotations, routes registration, and automated feature testing.

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `products` and `product_categories` pivot tables. Run `php artisan migrate`.
2. **Domain Models & Relationships**: Create `Product` model (with `brand` relationship, `categories` pivot relationship, `primaryCategory` relationship, automatic slug & SKU generators, active scope, and price calculation helpers).
3. **Validation Requests**: Create Form Requests (`StoreProductRequest`, `UpdateProductRequest`).
4. **Service Layer**: Create `ProductService` (handling product creation, category pivot sync with `is_primary` flag, SKU/slug generation, admin filtering, status toggling, public storefront queries, category breadcrumbs, and related products).
5. **Controllers & OpenAPI Annotations**: Implement Admin Controller (`ProductController`) and Public Storefront Controller (`PublicProductController`) with complete OpenAPI `@OA` annotations targeting `http://localhost:8002`.
6. **Routes Registration**: Register `/api/v1/admin/products` (protected by `auth:sanctum` and `permission:<name>`) and `/api/v1/products` (public) in `routes/api.php`.
7. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to update Swagger docs.
8. **Automated Feature Testing**: Create `ProductTest.php` validating simple/variable/digital product creation, SKU/slug auto-generation, category pivot attachment, admin filtering/sorting, status toggling, public storefront catalog querying, detail page breadcrumbs, and permission authorization.

---

## 3. Architecture

- **Controllers**:
  - `App\Http\Controllers\Api\V1\Admin\ProductController`
  - `App\Http\Controllers\Api\V1\PublicProductController`
- **Services**: `App\Services\ProductService`
- **Form Requests**:
  - `App\Http\Requests\Admin\StoreProductRequest`
  - `App\Http\Requests\Admin\UpdateProductRequest`
- **Models**: `Product`, `Category`, `Brand`
- **Database Tables**: `products`, `product_categories`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000011_create_products_table.php`
  - Path: `database/migrations/2026_08_11_000012_create_product_categories_table.php`
  - Description: Create tables for `products` and `product_categories` pivot. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Model & Relationships**
  - Path: `app/Models/Product.php`
  - Description: Build `Product` model with `brand`, `categories`, `primaryCategory` relationships, automatic SKU/slug generation, active scope, and effective price attributes.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/StoreProductRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateProductRequest.php`
  - Description: Create request classes with validation rules for product creation and updates (supporting simple, variable, digital types).

- [x] **Task 4: Implement ProductService**
  - Path: `app/Services/ProductService.php`
  - Description: Implement business logic for product CRUD, category pivot sync with primary flag, admin filtering/sorting, status toggling, public catalog queries, breadcrumb trail building, and related products.

- [x] **Task 5: Implement Controllers with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/ProductController.php`
  - Path: `app/Http/Controllers/Api/V1/PublicProductController.php`
  - Description: Implement admin CRUD controller and public storefront controller with complete OpenAPI annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register admin product routes (`auth:sanctum` + `permission:<name>`) and public product routes.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation for all Product endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/ProductTest.php`
  - Description: Write comprehensive PHPUnit feature test suite validating simple/variable/digital product creation, SKU/slug auto-generation, category pivot attachment, admin filtering/sorting, status toggling, public storefront catalog querying, detail page breadcrumbs, and permission authorization.
