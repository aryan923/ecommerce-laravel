# Implementation Plan: Product Media Management Module

**Module Name:** Product Media Management  
**Module ID:** 08  
**Plan File:** `plans/plan.media.md`  
**Specification:** `specifications/feature.media.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / Storage Facade / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan outlines the implementation strategy for Module 08 (Product Media Management) in the Laravel e-commerce backend platform. It encompasses database migration for the `media` table, the polymorphic `Media` Eloquent model, Form Request validation classes, Service Layer (`MediaService`), Admin Media Controller (`MediaController`), OpenAPI 3.0 annotations, API route registrations, and automated feature testing (`MediaTest.php`).

---

## 2. Development Strategy

1. **Database Layer**: Create migration for `media` table (`2026_08_11_000015_create_media_table.php`) with polymorphic columns (`model_type`, `model_id`), file attributes, types, MIME types, pixel dimensions, and indexes. Run `php artisan migrate`.
2. **Domain Model & Morph Map**: Build `Media` model with polymorphic `imageable` relationship, active scopes (`main`, `gallery`, `byModel`), automatic file URL generator based on storage disk (`public` or `s3`), and physical file deletion hook on model deletion. Register polymorphic morph mapping in `AppServiceProvider`.
3. **Form Request Validation**: Create Form Requests (`UploadMediaRequest`, `AttachMediaRequest`, `UpdateMediaRequest`, `SortMediaRequest`).
4. **Service Layer**: Implement `MediaService` encapsulating file storage abstraction via Laravel `Storage` facade, filename sanitization & timestamping, dimension calculation (`width`/`height`), main image exclusivity logic, attachment/detachment, bulk sorting, and orphaned file purging.
5. **Controller & OpenAPI Annotations**: Implement `MediaController` providing 9 Admin APIs with full OpenAPI 3.0 annotations targeting `http://localhost:8002`.
6. **Route Registration**: Register `/api/v1/admin/media` routes in `routes/api.php` guarded by `auth:sanctum` and RBAC permissions (`permission:media.*`).
7. **Swagger Regeneration**: Run `php artisan l5-swagger:generate` to compile updated OpenAPI documentation.
8. **Automated Feature Testing**: Create `MediaTest.php` validating file upload, MIME & dimension validation, S3/local disk storage, entity attachment/detachment, main image exclusivity, sorting, deletion with disk cleanup, and RBAC permission enforcement.

---

## 3. Architecture

- **Controllers**: `App\Http\Controllers\Api\V1\Admin\MediaController`
- **Services**: `App\Services\MediaService`
- **Form Requests**:
  - `App\Http\Requests\Admin\UploadMediaRequest`
  - `App\Http\Requests\Admin\AttachMediaRequest`
  - `App\Http\Requests\Admin\UpdateMediaRequest`
  - `App\Http\Requests\Admin\SortMediaRequest`
- **Models**: `Media`, `Product`, `Category`, `Brand`, `Banner`
- **Database Tables**: `media`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migration**
  - Path: `database/migrations/2026_08_11_000015_create_media_table.php`
  - Description: Create `media` table with polymorphic model fields, file attributes, dimensions, alt text, sort order, and composite indexes. Execute `php artisan migrate`.

- [x] **Task 2: Create Eloquent Model & Register Morph Map**
  - Path: `app/Models/Media.php`
  - Path: `app/Providers/AppServiceProvider.php`
  - Description: Implement `Media` model with polymorphic `imageable` relationship, `url` accessor, physical file deletion listener, and morph mapping (`product`, `category`, `brand`, `banner`).

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Admin/UploadMediaRequest.php`
  - Path: `app/Http/Requests/Admin/AttachMediaRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateMediaRequest.php`
  - Path: `app/Http/Requests/Admin/SortMediaRequest.php`
  - Description: Implement request validation rules for file upload (MIME, max size, dimensions), attachment, metadata update, and bulk sorting.

- [x] **Task 4: Implement MediaService**
  - Path: `app/Services/MediaService.php`
  - Description: Implement business logic for physical file upload to disk (`public`/`s3`), dimension extraction, `main` image demotion logic, entity attachment/detachment, gallery sorting, and unused file purging.

- [x] **Task 5: Implement MediaController with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Admin/MediaController.php`
  - Description: Create controller with endpoints (`upload`, `index`, `show`, `attach`, `detach`, `update`, `sort`, `destroy`, `purgeUnused`) extending `BaseController` and `ApiResponseTrait` with full `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register admin media routes guarded by `auth:sanctum` and `permission:media.*`.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Execute `php artisan l5-swagger:generate` to compile Swagger documentation for all Media endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/MediaTest.php`
  - Description: Create PHPUnit feature test suite covering file uploads, MIME & dimension validation, attachment, main image exclusivity, sorting, file deletion from disk, and RBAC permissions.
