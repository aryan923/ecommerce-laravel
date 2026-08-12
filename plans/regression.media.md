# Regression Strategy: Product Media Management Module

**Module Name:** Product Media Management  
**Module ID:** 08  
**Regression File:** `plans/regression.media.md`  
**Specification:** `specifications/feature.media.spec.md`  
**Plan:** `plans/plan.media.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / Storage Facade / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Product Media Management provides media assets across the platform and affects:
- Module 01 Foundation & Infrastructure (`ApiResponseTrait`, `BaseController`, Storage Config)
- Module 03 Admin Authentication & RBAC (`permission:media.*` authorization)
- Module 04 Categories & Brands (Category logos, Brand banners)
- Module 06 Product Catalog (Product images & main thumbnail displays)
- Module 07 Product Variants (Variant-level media galleries)
- Module 29 Banner Management (Promotional marketing banners)
- Module 30 CMS Page Management (Page content image embedding)
- Module 31 Centralized Media Library

---

## 2. Regression Scenarios

### REG-MED-001: Main Image Exclusivity & Demotion Integrity
- **Scenario**: Verify that setting a new image as `type = 'main'` for a Product or Category automatically demotes the previously assigned `main` image to `type = 'gallery'` without creating duplicate main image assignments or breaking storefront product thumbnail rendering.
- **Priority**: Critical
- **Expected Result**: Single `main` image maintained cleanly; previous `main` demoted to `gallery`.

### REG-MED-002: Physical Storage Disk File Cleanup Integrity
- **Scenario**: Verify that deleting media assets via API or bulk purge deletes the physical files from the configured storage disk (`public` or `s3`), ensuring no orphaned files remain on storage.
- **Priority**: High
- **Expected Result**: File removed from storage disk immediately upon DB record deletion.

### REG-MED-003: Swagger Documentation Auto-Generation
- **Scenario**: Verify that running `php artisan l5-swagger:generate` compiles OpenAPI specification containing all 9 Media API endpoints targeting `http://localhost:8002` without annotation syntax errors.
- **Priority**: Critical
- **Expected Result**: `api-docs.json` updated with complete Admin Media OpenAPI schemas.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all existing application test suites pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=MediaTest`.
4. Perform end-to-end API verification: Upload Media File → Attach to Product as Main → Attach Gallery Media → Reorder Gallery → Delete Media & Verify File Removed From Disk.
