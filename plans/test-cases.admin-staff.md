# Test Cases: Admin Staff, Roles & Permissions (Module 38)

These test cases validate the functional, permission, and security requirements of Module 38 defined in [`specifications/feature.admin-staff.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.admin-staff.spec.md).

---

## Staff Management Test Cases

### TC-STAFF-001: Unauthenticated User Cannot Access Staff API
- **Preconditions**: No bearer token provided.
- **Steps**: Call `GET /api/v1/admin/users`.
- **Expected Result**: API returns `401 Unauthorized`.

### TC-STAFF-002: Unauthorized Staff Member Cannot Access Staff List
- **Preconditions**: Staff logged in without `staff.view` or `super_admin` role.
- **Steps**: Call `GET /api/v1/admin/users`.
- **Expected Result**: API returns `403 Forbidden`.

### TC-STAFF-003: Super Admin Can Retrieve Paginated Staff Members
- **Preconditions**: Super Admin token provided.
- **Steps**: Call `GET /api/v1/admin/users`.
- **Expected Result**: `200 OK` returning paginated staff users with assigned roles.

### TC-STAFF-004: Filter Staff Members by Search and Role
- **Preconditions**: Multiple staff users in database.
- **Steps**: Call `GET /api/v1/admin/users?search=Jane&role_id=2`.
- **Expected Result**: Returns matching staff records.

### TC-STAFF-005: Create Staff Member with Role Assignment
- **Preconditions**: Authorized Super Admin token.
- **Steps**: Call `POST /api/v1/admin/users` with valid payload (`name`, `email`, `password`, `role_ids`).
- **Expected Result**: `201 Created`, user saved in DB with assigned roles.

### TC-STAFF-006: Duplicate Staff Email Validation
- **Preconditions**: Existing staff email in DB (`staff@example.com`).
- **Steps**: Call `POST /api/v1/admin/users` with `email: "staff@example.com"`.
- **Expected Result**: `422 Unprocessable Content` with validation error message.

### TC-STAFF-007: Update Staff Member Profile & Roles
- **Preconditions**: Staff member ID 2 exists.
- **Steps**: Call `PUT /api/v1/admin/users/2` with updated `name` and `role_ids`.
- **Expected Result**: `200 OK`, staff record and roles updated.

### TC-STAFF-008: Toggle Staff Status to Disabled Revokes Tokens
- **Preconditions**: Staff member active with Sanctum tokens.
- **Steps**: Call `PUT /api/v1/admin/users/2` with `status: "disabled"`.
- **Expected Result**: `200 OK`, status set to `disabled`, user tokens revoked.

### TC-STAFF-009: Reset Staff Password / Access
- **Preconditions**: Active staff member.
- **Steps**: Call `POST /api/v1/admin/users/2/reset-access` with `new_password: "NewPassword123!"`.
- **Expected Result**: `200 OK`, password updated successfully.

---

## Role & Permission Test Cases

### TC-ROLE-001: List Roles with Count Aggregations
- **Steps**: Call `GET /api/v1/admin/roles`.
- **Expected Result**: `200 OK` with `permissions_count` and `staff_count` fields for each role.

### TC-ROLE-002: Create Custom Role with Permission Assignments
- **Steps**: Call `POST /api/v1/admin/roles` with `{ name: "Order Specialist", permission_ids: [1, 2, 3] }`.
- **Expected Result**: `201 Created`, custom role and pivot permissions created.

### TC-ROLE-003: Prevent Deleting Built-In Super Admin Role
- **Steps**: Call `DELETE /api/v1/admin/roles/{super_admin_role_id}`.
- **Expected Result**: `403 Forbidden` or `422 Unprocessable Content` with protection error.

### TC-ROLE-004: Prevent Deleting Custom Role Assigned to Active Staff
- **Steps**: Call `DELETE /api/v1/admin/roles/{assigned_role_id}`.
- **Expected Result**: `422 Unprocessable Content` requiring staff re-assignment first.

### TC-ROLE-005: Retrieve Grouped Permission Matrix
- **Steps**: Call `GET /api/v1/admin/permissions`.
- **Expected Result**: `200 OK` with permissions grouped by module key.
