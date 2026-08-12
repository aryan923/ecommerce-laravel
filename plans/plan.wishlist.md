# Implementation Plan: Wishlist Module

**Module Name:** Wishlist  
**Module ID:** 11  
**Plan File:** `plans/plan.wishlist.md`  
**Specification:** `specifications/feature.wishlist.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan outlines the implementation strategy for Module 11 (Wishlist) in the Laravel e-commerce backend platform. It encompasses database migration for the `wishlist_items` table, `WishlistItem` Eloquent model, updates to `User` and `Product` models, Form Request validation classes, Service Layer (`WishlistService`), Customer Controller (`WishlistController`), OpenAPI 3.0 annotations, API route registrations, and automated feature testing (`WishlistTest.php`).

---

## 2. Development Strategy

1. **Database Layer**: Create migration for `wishlist_items` table (`2026_08_11_000019_create_wishlist_items_table.php`) with composite unique constraint `['user_id', 'product_id', 'product_variant_id']`. Run `php artisan migrate`.
2. **Domain Models & Relationships**: Build `WishlistItem` model with `belongsTo(User::class)`, `belongsTo(Product::class)`, and `belongsTo(ProductVariant::class)`. Update `User` model with `wishlistItems()` relationship.
3. **Form Request Validation**: Create Form Request (`AddToWishlistRequest`).
4. **Service Layer**: Implement `WishlistService` encapsulating `add`, `remove`, `clear`, `checkStatus`, `list`, and `moveToCart` operations with cross-customer security checks.
5. **Controller & OpenAPI Annotations**: Implement `WishlistController` providing 6 customer endpoints with full OpenAPI 3.0 annotations targeting `http://localhost:8002`.
6. **Route Registration**: Register `/api/v1/wishlist` routes in `routes/api.php` guarded by `auth:sanctum`.
7. **Swagger Regeneration**: Run `php artisan l5-swagger:generate` to compile updated OpenAPI documentation.
8. **Automated Feature Testing**: Create `WishlistTest.php` validating adding products/variants, idempotency, listing wishlist items, checking status, removing items, clearing wishlist, move-to-cart, cross-customer isolation, and Sanctum authentication enforcement.

---

## 3. Architecture

- **Controllers**: `App\Http\Controllers\Api\V1\Customer\WishlistController`
- **Services**: `App\Services\WishlistService`
- **Form Requests**: `App\Http\Requests\Customer\AddToWishlistRequest`
- **Models**: `WishlistItem`, `User`, `Product`, `ProductVariant`
- **Database Tables**: `wishlist_items`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migration**
  - Path: `database/migrations/2026_08_11_000019_create_wishlist_items_table.php`
  - Description: Create `wishlist_items` table with FK constraints to `users(id)`, `products(id)`, and `product_variants(id)` with composite unique constraint `['user_id', 'product_id', 'product_variant_id']`. Execute `php artisan migrate`.

- [x] **Task 2: Create WishlistItem Model & Update User Model**
  - Path: `app/Models/WishlistItem.php`
  - Path: `app/Models/User.php`
  - Description: Implement `WishlistItem` model with relationships. Add `wishlistItems()` relationship to `User` model.

- [x] **Task 3: Create Validation Form Request**
  - Path: `app/Http/Requests/Customer/AddToWishlistRequest.php`
  - Description: Implement request validation rules for adding products and variants to wishlist.

- [x] **Task 4: Implement WishlistService**
  - Path: `app/Services/WishlistService.php`
  - Description: Implement business logic for adding items, idempotent checks, listing wishlist items with price/stock eager loading, checking status, removing items, clearing wishlist, and moving items to cart.

- [x] **Task 5: Implement WishlistController with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Customer/WishlistController.php`
  - Description: Create controller for wishlist management (index, store, check, moveToCart, destroy, clear) extending `BaseController` and `ApiResponseTrait` with full `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register customer wishlist routes guarded by `auth:sanctum`.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Execute `php artisan l5-swagger:generate` to compile Swagger documentation for all Wishlist endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/WishlistTest.php`
  - Description: Create PHPUnit feature test suite covering adding simple & variant products, duplicate add idempotency, fetching wishlist, status check, item removal, clearing wishlist, move-to-cart, and cross-customer security isolation.
