# Feature Specification: Admin Coupon Management Module

**Module Name:** Admin Coupon Management  
**Module ID:** 29  
**Specification File:** `specifications/feature.admin-coupons.spec.md`  
**Version:** 1.0  
**Status:** Approved Specification  
**SRS References:** `Requirements/srs_apis.md` (§38–§40), `Requirements/admin_panel.md` (§19–§20), `Requirements/development_modules.md` (§Module 29)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permissions / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Coupon Management module provides store administrators with complete control over promotional campaigns, discount rules, coupon lifecycle management, and ROI reporting. It allows admins to configure percentage, fixed-amount, and free-shipping discounts; define strict eligibility criteria (minimum order amounts, maximum discount caps, active validity windows, global & per-customer usage limits, first-order/new-customer flags); apply targeted restrictions to specific products, categories, brands, or customer segments; toggle active/inactive statuses; archive coupons safely without corrupting historical financial data; and analyze comprehensive usage metrics (total redemptions, total discount cost, orders generated, revenue generated, and remaining usage quota).

All administrative API endpoints strictly conform to standardized JSON formatting using `App\Traits\ApiResponseTrait` on `http://localhost:8002`, are guarded by Sanctum authentication and permission middleware (`permission:coupons.view`, `permission:coupons.create`, `permission:coupons.update`, `permission:coupons.delete`), and include complete OpenAPI 3.0 `@OA` docblocks for automated Swagger documentation.

---

## 2. Business Flow

### 2.1 Coupon Listing & Search Flow
1. Administrator navigates to the Admin Panel Coupon Management page (`GET /api/v1/admin/coupons`).
2. System fetches paginated list of coupons with optional filtering by:
   - `search`: Case-insensitive substring search matching coupon `code` or `name`.
   - `status`: Filter by `active`, `inactive`, or `archived`.
   - `type`: Filter by `percentage`, `fixed_amount`, or `free_shipping`.
   - `sort_by`: Sort by `created_at`, `code`, `start_date`, `end_date`, or `uses_count`.
   - `sort_order`: `asc` or `desc`.
3. System returns paginated coupon records including usage counts and active status indicators.

### 2.2 Coupon Creation Flow
1. Admin clicks "Create Coupon" (`POST /api/v1/admin/coupons`).
2. Admin submits campaign rules via form payload:
   - **Basic Info**: `code` (automatically uppercased, e.g., `SAVE20`), `name`, `description`.
   - **Discount Type & Value**: `type` (`percentage`, `fixed_amount`, `free_shipping`), `value` (percentage rate or monetary amount).
   - **Financial Thresholds**: `min_order_value` (minimum cart amount), `max_discount` (maximum cap for percentage discounts).
   - **Validity Window**: `start_date` and `end_date` (ISO timestamps).
   - **Usage Quotas**: `usage_limit` (total redemptions allowed across store), `per_customer_limit` (max uses per customer account).
   - **Flags**: `is_first_order_only` (boolean), `is_new_customer_only` (boolean), `free_shipping` (boolean toggle).
   - **Targeting Restrictions**: Arrays of `product_ids`, `category_ids`, `brand_ids`, and `user_ids`.
3. `StoreCouponRequest` validates inputs for uniqueness, date ordering, and positive numerical limits.
4. `CouponService` creates the coupon record and syncs restriction pivot tables (`coupon_products`, `coupon_categories`, `coupon_brands`, `coupon_customers`).
5. System returns 201 Created response with the new coupon payload.

### 2.3 Coupon Details & Rule Inspection Flow
1. Admin selects a coupon (`GET /api/v1/admin/coupons/{id}`).
2. System loads the full coupon record eager-loading its assigned restriction relations (`products`, `categories`, `brands`, `customers`) and recent usage statistics.
3. Returns comprehensive coupon configuration payload.

### 2.4 Coupon Modification Flow
1. Admin edits an existing coupon (`PUT /api/v1/admin/coupons/{id}`).
2. `UpdateCouponRequest` validates code uniqueness (ignoring current coupon ID) and updated rule constraints.
3. `CouponService` updates attributes and syncs updated restriction pivot arrays.
4. Returns updated coupon profile.

### 2.5 Status Toggle & Archiving Flow
1. Admin toggles coupon availability (`PATCH /api/v1/admin/coupons/{id}/status`).
   - Body: `{"status": "active"}` or `{"status": "inactive"}`.
   - System updates status immediately.
2. Admin deletes/archives a coupon (`DELETE /api/v1/admin/coupons/{id}`).
   - System soft-deletes or marks status as `archived`.
   - Historical orders, invoices, and `coupon_usages` financial records are preserved intact.

### 2.6 Coupon Usage & ROI Analytics Report Flow
1. Admin opens Coupon Performance Report (`GET /api/v1/admin/coupons/{id}/reports`).
2. `CouponService` calculates campaign KPIs:
   - `total_uses`: Total number of times coupon has been redeemed across completed orders.
   - `total_discount_amount`: Cumulative sum of discount amounts granted by this coupon.
   - `orders_count`: Count of distinct orders created using this coupon.
   - `total_revenue_generated`: Sum of `grand_total` for all orders where this coupon was redeemed.
   - `remaining_uses`: `usage_limit - total_uses` (or `null` if unlimited).
   - `customer_breakdown`: Paginated list of customers who used the coupon with usage count and total saved.
3. System returns formatted analytics payload.

---

## 3. Functional Requirements

- **FR-ACPN-001**: System shall provide Admin API endpoints to list, filter, search, create, view, update, status-toggle, and delete/archive coupons.
- **FR-ACPN-002**: Coupon codes must be unique across the platform and automatically converted to uppercase (e.g., `SUMMER2026`).
- **FR-ACPN-003**: System shall support 3 primary discount calculation types: `percentage`, `fixed_amount`, and `free_shipping`.
- **FR-ACPN-004**: System shall allow setting minimum cart subtotal (`min_order_value`) required for coupon eligibility.
- **FR-ACPN-005**: System shall allow setting maximum monetary discount cap (`max_discount`) for percentage-based coupons.
- **FR-ACPN-006**: System shall support validity date windows (`start_date` and `end_date`), enforcing that `end_date` must be equal to or after `start_date`.
- **FR-ACPN-007**: System shall enforce global redemption caps (`usage_limit`) and per-customer redemption caps (`per_customer_limit`).
- **FR-ACPN-008**: System shall support customer account restrictions (`is_first_order_only`, `is_new_customer_only`, `user_ids`).
- **FR-ACPN-009**: System shall support item targeting restrictions (`product_ids`, `category_ids`, `brand_ids`).
- **FR-ACPN-10**: Deleting a coupon must soft-delete or archive the coupon, preserving historic financial records in `orders` and `coupon_usages`.
- **FR-ACPN-011**: System shall provide a Coupon Performance Report endpoint (`GET /api/v1/admin/coupons/{id}/reports`) computing total usages, total discount monetary value, generated order count, gross order revenue, remaining usage, and customer usage logs.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4
- **Architecture Pattern**: Controller -> FormRequest -> Service -> Eloquent Model -> JSON Response (`ApiResponseTrait`).
- **Authentication & Security**: Sanctum Bearer token authentication required for all admin endpoints.
- **Role & Permission Guarding**: Middleware enforced:
  - `GET /api/v1/admin/coupons` -> `permission:coupons.view`
  - `POST /api/v1/admin/coupons` -> `permission:coupons.create`
  - `GET /api/v1/admin/coupons/{id}` -> `permission:coupons.view`
  - `PUT /api/v1/admin/coupons/{id}` -> `permission:coupons.update`
  - `PATCH /api/v1/admin/coupons/{id}/status` -> `permission:coupons.update`
  - `DELETE /api/v1/admin/coupons/{id}` -> `permission:coupons.delete`
  - `GET /api/v1/admin/coupons/{id}/reports` -> `permission:coupons.view`
- **Documentation**: All endpoints must contain OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`) for live Swagger UI rendering on `http://localhost:8002/api/documentation`.

---

## 5. Database Schema & Relations

### 5.1 Primary Tables Involved
1. **`coupons`**:
   - `id` (bigint unsigned, primary key)
   - `code` (string 50, unique, indexed)
   - `name` (string 150)
   - `description` (text, nullable)
   - `type` (enum: `percentage`, `fixed_amount`, `free_shipping`)
   - `value` (decimal 12,2, default 0.00)
   - `min_order_value` (decimal 12,2, nullable)
   - `max_discount` (decimal 12,2, nullable)
   - `start_date` (timestamp, nullable)
   - `end_date` (timestamp, nullable)
   - `usage_limit` (integer unsigned, nullable)
   - `per_customer_limit` (integer unsigned, default 1)
   - `uses_count` (integer unsigned, default 0)
   - `is_first_order_only` (boolean, default false)
   - `is_new_customer_only` (boolean, default false)
   - `free_shipping` (boolean, default false)
   - `status` (enum: `active`, `inactive`, `archived`, default `active`)
   - `created_at`, `updated_at`, `deleted_at` (timestamps, soft deletes)

2. **Pivot Tables for Targeting Restrictions**:
   - `coupon_products` (`coupon_id`, `product_id`)
   - `coupon_categories` (`coupon_id`, `category_id`)
   - `coupon_brands` (`coupon_id`, `brand_id`)
   - `coupon_customers` (`coupon_id`, `user_id`)

3. **`coupon_usages`**:
   - `id` (bigint unsigned, primary key)
   - `coupon_id` (foreignKey -> `coupons.id`)
   - `user_id` (foreignKey -> `users.id`, nullable for guest checkouts if recorded)
   - `order_id` (foreignKey -> `orders.id`)
   - `discount_amount` (decimal 12,2)
   - `used_at` (timestamp)

---

## 6. API Requirements

### 6.1 `GET /api/v1/admin/coupons`
- **Summary**: List All Coupons
- **Query Params**:
  - `search` (string, optional)
  - `status` (string: `active`, `inactive`, `archived`, optional)
  - `type` (string: `percentage`, `fixed_amount`, `free_shipping`, optional)
  - `sort_by` (string: `id`, `code`, `created_at`, `uses_count`, optional, default: `id`)
  - `sort_order` (string: `asc`, `desc`, default: `desc`)
  - `per_page` (integer, default 15)
- **Response 200**:
  ```json
  {
    "success": true,
    "message": "Coupons retrieved successfully.",
    "data": [
      {
        "id": 1,
        "code": "WELCOME2026",
        "name": "Welcome New Customer Discount",
        "type": "percentage",
        "value": 15.00,
        "min_order_value": 500.00,
        "max_discount": 150.00,
        "start_date": "2026-08-01T00:00:00Z",
        "end_date": "2026-12-31T23:59:59Z",
        "usage_limit": 1000,
        "per_customer_limit": 1,
        "uses_count": 42,
        "status": "active",
        "created_at": "2026-08-01T10:00:00Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 15,
      "total": 1,
      "last_page": 1
    },
    "errors": null
  }
  ```

### 6.2 `POST /api/v1/admin/coupons`
- **Summary**: Create New Coupon
- **Request Body**:
  ```json
  {
    "code": "FESTIVE50",
    "name": "Festive Flat Discount",
    "description": "Flat ₹500 off on minimum purchase of ₹2000",
    "type": "fixed_amount",
    "value": 500.00,
    "min_order_value": 2000.00,
    "max_discount": null,
    "start_date": "2026-08-15 00:00:00",
    "end_date": "2026-08-31 23:59:59",
    "usage_limit": 500,
    "per_customer_limit": 2,
    "is_first_order_only": false,
    "is_new_customer_only": false,
    "free_shipping": false,
    "status": "active",
    "product_ids": [10, 12],
    "category_ids": [3],
    "brand_ids": [],
    "user_ids": []
  }
  ```
- **Response 201**: Standard success response with created coupon object.

### 6.3 `GET /api/v1/admin/coupons/{id}`
- **Summary**: Retrieve Single Coupon Details
- **Response 200**: Returns coupon object with restriction relationships (`products`, `categories`, `brands`, `customers`).

### 6.4 `PUT /api/v1/admin/coupons/{id}`
- **Summary**: Update Coupon Configuration
- **Request Body**: Same fields as creation. Code uniqueness check ignores current ID.
- **Response 200**: Updated coupon object.

### 6.5 `PATCH /api/v1/admin/coupons/{id}/status`
- **Summary**: Toggle Coupon Active/Inactive Status
- **Request Body**: `{"status": "inactive"}`
- **Response 200**: Success message with updated status.

### 6.6 `DELETE /api/v1/admin/coupons/{id}`
- **Summary**: Delete/Archive Coupon
- **Response 200**: Success message confirming coupon soft-deletion/archiving.

### 6.7 `GET /api/v1/admin/coupons/{id}/reports`
- **Summary**: Coupon Usage & Financial Analytics Report
- **Response 200**:
  ```json
  {
    "success": true,
    "message": "Coupon performance report retrieved successfully.",
    "data": {
      "coupon": {
        "id": 1,
        "code": "FESTIVE50",
        "name": "Festive Flat Discount",
        "status": "active"
      },
      "metrics": {
        "total_uses": 42,
        "total_discount_amount": 21000.00,
        "orders_count": 42,
        "total_revenue_generated": 105000.00,
        "remaining_uses": 458
      },
      "recent_usages": [
        {
          "id": 101,
          "order_id": 85,
          "order_number": "ORD-20260817-0085",
          "user_id": 4,
          "customer_name": "Emily Davis",
          "discount_amount": 500.00,
          "used_at": "2026-08-17T09:30:00Z"
        }
      ]
    },
    "errors": null
  }
  ```

---

## 7. Validation Rules

1. **`code`**: Required, string, max 50 chars, unique in `coupons` table (ignoring current coupon on update), automatically uppercase.
2. **`name`**: Required, string, max 150 chars.
3. **`type`**: Required, in (`percentage`, `fixed_amount`, `free_shipping`).
4. **`value`**: Required if type is `percentage` or `fixed_amount`, numeric, min 0. If percentage, max 100.
5. **`min_order_value`**: Optional, numeric, min 0.
6. **`max_discount`**: Optional, numeric, min 0.
7. **`start_date`**: Optional, valid date format (`Y-m-d H:i:s` or ISO 8601).
8. **`end_date`**: Optional, valid date format, must be `after_or_equal:start_date`.
9. **`usage_limit`**: Optional, integer, min 1.
10. **`per_customer_limit`**: Optional, integer, min 1.
11. **`status`**: Optional, in (`active`, `inactive`, `archived`).
12. **`product_ids`**: Optional, array, items must exist in `products.id`.
13. **`category_ids`**: Optional, array, items must exist in `categories.id`.
14. **`brand_ids`**: Optional, array, items must exist in `brands.id`.
15. **`user_ids`**: Optional, array, items must exist in `users.id`.

---

## 8. Permission Rules

- `coupons.view`: Required to list coupons, view coupon details, and view performance reports.
- `coupons.create`: Required to create new coupons.
- `coupons.update`: Required to update coupon rules and toggle active status.
- `coupons.delete`: Required to soft-delete/archive coupons.

---

## 9. Error Handling

- **400 Bad Request**: Malformed JSON or invalid parameter syntax.
- **401 Unauthenticated**: Missing or invalid Sanctum Bearer token.
- **403 Forbidden**: Authenticated admin user lacks required Spatie permission (e.g., `coupons.create`).
- **404 Not Found**: Coupon ID does not exist.
- **422 Unprocessable Entity**: Validation failure (duplicate code, `end_date` before `start_date`, percentage value > 100). Returns `validationErrorResponse()`.

---

## 10. Acceptance Criteria Checklist

- [x] Endpoint `GET /api/v1/admin/coupons` returns paginated coupon list with search, status, and type filters.
- [x] Endpoint `POST /api/v1/admin/coupons` creates new coupon, auto-uppercases code, and syncs restriction pivot tables.
- [x] Endpoint `GET /api/v1/admin/coupons/{id}` retrieves single coupon with restriction relations.
- [x] Endpoint `PUT /api/v1/admin/coupons/{id}` updates existing coupon attributes and restriction pivot tables.
- [x] Endpoint `PATCH /api/v1/admin/coupons/{id}/status` toggles coupon active/inactive status.
- [x] Endpoint `DELETE /api/v1/admin/coupons/{id}` soft-deletes/archives coupon without purging financial history.
- [x] Endpoint `GET /api/v1/admin/coupons/{id}/reports` returns comprehensive usage and revenue analytics.
- [x] All requests validated via FormRequest classes (`StoreCouponRequest`, `UpdateCouponRequest`).
- [x] All responses returned via `ApiResponseTrait`.
- [x] Feature test suite (`tests/Feature/AdminCouponManagementTest.php`) passes cleanly.

---

## 11. Edge Cases

1. **Duplicate Coupon Code**: Creating a coupon with a code that already exists (even in lowercase, e.g., `welcome2026` vs `WELCOME2026`) must fail validation with HTTP 422.
2. **Expired Coupon Update**: Updating an expired coupon's `end_date` to a future timestamp automatically restores eligibility without corrupting historic usages.
3. **Percentage > 100%**: Submitting a percentage value > 100 must fail validation.
4. **Invalid Date Window**: Submitting an `end_date` that is chronologically prior to `start_date` must fail validation with HTTP 422.
5. **Zero Usages Report**: Requesting reports for a newly created coupon with 0 redemptions returns 0 metrics cleanly without division-by-zero errors.

---

## 12. Dependencies

- **Database**: `coupons`, `coupon_usages`, `coupon_products`, `coupon_categories`, `coupon_brands`, `coupon_customers`, `orders`, `users`.
- **Services**: `App\Services\CouponService`.
- **Controllers**: `App\Http\Controllers\Api\V1\Admin\CouponController`.
- **Documentation**: L5-Swagger / OpenAPI 3.0 (`php artisan l5-swagger:generate`).
