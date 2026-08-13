# Regression Strategy: Admin Category & Brand Management Module

**Module Name:** Admin Category & Brand Management  
**Module ID:** 24  
**Regression File:** `plans/regression.admin-catalog.md`  
**Specification:** `specifications/feature.admin-catalog.spec.md`  
**Plan:** `plans/plan.admin-catalog.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite + React SPA) / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Admin Category & Brand Management Module impacts:
- **Module 04 Category & Brand APIs**: Preserving parent-child relationships and category listing filters.
- **Module 23 Admin Product Management**: Preserving category and brand selectors in `ProductFormModal.jsx` and bulk category assignment.
- **Module 22 Admin Dashboard**: Preserving top categories ranking calculations.

---

## 2. Regression Scenarios

### REG-ACAT-001: Category Hierarchy Integrity
- **Scenario**: Verify that deleting a parent category updates or safely handles child categories without leaving orphaned database foreign key references.
- **Priority**: Critical
- **Expected Result**: 100% cascade or set-null foreign key constraint compliance.

### REG-ACAT-002: React UI Bundle Build Integrity
- **Scenario**: Verify that adding Category, Brand, and Attribute views to `App.jsx` compiles with 0 errors in Vite.
- **Priority**: High
- **Expected Result**: Clean `npm run build` asset output.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/AdminCatalogManagementTest.php`.
2. Run `npm run build` to verify React UI compilation.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
