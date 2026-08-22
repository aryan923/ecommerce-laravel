# Test Cases: Admin Store Settings Module

**Module Name:** Admin Store Settings  
**Module ID:** 37  
**Test Suite File:** `plans/test-cases.admin-settings.md`  
**Specification Reference:** `specifications/feature.admin-settings.spec.md`  
**Plan Reference:** `plans/plan.admin-settings.md`  

---

## 1. Happy Path Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMSET-001` | Retrieve All Grouped Settings | Send `GET /api/v1/admin/settings` with admin Bearer token | Returns 200 OK with settings grouped by module (`general`, `localization`, `commerce`, `seo`) | Planned |
| `TC-ADMSET-002` | Retrieve Group Settings | Send `GET /api/v1/admin/settings/general` | Returns 200 OK with key-value dictionary for general settings | Planned |
| `TC-ADMSET-003` | Update General Settings Group | Send `POST /api/v1/admin/settings/general` with valid payload (`store_name`, `store_email`, `store_phone`) | Returns 200 OK and persists updated settings in DB | Planned |
| `TC-ADMSET-004` | Update Commerce Settings Group | Send `POST /api/v1/admin/settings/commerce` with `guest_checkout: true`, `min_order_value: 100` | Returns 200 OK and updates settings | Planned |
| `TC-ADMSET-005` | List Currencies | Send `GET /api/v1/admin/currencies` | Returns 200 OK with paginated currencies list | Planned |
| `TC-ADMSET-006` | Create Currency | Send `POST /api/v1/admin/currencies` with valid code (`EUR`), symbol (`€`), rate (`0.011000`) | Returns 201 Created and persists currency | Planned |
| `TC-ADMSET-007` | Update Currency Exchange Rate | Send `PUT /api/v1/admin/currencies/{id}` with updated `exchange_rate` | Returns 200 OK with updated rate | Planned |
| `TC-ADMSET-008` | Set Default Currency | Send `POST /api/v1/admin/currencies/{id}/set-default` | Target currency becomes default, old default `is_default` cleared | Planned |
| `TC-ADMSET-009` | View Settings Audit Logs | Retrieve settings audit logs after updating store settings | Returns 200 OK with audit record detailing admin user ID & timestamp | Planned |

---

## 2. Negative & Validation Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMSET-010` | Unauthenticated Access | Send `GET /api/v1/admin/settings` without auth token | Returns 401 Unauthorized | Planned |
| `TC-ADMSET-011` | Invalid Settings Group | Send `GET /api/v1/admin/settings/nonexistent_group` | Returns 404 Not Found | Planned |
| `TC-ADMSET-012` | Invalid Email Format | Send `POST /api/v1/admin/settings/general` with `store_email: "invalid-email"` | Returns 422 Unprocessable Entity | Planned |
| `TC-ADMSET-013` | Invalid Currency Code Length | Send `POST /api/v1/admin/currencies` with `code: "INVALID"` | Returns 422 validation error (must be 3 characters) | Planned |
| `TC-ADMSET-014` | Zero or Negative Exchange Rate | Send `POST /api/v1/admin/currencies` with `exchange_rate: 0` | Returns 422 validation error | Planned |
| `TC-ADMSET-015` | Max Order Value Less Than Min Order Value | Send `POST /api/v1/admin/settings/commerce` with `min_order_value: 500`, `max_order_value: 100` | Returns 422 validation error | Planned |

---

## 3. Permission & RBAC Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMSET-016` | Read-only Admin Access | Access `GET /api/v1/admin/settings` with `settings.view` permission | Operations succeed | Planned |
| `TC-ADMSET-017` | Unauthorized Setting Mutation | Send `POST /api/v1/admin/settings/general` as admin lacking `settings.update` | Returns 403 Forbidden | Planned |
| `TC-ADMSET-018` | Unauthorized Currency Management | Perform currency CRUD as admin lacking `currency.manage` | Returns 403 Forbidden | Planned |
| `TC-ADMSET-019` | Super Admin Full Settings Control | Perform setting updates & currency default switching with `super_admin` role | All operations complete successfully | Planned |

---

## 4. Edge Cases

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMSET-020` | Delete Store Default Currency | Send `DELETE /api/v1/admin/currencies/{id}` for currency where `is_default = true` | Returns 422 Error preventing deletion of default currency | Planned |
| `TC-ADMSET-021` | Duplicate Currency Code | Attempt to create currency with code that already exists in DB | Returns 422 Unique validation error | Planned |
| `TC-ADMSET-022` | Secret Credentials Response Masking | Send `GET /api/v1/admin/settings/payment` | API responses return masked placeholders (`********`) for secret API keys | Planned |
