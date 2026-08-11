# Regression Strategy: Categories & Brands Module

**Module Name:** Categories & Brands  
**Module ID:** 04  
**Regression File:** `plans/regression.categories-brands.md`  
**Specification:** `specifications/feature.categories-brands.spec.md`  
**Plan:** `plans/plan.categories-brands.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Categories and Brands form the taxonomy core of the platform and affect:
- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Exception Handler)
- Module 03 Admin Authentication & RBAC (`permission:categories.*`, `permission:brands.*` authorization)
- Module 06 Product Catalog (Category & Brand associations for products)
- Module 11 Wishlist & Module 12 Shopping Cart (Product category attributes)
- Module 24 Admin Category & Brand Management

---

## 2. Regression Scenarios

### REG-CAT-001: Category Tree Integrity & Hierarchy Safety
- **Scenario**: Verify that updating parent IDs or sort orders across multi-level category trees does not break parent-child associations or produce orphaned categories.
- **Priority**: Critical
- **Expected Result**: Hierarchy remains consistent; child subcategories update parent associations cleanly.

### REG-CAT-002: Public Catalog Filter Safety
- **Scenario**: Verify that changing a category or brand status to `inactive` in the Admin API immediately excludes it from public storefront endpoints (`/api/v1/categories`, `/api/v1/brands`).
- **Priority**: High
- **Expected Result**: Inactive categories and brands are hidden from public APIs.

### REG-CAT-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Category and Brand endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with all Admin and Public Category/Brand endpoints.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all 37 existing tests across the platform still pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=CategoryTest` and `php artisan test --filter=BrandTest`.
4. Perform end-to-end API verification: Create Category → Add Sub-Category → Create Brand → Reorder → Fetch Public Catalog APIs.
