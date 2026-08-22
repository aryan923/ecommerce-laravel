# Regression Strategy: Admin Store Settings Module

**Module Name:** Admin Store Settings  
**Module ID:** 37  
**Regression Document:** `plans/regression.admin-settings.md`  
**Specification Reference:** `specifications/feature.admin-settings.spec.md`  
**Plan Reference:** `plans/plan.admin-settings.md`  

---

## 1. Affected Existing Features

- **Storefront Identity & Header Components**: Displaying store name, logo, support contact details across customer header/footer.
- **Cart & Checkout Workflow (Module 17 / Module 18)**: Guest checkout enforcement, minimum/maximum order value constraints, default store currency formatting.
- **Tax Management Engine (Module 31)**: Global tax inclusive/exclusive toggle and GST origin state settings.
- **Multi-Currency Pricing Engine**: Conversion of product prices and order totals when currency switching is enabled.
- **SEO & Meta Tag Generators**: Dynamic rendering of meta titles, meta descriptions, and OpenGraph tags on public pages.
- **System Audit Trail**: Centralized tracking of administrative setting modifications.

---

## 2. Regression Test Scenarios

| Scenario ID | Affected Component | Test Description | Expected Result | Priority |
|---|---|---|---|---|
| `REG-SET-001` | Store Identity Update | Update Store Name in General Settings and inspect storefront homepage header | Updated Store Name is reflected across storefront pages | High |
| `REG-SET-002` | Guest Checkout Enforcement | Disable Guest Checkout in Commerce Settings and attempt storefront checkout without login | User is redirected to Login / Authentication prompt | Critical |
| `REG-SET-003` | Minimum Order Value Restriction | Set Minimum Order Value to 500 and attempt checkout with cart total of 300 | Checkout blocks order creation with clear minimum threshold error | Critical |
| `REG-SET-004` | Default Currency Format | Set default store currency to `INR` (`₹`) and verify cart & checkout price displays | All amounts render with `₹` symbol and correct decimal formatting | High |
| `REG-SET-005` | Currency Rate Conversion | Add USD currency with rate `0.012` and convert product base price | Product pricing correctly reflects converted rate | High |
| `REG-SET-006` | Global SEO Metadata Override | Change default store meta title and inspect rendered `<title>` tag on un-customized page | Page head includes new global default meta title | Medium |
| `REG-SET-007` | Settings Audit Log Recording | Change store setting and query `settings_audit_logs` | Audit record logged with administrative user ID, timestamp, and diff | Medium |

---

## 8. Integration & Verification Commands

- **Backend Automated Unit & Feature Tests**:
  ```bash
  php artisan test --filter=StoreSettingsManagementTest
  ```

- **Full Suite Regression Checks**:
  ```bash
  php artisan test --filter=CheckoutTest
  php artisan test --filter=TaxManagementTest
  ```

- **Frontend Compilation Verification**:
  ```bash
  npm run build
  ```
