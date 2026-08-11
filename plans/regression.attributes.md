# Regression Strategy: Attributes & Attribute Values Module

**Module Name:** Attributes & Attribute Values  
**Module ID:** 05  
**Regression File:** `plans/regression.attributes.md`  
**Specification:** `specifications/feature.attributes.spec.md`  
**Plan:** `plans/plan.attributes.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Attributes & Attribute Values form the specification layer for catalog filtering and product variants, affecting:
- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Exception Handler)
- Module 03 Admin Authentication & RBAC (`permission:attributes.*` authorization)
- Module 06 Product Catalog (Product specification values)
- Module 07 Product Variants (Variant matrix generation e.g. Color x Size)
- Module 23 Admin Product Management

---

## 2. Regression Scenarios

### REG-ATT-001: Filterable Attributes Storefront Query Integrity
- **Scenario**: Verify that updating an attribute's `is_filterable` or `status` flag immediately updates the storefront catalog filter API response (`GET /api/v1/attributes`).
- **Priority**: Critical
- **Expected Result**: Storefront filters dynamically update without cached/stale data.

### REG-ATT-002: Attribute Values Cascading Deletion Safety
- **Scenario**: Verify that deleting an attribute cleanly cascades and deletes associated attribute values without foreign key violation errors.
- **Priority**: High
- **Expected Result**: Cascading deletion executes cleanly.

### REG-ATT-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Attribute and Attribute Value endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with all Admin and Public Attribute endpoints.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all 53 existing tests across the platform still pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=AttributeTest`.
4. Perform end-to-end API verification: Create Attribute → Add Values → Fetch Public Attributes API → Update Value → Delete Attribute.
