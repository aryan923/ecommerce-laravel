# Regression Strategy: Admin Tax / GST Management Module

**Module Name:** Admin Tax / GST Management  
**Module ID:** 31  
**Regression Document:** `plans/regression.admin-tax.md`  
**Specification Reference:** `specifications/feature.admin-tax.spec.md`  

---

## 1. Affected Existing Features

- **Product Catalog Management (Module 3 / Module 24)**: Tax class selection on products.
- **Cart & Storefront Tax Engine (Module 14 / Module 16)**: Line-item and order tax calculations.
- **Checkout & Payment (Module 17 / Module 18)**: Final invoice tax breakdown (CGST, SGST, IGST).
- **Admin Audit Logging System**: System audit trail persistence.

---

## 2. Regression Test Scenarios

| Scenario ID | Affected Component | Test Description | Expected Result | Priority |
|---|---|---|---|---|
| `REG-TX-001` | Product Tax Assignment | Assign updated tax class to product and view storefront product details | Product reference matches new tax class | High |
| `REG-TX-002` | Cart Tax Recalculation | Toggle store pricing mode from `tax_exclusive` to `tax_inclusive` | Cart recalculates tax totals accurately | High |
| `REG-TX-003` | GST Component Breakdown | Test checkout with intra-state (`MH` to `MH`) shipping address | Invoice displays split CGST (9%) + SGST (9%) | Critical |
| `REG-TX-004` | Inter-State IGST | Test checkout with inter-state (`MH` to `KA`) shipping address | Invoice displays single IGST (18%) | Critical |
| `REG-TX-005` | Audit Log Integrity | Perform tax setting change and check system audit log table | Audit entry recorded with old and new values | Medium |

---

## 3. Integration & Smoke Test Verification

- **Smoke Suite**:
  1. `docker exec ecom-panel-app php artisan test --filter=TaxManagementTest`
  2. `docker exec ecom-panel-app php artisan test --filter=ShippingManagementTest`
- **Build Verification**:
  1. `npm run build`
