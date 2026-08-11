# Test Cases: Product Catalog Module

**Module Name:** Product Catalog  
**Module ID:** 06  
**Test File:** `plans/test-cases.products.md`  
**Specification:** `specifications/feature.products.spec.md`  
**Plan:** `plans/plan.products.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-PRD-001: Create Simple Physical Product Success
- **Preconditions**: Authenticated admin with `products.create` permission, category ID 1 exists.
- **Input**: `POST /api/v1/admin/products` with `name: "Wireless Headphones"`, `type: "simple"`, `price: 99.99`, `category_ids: [1]`, `primary_category_id: 1`, `status: "active"`.
- **Expected Result**: HTTP 201 Created, record created in `products` table with auto-generated `slug: "wireless-headphones"` and `sku: "PRD-..."`, category attached in `product_categories` with `is_primary = true`.

### TC-PRD-002: Create Digital Product Success
- **Input**: `POST /api/v1/admin/products` with `name: "E-Book Guide"`, `type: "digital"`, `price: 19.99`, `download_url: "https://example.com/ebook.pdf"`, `download_limit: 5`, `category_ids: [1]`.
- **Expected Result**: HTTP 201 Created, digital product created with download parameters.

### TC-PRD-003: List Products with Multi-Filters (Admin)
- **Input**: `GET /api/v1/admin/products?search=Wireless&type=simple&status=active&min_price=50&max_price=150`.
- **Expected Result**: HTTP 200 OK, paginated list matching filters.

### TC-PRD-004: Update Product Details Success
- **Preconditions**: Product ID 1 exists.
- **Input**: `PUT /api/v1/admin/products/1` with `name: "Wireless Headphones Pro"`, `sale_price: 79.99`.
- **Expected Result**: HTTP 200 OK, product updated.

### TC-PRD-005: Public Storefront Catalog Search & Sort
- **Input**: `GET /api/v1/products?search=Wireless&sort_by=price_low_high`.
- **Expected Result**: HTTP 200 OK, active products list sorted by effective price ascending.

### TC-PRD-006: Public Product Detail View with Breadcrumbs & Related Products
- **Preconditions**: Active product with `slug: "wireless-headphones"`.
- **Input**: `GET /api/v1/products/wireless-headphones`.
- **Expected Result**: HTTP 200 OK, returns product payload, brand, primary category, category breadcrumbs trail, and related items.

---

## 2. Negative Test Scenarios

### TC-PRD-007: Digital Product Missing Download URL Validation Error
- **Input**: `POST /api/v1/admin/products` with `name: "Invalid Digital"`, `type: "digital"`, `price: 9.99`, `category_ids: [1]`. (omitting `download_url`).
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `download_url`.

### TC-PRD-008: Sale Price Higher Than Regular Price Validation Error
- **Input**: `POST /api/v1/admin/products` with `name: "Overpriced Sale"`, `type: "simple"`, `price: 100`, `sale_price: 150`, `category_ids: [1]`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `sale_price`.

### TC-PRD-009: Create Product with Duplicate SKU
- **Preconditions**: Existing product with `sku: "SKU-100"`.
- **Input**: `POST /api/v1/admin/products` with `sku: "SKU-100"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `sku`.

### TC-PRD-010: Unauthorized Admin Product Creation
- **Preconditions**: Admin user without `products.create` permission.
- **Input**: `POST /api/v1/admin/products`.
- **Expected Result**: HTTP 403 Forbidden.

---

## 3. Security & Validation Tests

- **TC-PRD-011**: Public storefront routes (`/api/v1/products`, `/api/v1/products/{slug}`) do not expose `draft`, `inactive`, or `archived` products.
- **TC-PRD-012**: Admin product routes require valid Sanctum Bearer token.
- **TC-PRD-013**: Swagger UI contains all Product endpoints (`/admin/products`, `/admin/products/{id}`, `/admin/products/{id}/status`, `/products`, `/products/{slug}`).
