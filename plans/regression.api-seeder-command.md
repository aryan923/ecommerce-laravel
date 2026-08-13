# Regression Strategy: Internal API Store Data Seeder Command

**Module Name:** Internal API Store Data Seeder Command  
**Module ID:** 24  
**Regression File:** `plans/regression.api-seeder-command.md`  
**Specification:** `specifications/feature.api-seeder-command.spec.md`  
**Plan:** `plans/plan.api-seeder-command.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / React 18 / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Internal API Store Data Seeder Command impacts:
- **All API Controllers**: Verifying Form Request validations pass cleanly during internal API request dispatching.

---

## 2. Regression Scenarios

### REG-CMD-001: Re-running Data Population Command
- **Scenario**: Verify that running `php artisan app:populate-store-data` multiple times cleanly handles existing records without throwing duplicate SKU or email exceptions.
- **Priority**: Critical
- **Expected Result**: Idempotent execution or clean handling of existing records.

---

## 3. Smoke & Integration Test Suite

1. Run `php artisan app:populate-store-data`.
2. Build Vite asset bundle with `cmd /c npm run build`.
