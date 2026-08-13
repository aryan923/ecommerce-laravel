# Implementation Plan: Module 20 — Product Reviews

**Module Name:** Product Reviews  
**Module ID:** 20  
**Plan File:** `plans/plan.reviews.md`  
**Specification File:** `specifications/feature.reviews.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 20 (Product Reviews) to enable post-purchase verified customer reviews and admin review moderation. This includes database migration for `reviews`; Eloquent model `Review`; `ReviewService` for customer review submission, verified purchase validation, average rating calculation, and admin moderation; form requests; public, customer, and admin controllers; OpenAPI 3.0 annotations; and automated feature tests.

---

## 2. User Review Required

> [!NOTE]
> - Review submission requires an order in `delivered` status containing the target product (`product_id`).
> - Duplicate reviews for the same `(user_id, order_id, product_id)` tuple are rejected.
> - Submitted reviews default to `pending` status and only `approved` reviews appear in public product review API responses.

---

## 3. Open Questions

*None at this time. SRS specifications (§55–§56) and Admin Panel specs (§28) fully define post-purchase review validation, rating bounds (1–5), moderation statuses, and public listing.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000039_create_reviews_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000039_create_reviews_table.php) — Migration for `reviews` table.

### Model Layer
- **[NEW]** [`app/Models/Review.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Review.php) — Eloquent model for reviews.
- **[MODIFY]** [`app/Models/Product.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Product.php) — Add `reviews()` and `approvedReviews()` relationships.

### Service Layer
- **[NEW]** [`app/Services/ReviewService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/ReviewService.php) — Business service for verified purchase review submission, customer review listing, public product review retrieval with average rating breakdown, and admin moderation actions.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Review/CreateReviewRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Review/CreateReviewRequest.php)
- **[NEW]** [`app/Http/Requests/Review/UpdateReviewStatusRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Review/UpdateReviewStatusRequest.php)

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/PublicProductReviewController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/PublicProductReviewController.php) — Public endpoint for product reviews.
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/ReviewController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/ReviewController.php) — Customer review endpoints.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/ReviewAdminController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/ReviewAdminController.php) — Admin review moderation endpoints.

### Routes & Testing
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Add routes for public product reviews, customer reviews, and admin review moderation.
- **[NEW]** [`tests/Feature/ReviewTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/ReviewTest.php) — Feature test suite.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migration**
  - Path: `database/migrations/2026_08_11_000039_create_reviews_table.php`
  - Description: Create migration for `reviews` table with unique constraint on `(user_id, order_id, product_id)`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Model**
  - Path: `app/Models/Review.php`
  - Path: `app/Models/Product.php`
  - Description: Implement `Review` model and update `Product` model relationships.

- [x] **Task 3: Implement ReviewService**
  - Path: `app/Services/ReviewService.php`
  - Description: Implement `createReview()`, `getProductReviews()`, `getCustomerReviews()`, `listAdminReviews()`, `updateReviewStatus()`, and `deleteReview()`.

- [x] **Task 4: Implement Form Requests & Controllers**
  - Path: `app/Http/Requests/Review/CreateReviewRequest.php`
  - Path: `app/Http/Requests/Review/UpdateReviewStatusRequest.php`
  - Path: `app/Http/Controllers/Api/V1/PublicProductReviewController.php`
  - Path: `app/Http/Controllers/Api/V1/Customer/ReviewController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/ReviewAdminController.php`
  - Description: Build controllers with OpenAPI 3.0 annotations.

- [x] **Task 5: Register API Routes**
  - Path: `routes/api.php`
  - Description: Add public `/v1/products/{product_id}/reviews`, customer `/v1/customer/reviews`, and admin `/v1/admin/reviews`.

- [x] **Task 6: Generate Swagger Docs**
  - Command: `php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 7: Feature Testing**
  - Path: `tests/Feature/ReviewTest.php`
  - Command: `php vendor/bin/phpunit tests/Feature/ReviewTest.php`
  - Description: Verify verified purchase enforcement, pending moderation default, public approval filtering, rating calculations, and admin moderation.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `php vendor/bin/phpunit tests/Feature/ReviewTest.php`
2. Full Suite Test:
   `php vendor/bin/phpunit`

### Manual Verification
1. Verify customer can submit review for delivered order product.
2. Verify pending review is not visible in public product review API.
3. Verify approving review makes it visible and updates average rating score.
