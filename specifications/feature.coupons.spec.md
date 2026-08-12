# Feature Specification: Coupons & Discounts Module

**Module Name:** Coupons & Discounts  
**Module ID:** 13  
**Specification File:** `specifications/feature.coupons.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§38–§40), `Requirements/admin_panel.md` (§19–§20), `Requirements/development_modules.md` (§Module 13, §Module 29)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permissions / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Coupons & Discounts module provides a flexible promotion engine and comprehensive coupon management system. It supports percentage-based, fixed amount, and free shipping coupons with rich restriction rules including minimum order values, maximum discount caps, active date ranges, global usage limits, per-customer usage limits, first-order restrictions, new-customer restrictions, and item-level targeting (product, category, brand, or customer exclusions/inclusions).

It exposes both public validation APIs for guest and customer shopping carts, complete admin CRUD management endpoints, and usage reporting tools. All endpoints strictly output standardized JSON using `ApiResponseTrait` on `http://localhost:8002` and include OpenAPI 3.0 `@OA` documentation for live Swagger generation.

---

## 2. Business Flow

### 2.1 Admin Coupon Creation & Management Flow
1. Admin opens Coupon Management (`POST /api/v1/admin/coupons`).
2. Admin enters code (auto-uppercased), name, discount type (`percentage`, `fixed_amount`, `free_shipping`), discount value, and optional constraints:
   - Minimum order value and maximum discount amount (for percentage coupons).
   - Start and end validity timestamps.
   - Total usage limit and per-customer usage limit.
   - Flags: `is_first_order_only`, `is_new_customer_only`, `free_shipping`.
   - Restrictions arrays: `product_ids`, `category_ids`, `brand_ids`, `user_ids`.
3. System saves coupon record and syncs restriction pivot tables (`coupon_products`, `coupon_categories`, `coupon_brands`, `coupon_customers`).
4. Admin can list, filter by status/type, view details, update rules, toggle status (`active`/`inactive`), and soft-delete/archive coupons.

### 2.2 Coupon Validation & Calculation Engine Flow (Cart / Checkout)
1. Customer or Cart Service submits a coupon code via `POST /api/v1/coupons/validate` or during cart checkout recalculation.
2. `CouponService` validates the coupon sequentially:
   - **Existence & Status**: Code must exist and have `status = 'active'`.
   - **Date Range**: Current timestamp must be $\ge \text{start\_date}$ (if set) and $\le \text{end\_date}$ (if set).
   - **Total Usage Limit**: $\text{total\_usages} < \text{usage\_limit}$ (if set).
   - **Per-Customer Limit**: For authenticated customers, $\text{customer\_usages} < \text{per\_customer\_limit}$ (if set).
   - **First Order / New Customer**: If `is_first_order_only` or `is_new_customer_only` is true, verifies user has 0 prior completed orders.
   - **Minimum Cart Subtotal**: Cart subtotal (or eligible subtotal) must be $\ge \text{min\_order\_value}$.
   - **Targeting Eligibility**: If product/category/brand restrictions are defined, only items matching those criteria are included in the discount subtotal calculation.
3. System calculates the discount amount:
   - `percentage`: $\min\left(\text{eligible\_subtotal} \times \frac{\text{value}}{100}, \text{max\_discount} \text{ if set}\right)$.
   - `fixed_amount`: $\min\left(\text{value}, \text{eligible\_subtotal}\right)$.
   - `free_shipping`: Grants 100% shipping fee waiver (plus any percentage/fixed discount if configured).
4. System returns validation result, breakdown of calculated discount, and applicable metadata.

### 2.3 Coupon Usage Tracking Flow
1. Upon successful order placement, system logs an entry in `coupon_usages` (`coupon_id`, `user_id`, `order_id`, `discount_amount`, `used_at`).
2. Increments total usage count on the coupon.

---

## 3. Functional Requirements

- **FR-CPN-001**: System shall support 3 coupon discount types: `percentage`, `fixed_amount`, and `free_shipping`.
- **FR-CPN-002**: Coupon codes must be unique and automatically converted to uppercase (e.g., `WELCOME10`).
- **FR-CPN-003**: System shall enforce date-range validity (`start_date` and `end_date`).
- **FR-CPN-004**: System shall enforce global `usage_limit` and per-customer `per_customer_limit`.
- **FR-CPN-005**: System shall enforce minimum cart subtotal (`min_order_value`).
- **FR-CPN-006**: System shall enforce maximum discount limit (`max_discount`) for percentage discounts.
- **FR-CPN-007**: System shall support first-order-only (`is_first_order_only`) and new-customer-only (`is_new_customer_only`) restrictions.
- **FR-CPN-008**: System shall support restriction targeting via pivot tables for specific products (`coupon_products`), categories (`coupon_categories`), brands (`coupon_brands`), and customers (`coupon_customers`).
- **FR-CPN-009**: System shall provide public validation API (`POST /api/v1/coupons/validate`) returning eligibility and exact discount calculation.
- **FR-CPN-010**: System shall provide full Admin CRUD APIs (`GET/POST/PUT/DELETE /api/v1/admin/coupons`, status toggle `/api/v1/admin/coupons/{id}/status`).
- **FR-CPN-011**: System shall provide Admin Coupon Usage & Performance Report endpoint (`GET /api/v1/admin/coupons/{id}/reports`) displaying total uses, total discount given, total orders, revenue generated, and remaining uses.
- **FR-CPN-012**: Every endpoint must be documented with OpenAPI 3.0 `@OA` annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Auth Guard**: Sanctum guard + Spatie Permission middleware (`permission:manage-coupons` or `role:super-admin`).
- **OpenAPI Target**: `http://localhost:8002` (Swagger UI generation).

---

## 5. Database Schema Specification

### 5.1 Table: `coupons`
Migration: `database/migrations/2026_08_11_000022_create_coupons_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `code` | `string` | Unique, Index | Coupon code (uppercase) |
| `name` | `string` | | Descriptive title |
| `description` | `text` | Nullable | Admin notes / public description |
| `type` | `enum` | `['percentage', 'fixed_amount', 'free_shipping']` | Discount calculation model |
| `value` | `decimal(12,2)` | Default `0.00` | Discount percentage or amount |
| `max_discount` | `decimal(12,2)` | Nullable | Maximum cap for percentage discounts |
| `min_order_value` | `decimal(12,2)` | Default `0.00` | Minimum required subtotal |
| `start_date` | `dateTime` | Nullable | Activation timestamp |
| `end_date` | `dateTime` | Nullable | Expiration timestamp |
| `usage_limit` | `unsignedInteger` | Nullable | Global maximum uses |
| `per_customer_limit` | `unsignedInteger` | Nullable | Max uses per user |
| `is_first_order_only` | `boolean` | Default `false` | Restrict to 1st order |
| `is_new_customer_only` | `boolean` | Default `false` | Restrict to new users |
| `free_shipping` | `boolean` | Default `false` | Grants free shipping |
| `status` | `enum` | `['active', 'inactive', 'archived']`, Default `'active'` | Lifecycle state |
| `timestamps` | `timestamps` | | Created / Updated timestamps |

### 5.2 Restriction Pivot Tables
- `coupon_products`: `id`, `coupon_id` (FK), `product_id` (FK)
- `coupon_categories`: `id`, `coupon_id` (FK), `category_id` (FK)
- `coupon_brands`: `id`, `coupon_id` (FK), `brand_id` (FK)
- `coupon_customers`: `id`, `coupon_id` (FK), `user_id` (FK)

### 5.3 Table: `coupon_usages`
Migration: `database/migrations/2026_08_11_000023_create_coupon_usages_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `coupon_id` | `foreignId` | FK -> `coupons` | Applied coupon |
| `user_id` | `foreignId` | Nullable, FK -> `users` | Customer ID |
| `order_id` | `foreignId` | Nullable, FK -> `orders` | Order ID |
| `discount_amount` | `decimal(12,2)` | | Actual discount given |
| `used_at` | `timestamp` | Default `CURRENT_TIMESTAMP` | Usage timestamp |

---

## 6. API Endpoints Specification

### 6.1 Public / Customer Endpoints
- `POST /api/v1/coupons/validate` — Validate code against cart payload and calculate discount.

### 6.2 Admin Endpoints (`auth:sanctum`)
- `GET /api/v1/admin/coupons` — List coupons with pagination and status/type search.
- `POST /api/v1/admin/coupons` — Create coupon with restriction rules.
- `GET /api/v1/admin/coupons/{id}` — Get single coupon with attached restrictions.
- `PUT /api/v1/admin/coupons/{id}` — Update coupon details and restrictions.
- `DELETE /api/v1/admin/coupons/{id}` — Soft-delete / archive coupon.
- `PATCH /api/v1/admin/coupons/{id}/status` — Toggle status (`active`/`inactive`).
- `GET /api/v1/admin/coupons/{id}/reports` — Coupon usage report & performance metrics.

---

## 7. Verification & Acceptance Criteria

1. Migration & Schema check: `coupons`, `coupon_usages`, and restriction pivot tables migrate cleanly.
2. Unit / Integration tests cover:
   - Admin CRUD operations & validation errors (e.g. duplicate code, invalid dates).
   - Validating percentage, fixed amount, and free shipping coupons.
   - Enforcing minimum order subtotal and max discount cap.
   - Enforcing usage limit and per-customer limit.
   - Product / Category / Brand restriction filtering.
   - Report statistics (total uses, revenue generated, discount total).
3. Swagger documentation regenerates with `php artisan l5-swagger:generate` without errors.
4. Full application test suite `php artisan test` passes 100%.
