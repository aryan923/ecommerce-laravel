# Feature Specification: Product Media Management Module

**Module Name:** Product Media Management  
**Module ID:** 08  
**Specification File:** `specifications/feature.media.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§16, §71, §123), `Requirements/admin_panel.md` (§31), `Requirements/development_modules.md` (§Module 08)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / Storage Facade (Local & S3) / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Product Media Management module provides a centralized media asset pipeline and digital media library for the e-commerce backend platform. It handles file uploads, MIME type and dimension validations, multi-disk storage abstraction (configurable between `local` filesystem and S3-compatible object storage via Laravel's `Storage` facade), polymorphic media associations (`Product`, `Category`, `Brand`, `Banner`, `CmsPage`), image classification (`main`, `gallery`, `thumbnail`, `banner`, `document`), image sort ordering, and media asset lifecycle management (upload, metadata management, attachment/detachment, search, and disk file cleanup).

All API endpoints extend `BaseController`, utilize `ApiResponseTrait`, execute on `http://localhost:8002`, and MUST include full OpenAPI 3.0 annotations for live Swagger documentation generation via `php artisan l5-swagger:generate`.

---

## 2. Business Flow

### 2.1 Admin Centralized Media Upload & Asset Management Flow
1. Admin navigates to the Media Library section in the Admin Panel or clicks "Upload Image" inside a Product/Category/Brand/Banner form.
2. Admin uploads one or multiple files via `POST /api/v1/admin/media/upload`.
3. System intercepts the request, validates file presence, MIME type (`jpg`, `jpeg`, `png`, `webp`, `gif`, `svg`, `pdf`), file extension, maximum file size (10MB default), and pixel dimensions (for images).
4. System determines storage disk (`local` public storage or `s3` bucket based on `FILESYSTEM_DISK` environment variable), generates a collision-free filename, uploads the physical file, calculates pixel dimensions (width/height) and file size, and persists a new `Media` record in the `media` table.
5. System returns a `201 Created` JSON payload containing full media details including public accessible absolute URL.

### 2.2 Entity Media Attachment & Gallery Management Flow
1. Admin attaches uploaded media assets to a specific entity (e.g., a `Product`) via `POST /api/v1/admin/media/attach` or directly during entity creation/update.
2. Admin specifies `model_type` (`product`, `category`, `brand`, `banner`), `model_id`, `media_id`, `type` (`main`, `gallery`, `thumbnail`, `banner`), and optional `sort_order` and `alt` text.
3. If `type` is set to `main`, the system automatically demotes any existing `main` media for that entity to `gallery` type to ensure strictly one primary image per entity.
4. Admin can reorder gallery media via `POST /api/v1/admin/media/sort` supplying an array of media IDs and their target `sort_order` indexes.

### 2.3 Media Search & Centralized Library Query Flow
1. Admin views the Centralized Media Library via `GET /api/v1/admin/media`.
2. Admin can filter media by search keyword (file name or alt text), `type`, `mime_type`, `model_type`, or `unattached_only` flag.
3. System queries `media` records with pagination, returning file details, thumbnail URLs, attachment counts, and storage disk metadata.

### 2.4 Media Deletion & Disk Storage Cleanup Flow
1. Admin deletes a media asset via `DELETE /api/v1/admin/media/{id}`.
2. System checks if media is attached to active entities. If attached and `force` flag is false, system returns a `422 Unprocessable Entity` warning listing attached models.
3. Upon confirmed deletion, the system deletes the physical file from the target disk (`Storage::disk($media->disk)->delete($media->file_path)`) and removes the `media` record from the database.
4. Admin can also trigger `DELETE /api/v1/admin/media/unused` to purge orphaned unattached media files older than a specified threshold.

---

## 3. Functional Requirements

- **FR-MED-001**: System shall support file uploads for images (`jpg`, `jpeg`, `png`, `webp`, `gif`, `svg`) and documents (`pdf`).
- **FR-MED-002**: System shall validate file size (max 10MB default, configurable via `.env`).
- **FR-MED-003**: System shall validate image dimensions (min 100x100 px, max 5000x5000 px for raster images).
- **FR-MED-004**: System shall support multi-disk storage (`local` and `s3`), abstracting file storage using Laravel `Storage` facade based on `FILESYSTEM_DISK`.
- **FR-MED-005**: System shall store polymorphic media associations (`model_type`, `model_id`) supporting `Product`, `Category`, `Brand`, `Banner`, and `CmsPage`.
- **FR-MED-006**: System shall classify media items into types: `main`, `gallery`, `thumbnail`, `banner`, `document`.
- **FR-MED-007**: System shall enforce strictly one `main` media asset per entity; attaching a new `main` image automatically demotes existing `main` image to `gallery`.
- **FR-MED-008**: System shall support custom image alt text (`alt`) and sequential sort ordering (`sort_order`).
- **FR-MED-009**: System shall provide bulk sort ordering API (`POST /api/v1/admin/media/sort`).
- **FR-MED-010**: System shall provide Centralized Media Library search and filter API (`GET /api/v1/admin/media`).
- **FR-MED-011**: System shall automatically delete physical files from storage disk upon media deletion.
- **FR-MED-012**: System shall provide an unattached media cleanup endpoint (`DELETE /api/v1/admin/media/unused`).
- **FR-MED-013**: System shall restrict all Admin Media APIs with Sanctum authentication and RBAC permissions (`media.view`, `media.create`, `media.update`, `media.delete`).
- **FR-MED-014**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Storage Subsystem**: Laravel `Storage` facade (`disk('public')` or `disk('s3')`).
- **Image Metadata Extraction**: Native PHP `getimagesize()` or GD extension for width/height/mime extraction.
- **Middleware**: `auth:sanctum` and `permission:<name>` for Admin APIs.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `media` Table Migration
Migration File: `database/migrations/2026_08_11_000015_create_media_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `model_type` | `string` | `nullable`, `index` | Polymorphic model class or morph alias |
| `model_id` | `unsignedBigInteger` | `nullable`, `index` | Polymorphic model ID |
| `file_name` | `string` | | Sanitized original file name |
| `file_path` | `string` | | Relative storage path on disk |
| `disk` | `string` | `default('public')`, `index` | Storage disk (`public`, `s3`) |
| `url` | `text` | | Full accessible public URL |
| `type` | `enum` | `['main', 'gallery', 'thumbnail', 'banner', 'document']`, `default('gallery')`, `index` | Asset type classification |
| `mime_type` | `string` | `100` | Verified MIME type |
| `size` | `unsignedBigInteger` | | File size in bytes |
| `width` | `unsignedInteger` | `nullable` | Image width in pixels |
| `height` | `unsignedInteger` | `nullable` | Image height in pixels |
| `alt` | `string` | `nullable` | Alternative text for accessibility & SEO |
| `sort_order` | `integer` | `default(0)`, `index` | Sort order index for galleries |
| `timestamps` | `timestamps` | | Created / Updated at |

#### Composite Indexes:
- `index(['model_type', 'model_id'])`
- `index(['model_type', 'model_id', 'type'])`

---

## 6. API Requirements

### 6.1 Admin Media APIs (`/api/v1/admin/media`)
- `POST /api/v1/admin/media/upload` — Upload single or multiple media files (`permission:media.create`)
- `GET /api/v1/admin/media` — List & search media library records with pagination & filters (`permission:media.view`)
- `GET /api/v1/admin/media/{id}` — Get single media details (`permission:media.view`)
- `POST /api/v1/admin/media/attach` — Attach media to entity (`permission:media.update`)
- `POST /api/v1/admin/media/detach` — Detach media from entity (`permission:media.update`)
- `PUT /api/v1/admin/media/{id}` — Update media metadata (`alt`, `sort_order`, `type`) (`permission:media.update`)
- `POST /api/v1/admin/media/sort` — Bulk update media sort orders for an entity (`permission:media.update`)
- `DELETE /api/v1/admin/media/{id}` — Delete media record and remove file from storage disk (`permission:media.delete`)
- `DELETE /api/v1/admin/media/unused` — Purge unattached media assets (`permission:media.delete`)

---

## 7. UI Requirements (Admin Panel Integration)

### 7.1 Media Library Grid View Screen
- **Screens**: Centralized Media Gallery Grid & Table Views in Admin Panel.
- **Components**: File Uploader Dropzone, Filter Bar (search, type, model_type, disk), Asset Card Grid, Preview Drawer, Metadata Edit Modal.
- **User Interactions**: Drag-and-drop file upload, click file to preview/edit alt text, click copy URL to clipboard, drag card to reorder gallery.
- **States**:
  - **Loading State**: Skeleton loading cards during paginated fetch.
  - **Empty State**: Friendly "No media files uploaded yet" message with quick upload CTA.
  - **Error State**: Toast notifications for upload failures, size limits, or network interruptions.

---

## 8. Validation Rules

### 8.1 Upload Media Request (`UploadMediaRequest`)
- `file`: `required_without:files|file|mimes:jpg,jpeg,png,webp,gif,svg,pdf|max:10240`
- `files`: `required_without:file|array|max:10`
- `files.*`: `file|mimes:jpg,jpeg,png,webp,gif,svg,pdf|max:10240`
- `model_type`: `nullable|string|in:product,category,brand,banner,cms_page`
- `model_id`: `nullable|integer|required_with:model_type`
- `type`: `nullable|in:main,gallery,thumbnail,banner,document`
- `alt`: `nullable|string|max:255`

### 8.2 Attach Media Request (`AttachMediaRequest`)
- `media_id`: `required|exists:media,id`
- `model_type`: `required|string|in:product,category,brand,banner,cms_page`
- `model_id`: `required|integer`
- `type`: `sometimes|in:main,gallery,thumbnail,banner,document`
- `alt`: `nullable|string|max:255`

### 8.3 Update Media Metadata Request (`UpdateMediaRequest`)
- `alt`: `nullable|string|max:255`
- `type`: `sometimes|in:main,gallery,thumbnail,banner,document`
- `sort_order`: `sometimes|integer|min:0`

### 8.4 Sort Media Request (`SortMediaRequest`)
- `items`: `required|array|min:1`
- `items.*.id`: `required|exists:media,id`
- `items.*.sort_order`: `required|integer|min:0`

---

## 9. Permission Rules

| API Endpoint | HTTP Method | Required Permission |
| :--- | :--- | :--- |
| `/api/v1/admin/media/upload` | `POST` | `media.create` |
| `/api/v1/admin/media` | `GET` | `media.view` |
| `/api/v1/admin/media/{id}` | `GET` | `media.view` |
| `/api/v1/admin/media/attach` | `POST` | `media.update` |
| `/api/v1/admin/media/detach` | `POST` | `media.update` |
| `/api/v1/admin/media/{id}` | `PUT` | `media.update` |
| `/api/v1/admin/media/sort` | `POST` | `media.update` |
| `/api/v1/admin/media/{id}` | `DELETE` | `media.delete` |
| `/api/v1/admin/media/unused` | `DELETE` | `media.delete` |

---

## 10. Business Rules

1. **Storage Disk Selection**: Storage disk defaults to `env('FILESYSTEM_DISK', 'public')`. Files uploaded under `public` disk are stored in `storage/app/public/media/{year}/{month}/` and accessible via `APP_URL/storage/media/{year}/{month}/{filename}`. S3 storage uses S3 bucket pathing.
2. **Main Image Exclusivity**: An entity can have only one `main` image. Attaching or setting `type = 'main'` automatically converts previous `main` media for the same entity to `gallery`.
3. **Physical File Deletion**: Deleting a `media` record MUST invoke `Storage::disk($media->disk)->delete($media->file_path)` before removing the DB record.
4. **Safety Delete Check**: Non-forced deletion of an attached media file returns HTTP 422 with a message listing attached entity IDs unless `force=true` parameter is supplied.
5. **Polymorphic Morph Map**: Define explicit morph mapping in `AppServiceProvider` (`product` -> `App\Models\Product`, `category` -> `App\Models\Category`, `brand` -> `App\Models\Brand`, `banner` -> `App\Models\Banner`).

---

## 11. Error Handling

- `422 Unprocessable Entity`: Validation failure (invalid MIME, file > 10MB, invalid dimensions, attached media safety check).
- `404 Not Found`: Media ID does not exist.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `403 Forbidden`: User lacks required `media.*` permission.
- `500 Internal Server Error`: Disk write error or S3 connection failure.

---

## 12. Acceptance Criteria

- [ ] Migration `2026_08_11_000015_create_media_table.php` executes cleanly.
- [ ] `Media` model created with polymorphic `imageable` morphTo relationship, disk URL generator, and active scopes.
- [ ] File upload API handles single & multi-file uploads with MIME, size, and dimension validation.
- [ ] Media attachment/detachment API correctly associates media with Products, Categories, Brands, Banners.
- [ ] `main` image exclusivity logic works seamlessly.
- [ ] Bulk sort ordering API updates `sort_order` across gallery items.
- [ ] Media deletion removes physical files from disk.
- [ ] All 9 Media API endpoints contain OpenAPI 3.0 annotations.
- [ ] `php artisan l5-swagger:generate` completes with zero errors.
- [ ] Automated feature test suite `MediaTest.php` passes with 100% success rate.

---

## 13. Edge Cases

- **Corrupted Image Upload**: User uploads invalid file disguised with `.jpg` extension -> `getimagesize()` failure caught, returning HTTP 422.
- **Zero-Byte File**: Empty file uploaded -> caught by `file` validation rule.
- **S3 Connection Timeout**: Network drop during S3 upload -> transaction wrapped, DB record not created, clean 500 returned.
- **Concurrent Main Image Assignment**: Two admins set different images as `main` simultaneously -> database transaction locks entity media, guaranteeing single `main` image.
- **Orphaned Physical Files**: DB record deleted manually -> `DELETE /api/v1/admin/media/unused` reconciles storage disk against DB records.

---

## 14. Dependencies

- Module 01: Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`)
- Module 03: Admin Authentication & RBAC (`permission:media.*`)
- Module 04: Categories & Brands (Media polymorphic target)
- Module 06: Product Catalog (Media polymorphic target)

---

## 15. Open Questions

- None. Requirements are fully specified based on `srs_apis.md` §16, §71, `admin_panel.md` §31, and `development_modules.md` §Module 08.
