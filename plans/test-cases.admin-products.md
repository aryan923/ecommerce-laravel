# Test Cases: Admin Product Management Module

**Module Name:** Admin Product Management  
**Module ID:** 23  
**Test File:** `plans/test-cases.admin-products.md`  
**Specification:** `specifications/feature.admin-products.spec.md`  
**Plan:** `plans/plan.admin-products.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-APRD-001: Admin Duplicate Product with Variants
- **Preconditions**: Product 1 exists with SKU `PRD-ORIG-01` and 2 variants. Admin authenticated.
- **Input**: `POST /api/v1/admin/products/1/duplicate`
- **Expected Result**: HTTP 201 Created, returns duplicated product record with name containing "(Copy)", unique SKU, and cloned variants.

### TC-APRD-002: Admin Bulk Update Status for Multiple Products
- **Preconditions**: Products 1, 2, and 3 exist with status `draft`. Admin authenticated.
- **Input**: `POST /api/v1/admin/products/bulk` with payload:
  `{"product_ids": [1, 2, 3], "action": "activate"}`
- **Expected Result**: HTTP 200 OK, database updated so products 1, 2, 3 have `status = 'active'`.

### TC-APRD-003: Admin Bulk Update Category for Selected Products
- **Preconditions**: Products 1 and 2 exist. Category 5 exists.
- **Input**: `POST /api/v1/admin/products/bulk` with payload:
  `{"product_ids": [1, 2], "action": "update_category", "data": {"category_id": 5}}`
- **Expected Result**: HTTP 200 OK, products 1 and 2 associated with Category 5 in pivot table.

### TC-APRD-004: Admin Queue Product Import
- **Preconditions**: Admin authenticated. CSV payload with 2 product rows.
- **Input**: `POST /api/v1/admin/products/import` with payload:
  `{"products": [{"name": "Imported Phone", "type": "simple", "price": 499.99, "sku": "IMP-01"}]}`
- **Expected Result**: HTTP 202 Accepted or 200 OK, `ImportProductsJob` queued, products created.

---

## 2. Negative & Edge Case Scenarios

### TC-APRD-005: Duplicate Non-Existent Product Fails with 404
- **Input**: `POST /api/v1/admin/products/9999/duplicate`
- **Expected Result**: HTTP 404 Not Found.

### TC-APRD-006: Bulk Action with Empty Product IDs Array Fails
- **Input**: `POST /api/v1/admin/products/bulk` with `{"product_ids": [], "action": "activate"}`
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `product_ids`.
