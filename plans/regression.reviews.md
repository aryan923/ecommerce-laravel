# Regression Strategy: Product Reviews Module

**Module Name:** Product Reviews  
**Module ID:** 20  
**Regression File:** `plans/regression.reviews.md`  
**Specification:** `specifications/feature.reviews.spec.md`  
**Plan:** `plans/plan.reviews.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Product Reviews Module impacts:
- **Module 04 Product Catalog Management**: Displaying average ratings and review counts on product details.
- **Module 18 Customer Order Management**: Verifying order delivered status prior to review creation.

---

## 2. Regression Scenarios

### REG-REV-001: Verified Purchase Integrity Validation
- **Scenario**: Verify that attempting to submit a review without an authentic delivered order returns 422, ensuring catalog review credibility.
- **Priority**: Critical
- **Expected Result**: 100% rejection of unverified review attempts.

### REG-REV-002: Public Catalog Unapproved Review Isolation
- **Scenario**: Verify that pending, rejected, or hidden reviews never leak to public API responses (`GET /api/v1/products/{product_id}/reviews`).
- **Priority**: Critical
- **Expected Result**: Public endpoints expose strictly approved reviews only.

---

## 3. Smoke & Integration Test Suite

1. Run `php vendor/bin/phpunit tests/Feature/ReviewTest.php` to verify all review tests.
2. Run `php vendor/bin/phpunit tests/Feature/CustomerOrderTest.php` to verify order integration.
3. Execute `php artisan l5-swagger:generate` to verify Swagger build.
