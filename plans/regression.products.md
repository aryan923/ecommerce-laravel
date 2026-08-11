# Regression Strategy: Product Catalog Module

**Module Name:** Product Catalog  
**Module ID:** 06  
**Regression File:** `plans/regression.products.md`  
**Specification:** `specifications/feature.products.spec.md`  
**Plan:** `plans/plan.products.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Product Catalog forms the core domain entity of the e-commerce platform and affects:
- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Exception Handler)
- Module 03 Admin Authentication & RBAC (`permission:products.*` authorization)
- Module 04 Categories & Brands (Brand & Category pivot relationships)
- Module 05 Attributes & Attribute Values (Specification & variant attributes)
- Module 07 Product Variants (Parent-child variant matrices)
- Module 08 Product Media Management (Product image galleries)
- Module 09 Inventory Management (Stock tracking per SKU)
- Module 12 Shopping Cart & Module 16 Checkout (Line items & pricing calculations)
- Module 23 Admin Product Management

---

## 2. Regression Scenarios

### REG-PRD-001: Category Pivot Sync & Primary Category Integrity
- **Scenario**: Verify that updating product category attachments via `PUT /api/v1/admin/products/{id}` correctly updates the `product_categories` pivot table, sets the designated `is_primary` flag, and updates storefront breadcrumbs without leaving orphaned pivot records.
- **Priority**: Critical
- **Expected Result**: Category associations and primary category assignment update cleanly.

### REG-PRD-002: Public Storefront Catalog Visibility Safety
- **Scenario**: Verify that changing a product status from `active` to `draft`, `inactive`, or `archived` in the Admin API immediately excludes it from public storefront endpoints (`/api/v1/products` and `/api/v1/products/{slug}`).
- **Priority**: Critical
- **Expected Result**: Non-active products return HTTP 404 or are omitted from storefront queries.

### REG-PRD-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Product endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with all Admin and Public Product endpoints.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all 61 existing tests across the platform still pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=ProductTest`.
4. Perform end-to-end API verification: Create Product (Simple/Digital) → Assign Category & Brand → Toggle Status → Query Public Catalog → View Product Detail with Breadcrumbs.
