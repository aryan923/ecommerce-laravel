# Implementation Plan: Module 16 — Checkout & Order Creation

**Module Name:** Checkout & Order Creation  
**Module ID:** 16  
**Plan File:** `plans/plan.checkout.md`  
**Specification File:** `specifications/feature.checkout.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 16 (Checkout & Order Creation) to provide a robust, transactional checkout engine. This includes database migrations for `orders`, `order_items`, `payments`, and `order_histories`; Eloquent models; `CheckoutService` for idempotency checking, server-side price/tax/shipping/coupon recalculations, atomic stock reservation, order number generation (`ORD-YYYYMMDD-{id}`), item snapshotting, payment initialization, and cart clearing; CheckoutController with OpenAPI annotations; and automated test coverage.

---

## 2. User Review Required

> [!NOTE]
> - Order number is publicly formatted as `ORD-YYYYMMDD-{id}` (e.g. `ORD-20260812-1001`).
> - Order placement is strictly wrapped in `DB::transaction` and uses `InventoryService::reserveStock()` for atomic stock locking.
> - Supports optional `X-Idempotency-Key` header or payload `idempotency_key` to make order creation request safe for retries.

---

## 3. Open Questions

*None at this time. SRS specifications fully define checkout flow, order placement, stock locking, and snapshot preservation.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000031_create_orders_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000031_create_orders_table.php) — Migration for `orders` table.
- **[NEW]** [`database/migrations/2026_08_11_000032_create_order_items_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000032_create_order_items_table.php) — Migration for `order_items` table.
- **[NEW]** [`database/migrations/2026_08_11_000033_create_payments_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000033_create_payments_table.php) — Migration for `payments` and `order_histories` tables.

### Model Layer
- **[NEW]** [`app/Models/Order.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Order.php)
- **[NEW]** [`app/Models/OrderItem.php`](file:///d:/Projects/ecommerce_laravel/app/Models/OrderItem.php)
- **[NEW]** [`app/Models/Payment.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Payment.php)
- **[NEW]** [`app/Models/OrderHistory.php`](file:///d:/Projects/ecommerce_laravel/app/Models/OrderHistory.php)
- **[MODIFY]** [`app/Models/User.php`](file:///d:/Projects/ecommerce_laravel/app/Models/User.php) — Add `orders()` relationship.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Customer/CheckoutProcessRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Customer/CheckoutProcessRequest.php)

### Business Logic Service Layer
- **[NEW]** [`app/Services/CheckoutService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/CheckoutService.php) — Core checkout engine, idempotency check, price/tax/shipping recalculation, atomic stock reservation, order & item snapshot creation, payment record creation, and cart clearing.

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/CheckoutController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/CheckoutController.php) — Checkout process and order confirmation lookup controller with OpenAPI 3.0 annotations.

### Routes Layer
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register checkout routes under `/v1/checkout` and `/v1/orders`.

### Documentation Layer
- **[MODIFY]** [`storage/api-docs/api-docs.json`](file:///d:/Projects/ecommerce_laravel/storage/api-docs/api-docs.json) — Regenerate via `php artisan l5-swagger:generate`.

### Test Layer
- **[NEW]** [`tests/Feature/CheckoutTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/CheckoutTest.php) — Feature test suite for Checkout & Order Creation module.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000031_create_orders_table.php`
  - Path: `database/migrations/2026_08_11_000032_create_order_items_table.php`
  - Path: `database/migrations/2026_08_11_000033_create_payments_table.php`
  - Description: Create `orders`, `order_items`, `payments`, and `order_histories` tables. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models**
  - Path: `app/Models/Order.php`
  - Path: `app/Models/OrderItem.php`
  - Path: `app/Models/Payment.php`
  - Path: `app/Models/OrderHistory.php`
  - Path: `app/Models/User.php`
  - Description: Implement models with casts, order number generator, and relationships.

- [x] **Task 3: Create Form Request Class**
  - Path: `app/Http/Requests/Customer/CheckoutProcessRequest.php`
  - Description: Implement validation rules for shipping/billing address, shipping method, coupon, and payment method.

- [x] **Task 4: Implement CheckoutService**
  - Path: `app/Services/CheckoutService.php`
  - Description: Implement `processCheckout()` with idempotency checking, DB transaction, atomic stock locking, order & item snapshot creation, initial payment record creation, and cart clearing.

- [x] **Task 5: Implement CheckoutController with OpenAPI 3.0**
  - Path: `app/Http/Controllers/Api/V1/Customer/CheckoutController.php`
  - Description: Implement `process` and `show` endpoints extending `BaseController` and using `ApiResponseTrait`. Include `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register routes under `/api/v1/checkout/process` and `/api/v1/orders/{order_number}`.

- [x] **Task 7: Generate Swagger Docs**
  - Command: `docker exec ecom-panel-app php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 8: Feature Testing**
  - Path: `tests/Feature/CheckoutTest.php`
  - Command: `docker exec ecom-panel-app php vendor/bin/phpunit tests/Feature/CheckoutTest.php`
  - Description: Verify all checkout, order creation, item snapshotting, idempotency, and stock reservation tests pass.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `docker exec ecom-panel-app php vendor/bin/phpunit tests/Feature/CheckoutTest.php`
