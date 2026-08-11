# Test Cases: Categories & Brands Module

**Module Name:** Categories & Brands  
**Module ID:** 04  
**Test File:** `plans/test-cases.categories-brands.md`  
**Specification:** `specifications/feature.categories-brands.spec.md`  
**Plan:** `plans/plan.categories-brands.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-CAT-001: Create Root Category Success
- **Preconditions**: Authenticated admin with `categories.create` permission.
- **Input**: `POST /api/v1/admin/categories` with `name: "Electronics"`, `status: "active"`.
- **Expected Result**: HTTP 201 Created, `categories` table contains record with `parent_id = null` and auto-generated `slug: "electronics"`.

### TC-CAT-002: Create Sub-Category Success
- **Preconditions**: Parent category "Electronics" (ID 1) exists.
- **Input**: `POST /api/v1/admin/categories` with `name: "Laptops"`, `parent_id: 1`.
- **Expected Result**: HTTP 201 Created, sub-category created with `parent_id = 1`.

### TC-CAT-003: List Categories Tree (Admin)
- **Input**: `GET /api/v1/admin/categories?tree=true`.
- **Expected Result**: HTTP 200 OK, returns category hierarchy formatted as nested children array.

### TC-CAT-004: Reorder Categories Success
- **Input**: `POST /api/v1/admin/categories/reorder` with `orders: [{"id": 1, "sort_order": 2}, {"id": 2, "sort_order": 1}]`.
- **Expected Result**: HTTP 200 OK, category `sort_order` values updated in database.

### TC-BRD-001: Create Brand Success
- **Preconditions**: Authenticated admin with `brands.create` permission.
- **Input**: `POST /api/v1/admin/brands` with `name: "Apple"`, `website: "https://apple.com"`.
- **Expected Result**: HTTP 201 Created, brand created with `slug: "apple"`.

### TC-CAT-005: Public Active Category Tree Listing
- **Input**: `GET /api/v1/categories`.
- **Expected Result**: HTTP 200 OK, returns active categories in tree format without authentication required.

### TC-BRD-002: Public Active Brands Listing
- **Input**: `GET /api/v1/brands`.
- **Expected Result**: HTTP 200 OK, returns active brands list without authentication required.

---

## 2. Negative Test Scenarios

### TC-CAT-006: Prevent Category Self-Parenting Loop
- **Input**: `PUT /api/v1/admin/categories/1` with `parent_id: 1`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "A category cannot be its own parent".

### TC-CAT-007: Prevent Deletion of Category with Sub-Categories
- **Preconditions**: Category 1 has sub-category 2 attached.
- **Input**: `DELETE /api/v1/admin/categories/1`.
- **Expected Result**: HTTP 422 Unprocessable Entity, message "Cannot delete category that contains sub-categories".

### TC-CAT-008: Create Category with Duplicate Slug
- **Preconditions**: Existing category with `slug: "electronics"`.
- **Input**: `POST /api/v1/admin/categories` with `name: "Electronics"`.
- **Expected Result**: System automatically appends unique suffix (e.g. `electronics-1`) or throws validation error.

### TC-CAT-009: Unauthorized Admin Category Creation
- **Preconditions**: Admin user without `categories.create` permission.
- **Input**: `POST /api/v1/admin/categories`.
- **Expected Result**: HTTP 403 Forbidden.

---

## 3. Security & Validation Tests

- **TC-CAT-010**: Public storefront routes (`/api/v1/categories`, `/api/v1/brands`) do not expose inactive or draft categories/brands.
- **TC-CAT-011**: Admin category/brand routes require valid Sanctum Bearer token.
- **TC-CAT-012**: Swagger UI contains all Category & Brand endpoints (`/admin/categories`, `/admin/brands`, `/categories`, `/brands`).
