# Feature Specification: Tax / GST Engine Module

**Module Name:** Tax / GST Engine  
**Module ID:** 14  
**Specification File:** `specifications/feature.tax.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§41–§43), `Requirements/development_modules.md` (§Module 14)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Tax / GST Engine provides a configurable, multi-jurisdictional tax calculation system tailored for Indian GST standards (CGST, SGST, IGST, UTGST) and general global tax classes. It allows administrators to define tax classes (e.g., Standard GST 18%, Reduced 5%, Zero-Rated 0%), create tax rates with state/region applicability, configure tax-inclusive vs tax-exclusive pricing modes, and assign tax classes to products.

The core `TaxService` acts as a central engine consumed by Cart, Checkout, and Order processing modules to calculate precise line-item and order-level taxes based on store origin state and customer shipping destination state. All admin CRUD endpoints are secured via Sanctum and Spatie permissions, output standardized JSON responses, and include OpenAPI 3.0 annotations.

---

## 2. Business Flow

### 2.1 Admin Tax Class & Rate Management Flow
1. Admin navigates to Tax Management (`POST /api/v1/admin/tax-classes`).
2. Admin creates a Tax Class (e.g., `Standard GST 18%`, `Zero-Rated`).
3. Admin defines Tax Rates for the Tax Class (`POST /api/v1/admin/tax-rates`):
   - Name (e.g., `CGST`, `SGST`, `IGST`).
   - Rate percentage (e.g., 9.00 for CGST, 9.00 for SGST, 18.00 for IGST).
   - Rate type (`cgst`, `sgst`, `igst`, `flat`).
   - State code applicability (optional, e.g. `MH` for Maharashtra).
   - `is_inclusive` flag (whether product prices include tax or exclude tax).
4. Admin assigns `tax_class_id` to Products or Product Variants.

### 2.2 GST Calculation Engine Flow (Intra-State vs Inter-State)
1. System receives calculation request with line items, store origin state code (configured in app settings or environment, e.g. `MH`), and customer shipping destination state code (e.g. `MH` or `KA`).
2. **Jurisdiction Evaluation**:
   - **Intra-State Transaction** ($\text{Origin State} = \text{Destination State}$):
     - Applies **CGST** (e.g. 9%) + **SGST** (e.g. 9%). Total tax rate = 18%.
   - **Inter-State Transaction** ($\text{Origin State} \neq \text{Destination State}$):
     - Applies **IGST** (e.g. 18%). Total tax rate = 18%.
3. **Calculation Model**:
   - **Tax-Exclusive Pricing** (`is_inclusive = false`):
     $$\text{Tax Amount} = \text{Taxable Amount} \times \left(\frac{\text{Rate}}{100}\right)$$
     $$\text{Total Line Price} = \text{Taxable Amount} + \text{Tax Amount}$$
   - **Tax-Inclusive Pricing** (`is_inclusive = true`):
     $$\text{Tax Amount} = \text{Taxable Amount} - \left(\frac{\text{Taxable Amount}}{1 + \frac{\text{Rate}}{100}}\right)$$
     $$\text{Base Amount} = \text{Taxable Amount} - \text{Tax Amount}$$
4. Returns detailed breakdown per line item and aggregated tax totals (`cgst_amount`, `sgst_amount`, `igst_amount`, `total_tax`).

---

## 3. Functional Requirements

- **FR-TAX-001**: System shall support creating, listing, viewing, updating, and deleting `tax_classes`.
- **FR-TAX-002**: System shall support creating, listing, viewing, updating, and deleting `tax_rates` associated with a `tax_class_id`.
- **FR-TAX-003**: System shall support rate types: `cgst`, `sgst`, `igst`, `flat`, `standard`.
- **FR-TAX-004**: System shall evaluate intra-state ($\text{CGST} + \text{SGST}$) vs inter-state ($\text{IGST}$) automatically based on store origin state and shipping address state code.
- **FR-TAX-005**: System shall support both tax-inclusive and tax-exclusive calculation formulas.
- **FR-TAX-006**: System shall allow assigning a `tax_class_id` to `products` (and `product_variants` if overridden).
- **FR-TAX-007**: System shall provide a public/internal tax calculation API (`POST /api/v1/tax/calculate`).
- **FR-TAX-008**: System shall provide Admin CRUD endpoints for tax classes and tax rates with Spatie permission checks (`manage-tax`).
- **FR-TAX-009**: Every endpoint must be documented with OpenAPI 3.0 `@OA` annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Default Origin State**: Configurable via `config('app.store_state_code', 'MH')` or `.env`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table: `tax_classes`
Migration: `database/migrations/2026_08_11_000024_create_tax_classes_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `name` | `string` | Unique | Tax class name (e.g. Standard GST 18%) |
| `description` | `text` | Nullable | Description |
| `is_default` | `boolean` | Default `false` | Default tax class flag |
| `timestamps` | `timestamps` | | Created / Updated timestamps |

### 5.2 Table: `tax_rates`
Migration: `database/migrations/2026_08_11_000025_create_tax_rates_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `tax_class_id` | `foreignId` | FK -> `tax_classes` | Associated tax class |
| `name` | `string` | | Rate name (e.g. CGST 9%) |
| `type` | `enum` | `['cgst', 'sgst', 'igst', 'flat', 'standard']` | GST rate classification |
| `rate` | `decimal(8,4)` | Default `0.0000` | Percentage rate (e.g. 9.0000) |
| `state_code` | `string(10)` | Nullable, Index | Applicable state code (e.g. MH) |
| `country_code` | `string(2)` | Default `'IN'` | Applicable country code |
| `is_inclusive` | `boolean` | Default `false` | Price includes tax flag |
| `priority` | `unsignedInteger` | Default `0` | Order of application |
| `status` | `enum` | `['active', 'inactive']`, Default `'active'` | Status |
| `timestamps` | `timestamps` | | Created / Updated timestamps |

---

## 6. API Endpoints Specification

### 6.1 Tax Calculation Engine Endpoint
- `POST /api/v1/tax/calculate` — Calculate tax for items and shipping destination state.

### 6.2 Admin Tax Management Endpoints (`auth:sanctum`)
- `GET /api/v1/admin/tax-classes` — List tax classes with rates.
- `POST /api/v1/admin/tax-classes` — Create tax class.
- `GET /api/v1/admin/tax-classes/{id}` — Get single tax class with rates.
- `PUT /api/v1/admin/tax-classes/{id}` — Update tax class.
- `DELETE /api/v1/admin/tax-classes/{id}` — Delete tax class.

- `GET /api/v1/admin/tax-rates` — List tax rates.
- `POST /api/v1/admin/tax-rates` — Create tax rate.
- `GET /api/v1/admin/tax-rates/{id}` — Get single tax rate.
- `PUT /api/v1/admin/tax-rates/{id}` — Update tax rate.
- `DELETE /api/v1/admin/tax-rates/{id}` — Delete tax rate.

---

## 7. Verification & Acceptance Criteria

1. Migration & Schema check: `tax_classes` and `tax_rates` migrate cleanly.
2. `TaxService` intra-state (CGST+SGST) vs inter-state (IGST) tests pass.
3. Tax-inclusive vs tax-exclusive calculation formulas verified with exact decimal precision.
4. Admin CRUD endpoints for tax classes and rates function with Spatie permission checks.
5. Swagger documentation regenerates via `php artisan l5-swagger:generate`.
