# Implementation Plan: Shopping Cart Module

**Module Name:** Shopping Cart  
**Module ID:** 12  
**Plan File:** `plans/plan.cart.md`  
**Specification:** `specifications/feature.cart.spec.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  
**Status:** Pending Execution  

---

## 1. Module Summary

This plan outlines the implementation strategy for Module 12 (Shopping Cart) in the Laravel e-commerce backend platform. It encompasses database migrations for `carts` and `cart_items` tables, `Cart` and `CartItem` Eloquent models, Form Request validation classes, Service Layer (`CartService`), Customer Controller (`CartController`), OpenAPI 3.0 annotations, API route registrations, and automated feature testing (`CartTest.php`).

---

## 2. Development Strategy

1. **Database Layer**: Create migrations for `carts` (`2026_08_11_000020_create_carts_table.php`) and `cart_items` (`2026_08_11_000021_create_cart_items_table.php`). Run `php artisan migrate`.
2. **Domain Models & Relationships**: Build `Cart` and `CartItem` Eloquent models with relationships (`user()`, `cart()`, `product()`, `variant()`, `items()`).
3. **Form Request Validation**: Create Form Requests (`AddToCartRequest`, `UpdateCartItemRequest`, `ApplyCouponRequest`, `MergeCartRequest`).
4. **Service Layer**: Implement `CartService` encapsulating `resolveCart`, `addItem`, `updateItem`, `removeItem`, `clearCart`, `recalculateTotals`, `applyCoupon`, `removeCoupon`, `mergeGuestCart`, and `validateCartForCheckout`.
5. **Controller & OpenAPI Annotations**: Implement `CartController` providing 9 endpoints with full OpenAPI 3.0 annotations targeting `http://localhost:8002`.
6. **Route Registration**: Register `/api/v1/cart/*` routes in `routes/api.php` supporting optional Sanctum authentication and guest `X-Session-ID` headers.
7. **Swagger Regeneration**: Run `php artisan l5-swagger:generate` to compile updated OpenAPI documentation.
8. **Automated Feature Testing**: Create `CartTest.php` validating guest cart creation, adding simple & variant products, server-side price recalculation, stock limit validation, updating quantity, removing items, clearing cart, coupon application, guest-to-customer cart merging, and pre-checkout validation.

---

## 3. Architecture

- **Controllers**: `App\Http\Controllers\Api\V1\Customer\CartController`
- **Services**: `App\Services\CartService`
- **Form Requests**:
  - `App\Http\Requests\Customer\AddToCartRequest`
  - `App\Http\Requests\Customer\UpdateCartItemRequest`
  - `App\Http\Requests\Customer\ApplyCouponRequest`
  - `App\Http\Requests\Customer\MergeCartRequest`
- **Models**: `Cart`, `CartItem`, `Product`, `ProductVariant`, `Inventory`, `User`
- **Database Tables**: `carts`, `cart_items`

---

## 4. Task Breakdown

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000020_create_carts_table.php`
  - Path: `database/migrations/2026_08_11_000021_create_cart_items_table.php`
  - Description: Create `carts` and `cart_items` tables with FK constraints, composite unique index `['cart_id', 'product_id', 'product_variant_id']`, and monetary decimal columns. Execute `php artisan migrate`.

- [x] **Task 2: Create Cart & CartItem Eloquent Models**
  - Path: `app/Models/Cart.php`
  - Path: `app/Models/CartItem.php`
  - Path: `app/Models/User.php`
  - Description: Implement `Cart` and `CartItem` models with relationships. Add `activeCart()` relationship to `User` model.

- [x] **Task 3: Create Validation Form Requests**
  - Path: `app/Http/Requests/Customer/AddToCartRequest.php`
  - Path: `app/Http/Requests/Customer/UpdateCartItemRequest.php`
  - Path: `app/Http/Requests/Customer/ApplyCouponRequest.php`
  - Path: `app/Http/Requests/Customer/MergeCartRequest.php`
  - Description: Implement request validation rules for cart operations, quantity updates, coupon application, and cart merging.

- [x] **Task 4: Implement CartService**
  - Path: `app/Services/CartService.php`
  - Description: Implement core business logic for resolving guest/customer cart, adding items, server-side price calculation, stock validation, updating quantity, coupon application, guest cart merging, and pre-checkout validation.

- [x] **Task 5: Implement CartController with OpenAPI Annotations**
  - Path: `app/Http/Controllers/Api/V1/Customer/CartController.php`
  - Description: Create controller for cart operations (`index`, `addItem`, `updateItem`, `removeItem`, `clear`, `applyCoupon`, `removeCoupon`, `merge`, `validateCart`) extending `BaseController` and `ApiResponseTrait` with full `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register cart routes under `/api/v1/cart` in `routes/api.php`.

- [x] **Task 7: Generate Swagger OpenAPI Specification**
  - Path: `storage/api-docs/api-docs.json`
  - Description: Execute `php artisan l5-swagger:generate` to compile Swagger documentation for all Shopping Cart endpoints.

- [x] **Task 8: Automated Feature Testing**
  - Path: `tests/Feature/CartTest.php`
  - Description: Create PHPUnit feature test suite covering guest cart creation, adding simple & variant products, server-side price calculation, stock limits, quantity updates, item removal, clearing cart, coupon application, guest cart merging, and pre-checkout validation.
