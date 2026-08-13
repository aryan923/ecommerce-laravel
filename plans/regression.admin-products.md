# Regression Strategy: Admin Product Management Module

**Module Name:** Admin Product Management  
**Module ID:** 23  
**Regression File:** `plans/regression.admin-products.md`  
**Specification:** `specifications/feature.admin-products.spec.md`  
**Plan:** `plans/plan.admin-products.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Admin Product Management Module impacts:
- **Module 04 Product Catalog Management**: Preserving public storefront catalog visibility rules (`status = 'active'`).
- **Module 06 Product Variant Management**: Preserving variant combination & SKU integrity during product duplication.
- **Module 09 Inventory Management**: Preserving stock transactions during bulk inventory updates.

---

## 2. Regression Scenarios

### REG-APRD-001: Duplicate Product SKU Uniqueness
- **Scenario**: Verify that duplicating a product multiple times never generates collision errors on the unique SKU or slug database indexes.
- **Priority**: Critical
- **Expected Result**: 100% resolution of SKU/slug uniqueness collisions.

### REG-APRD-002: Bulk Transaction Atomicity
- **Scenario**: Verify that if one product ID fails during a bulk operation, database transactions roll back cleanly without leaving partial updates.
- **Priority**: Critical
- **Expected Result**: Complete transactional rollback on error.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/AdminProductManagementTest.php` to verify all admin product management tests.
2. Run `php vendor/bin/phpunit tests/Feature/ProductTest.php` to verify product catalog regression.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
