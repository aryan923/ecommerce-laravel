# Test Cases: Product Media Management Module

**Module Name:** Product Media Management  
**Module ID:** 08  
**Test File:** `plans/test-cases.media.md`  
**Specification:** `specifications/feature.media.spec.md`  
**Plan:** `plans/plan.media.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / Storage Facade / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-MED-001: Admin Single File Upload Success
- **Preconditions**: Authenticated admin with `media.create` permission.
- **Input**: `POST /api/v1/admin/media/upload` multipart with `file` (valid JPEG image 800x600 px, 500KB).
- **Expected Result**: HTTP 201 Created, physical file saved on storage disk under `public/media/{Y}/{m}/`, database record created in `media` table with width=800, height=600, mime_type="image/jpeg", size=512000, and accessible `url`.

### TC-MED-002: Admin Batch File Upload Success
- **Preconditions**: Authenticated admin with `media.create` permission.
- **Input**: `POST /api/v1/admin/media/upload` multipart with `files` (array of 3 valid WebP images).
- **Expected Result**: HTTP 201 Created, returns array of 3 created media records.

### TC-MED-003: Attach Media to Product & Main Image Exclusivity
- **Preconditions**: Existing product ID 1, existing media ID 10 (currently `type: gallery`).
- **Input**: `POST /api/v1/admin/media/attach` with `media_id: 10`, `model_type: "product"`, `model_id: 1`, `type: "main"`.
- **Expected Result**: HTTP 200 OK, media ID 10 attached to Product ID 1 as `main`. Any previously designated `main` image for Product ID 1 is automatically updated to `type: gallery`.

### TC-MED-004: Bulk Sort Gallery Media Orders
- **Preconditions**: Product ID 1 has gallery media IDs [10, 11, 12].
- **Input**: `POST /api/v1/admin/media/sort` with `items: [{id: 12, sort_order: 1}, {id: 10, sort_order: 2}, {id: 11, sort_order: 3}]`.
- **Expected Result**: HTTP 200 OK, media records updated with specified `sort_order` indexes.

### TC-MED-005: Query Centralized Media Library with Filters
- **Input**: `GET /api/v1/admin/media?type=gallery&mime_type=image/jpeg&search=product`.
- **Expected Result**: HTTP 200 OK, paginated media records matching search criteria.

### TC-MED-006: Delete Media & Storage File Cleanup Success
- **Preconditions**: Unattached media record ID 20 with file on disk.
- **Input**: `DELETE /api/v1/admin/media/20`.
- **Expected Result**: HTTP 200 OK, database record removed and `Storage::disk('public')->exists($file_path)` returns false.

---

## 2. Negative Test Scenarios

### TC-MED-007: Upload Executable File Type Validation Error
- **Input**: `POST /api/v1/admin/media/upload` with file `script.php` or `malicious.exe`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `file` mime type/extension.

### TC-MED-008: File Size Exceeds 10MB Limit Validation Error
- **Input**: `POST /api/v1/admin/media/upload` with 15MB file.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error `file size must not exceed 10240 KB`.

### TC-MED-009: Corrupted Image Header Validation Error
- **Input**: `POST /api/v1/admin/media/upload` with dummy text file renamed to `photo.jpg`.
- **Expected Result**: HTTP 422 Unprocessable Entity, image dimension/header extraction failure detected.

### TC-MED-010: Attach Media to Non-Existent Entity
- **Input**: `POST /api/v1/admin/media/attach` with `media_id: 1`, `model_type: "product"`, `model_id: 999999`.
- **Expected Result**: HTTP 422 Unprocessable Entity, target model does not exist.

### TC-MED-011: Safety Warning on Deleting Attached Media
- **Preconditions**: Media ID 5 attached to Product ID 1.
- **Input**: `DELETE /api/v1/admin/media/5` (without `force=true`).
- **Expected Result**: HTTP 422 Unprocessable Entity, message indicating media is actively attached to Product #1.

### TC-MED-012: Unauthorized Media Upload Attempt
- **Preconditions**: User without `media.create` permission.
- **Input**: `POST /api/v1/admin/media/upload`.
- **Expected Result**: HTTP 403 Forbidden.
