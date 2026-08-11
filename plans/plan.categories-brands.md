# Implementation Plan: Categories & Brands Module

**Module Name:** Categories & Brands  
**Module ID:** 04  
**Plan File:** `plans/plan.categories-brands.md`  
**Specification:** `specifications/feature.categories-brands.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan defines the step-by-step development strategy for implementing Module 04 (Categories & Brands) in the Laravel e-commerce backend platform. It encompasses database migrations for `categories` and `brands`, Eloquent models (`Category`, `Brand`), Form Requests, Service Layer (`CategoryService`, `BrandService`), Admin Controllers (`CategoryController`, `BrandController`), Public Controllers (`PublicCategoryController`, `PublicBrandController`), OpenAPI 3.0 annotations, routes registration, and automated feature testing.

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `categories` and `brands` tables. Run `php artisan migrate`.
2. **Domain Models & Relationships**: Create `Category` (with self-referencing `parent`, `children`, `ancestors` methods, tree scope, slug generator) and `Brand` models.
3. **Validation Requests**: Create Form Requests (`StoreCategoryRequest`, `UpdateCategoryRequest`, `StoreBrandRequest`, `UpdateBrandRequest`, `ReorderCategoriesRequest`).
4. **Service Layer**: Create `CategoryService` (handling category tree generation, parent loop validation, child deletion checks, reordering) and `BrandService`.
5. **Controllers & OpenAPI Annotations**: Implement Admin Controllers (`CategoryController`, `BrandController`) and Public Storefront Controllers (`PublicCategoryController`, `PublicBrandController`) with complete OpenAPI `@OA` annotations targeting `http://localhost:8002`.
6. **Routes Registration**: Register `/api/v1/admin/categories`, `/api/v1/admin/brands` (protected by `auth:sanctum` and `permission:<name>`) and `/api/v1/categories`, `/api/v1/brands` (public) in `routes/api.php`.
7. **Swagger Spec Regeneration**: Run `php artisan l5-swagger:generate` to update Swagger docs.
8. **Automated Feature Testing**: Create `CategoryTest.php` and `BrandTest.php` validating CRUD operations, tree structures, self-parenting prevention, child deletion guards, public catalog queries, and permission authorization.

---

## 3. Architecture

- **Controllers**:
  - `App\Http\Controllers\Api\V1\Admin\CategoryController`
  - `App\Http\Controllers\Api\V1\Admin\BrandController`
  - `App\Http\Controllers\Api\V1\PublicCategoryController`
  - `App\Http\Controllers\Api\V1\PublicBrandController`
- **Services**:
  - `App\Services\CategoryService`
  - `App\Services\BrandService`
- **Form Requests**:
  - `App\Http\Requests\Admin\StoreCategoryRequest`
  - `App\Http\Requests\Admin\UpdateCategoryRequest`
  - `App\Http\Requests\Admin\StoreBrandRequest`
  - `App\Http\Requests\Admin\UpdateBrandRequest`
  - `App\Http\Requests\Admin\ReorderCategoriesRequest`
- **Models**: `Category`, `Brand`
- **Database Tables**: `categories`, `brands`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000007_create_categories_table.php`
  - Path: `database/migrations/2026_08_11_000008_create_brands_table.php`
  - Description: Create tables for `categories` (with self-referencing `parent_id`) and `brands`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models & Scopes**
  - Path: `app/Models/Category.php`
  - Path: `app/Models/Brand.php`
  - Description: Build `Category` model with `parent`, `children` relationships, automatic slug generation, tree scope, and active scope. Build `Brand` model.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/StoreCategoryRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateCategoryRequest.php`
  - Path: `app/Http/Requests/Admin/StoreBrandRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateBrandRequest.php`
  - Path: `app/Http/Requests/Admin/ReorderCategoriesRequest.php`
  - Description: Create request classes with validation rules for categories and brands.

- [x] **Task 4: Implement CategoryService & BrandService**
  - Path: `app/Services/CategoryService.php`
  - Path: `app/Services/BrandService.php`
  - Description: Implement business logic for category tree creation, self-parenting check, sub-category deletion guard, sort order reordering, and brand management.

- [x] **Task 5: Implement Controllers with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/CategoryController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/BrandController.php`
  - Path: `app/Http/Controllers/Api/V1/PublicCategoryController.php`
  - Path: `app/Http/Controllers/Api/V1/PublicBrandController.php`
  - Description: Implement admin CRUD controllers and public storefront controllers with complete OpenAPI annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register admin category/brand routes (`auth:sanctum` + `permission:<name>`) and public category/brand routes.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Run `php artisan l5-swagger:generate` to compile Swagger documentation for all Category & Brand endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/CategoryTest.php`
  - Path: `tests/Feature/BrandTest.php`
  - Description: Write comprehensive PHPUnit feature test suites validating admin category CRUD, tree generation, child deletion guards, reordering, brand CRUD, public storefront endpoints, and permission authorization.
