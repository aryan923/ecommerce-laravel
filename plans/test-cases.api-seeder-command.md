# Test Cases: Internal API Store Data Seeder Command

**Module Name:** Internal API Store Data Seeder Command  
**Module ID:** 24  
**Test File:** `plans/test-cases.api-seeder-command.md`  
**Specification:** `specifications/feature.api-seeder-command.spec.md`  
**Plan:** `plans/plan.api-seeder-command.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / React 18 / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-CMD-001: Internal API Store Data Population Command Execution
- **Preconditions**: Database migrated cleanly via `php artisan migrate:fresh`.
- **Input**: Execute command `php artisan app:populate-store-data`.
- **Expected Result**: Command executes successfully, invoking internal API controllers for Currencies, Brands, Categories, Attributes, Tax Classes, Shipping Methods, Products, Coupons, Users, Addresses, Carts, Orders, Reviews, Shipments, and Payments. Displays success summary table.
