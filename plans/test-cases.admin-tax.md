# Test Cases: Admin Tax / GST Management Module

**Module Name:** Admin Tax / GST Management  
**Module ID:** 31  
**Test Suite File:** `plans/test-cases.admin-tax.md`  
**Specification Reference:** `specifications/feature.admin-tax.spec.md`  

---

## 1. Happy Path Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMTX-001` | List Tax Classes | Send `GET /api/v1/admin/tax-classes` with Bearer token | Returns 200 OK with paginated tax classes list | Planned |
| `TC-ADMTX-002` | Create Tax Class | Send `POST /api/v1/admin/tax-classes` with valid payload | Returns 201 Created and persists record | Planned |
| `TC-ADMTX-003` | Set Default Tax Class | Send `POST /api/v1/admin/tax-classes/{id}/set-default` | Target class becomes default, old default cleared | Planned |
| `TC-ADMTX-004` | Create CGST/SGST/IGST Rates | Send `POST /api/v1/admin/tax-rates` with component details | Rate created and associated with tax class | Planned |
| `TC-ADMTX-005` | Update Global Tax Mode | Send `POST /api/v1/admin/tax/settings` with `pricing_mode: tax_inclusive` | Settings updated and saved | Planned |
| `TC-ADMTX-006` | View Tax Audit Logs | Retrieve audit logs after tax setting modification | Audit log entry present with user ID & timestamp | Planned |

---

## 2. Negative & Validation Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMTX-007` | Unauthenticated Access | Send `GET /api/v1/admin/tax-classes` without token | Returns 401 Unauthorized | Planned |
| `TC-ADMTX-008` | Missing Required Fields | Send `POST /api/v1/admin/tax-classes` with empty body | Returns 422 Unprocessable Entity with error keys | Planned |
| `TC-ADMTX-009` | Invalid Rate Percentage | Send `POST /api/v1/admin/tax-rates` with `rate: -5` | Returns 422 validation error | Planned |
| `TC-ADMTX-010` | Invalid Pricing Mode | Send `POST /api/v1/admin/tax/settings` with `pricing_mode: invalid_mode` | Returns 422 validation error | Planned |

---

## 3. Permission & RBAC Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMTX-011` | Unauthorized Admin Role | Perform tax mutation as admin lacking `tax.create` permission | Returns 403 Forbidden | Planned |
| `TC-ADMTX-012` | Super Admin Full Access | Perform all tax endpoints with `super_admin` role | All operations complete successfully | Planned |

---

## 4. Edge Cases

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMTX-013` | Delete Default Tax Class | Attempt to delete tax class marked as default | Rejection or explicit fallback default assignment | Planned |
| `TC-ADMTX-014` | Duplicate Code | Create tax class with existing code | Returns 422 Validation Error for unique constraint | Planned |
