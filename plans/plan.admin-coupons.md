# Implementation Plan: Module 29 — Admin Coupon Management

**Module Name:** Admin Coupon Management  
**Module ID:** 29  
**Plan File:** `plans/plan.admin-coupons.md`  
**Specification File:** `specifications/feature.admin-coupons.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 29 (Admin Coupon Management) to give administrators complete control over promotional coupon campaigns, discount rules, active/inactive/archived lifecycle status, targeted product/category/brand/customer restrictions, and performance analytics reporting. This includes implementing FormRequests for coupon creation and updates, enhancing `CouponService` with admin CRUD & reporting methods, creating `App\Http\Controllers\Api\V1\Admin\CouponController` with full OpenAPI annotations, registering admin routes, regenerating OpenAPI documentation, and writing comprehensive automated Feature unit/integration tests.

---

## 2. User Review Required

> [!NOTE]
> - All coupon codes are automatically normalized to UPPERCASE upon creation or edit (e.g., `sale20` becomes `SALE20`).
> - Soft-deleting or archiving a coupon retains historical `coupon_usages` and order invoice totals to maintain financial auditing integrity.
> - Coupon performance reports calculate total redemptions, total monetary discount value granted, total gross order revenue generated, remaining usage quota, and recent customer usage breakdown.

---

## 3. Open Questions

*None at this time. All requirements, database schemas, validation logic, permissions, and report metrics are fully specified in `specifications/feature.admin-coupons.spec.md` and SRS documents.*

---

## 4. Architecture & Component Strategy

### Backend Architecture (Laravel 12.x / PHP 8.4)
- **Database Tables**: `coupons`, `coupon_usages`, `coupon_products`, `coupon_categories`, `coupon_brands`, `coupon_customers`.
- **Eloquent Models**:
  - [`app/Models/Coupon.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Coupon.php) (Supports SoftDeletes, relationships: `usages`, `products`, `categories`, `brands`, `customers`).
  - [`app/Models/CouponUsage.php`](file:///d:/Projects/ecommerce_laravel/app/Models/CouponUsage.php) (BelongsTo `Coupon`, `User`, `Order`).
- **Request Layer**:
  - [`app/Http/Requests/Admin/StoreCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreCouponRequest.php) (Validates creation parameters, code uniqueness, date window ordering).
  - [`app/Http/Requests/Admin/UpdateCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/UpdateCouponRequest.php) (Validates updates, ignoring current coupon ID).
- **Service Layer**:
  - [`app/Services/CouponService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/CouponService.php) (Contains business logic for coupon listing, creation, updating, pivot syncing, status toggling, archiving, and performance report compilation).
- **Controller Layer**:
  - [`app/Http/Controllers/Api/V1/Admin/CouponController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/CouponController.php) (Handles HTTP endpoints, Sanctum guard, Spatie permission checks, OpenAPI docblocks, and returns `ApiResponseTrait` JSON responses).
- **Routing**:
  - [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) (Admin coupon endpoints grouped under `/v1/admin/coupons`).

---

## 5. Task Breakdown

### Task 1: Form Request Validation Layer
- [x] **[NEW]** [`app/Http/Requests/Admin/StoreCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreCouponRequest.php) — FormRequest validating code, name, type, value, min order value, max discount, start/end dates (`after_or_equal:start_date`), limits, and restriction arrays.
- [x] **[NEW]** [`app/Http/Requests/Admin/UpdateCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/UpdateCouponRequest.php) — FormRequest for updating existing coupons with unique code validation ignoring current ID.

### Task 2: Service Layer Enhancement (`CouponService`)
- [x] **[MODIFY]** [`app/Services/CouponService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/CouponService.php) — Implement `getAdminCouponsList($filters, $perPage)`, `createCoupon($data)`, `updateCoupon($coupon, $data)`, `toggleCouponStatus($coupon, $status)`, `deleteCoupon($coupon)`, and `getCouponReport($coupon)`.

### Task 3: Admin Controller & OpenAPI Annotations
- [x] **[NEW]** [`app/Http/Controllers/Api/V1/Admin/CouponController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/CouponController.php) — Create Admin Coupon Controller with `index`, `store`, `show`, `update`, `destroy`, `status`, and `reports` methods, incorporating `@OA` docblocks.

### Task 4: API Route Registration
- [x] **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register `/v1/admin/coupons` routes with Sanctum auth and Spatie permission middleware (`permission:coupons.view`, `permission:coupons.create`, `permission:coupons.update`, `permission:coupons.delete`).

### Task 5: OpenAPI Documentation Regeneration
- [x] **[MODIFY]** [`storage/api-docs/api-docs.json`](file:///d:/Projects/ecommerce_laravel/storage/api-docs/api-docs.json) — Execute `php artisan l5-swagger:generate` to refresh Swagger spec.

### Task 6: Feature Test Suite & Validation
- [x] **[NEW]** [`tests/Feature/AdminCouponManagementTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/AdminCouponManagementTest.php) — Write comprehensive Feature tests covering coupon CRUD, status toggles, restriction syncing, report generation, validation errors, and permission guarding.

---

## 6. Verification Plan

### Automated Tests
- Run feature tests: `php artisan test --filter=AdminCouponManagementTest`
- Run full test suite: `php artisan test`

### Manual & API Verification
- Test coupon creation via POST `/api/v1/admin/coupons` with valid and invalid payloads.
- Verify status toggle via PATCH `/api/v1/admin/coupons/{id}/status`.
- Test performance report via GET `/api/v1/admin/coupons/{id}/reports`.
- Verify Swagger UI accessibility at `http://localhost:8002/api/documentation`.
