# Feature Specification: Internal API Store Data Seeder Command

**Module Name:** Internal API Store Data Seeder Command  
**Module ID:** 24  
**Specification File:** `specifications/feature.api-seeder-command.spec.md`  
**Version:** 1.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md`, `Requirements/admin_panel.md`, `Requirements/development_modules.md`  
**Tech Stack:** Laravel 12.x Console Command / PHP 8.4 / Sanctum Auth / Internal HTTP Controller Dispatchers  

---

## 1. Module Overview

The Internal API Store Data Seeder Command provides an automated Artisan command `app:populate-store-data` (`php artisan app:populate-store-data`) that populates all 50 store database tables by invoking internal Laravel API endpoints and controllers instead of running raw database seeders.

This ensures all database seed data passes through the project's business logic, form request validation rules, relationship handling, slug/SKU auto-generation, media attachments, tax/shipping rate calculations, and OpenAPI-compliant data transformations.

---

## 2. Architecture & Execution Flow

```text
  CLI Command Trigger: `php artisan app:populate-store-data`
  │
  ├── Step 1: Admin Authentication & Sanctum Token Generation
  ├── Step 2: Seed Currencies (`INR`, `USD`, `EUR`, `GBP`) via `CurrencyController`
  ├── Step 3: Seed Brands (boAt, Noise, Fastrack, Apple, Samsung, Sony, Logitech) via `BrandController`
  ├── Step 4: Seed Categories (Electronics, Audio, Smartwatches, Computers, Accessories) via `CategoryController`
  ├── Step 5: Seed Attributes & Values (Color: Black/White/Navy; Size: S/M/L; RAM: 8GB/16GB; Storage: 128GB/256GB) via `AttributeController`
  ├── Step 6: Seed Tax Classes (GST 18%, GST 12%, GST 5%, GST 0%) via `TaxClassController`
  ├── Step 7: Seed Shipping Zones, Methods & Rates (Standard, Express, Per-Product, Weight-Based) via `ShippingZoneController` & `ShippingMethodController`
  ├── Step 8: Seed Products & Variants (Simple, Variable with attribute matrices, Digital downloads with per-variant download URLs, physical package dimensions & per-product custom shipping fees) via `ProductController`
  ├── Step 9: Seed Coupons & Promotional Rules via `CouponController`
  └── Step 10: Seed Customers, Addresses, Carts, Orders, Reviews, Shipments & Payments via Customer API Controllers
```

---

## 3. Command Specification

- **Artisan Command Signature**: `app:populate-store-data`
- **Options**:
  - `--fresh`: (Optional) Run `php artisan migrate:fresh` before seeding.
  - `--force`: (Optional) Bypass confirmation prompt in production.

---

## 4. Functional Requirements

- **FR-CMD-001**: System shall provide an Artisan command `app:populate-store-data`.
- **FR-CMD-002**: The command shall create an authenticated Admin session (`Sanctum`) or internal request context before invoking API controllers.
- **FR-CMD-003**: The command shall execute internal API requests / controller dispatches for all 10 domain areas in strict dependency order:
  1. Admin Account & Roles
  2. Currencies
  3. Brands
  4. Categories
  5. Attributes & Attribute Values
  6. Tax Classes
  7. Shipping Zones, Methods & Rates
  8. Products, Product Variants, Media & Shipping parameters
  9. Coupons
  10. Users, Addresses, Carts, Orders, Reviews, Shipments & Payments
- **FR-CMD-004**: The command shall render a styled CLI progress bar and summary report table showing created record counts per table.
- **FR-CMD-005**: If a record already exists (e.g. admin user or currency), the command shall update or skip gracefully without throwing duplicate key exceptions.

---

## 5. Technical Requirements

- **Framework**: Laravel 12.x Artisan Console Command with PHP 8.4.
- **Internal Request Handling**: `Illuminate\Http\Request::create()` or direct controller invocation with validated payloads.
- **Output**: Laravel Console Components (`$this->withProgressBar()`, `$this->table()`).

---

## 6. Verification Criteria & Acceptance Checklist

1. Running `php artisan app:populate-store-data` populates all store tables via internal API dispatches.
2. Products created by the command render correctly in the React Admin SPA at `/admin/products`.
3. Command handles idempotency when executed multiple times.
4. All unit and integration tests pass cleanly.
