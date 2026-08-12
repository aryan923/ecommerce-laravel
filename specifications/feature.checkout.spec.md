# Feature Specification: Checkout & Order Creation Module

**Module Name:** Checkout & Order Creation  
**Module ID:** 16  
**Specification File:** `specifications/feature.checkout.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§24–§29, §77–§78, §93–§94), `Requirements/development_modules.md` (§Module 16)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum & Session ID Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Checkout & Order Creation module converts a validated customer or guest cart into a committed, immutable purchase order. It handles the entire checkout workflow: address validation, shipping method selection, promo coupon application, tax calculation, payment method selection, atomic stock reservation, idempotency enforcement, order number generation (`ORD-YYYYMMDD-{id}`), historical item snapshot preservation, initial payment record creation, and cart clearing.

Order creation executes strictly inside a database transaction (`DB::transaction`) with atomic inventory locks via `InventoryService` to prevent race conditions and overselling. All endpoints output standardized JSON responses using `ApiResponseTrait` on `http://localhost:8002` and include OpenAPI 3.0 annotations.

---

## 2. Business Flow

### 2.1 Checkout Process & Order Creation Flow
1. Customer initiates checkout via `POST /api/v1/checkout/process` with:
   - Shipping Address ID (`shipping_address_id`) or inline address object.
   - Billing Address ID (`billing_address_id`) or inline address object.
   - Shipping Method ID (`shipping_method_id`).
   - Payment Method (`payment_method`: `cod`, `razorpay`, `stripe`, `bank_transfer`).
   - Optional Promo Coupon Code (`coupon_code`).
   - Optional Idempotency Key header `X-Idempotency-Key` or payload `idempotency_key`.
2. **Idempotency Guard**:
   - Checks if an order with the given `idempotency_key` already exists for the user/session. If found, immediately returns the previously created order payload without re-executing checkout.
3. **Cart & Item Validation**:
   - Resolves customer/guest cart and items.
   - Re-verifies product/variant status (`status = 'active'`).
   - Re-verifies stock availability in `inventories`.
4. **Price, Tax, Shipping & Coupon Calculation**:
   - Recalculates line item totals server-side using current database prices.
   - Applies coupon discount if `coupon_code` is provided via `CouponService`.
   - Calculates exact tax via `TaxService` (CGST/SGST vs IGST).
   - Calculates shipping fee via `ShippingService`.
5. **Database Transaction (`DB::transaction`)**:
   - Reserves item stock atomically via `InventoryService::reserveStock()`.
   - Creates `orders` record with `order_number` formatted as `ORD-YYYYMMDD-{id}`.
   - Creates immutable `order_items` records storing product name, SKU, price, tax, discount, and product metadata snapshots.
   - Creates `payments` record (`status = 'pending'`, `amount = grand_total`).
   - Records initial order timeline event (`order_histories`).
   - Records coupon usage log (`coupon_usages`) if a coupon was applied.
   - Clears cart items.
6. Returns completed order details, payment initiation payload, and confirmation summary.

---

## 3. Functional Requirements

- **FR-CHK-001**: System shall provide a unified checkout process endpoint (`POST /api/v1/checkout/process`).
- **FR-CHK-002**: System shall execute order placement inside a database transaction (`DB::transaction`).
- **FR-CHK-003**: System shall generate a unique public order number formatted as `ORD-YYYYMMDD-{id}` (e.g. `ORD-20260812-1001`).
- **FR-CHK-004**: System shall preserve complete immutable product & variant snapshots in `order_items` (`product_name`, `sku`, `unit_price`, `discount_amount`, `tax_amount`, `total_amount`, `snapshot_data`).
- **FR-CHK-005**: System shall reserve stock atomically using `InventoryService` during order placement, preventing overselling.
- **FR-CHK-006**: System shall support `X-Idempotency-Key` header / payload `idempotency_key` to prevent duplicate order submissions on network retries.
- **FR-CHK-007**: System shall create an initial `payments` record linked to the order (`status = 'pending'`).
- **FR-CHK-008**: System shall clear the cart upon successful order placement.
- **FR-CHK-009**: System shall record order creation timeline event in `order_histories`.
- **FR-CHK-010**: System shall provide customer order lookup endpoint (`GET /api/v1/orders/{order_number}`).
- **FR-CHK-011**: Every API endpoint must be documented with OpenAPI 3.0 `@OA` annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Order Number Format**: `ORD-YYYYMMDD-{id}`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table: `orders`
Migration: `database/migrations/2026_08_11_000031_create_orders_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `order_number` | `string` | Unique, Index | Public Order Number (e.g. `ORD-20260812-1001`) |
| `user_id` | `foreignId` | Nullable, FK -> `users` | Customer ID (null for guest checkout) |
| `guest_email` | `string` | Nullable | Guest checkout email |
| `guest_name` | `string` | Nullable | Guest checkout name |
| `status` | `enum` | `['pending_payment', 'paid', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed']`, Default `'pending_payment'` | Order lifecycle status |
| `currency` | `string(3)` | Default `'INR'` | Currency code |
| `subtotal` | `decimal(12,2)` | Default `0.00` | Items subtotal |
| `discount_total` | `decimal(12,2)` | Default `0.00` | Total discount |
| `tax_total` | `decimal(12,2)` | Default `0.00` | Total tax |
| `shipping_total` | `decimal(12,2)` | Default `0.00` | Shipping charge |
| `grand_total` | `decimal(12,2)` | Default `0.00` | Final payable total |
| `coupon_code` | `string` | Nullable | Applied coupon code |
| `payment_method` | `string` | Default `'cod'` | Selected payment method |
| `shipping_address` | `json` | | Shipping address snapshot |
| `billing_address` | `json` | | Billing address snapshot |
| `shipping_method_name` | `string` | Nullable | Shipping method title |
| `idempotency_key` | `string` | Nullable, Unique | Duplicate prevention key |
| `timestamps` | `timestamps` | | Timestamps |

### 5.2 Table: `order_items`
Migration: `database/migrations/2026_08_11_000032_create_order_items_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `order_id` | `foreignId` | FK -> `orders` | Parent Order FK |
| `product_id` | `foreignId` | Nullable, FK -> `products` | Product FK |
| `product_variant_id` | `foreignId` | Nullable, FK -> `product_variants` | Variant FK |
| `product_name` | `string` | | Snapshot of product title |
| `sku` | `string` | | Snapshot of SKU |
| `unit_price` | `decimal(12,2)` | | Snapshot unit price |
| `quantity` | `integer` | | Ordered quantity |
| `discount_amount` | `decimal(12,2)` | Default `0.00` | Item discount amount |
| `tax_amount` | `decimal(12,2)` | Default `0.00` | Item tax amount |
| `total_amount` | `decimal(12,2)` | | Final line total |
| `snapshot_data` | `json` | Nullable | Full item attributes & image snapshot |

### 5.3 Table: `payments` & `order_histories`
Migration: `database/migrations/2026_08_11_000033_create_payments_table.php`

- `payments`: `id`, `order_id` (FK), `payment_method`, `transaction_id` (nullable), `amount`, `currency`, `status` (`pending`, `authorized`, `captured`, `failed`, `refunded`), `payload` (json), `timestamps`.
- `order_histories`: `id`, `order_id` (FK), `user_id` (nullable), `status`, `comment`, `created_at`.

---

## 6. API Endpoints Specification

### 6.1 Customer Checkout Endpoints
- `POST /api/v1/checkout/process` — Primary transactional checkout & order placement endpoint.
- `GET /api/v1/orders/{order_number}` — Fetch customer order confirmation details.

---

## 7. Verification & Acceptance Criteria

1. Database migrations migrate cleanly.
2. `POST /api/v1/checkout/process` creates orders inside `DB::transaction` with exact `ORD-YYYYMMDD-{id}` formatting.
3. Item snapshots (`order_items`) preserve original title, SKU, price, and tax without altering when products change later.
4. Atomic stock reservation via `InventoryService` reduces available stock and prevents overselling.
5. Idempotency key duplicate requests return existing order payload without creating duplicates.
6. Swagger documentation regenerates via `php artisan l5-swagger:generate`.
