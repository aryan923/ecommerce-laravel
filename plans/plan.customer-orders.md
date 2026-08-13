# Implementation Plan: Module 18 — Order Management (Customer)

**Module Name:** Order Management (Customer)  
**Module ID:** 18  
**Plan File:** `plans/plan.customer-orders.md`  
**Specification File:** `specifications/feature.customer-orders.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 18 (Order Management - Customer) to provide authenticated customers with complete order self-service capabilities. This includes `CustomerOrderService` for fetching customer order lists, detailed order lookup, calculating progress tracking timelines, and enforcing cancellation business rules with atomic inventory release (`InventoryService::releaseStock()`); `CancelOrderRequest` validation; `CustomerOrderController` with OpenAPI annotations; route registration under `/api/v1/customer/orders`; and automated feature test coverage.

---

## 2. User Review Required

> [!NOTE]
> - Order listing and detail endpoints are strictly scoped to the authenticated customer (`user_id`).
> - Cancellation eligibility rules (SRS §54): Customer can cancel orders in `pending_payment`, `paid`, `confirmed`, or `processing` states. Orders in `packed`, `shipped`, `out_for_delivery`, or `delivered` state cannot be cancelled.
> - Cancelling an order automatically releases reserved stock via `InventoryService` and appends an audit event to `order_histories`.

---

## 3. Open Questions

*None at this time. SRS specifications (§27, §49, §54) fully define customer order listing, tracking timelines, and cancellation rules.*

---

## 4. Proposed Changes & Task Breakdown

### Business Logic & Service Layer
- **[NEW]** [`app/Services/CustomerOrderService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/CustomerOrderService.php) — Core business service for listing customer orders, detail fetching, calculating tracking timeline step index, and order cancellation with stock release.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Customer/CancelOrderRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Customer/CancelOrderRequest.php) — Request validation for order cancellation reason and comments.

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/CustomerOrderController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/CustomerOrderController.php) — Customer order list, detail, tracking timeline, and cancellation controller with OpenAPI 3.0 annotations.

### Routes Layer
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register routes under `/api/v1/customer/orders`.

### Documentation Layer
- **[MODIFY]** [`storage/api-docs/api-docs.json`](file:///d:/Projects/ecommerce_laravel/storage/api-docs/api-docs.json) — Regenerate via `php artisan l5-swagger:generate`.

### Test Layer
- **[NEW]** [`tests/Feature/CustomerOrderTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/CustomerOrderTest.php) — Feature test suite for customer order listing, detail fetching, tracking progress, eligible cancellation with stock release, and ineligible cancellation prevention.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Implement CustomerOrderService**
  - Path: `app/Services/CustomerOrderService.php`
  - Description: Implement `getCustomerOrders()`, `getOrderDetail()`, `getOrderTracking()`, and `cancelOrder()` with stock release via `InventoryService`.

- [x] **Task 2: Implement Form Request Class**
  - Path: `app/Http/Requests/Customer/CancelOrderRequest.php`
  - Description: Implement validation rules for cancellation `reason` and optional `comments`.

- [x] **Task 3: Implement CustomerOrderController with OpenAPI 3.0**
  - Path: `app/Http/Controllers/Api/V1/Customer/CustomerOrderController.php`
  - Description: Implement `index`, `show`, `tracking`, and `cancel` endpoints extending `BaseController` and using `ApiResponseTrait`. Include `@OA` annotations.

- [x] **Task 4: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register routes under `/api/v1/customer/orders` protected by `auth:sanctum`.

- [x] **Task 5: Generate Swagger Docs**
  - Command: `php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 6: Feature Testing**
  - Path: `tests/Feature/CustomerOrderTest.php`
  - Command: `php vendor/bin/phpunit tests/Feature/CustomerOrderTest.php`
  - Description: Verify customer order listing, detail viewing, tracking timeline steps, valid cancellation with stock release, and invalid cancellation rejection.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `php vendor/bin/phpunit tests/Feature/CustomerOrderTest.php`
2. Full Suite Test:
   `php vendor/bin/phpunit`

### Manual Verification
1. Verify `GET /api/v1/customer/orders` lists customer orders.
2. Verify `POST /api/v1/customer/orders/{order_number}/cancel` releases stock and transitions status to `cancelled`.
