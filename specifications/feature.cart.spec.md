# Feature Specification: Shopping Cart Module

**Module Name:** Shopping Cart  
**Module ID:** 12  
**Specification File:** `specifications/feature.cart.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§21–§23, §75–§76), `Requirements/development_modules.md` (§Module 12)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Shopping Cart module manages guest (session-based) and customer (authenticated) shopping carts. It handles cart item additions, quantity modifications, server-side price recalculations (frontend-submitted prices are strictly ignored), real-time stock validation, coupon application & discount calculations, shipping & tax estimations, guest-to-customer cart merging upon login, and pre-checkout cart validation.

All API endpoints extend `BaseController`, utilize `ApiResponseTrait`, execute on `http://localhost:8002`, support optional `auth:sanctum` and `X-Session-ID` headers, and MUST include full OpenAPI 3.0 annotations for live Swagger documentation generation via `php artisan l5-swagger:generate`.

---

## 2. Business Flow

### 2.1 Add Item & Server-Side Price Calculation Flow
1. Customer (guest or logged-in) adds an item to cart via `POST /api/v1/cart/items` with `product_id`, optional `product_variant_id`, and `quantity`.
2. System identifies cart context:
   - If authenticated user present: resolves cart by `user_id`.
   - If guest: resolves cart by `session_id` (from `X-Session-ID` header or request payload).
3. System fetches active `Product` and `ProductVariant` directly from database to retrieve unit price (`effective_price`). Frontend unit prices are NEVER trusted.
4. System verifies requested quantity does not exceed available stock in `inventories`. If requested quantity exceeds stock, system throws HTTP 422 `Insufficient stock`.
5. System inserts or updates `cart_items` row and recalculates cart totals (`subtotal`, `discount`, `tax`, `shipping`, `grand_total`).

### 2.2 Guest Cart Merging Flow Upon Login
1. Guest customer adds items to cart under a `session_id`.
2. Customer logs in or registers. Frontend sends `POST /api/v1/cart/merge` with `session_id`.
3. System retrieves guest cart items (`session_id`) and customer cart items (`user_id`).
4. For each guest item:
   - If product/variant already exists in customer cart: sums quantities, capped by available stock.
   - If product/variant is new to customer cart: reassigns `cart_id` to customer cart.
5. System recalculates customer cart totals and deletes the empty guest cart record.

### 2.3 Pre-Checkout Cart Validation Flow
1. Customer clicks "Proceed to Checkout".
2. System invokes `POST /api/v1/cart/validate`.
3. System verifies every cart item:
   - Product and variant still exist and are active (`status = 'active'`).
   - Unit prices match current database prices.
   - Item quantities do not exceed current available stock.
   - Applied coupon is still valid (not expired, minimum spend met, usage limit not reached).
4. Returns validation status `is_valid: true/false` alongside item warnings or price change notifications.

---

## 3. Functional Requirements

- **FR-CRT-001**: System shall support guest shopping carts identified by `session_id` (`X-Session-ID` header) and customer carts identified by `user_id`.
- **FR-CRT-002**: System shall allow adding simple products and product variants to cart (`POST /api/v1/cart/items`).
- **FR-CRT-003**: System shall recalculate unit prices, subtotal, tax, shipping, and grand total server-side for every cart operation. Frontend prices MUST NEVER BE TRUSTED.
- **FR-CRT-004**: System shall validate real-time stock availability against `inventories.available_qty` when adding or updating cart item quantities.
- **FR-CRT-005**: System shall allow updating item quantity (`PUT /api/v1/cart/items/{item_id}`). Setting quantity to `0` removes the item.
- **FR-CRT-006**: System shall allow removing an individual item (`DELETE /api/v1/cart/items/{item_id}`).
- **FR-CRT-007**: System shall allow clearing all items from cart (`DELETE /api/v1/cart`).
- **FR-CRT-008**: System shall support applying promo coupon codes (`POST /api/v1/cart/apply-coupon`) and removing coupons (`DELETE /api/v1/cart/remove-coupon`).
- **FR-CRT-009**: System shall support merging guest cart (`session_id`) into customer cart (`user_id`) upon login (`POST /api/v1/cart/merge`).
- **FR-CRT-010**: System shall provide pre-checkout cart validation endpoint (`POST /api/v1/cart/validate`).
- **FR-CRT-011**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Cart Resolution Logic**:
  ```php
  $user = auth('sanctum')->user();
  $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id');
  ```
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `carts` Table Migration
Migration File: `database/migrations/2026_08_11_000020_create_carts_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `user_id` | `unsignedBigInteger` | `nullable`, `foreign`, `index` | Customer ID (null for guest cart) |
| `session_id` | `string` | `nullable`, `index` | Guest session ID (null for customer cart) |
| `currency` | `string`, `3` | `default('INR')` | Cart currency code |
| `subtotal` | `decimal`, `12,2` | `default(0.00)` | Sum of item totals before discount/tax/shipping |
| `discount` | `decimal`, `12,2` | `default(0.00)` | Total discount amount |
| `tax` | `decimal`, `12,2` | `default(0.00)` | Estimated tax amount |
| `shipping` | `decimal`, `12,2` | `default(0.00)` | Estimated shipping fee |
| `grand_total` | `decimal`, `12,2` | `default(0.00)` | Final total payable |
| `coupon_code` | `string` | `nullable` | Applied coupon code |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `cart_items` Table Migration
Migration File: `database/migrations/2026_08_11_000021_create_cart_items_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `cart_id` | `unsignedBigInteger` | `foreign`, `index` | Foreign key referencing `carts(id)` |
| `product_id` | `unsignedBigInteger` | `foreign`, `index` | Foreign key referencing `products(id)` |
| `product_variant_id` | `unsignedBigInteger` | `nullable`, `foreign`, `index` | Foreign key referencing `product_variants(id)` |
| `quantity` | `integer` | `default(1)` | Item quantity |
| `unit_price` | `decimal`, `12,2` | | Server-recalculated unit price |
| `discount` | `decimal`, `12,2` | `default(0.00)` | Item discount |
| `tax` | `decimal`, `12,2` | `default(0.00)` | Item tax |
| `total` | `decimal`, `12,2` | | Final item total (`unit_price * quantity`) |
| `timestamps` | `timestamps` | | Created / Updated at |

#### Composite Unique Index:
- `unique(['cart_id', 'product_id', 'product_variant_id'])`

---

## 6. API Requirements

### 6.1 Shopping Cart APIs (`/api/v1/cart`)
- `GET /api/v1/cart` — View current active shopping cart with item details and calculated totals
- `POST /api/v1/cart/items` — Add product or variant to cart
- `PUT /api/v1/cart/items/{item_id}` — Update item quantity in cart
- `DELETE /api/v1/cart/items/{item_id}` — Remove item from cart
- `DELETE /api/v1/cart` — Clear all items from cart
- `POST /api/v1/cart/apply-coupon` — Apply coupon code to cart
- `DELETE /api/v1/cart/remove-coupon` — Remove applied coupon from cart
- `POST /api/v1/cart/merge` — Merge guest cart into customer cart upon login
- `POST /api/v1/cart/validate` — Validate cart items, prices, stock, and coupons pre-checkout

---

## 7. Validation Rules

### 7.1 Add Cart Item Request (`AddToCartRequest`)
- `product_id`: `required|exists:products,id`
- `product_variant_id`: `nullable|exists:product_variants,id`
- `quantity`: `required|integer|min:1|max:100`

### 7.2 Update Cart Item Request (`UpdateCartItemRequest`)
- `quantity`: `required|integer|min:0|max:100`

### 7.3 Apply Coupon Request (`ApplyCouponRequest`)
- `coupon_code`: `required|string|max:50`

### 7.4 Merge Cart Request (`MergeCartRequest`)
- `session_id`: `required|string|max:100`

---

## 8. Business Rules

1. **Server-Side Price Calculation Integrity**: Unit price is pulled directly from database (`variant->effective_price` or `product->effective_price`). User-supplied unit prices are completely ignored.
2. **Real-time Stock Validation**: Cart item quantity CANNOT exceed available stock (`inventories.available_qty`). If stock is lower than requested quantity, HTTP 422 error is returned listing available stock.
3. **Cart Context Resolution**:
   - If Bearer token is provided: `user_id = auth()->id()`.
   - If guest: resolves by `session_id` header `X-Session-ID`.
4. **Merge Logic**: Merging combines item quantities for matching `(product_id, product_variant_id)` up to available stock limits and updates `cart_id`.

---

## 9. Acceptance Criteria

- [ ] Migrations `2026_08_11_000020_create_carts_table.php` and `2026_08_11_000021_create_cart_items_table.php` execute cleanly.
- [ ] `Cart` and `CartItem` Eloquent models created with relationships.
- [ ] `CartService` implemented handling price recalculations, stock validations, coupon application, guest cart merging, and pre-checkout validation.
- [ ] `CartController` implemented handling 9 endpoints (`index`, `addItem`, `updateItem`, `removeItem`, `clear`, `applyCoupon`, `removeCoupon`, `merge`, `validateCart`) extending `BaseController` and `ApiResponseTrait` with full OpenAPI 3.0 annotations.
- [ ] Routes registered in `routes/api.php`.
- [ ] `php artisan l5-swagger:generate` completes with zero errors.
- [ ] Automated feature test suite `CartTest.php` passes with 100% success rate.
