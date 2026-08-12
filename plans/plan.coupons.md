# Implementation Plan: Module 13 — Coupons & Discounts

**Module Name:** Coupons & Discounts  
**Module ID:** 13  
**Plan File:** `plans/plan.coupons.md`  
**Specification File:** `specifications/feature.coupons.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 13 (Coupons & Discounts) and Module 29 (Admin Coupon Management) to provide a complete promo engine for the e-commerce backend. This includes creating database tables for coupons, usages, and restrictions; Eloquent models and relationships; `CouponService` for rule evaluation and discount calculation; public coupon validation endpoint; complete Admin CRUD controller with OpenAPI annotations; and automated test coverage.

---

## 2. User Review Required

> [!NOTE]
> - All coupon codes will automatically be formatted to UPPERCASE upon creation or lookup.
> - Product, Category, and Brand restrictions act as inclusive filters (if specified, only matching items in cart contribute to the discountable subtotal).
> - Deleting a coupon will set its status to `archived` or soft-delete it to preserve historic order/usage records.

---

## 3. Open Questions

*None at this time. SRS specifications and Admin Panel requirements fully define coupon attributes, rule engines, and reporting.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000022_create_coupons_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000022_create_coupons_table.php) — Migration for `coupons` table and restriction pivot tables (`coupon_products`, `coupon_categories`, `coupon_brands`, `coupon_customers`).
- **[NEW]** [`database/migrations/2026_08_11_000023_create_coupon_usages_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000023_create_coupon_usages_table.php) — Migration for `coupon_usages` tracking table.

### Model Layer
- **[NEW]** [`app/Models/Coupon.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Coupon.php) — Coupon model with relationships (`usages`, `products`, `categories`, `brands`, `customers`).
- **[NEW]** [`app/Models/CouponUsage.php`](file:///d:/Projects/ecommerce_laravel/app/Models/CouponUsage.php) — Coupon Usage model.
- **[MODIFY]** [`app/Models/User.php`](file:///d:/Projects/ecommerce_laravel/app/Models/User.php) — Add `couponUsages()` relationship.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Admin/StoreCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreCouponRequest.php) — Validation for coupon creation.
- **[NEW]** [`app/Http/Requests/Admin/UpdateCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/UpdateCouponRequest.php) — Validation for coupon updates.
- **[NEW]** [`app/Http/Requests/Customer/ValidateCouponRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Customer/ValidateCouponRequest.php) — Validation for public coupon code verification.

### Business Logic Service Layer
- **[NEW]** [`app/Services/CouponService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/CouponService.php) — Core rule evaluation logic, discount calculation (`percentage`, `fixed_amount`, `free_shipping`), restriction checking, and report generation.

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/CouponController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/CouponController.php) — Public endpoint for checking and validating coupon codes.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/CouponController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/CouponController.php) — Admin CRUD controller with OpenAPI annotations for index, store, show, update, destroy, toggle status, and performance reports.

### Routes Layer
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register customer coupon routes under `/v1/coupons` and admin coupon management routes under `/v1/admin/coupons`.

### Documentation Layer
- **[MODIFY]** [`storage/api-docs/api-docs.json`](file:///d:/Projects/ecommerce_laravel/storage/api-docs/api-docs.json) — Regenerated via `php artisan l5-swagger:generate`.

### Test Layer
- **[NEW]** [`tests/Feature/CouponTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/CouponTest.php) — Comprehensive PHPUnit feature test suite.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000022_create_coupons_table.php`
  - Path: `database/migrations/2026_08_11_000023_create_coupon_usages_table.php`
  - Description: Create `coupons`, pivot restriction tables, and `coupon_usages` tables. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models**
  - Path: `app/Models/Coupon.php`
  - Path: `app/Models/CouponUsage.php`
  - Description: Create `Coupon` and `CouponUsage` models with casts, scopes, and relationships.

- [x] **Task 3: Create Form Request Classes**
  - Path: `app/Http/Requests/Admin/StoreCouponRequest.php`
  - Path: `app/Http/Requests/Admin/UpdateCouponRequest.php`
  - Path: `app/Http/Requests/Customer/ValidateCouponRequest.php`
  - Description: Implement validation rules for creation, update, and validation endpoints.

- [x] **Task 4: Implement CouponService**
  - Path: `app/Services/CouponService.php`
  - Description: Implement validation engine, calculation engine, record usage, and report metrics calculation.

- [x] **Task 5: Implement Controllers with OpenAPI 3.0**
  - Path: `app/Http/Controllers/Api/V1/Customer/CouponController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/CouponController.php`
  - Description: Implement controller endpoints extending `BaseController` and using `ApiResponseTrait`. Include `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register routes under `/api/v1/coupons` and `/api/v1/admin/coupons`.

- [x] **Task 7: Generate Swagger Docs**
  - Command: `docker exec ecom-panel-app php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 8: Feature Testing & Full Application Verification**
  - Path: `tests/Feature/CouponTest.php`
  - Command: `docker exec ecom-panel-app php vendor/bin/phpunit tests/Feature/CouponTest.php`
  - Command: `docker exec ecom-panel-app php artisan test`
  - Description: Verify all coupon tests pass, followed by running the full test suite across all modules.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `docker exec ecom-panel-app php vendor/bin/phpunit tests/Feature/CouponTest.php`
2. Full Application Suite Test:
   `docker exec ecom-panel-app php artisan test`

### Manual Verification
- Swagger UI inspection at `http://localhost:8002/api/documentation`.
