# Test Cases: Module 39 — Admin Audit Logs

**Module Name:** Admin Audit Logs & Activity Trail  
**Spec File:** [`specifications/feature.admin-audit-logs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.admin-audit-logs.spec.md)  
**Plan File:** [`plans/plan.admin-audit-logs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.admin-audit-logs.md)  

---

## 1. Happy Path Test Scenarios

### TC-AUDIT-001: Automatic Audit Log Creation on Admin User Creation
- **Precondition**: Super admin authenticated via Sanctum.
- **Action**: Create new staff user via `POST /api/v1/admin/users`.
- **Expected Result**: An entry is created in `audit_logs` with `action = 'admin.create'`, `module = 'staff'`, `actor_id = auth_id`, `old_values = null`, `new_values` containing new staff credentials snapshot.

### TC-AUDIT-002: Automatic Audit Log Creation on Role & Permission Update
- **Precondition**: Super admin authenticated.
- **Action**: Update custom role permissions via `PUT /api/v1/admin/roles/{id}`.
- **Expected Result**: An entry in `audit_logs` with `action = 'role.update'`, `module = 'roles'`, `old_values` (previous permissions), `new_values` (updated permissions).

### TC-AUDIT-003: List Paginated Audit Logs
- **Precondition**: Audit log records exist in database.
- **Action**: Call `GET /api/v1/admin/audit-logs`.
- **Expected Result**: `200 OK` response returning paginated audit records with actor snapshot, action tags, and pagination metadata.

### TC-AUDIT-004: Filter Audit Logs by Module and Date Range
- **Precondition**: Logs exist across multiple modules and dates.
- **Action**: Call `GET /api/v1/admin/audit-logs?module=staff&date_from=2026-08-01&date_to=2026-08-30`.
- **Expected Result**: `200 OK` returning only audit log entries matching `module = 'staff'` within the date window.

### TC-AUDIT-005: Retrieve Single Audit Log Detail & Payload Diff
- **Precondition**: Audit record ID 10 exists.
- **Action**: Call `GET /api/v1/admin/audit-logs/10`.
- **Expected Result**: `200 OK` returning exact record with full `old_values` and `new_values` arrays.

### TC-AUDIT-006: CSV Export of Filtered Audit Logs
- **Precondition**: Authorized admin with `permission:audit-logs.export`.
- **Action**: Call `GET /api/v1/admin/audit-logs/export?module=orders`.
- **Expected Result**: `200 OK` streaming CSV download with headers `ID, Timestamp, Actor Name, Actor Email, Module, Action, Entity Type, Entity ID, IP Address`.

---

## 2. Negative & Permission Test Scenarios

### TC-AUDIT-007: Unauthenticated Access Blocked
- **Precondition**: No bearer token provided.
- **Action**: Call `GET /api/v1/admin/audit-logs`.
- **Expected Result**: `401 Unauthorized`.

### TC-AUDIT-008: Unauthorized Staff User Blocked by RBAC Permission
- **Precondition**: Staff user authenticated without `permission:audit-logs.view`.
- **Action**: Call `GET /api/v1/admin/audit-logs`.
- **Expected Result**: `403 Forbidden`.

### TC-AUDIT-009: Invalid Date Range Validation
- **Precondition**: Admin authenticated.
- **Action**: Call `GET /api/v1/admin/audit-logs?date_from=invalid-date`.
- **Expected Result**: `422 Unprocessable Entity` validation error.

---

## 3. Edge Cases

### TC-AUDIT-010: Audit Trail Intact After Admin User Deletion
- **Precondition**: Staff member `john@example.com` logged actions, then their admin account is deleted.
- **Action**: Fetch audit log entries for historical actions.
- **Expected Result**: `actor_id` becomes `null` (ON DELETE SET NULL), but `actor_name` ("John Doe") and `actor_email` ("john@example.com") remain intact for historical compliance.
