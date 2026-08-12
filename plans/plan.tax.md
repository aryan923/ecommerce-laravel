# Implementation Plan: Module 14 — Tax / GST Engine

**Module Name:** Tax / GST Engine  
**Module ID:** 14  
**Plan File:** `plans/plan.tax.md`  
**Specification File:** `specifications/feature.tax.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 14 (Tax / GST Engine) to provide a multi-jurisdictional GST calculation system for India (CGST, SGST, IGST) and general tax classes. This includes database migrations for `tax_classes` and `tax_rates`; Eloquent models; `TaxService` for intra-state vs inter-state logic and inclusive/exclusive price calculations; public tax calculation API; Admin CRUD controllers with OpenAPI annotations; and automated test coverage.

---

## 2. User Review Required

> [!NOTE]
> - Store origin state code defaults to `MH` (Maharashtra) via `config('app.store_state_code', 'MH')`.
> - If origin state matches shipping destination state, intra-state CGST + SGST are applied. If states differ, inter-state IGST is applied.
> - Products table will be updated with `tax_class_id` foreign key.

---

## 3. Open Questions

*None at this time. Requirements fully define GST types, inclusive/exclusive formulas, and rate management.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000024_create_tax_classes_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000024_create_tax_classes_table.php) — Migration for `tax_classes` table.
- **[NEW]** [`database/migrations/2026_08_11_000025_create_tax_rates_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000025_create_tax_rates_table.php) — Migration for `tax_rates` table.
- **[NEW]** [`database/migrations/2026_08_11_000026_add_tax_class_id_to_products_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000026_add_tax_class_id_to_products_table.php) — Add `tax_class_id` FK to `products`.

### Model Layer
- **[NEW]** [`app/Models/TaxClass.php`](file:///d:/Projects/ecommerce_laravel/app/Models/TaxClass.php) — TaxClass model.
- **[NEW]** [`app/Models/TaxRate.php`](file:///d:/Projects/ecommerce_laravel/app/Models/TaxRate.php) — TaxRate model.
- **[MODIFY]** [`app/Models/Product.php`](file:///d:/Projects/ecommerce_laravel/app/Models/Product.php) — Add `taxClass()` relationship.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Admin/StoreTaxClassRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreTaxClassRequest.php)
- **[NEW]** [`app/Http/Requests/Admin/StoreTaxRateRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Admin/StoreTaxRateRequest.php)
- **[NEW]** [`app/Http/Requests/CalculateTaxRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/CalculateTaxRequest.php)

### Business Logic Service Layer
- **[NEW]** [`app/Services/TaxService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/TaxService.php) — Core GST engine (intra-state vs inter-state evaluation, tax-inclusive and tax-exclusive calculations, line-item tax breakdown).

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/TaxController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/TaxController.php) — Public tax calculation endpoint.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/TaxClassController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/TaxClassController.php) — Admin Tax Class CRUD.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/TaxRateController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/TaxRateController.php) — Admin Tax Rate CRUD.

### Routes Layer
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register tax calculation endpoint and admin management routes.

### Documentation Layer
- **[MODIFY]** [`storage/api-docs/api-docs.json`](file:///d:/Projects/ecommerce_laravel/storage/api-docs/api-docs.json) — Regenerate via `php artisan l5-swagger:generate`.

### Test Layer
- **[NEW]** [`tests/Feature/TaxTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/TaxTest.php) — Feature test suite for Tax module.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000024_create_tax_classes_table.php`
  - Path: `database/migrations/2026_08_11_000025_create_tax_rates_table.php`
  - Path: `database/migrations/2026_08_11_000026_add_tax_class_id_to_products_table.php`
  - Description: Create tables and add `tax_class_id` FK to products. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models**
  - Path: `app/Models/TaxClass.php`
  - Path: `app/Models/TaxRate.php`
  - Path: `app/Models/Product.php`
  - Description: Implement models with casts and relationships.

- [x] **Task 3: Create Form Request Classes**
  - Path: `app/Http/Requests/Admin/StoreTaxClassRequest.php`
  - Path: `app/Http/Requests/Admin/StoreTaxRateRequest.php`
  - Path: `app/Http/Requests/CalculateTaxRequest.php`
  - Description: Implement validation rules.

- [x] **Task 4: Implement TaxService**
  - Path: `app/Services/TaxService.php`
  - Description: Implement CGST, SGST, IGST jurisdiction calculation, inclusive/exclusive price math, and line item breakdown.

- [x] **Task 5: Implement Controllers with OpenAPI 3.0**
  - Path: `app/Http/Controllers/Api/V1/TaxController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/TaxClassController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/TaxRateController.php`
  - Description: Implement controller endpoints extending `BaseController` and using `ApiResponseTrait`. Include `@OA` annotations.

- [x] **Task 6: Register API Routes**
  - Path: `routes/api.php`
  - Description: Register public calculation route and admin tax routes.

- [x] **Task 7: Generate Swagger Docs**
  - Command: `docker exec ecom-panel-app php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 8: Feature Testing**
  - Path: `tests/Feature/TaxTest.php`
  - Command: `docker exec ecom-panel-app php vendor/bin/phpunit tests/Feature/TaxTest.php`
  - Description: Verify all tax calculation and CRUD tests pass.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `docker exec ecom-panel-app php vendor/bin/phpunit tests/Feature/TaxTest.php`
