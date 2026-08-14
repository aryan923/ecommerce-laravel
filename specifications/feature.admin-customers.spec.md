# Feature Specification: Module 26 — Admin Customer Management

**Module Name:** Admin Customer Management  
**Module ID:** 25  
**Specification File:** `specifications/feature.admin-customers.spec.md`  
**Plan File:** `plans/plan.admin-customers.md`  
**Test Cases File:** `plans/test-cases.admin-customers.md`  
**Regression File:** `plans/regression.admin-customers.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§10, §36), `Requirements/admin_panel.md` (§16–§18), `Requirements/development_modules.md` (§Module 26)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Customer Management module provides store administrators and support personnel with a centralized console to search, filter, view, edit, suspend, and analyze customer accounts and purchase histories.

Key Capabilities:
1. **Executive Customer Metrics**: Summary stats cards for Total Customers, Active Customers, Suspended Accounts, New Customers This Month, and Lifetime Customer Revenue.
2. **Advanced Customer Listing & Filters**: Paginated listing with multi-field search (Name, Email, Phone), status filtering (`active`, `suspended`), date range filtering (`registered_from`, `registered_to`), and sorting (`latest`, `total_spent`, `total_orders`, `name_asc`).
3. **Comprehensive Customer Profile View**: Profile overview with lifetime stats (Total Orders, Total Spent, Average Order Value, Last Order Date, Registration Date).
4. **Detailed History Tabs**: Dedicated sub-views/tabs for Customer Orders, Saved Addresses, Submitted Reviews, Returns & Refunds.
5. **Customer Status & Security Control**: Toggle account status (`active`, `suspended`), edit contact information, and trigger secure password reset emails.
6. **Internal Admin Notes**: Audit log for internal staff comments attached to customer profiles (invisible to customers).
7. **CSV Export**: Streamed CSV download of customer master data and spending metrics.
8. **React Admin SPA**: Single-Page Application view at `/admin/customers` and `/admin/customers/:id`.

---

## 2. Business Flow

### 2.1 Customer Discovery & Search Flow
1. Admin navigates to `/admin/customers` in Admin SPA.
2. React SPA fetches KPI metrics from `GET /api/v1/admin/customers/stats` and paginated customer list from `GET /api/v1/admin/customers`.
3. Admin inputs search text (e.g. `John Doe` or `john@example.com`) or filters by status (`suspended`).
4. System executes query with eager-loaded order aggregates (`withCount('orders')`, `withSum('orders', 'total_amount')`).
5. Data grid renders customer list with avatar initials, email, phone, status badge, order count, total spent, and action buttons.

### 2.2 Customer Profile Inspection & History Flow
1. Admin clicks a customer record or navigates to `/admin/customers/:id`.
2. System fetches profile metrics from `GET /api/v1/admin/customers/{id}`.
3. Admin switches between detail tabs:
   - **Orders Tab**: Queries `GET /api/v1/admin/customers/{id}/orders` for purchase history.
   - **Addresses Tab**: Queries `GET /api/v1/admin/customers/{id}/addresses` for shipping/billing addresses.
   - **Reviews Tab**: Queries `GET /api/v1/admin/customers/{id}/reviews` for product reviews.
   - **Returns Tab**: Queries `GET /api/v1/admin/customers/{id}/returns` for return requests.
   - **Notes Tab**: Queries `GET /api/v1/admin/customers/{id}/notes` for internal staff log.

### 2.3 Status Toggle & Customer Actions Flow
1. Admin clicks **Suspend Account** or **Reactivate Account**.
2. System calls `PATCH /api/v1/admin/customers/{id}/status` with `{ "status": "suspended" }`.
3. System updates customer account status and logs an internal audit event.
4. Admin clicks **Add Note** to log a customer support ticket reference or phone conversation.

---

## 3. Functional Requirements

- **FR-CUST-001**: System shall maintain customer profile records in `users` table (`role = customer`).
- **FR-CUST-002**: System shall provide executive stats API (`GET /api/v1/admin/customers/stats`) returning total customers, active count, suspended count, new customers this month, and total customer revenue.
- **FR-CUST-003**: System shall provide paginated listing API (`GET /api/v1/admin/customers`) supporting multi-field search (name, email, phone), status filter (`active`, `suspended`), date range filter (`registered_from`, `registered_to`), and sorting (`latest`, `total_spent`, `total_orders`, `name_asc`).
- **FR-CUST-004**: System shall compute lifetime customer aggregates: Total Orders, Total Spent, Average Order Value (AOV), Last Order Date, and Registration Date.
- **FR-CUST-005**: System shall provide single customer profile API (`GET /api/v1/admin/customers/{id}`).
- **FR-CUST-006**: System shall provide customer order history API (`GET /api/v1/admin/customers/{id}/orders`).
- **FR-CUST-007**: System shall provide customer address list API (`GET /api/v1/admin/customers/{id}/addresses`).
- **FR-CUST-008**: System shall provide customer review list API (`GET /api/v1/admin/customers/{id}/reviews`).
- **FR-CUST-009**: System shall provide customer return list API (`GET /api/v1/admin/customers/{id}/returns`).
- **FR-CUST-010**: System shall provide customer update API (`PUT /api/v1/admin/customers/{id}`) for editing name, email, and phone.
- **FR-CUST-011**: System shall provide status toggle API (`PATCH /api/v1/admin/customers/{id}/status`).
- **FR-CUST-012**: System shall provide internal admin notes API (`GET` and `POST /api/v1/admin/customers/{id}/notes`).
- **FR-CUST-013**: System shall provide secure password reset dispatch API (`POST /api/v1/admin/customers/{id}/reset-password`). Plaintext passwords MUST NEVER be accessible or exposed.
- **FR-CUST-014**: System shall provide CSV export streaming endpoint (`GET /api/v1/admin/customers/export`).
- **FR-CUST-015**: All Admin Customer APIs MUST be protected with `auth:sanctum` and permission middleware (`customers.view`, `customers.update`, `customers.delete`).
- **FR-CUST-016**: Every API endpoint in this module MUST include full OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`) referencing target server `http://localhost:8002`.

---

## 4. API Requirements & Route Specifications

### 4.1 Admin Customer Endpoints (`/api/v1/admin/customers/*`)

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/customers/stats` | Executive KPI metrics | `customers.view` |
| `GET` | `/api/v1/admin/customers` | Paginated listing with search & filters | `customers.view` |
| `GET` | `/api/v1/admin/customers/export` | Stream CSV export of customers | `customers.view` |
| `GET` | `/api/v1/admin/customers/{id}` | Single customer profile with aggregated stats | `customers.view` |
| `PUT` | `/api/v1/admin/customers/{id}` | Update customer basic info | `customers.update` |
| `PATCH` | `/api/v1/admin/customers/{id}/status` | Toggle customer status (`active`/`suspended`) | `customers.update` |
| `GET` | `/api/v1/admin/customers/{id}/orders` | Customer order history | `customers.view` |
| `GET` | `/api/v1/admin/customers/{id}/addresses` | Customer saved addresses | `customers.view` |
| `GET` | `/api/v1/admin/customers/{id}/reviews` | Customer product reviews | `customers.view` |
| `GET` | `/api/v1/admin/customers/{id}/returns` | Customer return requests | `customers.view` |
| `GET` | `/api/v1/admin/customers/{id}/notes` | Fetch internal admin notes | `customers.view` |
| `POST` | `/api/v1/admin/customers/{id}/notes` | Add internal admin note | `customers.update` |
| `POST` | `/api/v1/admin/customers/{id}/reset-password` | Trigger password reset notification email | `customers.update` |

---

## 5. Validation Rules

### 5.1 Update Customer Request (`UpdateCustomerRequest`)
- `name`: `required|string|max:255`
- `email`: `required|email|unique:users,email,{id}`
- `phone`: `nullable|string|max:30`

### 5.2 Status Update Request (`UpdateCustomerStatusRequest`)
- `status`: `required|in:active,suspended,disabled`
- `reason`: `nullable|string|max:500`

### 5.3 Customer Note Request (`AddCustomerNoteRequest`)
- `note`: `required|string|max:1000`

---

## 6. Acceptance Criteria

- [ ] All 13 API endpoints co-exist and function cleanly in `CustomerAdminController.php`.
- [ ] `CustomerAdminService.php` encapsulates stats aggregation, listing, profile compilation, tab history queries, status toggling, internal notes, and CSV exports.
- [ ] `/admin/customers` and `/admin/customers/:id` SPA views render executive KPI cards, customer grid, profile stats, tabbed history, status toggling, notes drawer, and CSV export.
- [ ] Vite production bundle builds cleanly (`npm run build`).
- [ ] Automated feature test suite `AdminCustomerManagementTest.php` passes with 100% success rate via `vendor/bin/phpunit`.
