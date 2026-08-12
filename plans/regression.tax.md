# Regression Strategy: Tax / GST Engine Module

**Module Name:** Tax / GST Engine  
**Module ID:** 14  
**Regression File:** `plans/regression.tax.md`  
**Specification:** `specifications/feature.tax.spec.md`  
**Plan:** `plans/plan.tax.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Tax / GST Engine impacts:
- **Module 06 Product Catalog**: Product price display (`tax_class_id` assignment).
- **Module 12 Shopping Cart**: Cart item tax estimation and grand total calculation.
- **Module 13 Coupons & Discounts**: Pre-tax vs post-tax coupon discount ordering.
- **Module 15 Shipping Module**: Tax on shipping fees (e.g. 18% GST on delivery charges).
- **Module 16 Checkout & Order Creation**: Persisting tax breakdown (`cgst`, `sgst`, `igst`) per line item in order invoice snapshot.

---

## 2. Regression Scenarios

### REG-TAX-001: Intra-State vs Inter-State GST Precision
- **Scenario**: Verify that transactions within the store origin state consistently split tax equally between CGST and SGST, whereas cross-border state transactions apply single IGST rate.
- **Priority**: Critical
- **Expected Result**: Exact tax breakdown according to origin vs destination state rules.

### REG-TAX-002: Tax-Inclusive vs Tax-Exclusive Price Integrity
- **Scenario**: Verify that switching a rate between `is_inclusive = true` and `is_inclusive = false` updates final payable totals without rounding errors.
- **Priority**: Critical
- **Expected Result**: Decimal math holds precision to 2 decimal places.

---

## 3. Smoke & Integration Test Suite

1. Run `php artisan test --filter=TaxTest` to verify all tax engine tests.
2. Execute `php artisan l5-swagger:generate` to verify Swagger build.
