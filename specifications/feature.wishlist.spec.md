# Feature Specification: Wishlist Module

**Module Name:** Wishlist  
**Module ID:** 11  
**Specification File:** `specifications/feature.wishlist.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§20), `Requirements/development_modules.md` (§Module 11)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Wishlist module enables authenticated customers (`User` model) to save favorite products and specific product variants for future purchase, query their saved items with pricing and stock availability, remove items, clear the wishlist, and seamlessly transfer saved wishlist items directly into their shopping cart.

All API endpoints extend `BaseController`, utilize `ApiResponseTrait`, execute on `http://localhost:8002`, are protected under `auth:sanctum` middleware, and MUST include full OpenAPI 3.0 annotations for live Swagger documentation generation via `php artisan l5-swagger:generate`.

---

## 2. Business Flow

### 2.1 Add Item to Wishlist Flow
1. Authenticated customer browses products/variants and clicks "Add to Wishlist".
2. Customer issues `POST /api/v1/wishlist` with `product_id` and optional `product_variant_id`.
3. System verifies target `Product` exists and is active (`status = 'active'`). If `product_variant_id` is supplied, system verifies variant belongs to that product and is active.
4. System checks if item is already present in customer's wishlist (`user_id`, `product_id`, `product_variant_id`). If present, system gracefully returns HTTP 200/201 with the existing item to ensure idempotency without creating duplicate rows.
5. System creates a `wishlist_items` record and returns HTTP 201 Created.

### 2.2 View Wishlist & Check Status Flow
1. Customer views their saved wishlist via `GET /api/v1/wishlist`.
2. System fetches `wishlist_items` for `auth()->id()` eager loading `product` (name, slug, base price, status, main media image) and `variant` (SKU, variant price, stock quantity, attribute values).
3. System calculates real-time stock availability (`in_stock` / `out_of_stock`) for each wishlist entry.
4. Customer can check if a specific product is saved via `GET /api/v1/wishlist/check/{product_id}?variant_id={variant_id}`, returning `is_in_wishlist: true/false`.

### 2.3 Move Wishlist Item to Cart Flow
1. Customer clicks "Move to Cart" on a saved wishlist item.
2. Customer issues `POST /api/v1/wishlist/{id}/move-to-cart` with optional `quantity` (default 1).
3. System verifies item availability and stock. If available, adds item to customer's active shopping cart and deletes the item from `wishlist_items`.

---

## 3. Functional Requirements

- **FR-WSH-001**: System shall allow authenticated customers to add products or specific product variants to their wishlist (`POST /api/v1/wishlist`).
- **FR-WSH-002**: System shall support simple products (`product_id` only) and variant products (`product_id` + `product_variant_id`).
- **FR-WSH-003**: System shall prevent duplicate wishlist entries for the same customer (`unique(['user_id', 'product_id', 'product_variant_id'])`).
- **FR-WSH-004**: System shall allow customers to list saved wishlist items (`GET /api/v1/wishlist`) with eager loaded product image, current price, and stock status.
- **FR-WSH-005**: System shall allow customers to remove individual items from wishlist (`DELETE /api/v1/wishlist/{id}`).
- **FR-WSH-006**: System shall allow customers to clear all items from their wishlist (`DELETE /api/v1/wishlist`).
- **FR-WSH-007**: System shall allow customers to check whether a product or variant is currently in their wishlist (`GET /api/v1/wishlist/check/{product_id}`).
- **FR-WSH-008**: System shall allow moving a wishlist item to shopping cart (`POST /api/v1/wishlist/{id}/move-to-cart`), automatically deleting the item from wishlist upon cart addition.
- **FR-WSH-009**: System shall restrict all Wishlist APIs to authenticated customers via Sanctum middleware (`auth:sanctum`).
- **FR-WSH-010**: System shall enforce strict ownership isolation so customers can only view and modify their own wishlist items (`user_id = auth()->id()`).
- **FR-WSH-011**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Authentication Guard**: `auth:sanctum`.
- **Ownership Isolation**: Scope all queries by `where('user_id', auth()->id())`.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `wishlist_items` Table Migration
Migration File: `database/migrations/2026_08_11_000019_create_wishlist_items_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `user_id` | `unsignedBigInteger` | `foreign`, `index` | Foreign key referencing `users(id)` |
| `product_id` | `unsignedBigInteger` | `foreign`, `index` | Foreign key referencing `products(id)` |
| `product_variant_id` | `unsignedBigInteger` | `nullable`, `foreign`, `index` | Foreign key referencing `product_variants(id)` |
| `timestamps` | `timestamps` | | Created / Updated at |

#### Composite Unique Index:
- `unique(['user_id', 'product_id', 'product_variant_id'])`

---

## 6. API Requirements

### 6.1 Customer Wishlist APIs (`/api/v1/wishlist`)
- `GET /api/v1/wishlist` — List customer's wishlist items
- `POST /api/v1/wishlist` — Add product/variant to wishlist
- `GET /api/v1/wishlist/check/{product_id}` — Check if product/variant is in customer's wishlist
- `POST /api/v1/wishlist/{id}/move-to-cart` — Move wishlist item to shopping cart
- `DELETE /api/v1/wishlist/{id}` — Remove single item from wishlist
- `DELETE /api/v1/wishlist` — Clear customer's entire wishlist

---

## 7. Validation Rules

### 7.1 Add Wishlist Item Request (`AddToWishlistRequest`)
- `product_id`: `required|exists:products,id`
- `product_variant_id`: `nullable|exists:product_variants,id`

---

## 8. Business Rules

1. **Ownership Isolation**: Every wishlist operation (`show`, `destroy`, `moveToCart`) MUST verify that `$wishlistItem->user_id === auth()->id()`. Returning HTTP 404/403 for unauthorized access attempts.
2. **Product Active Requirement**: Attempts to add inactive or deleted products (`status != 'active'`) to wishlist throw an HTTP 422 validation error.
3. **Idempotent Addition**: If customer submits an add request for an item already in their wishlist, system returns HTTP 200 with the existing record rather than failing or creating duplicates.
4. **Move to Cart Atomicity**: Moving item to cart creates/updates cart entry and deletes the wishlist row within a database transaction.

---

## 9. Acceptance Criteria

- [ ] Migration `2026_08_11_000019_create_wishlist_items_table.php` executes cleanly.
- [ ] `WishlistItem` Eloquent model created with `belongsTo(User::class)`, `belongsTo(Product::class)`, and `belongsTo(ProductVariant::class)`.
- [ ] `User` model updated with `wishlistItems()` relationship.
- [ ] `WishlistService` implemented encapsulating add, remove, clear, check, list, and move-to-cart business logic.
- [ ] `WishlistController` implemented handling 6 endpoints (`index`, `store`, `check`, `moveToCart`, `destroy`, `clear`) extending `BaseController` and `ApiResponseTrait` with full OpenAPI 3.0 annotations.
- [ ] API routes registered in `routes/api.php` under `auth:sanctum` middleware.
- [ ] `php artisan l5-swagger:generate` completes with zero errors.
- [ ] Automated feature test suite `WishlistTest.php` passes with 100% success rate.
