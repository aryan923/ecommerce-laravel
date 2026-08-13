# E-Commerce Backend — Development Modules Roadmap

**Project:** E-Commerce Backend & Admin Panel  
**Tech Stack:** Laravel 12.x / PHP 8.4 / MySQL 8.0 / Laravel Sanctum  
**Architecture:** REST API + Admin Panel  
**Reference Documents:**
- `Requirements/srs_apis.md` — Backend & API Specification  
- `Requirements/admin_panel.md` — Admin Panel Functional Specification  
- `instruction.md` — Development Workflow Standard  

---

> [!IMPORTANT]  
> Each module listed below must follow the **mandatory workflow** defined in `instruction.md`:  
> `Spec → Plan → Test Cases → Regression → Implementation → Validation → Completion Report`  
> Never skip stages or generate code before documentation is finalized and approved.

---

## Development Module Index

| # | Module | Layer | Priority | Depends On |
|---|---|---|---|---|
| 01 | Foundation & Infrastructure | Backend | Critical | — |
| 02 | User Authentication (Customer) | Backend API | Critical | 01 |
| 03 | Admin Authentication & RBAC | Backend API | Critical | 01 |
| 03.5 | Admin CRUD APIs for RBAC | Admin API | Critical | 03 |
| 04 | Categories & Brands | Backend API | High | 01 |
| 05 | Attributes & Attribute Values | Backend API | High | 01 |
| 06 | Product Catalog | Backend API | High | 04, 05 |
| 07 | Product Variants | Backend API | High | 06 |
| 08 | Product Media Management | Backend API | High | 06 |
| 09 | Inventory Management | Backend API | High | 07 |
| 10 | Customer Profile & Addresses | Backend API | High | 02 |
| 11 | Wishlist | Backend API | Medium | 02, 06 |
| 12 | Shopping Cart | Backend API | Critical | 02, 06, 07, 09 |
| 13 | Coupons & Discounts | Backend API | High | 06 |
| 14 | Tax / GST Engine | Backend API | High | 06 |
| 15 | Shipping Module | Backend API | High | — |
| 16 | Checkout & Order Creation | Backend API | Critical | 12, 13, 14, 15 |
| 17 | Payment Module | Backend API | Critical | 16 |
| 18 | Order Management (Customer) | Backend API | High | 16, 17 |
| 19 | Returns & Refunds | Backend API | High | 18, 17 |
| 20 | Product Reviews | Backend API | Medium | 18 |
| 21 | Notifications System | Backend API | High | 02, 16, 17, 19 |
| 22 | Admin Dashboard | Admin API | High | 03 |
| 23 | Admin — Product Management | Admin API | High | 03, 06, 07, 08 |
| 24 | Admin — Category & Brand Mgmt | Admin API | High | 03, 04 |
| 25 | Admin — Inventory Admin | Admin API | High | 03, 09 |
| 26 | Admin — Customer Management | Admin API | High | 03, 10 |
| 27 | Admin — Order Management | Admin API | High | 03, 16, 17 |
| 28 | Admin — Return & Refund Mgmt | Admin API | High | 03, 19 |
| 29 | Admin — Coupon Management | Admin API | High | 03, 13 |
| 30 | Admin — Shipping Management | Admin API | High | 03, 15 |
| 31 | Admin — Tax/GST Management | Admin API | High | 03, 14 |
| 32 | Admin — Review Moderation | Admin API | Medium | 03, 20 |
| 33 | Admin — Notification Templates | Admin API | Medium | 03, 21 |
| 34 | Admin — Reports & Exports | Admin API | Medium | 22–32 |
| 35 | Admin — CMS / Banners / Pages | Admin API | Low | 03 |
| 36 | Admin — Media Library | Admin API | Medium | 03 |
| 37 | Admin — Store Settings | Admin API | High | 03 |
| 38 | Admin — Staff & Roles & Permissions | Admin API | High | 03 |
| 39 | Admin — Audit Logs | Admin API | Medium | 03, 38 |
| 40 | Background Jobs & Queues | Backend | High | All |

---

## MODULE 01 — Foundation & Infrastructure

**Layer:** Backend Core  
**Priority:** Critical — Must be built first  
**SRS References:** §82, §86–§99

### What This Module Covers

- `App\Traits\ApiResponseTrait` — Standardized JSON response structure used by ALL controllers
- Global exception handling (`app/Exceptions/Handler.php`)
- Base API controller
- API versioning structure (`/api/v1/`)
- Laravel Sanctum configuration for customer and admin token guards
- Database migrations execution order plan
- Environment configuration review

### Key Deliverables

- `app/Traits/ApiResponseTrait.php`
- `app/Http/Controllers/Api/V1/BaseController.php`
- Sanctum guards configured in `config/auth.php`
- Sanctum stateful configuration for admin SPA
- `config/cors.php` tuned for API consumers
- HTTP status code standards documented

### API Standards Established

```json
{
    "success": true,
    "message": "Operation message",
    "data": {},
    "errors": null
}
```

### Notes

- No endpoints in this module — all infrastructure only.
- All subsequent modules depend on this.

---

## MODULE 02 — User Authentication (Customer)

**Layer:** Backend API  
**Priority:** Critical  
**SRS References:** §7.1–§7.7, §86–§88  
**Spec File (existing):** `specifications/feature.authentication.spec.md`  
**Plan File (existing):** `plans/plan.authentication.md`

### What This Module Covers

- Customer registration (`POST /api/v1/auth/register`)
- Login with email or mobile (`POST /api/v1/auth/login`)
- Get authenticated user (`GET /api/v1/auth/me`)
- Logout / revoke token (`POST /api/v1/auth/logout`)
- Forgot password (`POST /api/v1/auth/forgot-password`)
- Reset password via OTP (`POST /api/v1/auth/reset-password`)
- Email verification (`POST /api/v1/auth/verify-email`)

### Key Database Tables

- `users` — Extended with `first_name`, `last_name`, `mobile`, `status`, `role`, `terms_accepted`
- `otps` — OTP codes with expiry, attempt limit, type

### Key Files

- `app/Models/User.php`
- `app/Models/Otp.php`
- `app/Services/AuthService.php`
- `app/Http/Controllers/Api/V1/AuthController.php`
- `app/Http/Requests/Auth/RegisterRequest.php`
- `app/Http/Requests/Auth/LoginRequest.php`
- `app/Http/Requests/Auth/ForgotPasswordRequest.php`
- `app/Http/Requests/Auth/ResetPasswordRequest.php`
- `routes/api.php` (auth routes)
- `tests/Feature/AuthTest.php`

---

## MODULE 03 — Admin Authentication & RBAC

**Layer:** Backend API  
**Priority:** Critical  
**SRS References:** §83–§85, §86, admin_panel.md §48–§50  
**Spec File:** `specifications/feature.admin-auth.spec.md`  
**Plan File:** `plans/plan.admin-auth.md`

### What This Module Covers

- Separate admin authentication (email + password) with dedicated Sanctum guard `admin`
- Admin login (`POST /api/v1/admin/auth/login`)
- Admin logout (`POST /api/v1/admin/auth/logout`)
- Admin profile (`GET /api/v1/admin/auth/me`)
- Role-Based Access Control (RBAC) — Roles, Permissions, role-permission pivot
- Role guard middleware (`CheckAdminRole`, `CheckPermission`)
- Policies or Gates for permission-level enforcement

### Key Database Tables

- `admin_users` — Separate from customer `users` table
- `roles` — Configurable roles (`super_admin`, `store_manager`, `order_manager`, etc.)
- `permissions` — Module-level actions (`products.view`, `orders.cancel`, etc.)
- `role_permissions` — Pivot table
- `admin_user_roles` — Pivot table

### Key Files

- `app/Models/AdminUser.php`
- `app/Models/Role.php`
- `app/Models/Permission.php`
- `app/Services/AdminAuthService.php`
- `app/Http/Controllers/Api/V1/Admin/AuthController.php`
- `app/Http/Middleware/CheckAdminPermission.php`
- Seeders for default roles and permissions

---

## MODULE 03.5 — Admin CRUD APIs for RBAC

**Layer:** Admin API  
**Priority:** Critical  
**SRS References:** §83, §84, §85, admin_panel.md §34–§36  
**Spec File:** `specifications/feature.rbac-crud.spec.md`  
**Plan File:** `plans/plan.rbac-crud.md`  

### What This Module Covers

- Admin Staff Users CRUD (`/api/v1/admin/users`) with pagination, search, role assignment, and status toggle
- Role Management CRUD (`/api/v1/admin/roles`) with permissions association and system role protection
- Permissions List API (`/api/v1/admin/permissions`) grouped by module
- Self-deletion prevention for active Super Admin user
- System roles deletion guard (`is_system=true`)

---
## MODULE 04 — Categories & Brands

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §14, §15, srs_apis.md §68, admin_panel.md §7–§8  
**Spec File:** `specifications/feature.categories-brands.spec.md`  
**Plan File:** `plans/plan.categories-brands.md`

### What This Module Covers

- Unlimited-depth category hierarchy
- Category CRUD (`/api/v1/admin/categories`)
- Public category list/tree (`/api/v1/categories`)
- Brand CRUD (`/api/v1/admin/brands`)
- Public brand list (`/api/v1/brands`)
- Image upload support
- SEO fields per category/brand
- Slug auto-generation

### Key Database Tables

- `categories` — `id`, `parent_id`, `name`, `slug`, `description`, `image`, `banner`, `status`, `sort_order`, `seo_*`
- `brands` — `id`, `name`, `slug`, `logo`, `description`, `status`, `seo_*`

### Key Files

- `app/Models/Category.php` (recursive relationship)
- `app/Models/Brand.php`
- `app/Http/Controllers/Api/V1/Admin/CategoryController.php`
- `app/Http/Controllers/Api/V1/Admin/BrandController.php`
- `app/Http/Controllers/Api/V1/CategoryController.php` (public)
- `app/Http/Controllers/Api/V1/BrandController.php` (public)

---

## MODULE 05 — Attributes & Attribute Values

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §13, admin_panel.md §9  
**Spec File:** `specifications/feature.attributes.spec.md`  
**Plan File:** `plans/plan.attributes.md`

### What This Module Covers

- Create and manage product attributes (`Size`, `Color`, `RAM`, `Storage`)
- Manage attribute values per attribute (`Color → Red, Blue, Black`)
- Admin CRUD for attributes and values
- Public attribute listing for use in product filters

### Key Database Tables

- `attributes` — `id`, `name`, `type`, `status`
- `attribute_values` — `id`, `attribute_id`, `value`, `sort_order`

---

## MODULE 06 — Product Catalog

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §10–§11, §17–§19, §67–§71, admin_panel.md §5  
**Spec File:** `specifications/feature.products.spec.md`  
**Plan File:** `plans/plan.products.md`

### What This Module Covers

- Full product CRUD for admin
- Support for Simple, Variable, Digital product types
- Product fields: name, slug, SKU, description, brand, category, status, type, SEO, dimensions, digital product related configuration
- Support for product level tax configuration
- Product status: Draft, Active, Inactive, Archived
- Public product listing with filtering, sorting, pagination, search
- Product detail page API

### Key Database Tables

- `products` — All product fields, SEO fields, flags
- `product_categories` — Pivot

### Key Files

- `app/Models/Product.php`
- `app/Services/ProductService.php`
- `app/Http/Controllers/Api/V1/Admin/ProductController.php`
- `app/Http/Controllers/Api/V1/ProductController.php` (public)

---

## MODULE 07 — Product Variants

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §12, §13  
**Spec File:** `specifications/feature.product-variants.spec.md`  
**Plan File:** `plans/plan.product-variants.md`

### What This Module Covers

- Variant generation from attribute combinations
- Per-variant: SKU, barcode, price, sale price, cost, weight, dimensions, stock, image, status
- Variant attribute assignment

### Key Database Tables

- `product_variants` — `id`, `product_id`, `sku`, `barcode`, `price`, `sale_price`, `cost_price`, `stock_qty`, `status`
- `product_attribute_values` — Pivot (`product_variant_id`, `attribute_value_id`)

---

## MODULE 08 — Product Media Management

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §16, §71, admin_panel.md §31  
**Spec File:** `specifications/feature.media.spec.md`  
**Plan File:** `plans/plan.media.md`

### What This Module Covers

- Upload images for products, categories, brands, banners
- S3-compatible storage (configurable: local/S3)
- MIME type, extension, size, dimension validation
- Image sort order and type (main, gallery, thumbnail)
- Media library (centralized) admin API

### Key Database Tables

- `media` — `id`, `model_type`, `model_id`, `file_name`, `url`, `type`, `alt`, `sort_order`, `size`, `mime_type`

---

## MODULE 09 — Inventory Management

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §35–§37, admin_panel.md §10–§11  
**Spec File:** `specifications/feature.inventory.spec.md`  
**Plan File:** `plans/plan.inventory.md`

### What This Module Covers

- Per-variant/SKU inventory tracking
- Stock types: Available, Reserved, Committed, Damaged, Returned
- Atomic stock reservation on order placement (prevent overselling)
- Inventory transaction log for every stock movement
- Low stock threshold alert
- Stock adjustment (add/deduct/adjust) by admin
- Inventory history API

### Key Database Tables

- `inventory` — `id`, `product_variant_id`, `sku`, `available_qty`, `reserved_qty`, `damaged_qty`
- `inventory_transactions` — Full audit trail per movement

---

## MODULE 10 — Customer Profile & Addresses

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §8.1–§8.2, §9  
**Spec File:** `specifications/feature.customer-profile.spec.md`  
**Plan File:** `plans/plan.customer-profile.md`

### What This Module Covers

- View and update customer profile (`GET/PUT /api/v1/customer/profile`)
- Change password (`POST /api/v1/customer/change-password`)
- Multiple address management (Home, Office, Other)
- Default billing/shipping address assignment
- Address CRUD (`/api/v1/customer/addresses`)

### Key Database Tables

- Additional `users` columns (profile already extended in Module 02)
- `addresses` — `id`, `user_id`, `name`, `mobile`, `line_1`, `line_2`, `landmark`, `city`, `state`, `country`, `postal_code`, `type`, `is_default_billing`, `is_default_shipping`

---

## MODULE 11 — Wishlist

**Layer:** Backend API  
**Priority:** Medium  
**SRS References:** §20  
**Spec File:** `specifications/feature.wishlist.spec.md`  
**Plan File:** `plans/plan.wishlist.md`

### What This Module Covers

- Add product/variant to wishlist (`POST /api/v1/wishlist`)
- View wishlist (`GET /api/v1/wishlist`)
- Remove from wishlist (`DELETE /api/v1/wishlist/{product}`)
- Move item from wishlist to cart

### Key Database Tables

- `wishlists` — `id`, `user_id`
- `wishlist_items` — `id`, `wishlist_id`, `product_id`, `variant_id`

---

## MODULE 12 — Shopping Cart

**Layer:** Backend API  
**Priority:** Critical  
**SRS References:** §21–§23, §75–§76  
**Spec File:** `specifications/feature.cart.spec.md`  
**Plan File:** `plans/plan.cart.md`

### What This Module Covers

- Guest cart (session-based) and customer cart (authenticated)
- Add / update / remove cart items
- Server-side price recalculation (never trust frontend prices)
- Real-time stock validation
- Coupon application to cart
- Shipping estimate in cart
- Tax estimate in cart
- Guest cart merging when guest logs in
- Cart validation before checkout

### Key Database Tables

- `carts` — `id`, `user_id`, `session_id`, `currency`, `subtotal`, `discount`, `tax`, `shipping`, `grand_total`, `coupon_id`
- `cart_items` — `id`, `cart_id`, `product_id`, `variant_id`, `quantity`, `unit_price`, `discount`, `tax`, `total`

---

## MODULE 13 — Coupons & Discounts

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §38–§40, admin_panel.md §19–§20  
**Spec File:** `specifications/feature.coupons.spec.md`  
**Plan File:** `plans/plan.coupons.md`

### What This Module Covers

- Coupon types: Percentage, Fixed Amount, Free Shipping
- Coupon rules: min order value, product/category/customer restrictions, date range, usage limits
- Coupon validation and application to cart
- Coupon usage tracking per order and per customer
- Admin CRUD for coupons

### Key Database Tables

- `coupons` — All coupon fields
- `coupon_usages` — Tracks per-user, per-order usage
- `coupon_products` / `coupon_categories` — Restriction pivots

---

## MODULE 14 — Tax / GST Engine

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §41–§43, admin_panel.md §27  
**Spec File:** `specifications/feature.tax.spec.md`  
**Plan File:** `plans/plan.tax.md`

### What This Module Covers

- Tax class management (e.g., Standard GST 18%, Zero-rated)
- Per-product tax class assignment
- GST logic: CGST + SGST (intra-state) / IGST (inter-state)
- Tax-inclusive and tax-exclusive pricing mode
- Tax calculation engine consumed by cart, checkout, and order modules

### Key Database Tables

- `tax_classes` — `id`, `name`, `description`
- `tax_rates` — `id`, `tax_class_id`, `name`, `rate`, `type` (`cgst/sgst/igst`), `is_inclusive`

---

## MODULE 15 — Shipping Module

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §44–§48, admin_panel.md §25–§26  
**Spec File:** `specifications/feature.shipping.spec.md`  
**Plan File:** `plans/plan.shipping.md`

### What This Module Covers

- Shipping zones (Local, State, National, Remote)
- Shipping methods (Standard, Express, Same Day, Pickup)
- Shipping rates (flat rate, weight-based, order-value-based, free threshold)
- Shipping calculation engine used by cart and checkout
- Shipment record creation (AWB, courier, tracking)
- Optional shipping provider API abstraction (Shiprocket/Delhivery)

### Key Database Tables

- `shipping_zones` — `id`, `name`, `countries`, `states`, `postal_codes`
- `shipping_methods` — `id`, `name`, `type`, `estimated_days`, `weight_limit`
- `shipping_rates` — `id`, `zone_id`, `method_id`, `rate_type`, `rate_value`, `min_order`, `max_order`
- `shipments` — `id`, `order_id`, `provider`, `awb`, `tracking_number`, `status`, dates
- `shipment_tracking` — Tracking event log

---

## MODULE 16 — Checkout & Order Creation

**Layer:** Backend API  
**Priority:** Critical  
**SRS References:** §24–§29, §77–§78, §93–§94  
**Spec File:** `specifications/feature.checkout.spec.md`  
**Plan File:** `plans/plan.checkout.md`

### What This Module Covers

- Checkout flow: Cart → Address → Shipping → Coupon → Tax → Payment → Order
- Transactional order creation (DB transaction)
- Order number generation (`ORD-YYYYMMDD-{id}`)
- Order item snapshot (product name, SKU, price at time of purchase)
- Stock reservation during order placement
- Atomic inventory locking (prevent overselling)
- Payment record creation
- Idempotency key support for duplicate request prevention

### Key Database Tables

- `orders` — `id`, `order_number`, `user_id`, `status`, `subtotal`, `discount`, `tax`, `shipping`, `grand_total`, `currency`, `notes`
- `order_items` — Item snapshot fields (name, sku, price, qty, discount, tax, total)
- `order_addresses` — Billing and shipping address snapshot
- `order_status_histories` — Full status timeline log

---

## MODULE 17 — Payment Module

**Layer:** Backend API  
**Priority:** Critical  
**SRS References:** §30–§34, §95  
**Spec File:** `specifications/feature.payment.spec.md`  
**Plan File:** `plans/plan.payment.md`

### What This Module Covers

- Gateway-independent PaymentService abstraction
- Supported gateways: Razorpay, Stripe, COD (configurable)
- Payment initiation and order linking
- Payment verification and status update
- Webhook handler (`POST /api/v1/webhooks/payment/{gateway}`)
- Idempotent webhook processing (no duplicate transactions)
- COD configuration (fee, max value, zone restriction)
- Payment statuses: Initiated, Pending, Authorized, Captured, Failed, Refunded

### Key Database Tables

- `payments` — `id`, `order_id`, `gateway`, `gateway_txn_id`, `amount`, `currency`, `status`, `method`, `gateway_response`, `paid_at`
- `payment_webhooks` — Provider, event ID, payload, processing status, attempts

---

## MODULE 18 — Order Management (Customer)

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §27, §49  
**Spec File:** `specifications/feature.customer-orders.spec.md`  
**Plan File:** `plans/plan.customer-orders.md`

### What This Module Covers

- View order list (`GET /api/v1/orders`)
- View order details (`GET /api/v1/orders/{order}`)
- Order tracking timeline
- Request order cancellation (where eligible based on status)
- Order status transition rules enforcement

---

## MODULE 19 — Returns & Refunds

**Layer:** Backend API  
**Priority:** High  
**SRS References:** §50–§54, admin_panel.md §21–§22  
**Spec File:** `specifications/feature.returns-refunds.spec.md`  
**Plan File:** `plans/plan.returns-refunds.md`

### What This Module Covers

- Customer return request submission
- Return eligibility validation (return window, product category)
- Return statuses: Requested → Approved → Pickup Scheduled → Received → Quality Check → Refunded
- Full and partial refund processing
- Refund via original payment gateway
- Refund via manual/other accounts (admin)
- Stock restocking on approved return
- Admin return review and action workflow

### Key Database Tables

- `returns` — `id`, `order_id`, `user_id`, `status`, `reason`, `description`, `images`
- `return_items` — `id`, `return_id`, `order_item_id`, `quantity`
- `refunds` — `id`, `order_id`, `payment_id`, `amount`, `reason`, `gateway_refund_id`, `status`, `created_by`

---

## MODULE 20 — Product Reviews

**Layer:** Backend API  
**Priority:** Medium  
**SRS References:** §55–§56, admin_panel.md §28  
**Spec File:** `specifications/feature.reviews.spec.md`  
**Plan File:** `plans/plan.reviews.md`

### What This Module Covers

- Customer review submission (post-purchase only)
- Star rating (1–5), title, review text, images
- Review moderation status: Pending, Approved, Rejected, Hidden
- Product average rating calculation
- Admin review moderation (approve, reject, hide, delete)
- Public review listing on product pages

### Key Database Tables

- `reviews` — `id`, `product_id`, `user_id`, `order_id`, `rating`, `title`, `review`, `status`, images JSON

---

## MODULE 21 — Notifications System

**Layer:** Backend  
**Priority:** High  
**SRS References:** §57–§60, admin_panel.md §38–§39  
**Spec File:** `specifications/feature.notifications.spec.md`  
**Plan File:** `plans/plan.notifications.md`

### What This Module Covers

- Notification channels: Email, SMS, Push, In-App
- Notification events: Registration, OTP, Order Placed, Payment Success/Fail, Order Shipped, Delivered, Cancelled, Return Approved, Refund Completed, Low Stock Alert
- Queue-based notification dispatch (async, non-blocking)
- Configurable notification templates with variable support (`{{customer_name}}`, `{{order_number}}`)
- Notification log (delivery status per channel)

### Key Database Tables

- `notification_templates` — `id`, `event`, `channel`, `subject`, `body`, `variables`, `status`
- `notification_logs` — `id`, `user_id`, `channel`, `template_id`, `status`, `sent_at`, `failure_reason`

---

> [!NOTE]
> **Admin Panel Frontend Requirement (Modules 22+):**
> From Module 22 onwards, for every module containing Admin APIs, build both the backend API implementation AND the corresponding React Admin UI view for that module (one module at a time).
> Each Admin Module shall deliver full end-to-end capabilities, pairing the Laravel backend API with its dedicated React Admin UI screen, forms, data tables, and actions in the React Admin SPA.

## MODULE 22 — Admin Dashboard

**Layer:** Admin API  
**Priority:** High  
**SRS References:** §61, admin_panel.md §3  
**Spec File:** `specifications/feature.admin-dashboard.spec.md`  
**Plan File:** `plans/plan.admin-dashboard.md`

### What This Module Covers

- Summary KPIs: Total Revenue, Today Revenue, Total Orders, Today Orders, Pending/Completed/Cancelled Orders, Total Customers, New Customers, Total Products, Low Stock Products, Pending Returns/Refunds
- Sales chart data (daily/weekly/monthly/yearly with date filters)
- Order status breakdown
- Top products (units sold, revenue)
- Top categories
- Recent orders list (clickable)
- Low stock alert panel

### Key Endpoint

- `GET /api/v1/admin/dashboard`

---

## MODULE 23 — Admin Product Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** §68–§70, admin_panel.md §5–§6  
**Spec File:** `specifications/feature.admin-products.spec.md`  
**Plan File:** `plans/plan.admin-products.md`

### What This Module Covers

- Full admin product CRUD with search, filter (category, brand, status, type), sort
- Product variant management (add, edit, delete variants)
- Bulk operations: activate, deactivate, archive, update category, update price, update stock
- Product duplication
- Product status management (Draft → Active → Inactive → Archived)
- Optional: CSV/XLSX product import (async queue-based)

---

## MODULE 24 — Admin Category & Brand Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §7–§8  
**Spec File:** `specifications/feature.admin-catalog.spec.md`  
**Plan File:** `plans/plan.admin-catalog.md`

### What This Module Covers

- Category CRUD with hierarchy, image, banner, SEO, sort order
- Brand CRUD with logo upload and SEO
- Attribute and attribute value CRUD (admin panel §9)

---

## MODULE 25 — Admin Inventory Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §10–§11  
**Spec File:** `specifications/feature.admin-inventory.spec.md`  
**Plan File:** `plans/plan.admin-inventory.md`

### What This Module Covers

- Inventory dashboard: Total SKUs, stock units, low-stock SKUs, out-of-stock, reserved stock, inventory value
- Per-SKU stock view, add, deduct, adjust (with reason/remarks)
- Full inventory transaction history
- Low stock list
- Inventory export (CSV/XLSX)

---

## MODULE 26 — Admin Customer Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §16–§18  
**Spec File:** `specifications/feature.admin-customers.spec.md`  
**Plan File:** `plans/plan.admin-customers.md`

### What This Module Covers

- Customer listing with search, filter (status, date)
- Customer profile view: info, stats (total orders, spent, avg order value, last order, registration date)
- Customer detail tabs: Orders, Addresses, Reviews, Returns, Refunds
- Customer status management (activate/deactivate/suspend)
- Admin internal notes on customer

---

## MODULE 27 — Admin Order Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §12–§15  
**Spec File:** `specifications/feature.admin-orders.spec.md`  
**Plan File:** `plans/plan.admin-orders.md`

### What This Module Covers

- Order listing with full filters (status, payment, customer, date, method, amount range)
- Order detail page: customer info, items, pricing, payment, addresses, shipment, timeline
- Admin order actions: Confirm, Processing, Packed, Create Shipment, Add Tracking, Shipped, Delivered, Cancel, Initiate Refund
- Internal notes on order
- All order status changes audit-logged

---

## MODULE 28 — Admin Return & Refund Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §21–§22  
**Spec File:** `specifications/feature.admin-returns.spec.md`  
**Plan File:** `plans/plan.admin-returns.md`

### What This Module Covers

- Return request listing and detail view
- Admin actions: Approve, Reject, Request Information, Schedule Pickup, Mark Received, Approve Refund
- Refund listing: process refund, retry failed refund, view gateway response, history
- Financial records are never physically deleted

---

## MODULE 29 — Admin Coupon Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §19–§20  
**Spec File:** `specifications/feature.admin-coupons.spec.md`  
**Plan File:** `plans/plan.admin-coupons.md`

### What This Module Covers

- Coupon CRUD with all rule configuration
- Coupon activate/deactivate/archive
- Coupon usage report: total uses, total discount, orders, revenue, remaining usage

---

## MODULE 30 — Admin Shipping Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §25–§26  
**Spec File:** `specifications/feature.admin-shipping.spec.md`  
**Plan File:** `plans/plan.admin-shipping.md`

### What This Module Covers

- Shipping zone management (countries, states, postal codes)
- Shipping method management (Standard, Express, Same Day, Pickup)
- Shipping rate management (flat, weight-based, order-value-based, free threshold)
- Shipment creation per order, AWB assignment, tracking
- Shipment status sync (manual / provider API)

---

## MODULE 31 — Admin Tax / GST Management

**Layer:** Admin API  
**Priority:** High  
**SRS References:** admin_panel.md §27, §43  
**Spec File:** `specifications/feature.admin-tax.spec.md`  
**Plan File:** `plans/plan.admin-tax.md`

### What This Module Covers

- Tax class management
- GST rate management (CGST, SGST, IGST, UTGST)
- Tax-inclusive vs tax-exclusive pricing toggle
- Default tax class configuration
- All tax configuration changes are audit-logged and permission-restricted

---

## MODULE 32 — Admin Review Moderation

**Layer:** Admin API  
**Priority:** Medium  
**SRS References:** admin_panel.md §28  
**Spec File:** `specifications/feature.admin-reviews.spec.md`  
**Plan File:** `plans/plan.admin-reviews.md`

### What This Module Covers

- Review listing with filters (product, rating, status, date)
- Admin actions: Approve, Reject, Hide, Delete
- Approved reviews visible publicly on product pages

---

## MODULE 33 — Admin Notification Templates

**Layer:** Admin API  
**Priority:** Medium  
**SRS References:** admin_panel.md §38–§39  
**Spec File:** `specifications/feature.admin-notifications.spec.md`  
**Plan File:** `plans/plan.admin-notifications.md`

### What This Module Covers

- Manage email, SMS, push notification templates per event
- Template variable support (`{{customer_name}}`, `{{order_number}}`, etc.)
- Notification delivery log viewer (recipient, channel, status, timestamps)
- Template activate/deactivate

---

## MODULE 34 — Admin Reports & Exports

**Layer:** Admin API  
**Priority:** Medium  
**SRS References:** §62–§65, admin_panel.md §32–§33  
**Spec File:** `specifications/feature.admin-reports.spec.md`  
**Plan File:** `plans/plan.admin-reports.md`

### What This Module Covers

- Sales Report: Gross sales, discounts, tax, shipping, refunds, net sales (with date/product/category/customer filters)
- Order Report: Totals by status
- Product Report: Units sold, revenue, returns, stock, rating
- Customer Report: New, returning, revenue, average order value
- Inventory Report: Stock, value, low stock, out of stock, movements
- Tax Report: Taxable amount, CGST, SGST, IGST, total tax
- CSV/XLSX export for all reports (async queue-based for large exports)
- Admin notification when export is ready

---

## MODULE 35 — Admin CMS / Banners / Pages

**Layer:** Admin API  
**Priority:** Low  
**SRS References:** §66, admin_panel.md §29–§30  
**Spec File:** `specifications/feature.admin-cms.spec.md`  
**Plan File:** `plans/plan.admin-cms.md`

### What This Module Covers

- Banner management: title, image (desktop/mobile), link, button text, date range, sort order, status
- CMS page management: About Us, Privacy Policy, Terms, Shipping Policy, Return Policy, FAQs
- Page fields: title, slug, content, SEO title, SEO description, status

### Key Database Tables

- `banners` — All banner fields
- `pages` — All CMS page fields

---

## MODULE 36 — Admin Media Library

**Layer:** Admin API  
**Priority:** Medium  
**SRS References:** admin_panel.md §31  
**Spec File:** `specifications/feature.admin-media.spec.md`  
**Plan File:** `plans/plan.admin-media.md`

### What This Module Covers

- Centralized media upload interface
- List, search, preview, delete (where unused), copy URL
- Used by products, categories, brands, banners, CMS pages
- File validation: MIME type, extension, size, dimensions

---

## MODULE 37 — Admin Store Settings

**Layer:** Admin API  
**Priority:** High  
**SRS References:** §72–§73, admin_panel.md §40–§44  
**Spec File:** `specifications/feature.admin-settings.spec.md`  
**Plan File:** `plans/plan.admin-settings.md`

### What This Module Covers

- General settings: store name, logo, favicon, email, phone, address
- Localization: currency, timezone, date format
- Commerce settings: guest checkout, inventory mode, reviews, minimum order
- Payment gateway settings: enable/disable, API credentials (encrypted), test/live mode
- Shipping provider settings
- Tax settings (delegated to Module 31)
- Notification/email/SMS provider configuration
- SEO defaults

### Key Database Tables

- `settings` — Key-value store for all configurable settings

---

## MODULE 38 — Admin Staff, Roles & Permissions

**Layer:** Admin API  
**Priority:** High  
**SRS References:** §83–§84, admin_panel.md §34–§36  
**Spec File:** `specifications/feature.admin-staff.spec.md`  
**Plan File:** `plans/plan.admin-staff.md`

### What This Module Covers

- Admin user CRUD (Super Admin can manage all)
- Staff fields: name, email, mobile, role, status, last login
- Role management: create/edit/delete configurable roles
- Permission management: module-action based permissions
- Role-permission assignment
- Staff status management (activate/disable/reset access)
- All role/permission changes audit-logged

---

## MODULE 39 — Admin Audit Logs

**Layer:** Admin API  
**Priority:** Medium  
**SRS References:** §85, admin_panel.md §37, §54  
**Spec File:** `specifications/feature.admin-audit-logs.spec.md`  
**Plan File:** `plans/plan.admin-audit-logs.md`

### What This Module Covers

- Automatic audit log creation on: product price change, product delete/archive, inventory adjustment, order cancellation, refund, coupon create/update, tax config change, payment setting change, admin create, role/permission change, customer status change
- Audit log fields: actor, action, module, entity, entity ID, old values, new values, IP, user agent, timestamp
- Admin log viewer with filters: user, module, action, date range

### Key Database Tables

- `audit_logs` — Complete audit trail

---

## MODULE 40 — Background Jobs & Queues

**Layer:** Backend Infrastructure  
**Priority:** High  
**SRS References:** §59–§60, §96–§99  
**Spec File:** `specifications/feature.queues-jobs.spec.md`  
**Plan File:** `plans/plan.queues-jobs.md`

### What This Module Covers

- Laravel Queue configuration (Redis recommended)
- Jobs for: Email dispatch, SMS dispatch, Push notifications, Payment reconciliation, Shipping sync, Report generation, Product import, Stock alert emails, Export generation
- Failed job monitoring and retry
- Scheduled commands (Cron): Expire carts, Expire coupons, Stock alerts, Reconciliation, Cleanup, Abandoned cart recovery
- Queue worker management in production

---

## Development Order (Recommended Sequence)

```text
Phase 1 — Core Foundation
  01. Foundation & Infrastructure
  02. User Authentication (Customer)
  03. Admin Authentication & RBAC

Phase 2 — Product Catalog
  04. Categories & Brands
  05. Attributes & Attribute Values
  06. Product Catalog
  07. Product Variants
  08. Product Media Management
  09. Inventory Management

Phase 3 — Customer Commerce
  10. Customer Profile & Addresses
  11. Wishlist
  12. Shopping Cart
  13. Coupons & Discounts
  14. Tax / GST Engine
  15. Shipping Module
  16. Checkout & Order Creation
  17. Payment Module
  18. Order Management (Customer)
  19. Returns & Refunds
  20. Product Reviews

Phase 4 — Notifications & Background
  21. Notifications System
  40. Background Jobs & Queues

Phase 5 — Admin APIs
  22. Admin Dashboard
  23. Admin Product Management
  24. Admin Category & Brand Management
  25. Admin Inventory Management
  26. Admin Customer Management
  27. Admin Order Management
  28. Admin Return & Refund Management
  29. Admin Coupon Management
  30. Admin Shipping Management
  31. Admin Tax/GST Management
  32. Admin Review Moderation
  33. Admin Notification Templates
  34. Admin Reports & Exports
  35. Admin CMS / Banners / Pages
  36. Admin Media Library
  37. Admin Store Settings
  38. Admin Staff, Roles & Permissions
  39. Admin Audit Logs
```

---

## Per-Module Deliverables Checklist

For every module listed above, the following must be created before writing code:

- [ ] `specifications/feature.<module>.spec.md`
- [ ] `plans/plan.<module>.md`
- [ ] `plans/test-cases.<module>.md`
- [ ] `plans/regression.<module>.md`

And after implementation:

- [ ] All tests passing (`php artisan test`)
- [ ] Build passing (`php artisan optimize`)
- [ ] Completion report provided

---

*Last Updated: 2026-08-11*  
*Generated from: `Requirements/srs_apis.md` + `Requirements/admin_panel.md` + `instruction.md`*
