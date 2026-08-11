# Regression Strategy: Product Variants Module

**Module Name:** Product Variants  
**Module ID:** 07  
**Regression File:** `plans/regression.product-variants.md`  
**Specification:** `specifications/feature.product-variants.spec.md`  
**Plan:** `plans/plan.product-variants.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Product Variants management affects key downstream commerce functions:
- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`)
- Module 03 Admin Authentication & RBAC (`permission:products.*` authorization)
- Module 05 Attributes & Attribute Values (Attribute values assigned to variants)
- Module 06 Product Catalog (Parent variable products and storefront detail page)
- Module 09 Inventory Management (Per-variant stock tracking)
- Module 12 Shopping Cart & Module 16 Checkout (Variant SKU selection and stock reservation)
- Module 23 Admin Product Management

---

## 2. Regression Scenarios

### REG-VAR-001: Parent Product Deletion Cascades Variants & Pivots
- **Scenario**: Verify that deleting a parent variable product via `DELETE /api/v1/admin/products/{id}` cleanly deletes all child `product_variants` and `product_variant_attribute_values` records without foreign key constraints errors.
- **Priority**: Critical
- **Expected Result**: Cascading deletion completes cleanly.

### REG-VAR-002: Public Storefront Variant Price & Stock Visibility
- **Scenario**: Verify that updating variant prices and stock quantities in `PUT /api/v1/admin/variants/{id}` immediately reflects in storefront product detail API (`GET /api/v1/products/{slug}`).
- **Priority**: Critical
- **Expected Result**: Storefront variant prices and stock levels update dynamically.

### REG-VAR-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Variant endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with all Admin Variant endpoints.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all 71 existing tests across the platform still pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=VariantTest`.
4. Perform end-to-end API verification: Create Variable Product → Select Attribute Values → Generate Variant Matrix → Update Variant Price & Stock → Query Public Storefront Detail API.
