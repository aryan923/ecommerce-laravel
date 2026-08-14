# Implementation Plan — Module 26: Admin Customer Management

**Module Name:** Admin Customer Management  
**Module ID:** 26  
**Specification File:** `specifications/feature.admin-customers.spec.md`  
**Plan File:** `plans/plan.admin-customers.md`  
**Test Cases File:** `plans/test-cases.admin-customers.md`  
**Regression File:** `plans/regression.admin-customers.md`  
**Target Completion:** Module 26 Complete  
**Zero Overwrite Policy:** All existing user/customer services and endpoints MUST NOT be overwritten or broken.  

---

## 1. Objective

Implement Module 26 (Admin Customer Management) to give store administrators full visibility into customer accounts, lifetime spending metrics, purchase history, addresses, reviews, returns, internal support notes, and account status controls (active/suspended) through OpenAPI-annotated REST APIs and a React Admin SPA interface at `/admin/customers` and `/admin/customers/:id`.

---

## 2. Architecture & File Breakdown

### 2.1 Backend Architecture (Laravel 12 / PHP 8.4)
- **Migration & Model**:
  - [NEW] Migration `2026_08_15_000001_create_customer_notes_table.php` (stores internal staff notes on customer accounts).
  - [NEW] Model `app/Models/CustomerNote.php`.
- **Form Requests**:
  - [NEW] `app/Http/Requests/Admin/UpdateCustomerRequest.php`
  - [NEW] `app/Http/Requests/Admin/UpdateCustomerStatusRequest.php`
  - [NEW] `app/Http/Requests/Admin/AddCustomerNoteRequest.php`
- **Service Layer**:
  - [NEW] `app/Services/CustomerAdminService.php` (encapsulates KPI stats calculations, search/filter queries, profile metrics, tabbed sub-queries, status changes, internal notes, and CSV export).
- **Controller Layer**:
  - [NEW] `app/Http/Controllers/Api/V1/Admin/CustomerAdminController.php` (OpenAPI-annotated controller with 13 endpoints).
- **Routes & RBAC**:
  - [MODIFY] `routes/api.php` (register `/api/v1/admin/customers/*` routes under Sanctum guard and `CheckAdminPermission` middleware).
  - Register RBAC permissions: `customers.view`, `customers.update`, `customers.delete`.
- **Feature Tests**:
  - [NEW] `tests/Feature/AdminCustomerManagementTest.php`

### 2.2 Frontend Architecture (React 18 SPA / Vite)
- **Pages**:
  - [NEW] `resources/js/admin/pages/CustomersPage.jsx` (KPI cards, search/status filter toolbar, customer listing data table, status toggle modal, CSV export button).
  - [NEW] `resources/js/admin/pages/CustomerDetailPage.jsx` (Customer profile view, executive lifetime stats cards, tabbed views for Orders, Addresses, Reviews, Returns, and Internal Staff Notes drawer).
- **App Router & Navigation**:
  - [MODIFY] `resources/js/admin/App.jsx` (register `/customers` and `/customers/:id` routes, add Sidebar navigation item for Customers with `Users` Lucide icon).

---

## 3. Implementation Steps

### Phase 1: Database Migration & Model Setup
1. Create migration `2026_08_15_000001_create_customer_notes_table.php`:
   - Columns: `id`, `user_id` (foreign key to `users.id`), `admin_user_id` (foreign key to `admin_users.id`), `note` (text), `timestamps`.
2. Create `CustomerNote` model with relationships (`user()`, `adminUser()`).
3. Add `customerNotes()` relationship method to `User` model.

### Phase 2: Form Requests & Service Layer
1. Create `UpdateCustomerRequest`, `UpdateCustomerStatusRequest`, and `AddCustomerNoteRequest`.
2. Build `CustomerAdminService.php`:
   - `getStats()`: Computes total customers, active count, suspended count, new this month, lifetime revenue.
   - `list($filters)`: Query builder supporting search (name, email, phone), status, date range, and sorting.
   - `getProfile($id)`: Returns user profile with calculated `total_orders`, `total_spent`, `avg_order_value`, `last_order_at`, `registration_date`.
   - `update($id, $data)`: Updates customer contact details.
   - `updateStatus($id, $status, $reason)`: Updates status (`active`, `suspended`, `disabled`).
   - `getOrders($id)`, `getAddresses($id)`, `getReviews($id)`, `getReturns($id)`: Tabbed sub-queries.
   - `getNotes($id)`, `addNote($id, $note, $adminId)`: Internal notes management.
   - `exportCsv($filters)`: Streams CSV download.

### Phase 3: OpenAPI Annotated Controller & Route Registration
1. Create `CustomerAdminController.php` with 13 OpenAPI-annotated methods (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`).
2. Register API routes in `routes/api.php` under Sanctum guard and RBAC permissions.

### Phase 4: React Admin SPA Views (`/admin/customers` & `/admin/customers/:id`)
1. Create `CustomersPage.jsx`:
   - Render 5 Executive KPI Cards (Total Customers, Active, Suspended, New This Month, Total Spent).
   - Search input, status dropdown filter, date range pickers.
   - Table grid displaying Customer Name, Email, Phone, Status badge, Orders count, Total Spent, Registration date, and Action buttons (View Detail, Edit, Toggle Status).
2. Create `CustomerDetailPage.jsx`:
   - Profile header card with customer initials avatar, contact info, status badge, edit button, and status toggle modal.
   - Executive metrics grid (Total Orders, Total Spent, Avg Order Value, Last Order, Registered Date).
   - Tabbed section:
     - **Orders Tab**: Customer order history table.
     - **Addresses Tab**: Saved shipping and billing addresses grid.
     - **Reviews Tab**: Customer product reviews table.
     - **Returns Tab**: Customer return requests table.
     - **Internal Notes Drawer**: Interactive staff note feed with "Add Note" textarea.
3. Update `resources/js/admin/App.jsx`:
   - Add `/customers` and `/customers/:id` routes.
   - Add "Customers" link with Lucide `Users` icon to Sidebar navigation under Catalog section.

### Phase 5: Build, Test & Verification
1. Run database migrations: `docker exec ecom-panel-app php artisan migrate`.
2. Compile Vite assets: `npm run build`.
3. Execute PHPUnit test suite: `$env:DB_HOST="127.0.0.1"; $env:DB_PORT="3307"; vendor/bin/phpunit tests/Feature/AdminCustomerManagementTest.php`.

---

## 4. Verification Plan

### Automated Tests
```powershell
$env:DB_HOST="127.0.0.1"; $env:DB_PORT="3307"; vendor/bin/phpunit tests/Feature/AdminCustomerManagementTest.php
```

### Manual Verification
1. Login to Admin Panel at `http://localhost:8000/admin`.
2. Click **Customers** in the sidebar to view `/admin/customers`.
3. Verify KPI cards, search filter, status filter, and pagination.
4. Click on a customer row to view profile at `/admin/customers/:id`.
5. Switch tabs (Orders, Addresses, Reviews, Returns, Notes) and verify data loading.
6. Toggle customer status (`active` $\leftrightarrow$ `suspended`) and verify immediate UI update.
7. Add an internal admin note and confirm it appears in the notes feed.
8. Click **Export CSV** and verify file download.
