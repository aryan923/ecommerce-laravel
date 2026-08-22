# Regression Plan: Module 39 — Admin Audit Logs

**Module Name:** Admin Audit Logs & Activity Trail  
**Spec File:** [`specifications/feature.admin-audit-logs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.admin-audit-logs.spec.md)  
**Plan File:** [`plans/plan.admin-audit-logs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.admin-audit-logs.md)  

---

## 1. Impacted Feature Areas

1. **Staff & RBAC Module (Module 38)**:
   - Creating, updating, or toggling staff status must write audit logs without breaking staff API execution time.
   - Creating, updating, or deleting custom roles must write audit logs without disrupting RBAC permissions.
2. **Settings & Tax Module (Module 35 & 36)**:
   - Modifying store settings or tax rates must trigger audit logs while preserving existing settings API response contracts.
3. **Products & Inventory Module (Module 1, 2, 4)**:
   - Changing product prices, deleting products, or adjusting inventory must write audit log records without impacting transaction speed.
4. **Orders & Refunds Module (Module 11, 14, 15)**:
   - Order cancellations and refunds must record audit log payloads.

---

## 2. Regression Test Matrix

| Test ID | Affected Feature | Regression Test Scenario | Expected Result | Priority |
|---|---|---|---|---|
| REG-AUDIT-001 | Staff Management | Create staff user and verify staff response while checking `audit_logs` insertion | Staff user created successfully; 1 audit log created | High |
| REG-AUDIT-002 | Staff Reset Access | Trigger reset access on staff member | Session tokens purged, password updated; 1 audit log created | High |
| REG-AUDIT-003 | Custom Roles | Create custom role with permissions matrix | Role created; `role.create` audit log created | Medium |
| REG-AUDIT-004 | Admin Auth Sanctum | Sanctum auth token verification on `/admin/audit-logs/*` routes | Non-admin/unauthenticated requests return 401/403 | High |
| REG-AUDIT-005 | Frontend Navigation | Admin sidebar navigation & route rendering for `/audit-logs` | Page loads metrics, toolbar, data table, and modal cleanly | High |

---

## 3. Automated Regression Verification Suite

Run all related feature test suites across admin modules to ensure zero regressions:

```bash
docker exec ecom-panel-app php artisan test --filter=AdminAuditLogTest
docker exec ecom-panel-app php artisan test --filter=AdminStaffManagementTest
docker exec ecom-panel-app php artisan test --filter=StoreSettingsManagementTest
docker exec ecom-panel-app php artisan test --filter=TaxManagementTest
```
