# Implementation Plan: Module 19 — Returns & Refunds

**Module Name:** Returns & Refunds  
**Module ID:** 19  
**Plan File:** `plans/plan.returns-refunds.md`  
**Specification File:** `specifications/feature.returns-refunds.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 19 (Returns & Refunds) to provide complete post-purchase return request management and financial refund processing. This includes database migrations for `returns`, `return_items`, and `refunds`; Eloquent models (`ReturnRequest`, `ReturnItem`, `Refund`); `ReturnService` for customer request validation, eligibility checking (7-day window, item limits), return number formatting (`RET-YYYYMMDD-{id}`), and admin milestone updates; `RefundService` for processing full/partial refunds, gateway integration, payment status sync (`refunded`/`partially_refunded`), and refund number formatting (`RFD-YYYYMMDD-{id}`); customer and admin controllers; OpenAPI annotations; and automated feature tests.

---

## 2. User Review Required

> [!NOTE]
> - Return requests require order status `delivered` within return window (default 7 days).
> - Public return numbers are formatted as `RET-YYYYMMDD-{id}` and refund numbers as `RFD-YYYYMMDD-{id}`.
> - Restocking returned items adds stock back into `inventories` via `InventoryService`.
> - Financial refund records (`refunds`) are immutably preserved and cannot be deleted.

---

## 3. Open Questions

*None at this time. SRS specifications (§50–§54) and Admin Panel specs (§21–§22) fully define return eligibility, milestone statuses, restocking rules, and refund processing.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000036_create_returns_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000036_create_returns_table.php) — Migration for `returns` table.
- **[NEW]** [`database/migrations/2026_08_11_000037_create_return_items_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000037_create_return_items_table.php) — Migration for `return_items` table.
- **[NEW]** [`database/migrations/2026_08_11_000038_create_refunds_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000038_create_refunds_table.php) — Migration for `refunds` table.

### Model Layer
- **[NEW]** [`app/Models/ReturnRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Models/ReturnRequest.php) — Eloquent model for returns.
- **[NEW]** [`app/Models/ReturnItem.php`](file:///d:/Projects/ecommerce_laravel/app/Models/ReturnItem.php) — Eloquent model for return line items.
- **[NEW]** [`app/Models/Refund.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Refund.php) — Eloquent model for financial refunds.
- **[MODIFY]** [`app/Models/Order.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Order.php) — Add `returns()` and `refunds()` relationships.

### Service Layer
- **[NEW]** [`app/Services/ReturnService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/ReturnService.php) — Customer return submission, 7-day eligibility check, status milestone updates, and inventory restocking via `InventoryService`.
- **[NEW]** [`app/Services/RefundService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/RefundService.php) — Refund calculation, gateway processing, payment status sync (`refunded`/`partially_refunded`), and audit logging.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Return/CreateReturnRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Return/CreateReturnRequest.php)
- **[NEW]** [`app/Http/Requests/Return/UpdateReturnStatusRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Return/UpdateReturnStatusRequest.php)
- **[NEW]** [`app/Http/Requests/Refund/ProcessRefundRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Refund/ProcessRefundRequest.php)

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/ReturnController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/ReturnController.php) — Customer return endpoints.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/ReturnAdminController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/ReturnAdminController.php) — Admin return review, status transitions, and restocking.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/RefundAdminController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/RefundAdminController.php) — Admin refund listing and processing.

### Routes & Testing
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Add `/v1/customer/returns`, `/v1/admin/returns`, and `/v1/admin/refunds`.
- **[NEW]** [`tests/Feature/ReturnRefundTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/ReturnRefundTest.php) — Comprehensive feature test suite.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000036_create_returns_table.php`
  - Path: `database/migrations/2026_08_11_000037_create_return_items_table.php`
  - Path: `database/migrations/2026_08_11_000038_create_refunds_table.php`
  - Description: Create migrations for `returns`, `return_items`, and `refunds`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models**
  - Path: `app/Models/ReturnRequest.php`
  - Path: `app/Models/ReturnItem.php`
  - Path: `app/Models/Refund.php`
  - Description: Implement models with fillables, casts, return/refund number generators, and relations.

- [x] **Task 3: Implement ReturnService & RefundService**
  - Path: `app/Services/ReturnService.php`
  - Path: `app/Services/RefundService.php`
  - Description: Implement return submission, eligibility check, restocking via `InventoryService`, and refund processing with payment status sync.

- [x] **Task 4: Implement Form Requests & Controllers**
  - Path: `app/Http/Requests/Return/CreateReturnRequest.php`
  - Path: `app/Http/Requests/Return/UpdateReturnStatusRequest.php`
  - Path: `app/Http/Requests/Refund/ProcessRefundRequest.php`
  - Path: `app/Http/Controllers/Api/V1/Customer/ReturnController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/ReturnAdminController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/RefundAdminController.php`
  - Description: Build customer and admin controllers with OpenAPI annotations.

- [x] **Task 5: Register API Routes**
  - Path: `routes/api.php`
  - Description: Add routes under `/api/v1/customer/returns`, `/api/v1/admin/returns`, and `/api/v1/admin/refunds`.

- [x] **Task 6: Generate Swagger Docs**
  - Command: `php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 7: Feature Testing**
  - Path: `tests/Feature/ReturnRefundTest.php`
  - Command: `php vendor/bin/phpunit tests/Feature/ReturnRefundTest.php`
  - Description: Verify return submission, window validation, admin status updates, restocking, and refund processing.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `php vendor/bin/phpunit tests/Feature/ReturnRefundTest.php`
2. Full Suite Test:
   `php vendor/bin/phpunit`

### Manual Verification
1. Verify customer can submit return for delivered order.
2. Verify admin can approve return, restock items, and process refund.
