# Test Cases: Product Variants Module

**Module Name:** Product Variants  
**Module ID:** 07  
**Test File:** `plans/test-cases.product-variants.md`  
**Specification:** `specifications/feature.product-variants.spec.md`  
**Plan:** `plans/plan.product-variants.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-VAR-001: Automatic Cartesian Matrix Generation Success
- **Preconditions**: Variable product exists (ID 1), Attribute "Color" has values Red (1), Blue (2); Attribute "Size" has values S (3), M (4).
- **Input**: `POST /api/v1/admin/products/1/variants/generate` with `attribute_value_ids: [[1, 2], [3, 4]]`, `base_price: 49.99`, `base_stock: 10`.
- **Expected Result**: HTTP 201 Created, 4 `ProductVariant` records generated with unique SKUs and assigned pivot records in `product_variant_attribute_values`.

### TC-VAR-002: Create Single Variant Manually
- **Input**: `POST /api/v1/admin/products/1/variants` with `sku: "SKU-CUSTOM-V1"`, `price: 59.99`, `stock_qty: 15`, `attribute_value_ids: [1, 3]`.
- **Expected Result**: HTTP 201 Created, single variant created with specified attributes.

### TC-VAR-003: List Product Variants (Admin)
- **Input**: `GET /api/v1/admin/products/1/variants`.
- **Expected Result**: HTTP 200 OK, list of variants with assigned `attribute_values`.

### TC-VAR-004: Update Variant Price and Stock
- **Preconditions**: Variant ID 1 exists.
- **Input**: `PUT /api/v1/admin/variants/1` with `price: 69.99`, `sale_price: 54.99`, `stock_qty: 25`.
- **Expected Result**: HTTP 200 OK, variant record updated.

### TC-VAR-005: Public Storefront Product Detail Includes Active Variants
- **Preconditions**: Variable product with active variants.
- **Input**: `GET /api/v1/products/variable-product-slug`.
- **Expected Result**: HTTP 200 OK, `product.variants` list contains active variants with attribute values attached.

---

## 2. Negative Test Scenarios

### TC-VAR-006: Matrix Generation Skips Existing Combination Pairs
- **Preconditions**: Variant with combination Red (1) x S (3) already exists.
- **Input**: `POST /api/v1/admin/products/1/variants/generate` with `attribute_value_ids: [[1], [3]]`.
- **Expected Result**: HTTP 200 OK, 0 new variants created, appropriate message returned without duplicate key errors.

### TC-VAR-007: Single Variant Creation Duplicate SKU Validation Error
- **Preconditions**: Variant with `sku: "SKU-EXISTING"` exists.
- **Input**: `POST /api/v1/admin/products/1/variants` with `sku: "SKU-EXISTING"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `sku`.

### TC-VAR-008: Unauthorized Admin Variant Generation
- **Preconditions**: Admin user without `products.create` permission.
- **Input**: `POST /api/v1/admin/products/1/variants/generate`.
- **Expected Result**: HTTP 403 Forbidden.

---

## 3. Security & Validation Tests

- **TC-VAR-009**: Inactive variants (`status = 'inactive'`) are omitted from public storefront product detail API (`GET /api/v1/products/{slug}`).
- **TC-VAR-010**: Admin variant routes require valid Sanctum Bearer token and proper RBAC permission.
- **TC-VAR-011**: Swagger UI contains all Variant endpoints (`/admin/products/{id}/variants`, `/admin/products/{id}/variants/generate`, `/admin/variants/{id}`).
