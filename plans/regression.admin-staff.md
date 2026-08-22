# Regression Suite: Admin Staff, Roles & Permissions (Module 38)

This regression suite ensures that introducing or modifying Module 38 features does not break existing authentication, RBAC authorization, order management, catalog management, or store settings API contracts.

---

## Regression Scenarios

### REG-STAFF-001: Sanctum Token Authentication & RBAC Middleware Integrity
- **Objective**: Verify that `AdminUser` permission checks (`hasPermission()`, `isSuperAdmin()`) operate consistently across all protected endpoints.
- **Verification**: Run `php artisan test --filter=AdminAuthTest`.

### REG-STAFF-002: Product & Catalog Admin Operations
- **Objective**: Verify that product creation, catalog management, and media uploads respect permissions.
- **Verification**: Run `php artisan test --filter=ProductManagementTest`.

### REG-STAFF-003: Store Settings Administration & Audit Logging
- **Objective**: Verify that store settings updates continue to function and record audit logs correctly.
- **Verification**: Run `php artisan test --filter=StoreSettingsManagementTest`.

### REG-STAFF-004: Frontend Admin Dashboard Build Verification
- **Objective**: Ensure that bundling `StaffPage.jsx` does not introduce syntax errors, broken imports, or missing dependencies.
- **Verification**: Run `npm run build`.
