# Test Cases: Tax / GST Engine Module

**Module Name:** Tax / GST Engine  
**Module ID:** 14  
**Test File:** `plans/test-cases.tax.md`  
**Specification:** `specifications/feature.tax.spec.md`  
**Plan:** `plans/plan.tax.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-TAX-001: Admin Create Tax Class
- **Preconditions**: Authenticated Admin with `manage-tax` permission.
- **Input**: `POST /api/v1/admin/tax-classes` with `name: "Standard GST 18%", description: "Standard GST rate for electronics"`.
- **Expected Result**: HTTP 201 Created, `tax_class` record saved in database.

### TC-TAX-002: Admin Create Intra-State Tax Rates (CGST + SGST)
- **Input**:
  - `POST /api/v1/admin/tax-rates` with `tax_class_id: 1, name: "CGST 9%", type: "cgst", rate: 9.00, state_code: "MH"`.
  - `POST /api/v1/admin/tax-rates` with `tax_class_id: 1, name: "SGST 9%", type: "sgst", rate: 9.00, state_code: "MH"`.
- **Expected Result**: HTTP 201 Created for both rates.

### TC-TAX-003: Admin Create Inter-State Tax Rate (IGST)
- **Input**: `POST /api/v1/admin/tax-rates` with `tax_class_id: 1, name: "IGST 18%", type: "igst", rate: 18.00`.
- **Expected Result**: HTTP 201 Created.

### TC-TAX-004: Calculate Intra-State GST (Same State: MH -> MH)
- **Preconditions**: Store Origin State: `MH`. Shipping State: `MH`. Tax Class 1 (CGST 9% + SGST 9%). Product 1 (Price: 1000.00, Tax Exclusive).
- **Input**: `POST /api/v1/tax/calculate` with `shipping_state_code: "MH", items: [{product_id: 1, amount: 1000.00}]`.
- **Expected Result**: HTTP 200 OK, `cgst_amount: 90.00`, `sgst_amount: 90.00`, `igst_amount: 0.00`, `total_tax: 180.00`, `grand_total: 1180.00`.

### TC-TAX-005: Calculate Inter-State GST (Different State: MH -> KA)
- **Preconditions**: Store Origin State: `MH`. Shipping State: `KA` (Karnataka). Tax Class 1 (IGST 18%). Product 1 (Price: 1000.00, Tax Exclusive).
- **Input**: `POST /api/v1/tax/calculate` with `shipping_state_code: "KA", items: [{product_id: 1, amount: 1000.00}]`.
- **Expected Result**: HTTP 200 OK, `cgst_amount: 0.00`, `sgst_amount: 0.00`, `igst_amount: 180.00`, `total_tax: 180.00`, `grand_total: 1180.00`.

### TC-TAX-006: Calculate Tax-Inclusive Pricing Math
- **Preconditions**: Product 1 has `is_inclusive = true`, Price: 1180.00. Tax Rate: 18%.
- **Input**: `POST /api/v1/tax/calculate` with `shipping_state_code: "KA", items: [{product_id: 1, amount: 1180.00}]`.
- **Expected Result**: HTTP 200 OK, `base_amount: 1000.00`, `total_tax: 180.00`, `grand_total: 1180.00`.

---

## 2. Negative & Edge Case Scenarios

### TC-TAX-007: Calculate Tax for Product Without Tax Class (Fallback Zero Rate)
- **Input**: `POST /api/v1/tax/calculate` for product with `tax_class_id = null`.
- **Expected Result**: HTTP 200 OK, `total_tax: 0.00`.

### TC-TAX-008: Admin Delete Tax Class with Assigned Products Warning
- **Input**: `DELETE /api/v1/admin/tax-classes/1`.
- **Expected Result**: Soft delete or remove association, returning HTTP 200 OK.
