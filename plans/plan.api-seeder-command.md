# Implementation Plan: Internal API Store Data Seeder Command

**Module Name:** Internal API Store Data Seeder Command  
**Module ID:** 24  
**Plan File:** `plans/plan.api-seeder-command.md`  
**Specification File:** `specifications/feature.api-seeder-command.spec.md`  
**Target Completion:** Completed  

---

## 1. Goal Description

Implement Artisan Command `app:populate-store-data` (`php artisan app:populate-store-data`) to populate all store database tables by invoking internal Laravel API endpoints and controllers across all 10 domain areas.

---

## 2. User Review Required

> [!NOTE]
> - **Internal API Population Command**:
>   - Replaces raw SQL database seeders with an Artisan command (`php artisan app:populate-store-data`).
>   - Populates Currencies, Brands, Categories, Attributes, Tax Classes, Shipping Methods & Rates, Products (Simple, Variable, Digital with custom shipping fees & download URLs), Coupons, Users, Addresses, Carts, Orders, Reviews, Shipments, and Payments via internal API calls.

---

## 3. Task Breakdown Checklist

- [x] **Task 1: Create Artisan Command Class** (`app/Console/Commands/PopulateStoreDataApiCommand.php`)
- [x] **Task 2: Implement Internal Request Helper & Controller Dispatcher**
- [x] **Task 3: Implement Seeder Dispatchers for All 10 Domain Areas**
- [x] **Task 4: Execute Command (`php artisan app:populate-store-data`) and Verify Database Population**
- [x] **Task 5: Comprehensive Feature & Regression Validation** (Vite build + PHPUnit test suite)
