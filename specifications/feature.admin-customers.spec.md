# Feature Specification: Module 26 — Admin Customer Management

**Module Name:** Admin Customer Management  
**Module ID:** 26  
**Specification File:** `specifications/feature.admin-customers.spec.md`  
**Plan File:** `plans/plan.admin-customers.md`  
**Version:** 1.0  
**Status:** In Progress  
**Base SRS References:** `Requirements/srs_apis.md`, `Requirements/admin_panel.md` (§16–§18), `Requirements/development_modules.md` (§Module 26)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Customer Management module empowers store administrators and customer support teams to manage customer profiles, monitor customer lifetime metrics (total spend, order count, average order value), inspect historical customer detail tabs (orders, shipping/billing addresses, product reviews, return requests, refunds), toggle account statuses (`active`, `inactive`, `suspended`), and log internal admin notes.

---

## 2. API Endpoints

### 2.1 Admin Customer APIs (`/api/v1/admin/customers/*`)
- `GET /api/v1/admin/customers/stats` — Executive overview metrics (`permission:customers.view`)
- `GET /api/v1/admin/customers` — Paginated list of registered customers with search and status filters (`permission:customers.view`)
- `GET /api/v1/admin/customers/{id}` — Full customer profile with lifetime statistics (`permission:customers.view`)
- `GET /api/v1/admin/customers/{id}/orders` — Customer order history tab (`permission:customers.view`)
- `GET /api/v1/admin/customers/{id}/addresses` — Customer address list tab (`permission:customers.view`)
- `GET /api/v1/admin/customers/{id}/reviews` — Customer product reviews tab (`permission:customers.view`)
- `GET /api/v1/admin/customers/{id}/returns` — Customer return requests tab (`permission:customers.view`)
- `GET /api/v1/admin/customers/{id}/refunds` — Customer refund history tab (`permission:customers.view`)
- `PATCH /api/v1/admin/customers/{id}/status` — Activate / Deactivate / Suspend customer account (`permission:customers.update`)
- `PATCH /api/v1/admin/customers/{id}/notes` — Update internal admin notes for customer (`permission:customers.update`)

---

## 3. Key Database Changes

- Add `admin_notes` (TEXT, nullable) column to `users` table.

---

## 4. Acceptance Criteria

- [ ] All 10 Customer Management API endpoints implemented in `CustomerController.php` with OpenAPI `@OA\*` annotations.
- [ ] `CustomerService.php` calculates exact customer lifetime value (total orders, total spend, AOV, last order date).
- [ ] Admin can filter customer catalog by search term (name, email, mobile) and account status (`active`, `inactive`, `suspended`).
- [ ] Customer Detail view provides active tabs for Orders, Addresses, Reviews, Returns, Refunds, and Admin Internal Notes.
- [ ] React SPA interface built at `/admin/customers` with responsive layouts.
- [ ] Production Vite assets build cleanly (`npm run build`).
- [ ] Automated feature test suite `AdminCustomerManagementTest.php` passes 100% green.
