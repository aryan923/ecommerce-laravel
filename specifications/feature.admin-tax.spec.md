# Feature Specification: Admin Tax / GST Management Module

**Module Name:** Admin Tax / GST Management  
**Module ID:** 31  
**Specification File:** `specifications/feature.admin-tax.spec.md`  
**Version:** 1.0  
**Status:** Approved Specification  
**SRS References:** `Requirements/srs_apis.md` (§Tax/GST Services), `Requirements/admin_panel.md` (§27, §43), `Requirements/development_modules.md` (§Module 31)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permissions / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Tax / GST Management module provides store administrators with comprehensive control over store tax configurations, tax classes, multi-component GST rate structures (CGST, SGST, IGST, UTGST), tax-inclusive vs tax-exclusive pricing modes, default tax class settings, and audit logging of all tax administration actions.

Key features include:
1. **Tax Class Administration**: Create, view, update, search, filter, and delete tax classes (e.g., *Standard GST 18%*, *Essential 5%*, *Super Luxury 28%*, *Exempt 0%*).
2. **GST Rate & Component Management**: Manage tax component breakdown rules including Central GST (CGST), State GST (SGST), Integrated GST (IGST), and Union Territory GST (UTGST), along with state code applicability.
3. **Global Tax Mode Configuration**: Configure global store tax mode (`tax_mode`: `tax_inclusive` vs `tax_exclusive`), store origin state/country GST TIN settings, and default tax class fallback.
4. **Audit Logging & Security**: Enforce strict Spatie permission checks (`tax.view`, `tax.create`, `tax.update`, `tax.delete`, `tax.configure`) and automatically create immutable audit log entries whenever tax configurations or rates are modified.

All API endpoints follow standard REST principles, utilize `App\Traits\ApiResponseTrait`, run on `http://localhost:8002`, and feature full OpenAPI 3.0 `@OA` documentation.

---

## 2. Business Flow & Use Cases

### 2.1 Tax Class Management Flow
1. Admin views paginated list of tax classes (`GET /api/v1/admin/tax-classes`).
2. Admin creates a new tax class (`POST /api/v1/admin/tax-classes`):
   - Specifies `name` (e.g. "Standard GST 18%"), `code` (`GST_18`), `description`, `is_default` boolean flag.
3. Admin edits tax class details (`PUT /api/v1/admin/tax-classes/{id}`).
4. Admin sets a tax class as default (`POST /api/v1/admin/tax-classes/{id}/set-default`), which automatically clears the default flag on all other tax classes.
5. System logs an audit entry detailing the admin user ID, IP address, timestamp, and updated attributes.

### 2.2 GST Component Rate Management Flow
1. Admin views rates assigned to a tax class (`GET /api/v1/admin/tax-classes/{id}/rates` or `GET /api/v1/admin/tax-rates`).
2. Admin creates/assigns a tax rate component (`POST /api/v1/admin/tax-rates`):
   - Specifies `tax_class_id`, component `name` (e.g. "CGST 9%"), `rate_type` (`cgst`, `sgst`, `igst`, `utgst`, `flat`, `standard`), `rate` percentage (e.g. `9.0000`), `state_code` (e.g. `MH`), and `country_code` (`IN`).
3. System validates that intra-state split (CGST + SGST or CGST + UTGST) matches total tax percentage when assigned for specific jurisdictions.
4. System records audit log entry for rate creation/modification.

### 2.3 Store Tax Configuration & Pricing Toggle Flow
1. Admin opens Store Tax Settings panel (`GET /api/v1/admin/tax/settings`).
2. Admin toggles tax calculation mode (`POST /api/v1/admin/tax/settings`):
   - `pricing_mode`: `tax_inclusive` (product prices already contain tax) vs `tax_exclusive` (tax added at checkout).
   - `default_tax_class_id`: Fallback tax class ID for products without an explicit tax class.
   - `store_gstin`: Store GST Identification Number (e.g. `27AAAAA0000A1Z5`).
   - `store_state_code`: Origin state code (e.g. `MH` for Maharashtra) used for intra-state vs inter-state determination.
3. System saves settings to store configuration registry and logs an audit record (`tax_settings_updated`).

---

## 3. Functional Requirements

- **FR-ADMTX-001**: System shall provide CRUD endpoints for managing tax classes (`tax_classes` table).
- **FR-ADMTX-002**: System shall support setting a single tax class as the system-wide `is_default` class.
- **FR-ADMTX-003**: System shall provide CRUD endpoints for tax rates (`tax_rates` table) supporting rate types: `cgst`, `sgst`, `igst`, `utgst`, `flat`, `standard`.
- **FR-ADMTX-004**: System shall allow filtering tax rates by `tax_class_id`, `type`, `state_code`, and `country_code`.
- **FR-ADMTX-005**: System shall store and expose global tax settings (`pricing_mode`, `default_tax_class_id`, `store_gstin`, `store_state_code`).
- **FR-ADMTX-006**: System shall automatically create an audit log record (`audit_logs` table) for every create, update, delete, or setting change action performed on tax resources.
- **FR-ADMTX-007**: System shall enforce Spatie permission controls (`tax.view`, `tax.create`, `tax.update`, `tax.delete`, `tax.configure`).
- **FR-ADMTX-008**: System shall prevent deleting a tax class if it is currently assigned to active products, unless re-assigned.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4
- **Authentication**: Sanctum Guard (`auth:sanctum`)
- **Authorization**: Spatie Permissions (`permission:tax.view|tax.create|tax.update|tax.delete|tax.configure`)
- **API Trait**: `App\Traits\ApiResponseTrait`
- **Target URL / Port**: `http://localhost:8002`
- **API Documentation**: OpenAPI 3.0 `@OA` docblocks on all controller action methods.

---

## 5. Database Schema Specification

### 5.1 `tax_classes` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Unique tax class ID |
| `name` | `varchar(150)` | NOT NULL | Tax class title (e.g. "Standard GST 18%") |
| `code` | `varchar(50)` | NOT NULL, Unique | Machine code (e.g. "GST_18") |
| `description` | `text` | NULLable | Overview & notes |
| `is_default` | `boolean` | DEFAULT `false` | System default tax class flag |
| `status` | `enum` | `'active'`, `'inactive'` DEFAULT `'active'` | Operational status |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Last update timestamp |

### 5.2 `tax_rates` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Unique rate ID |
| `tax_class_id` | `bigint` | Foreign Key → `tax_classes.id` (ON DELETE CASCADE) | Parent tax class |
| `name` | `varchar(150)` | NOT NULL | Component name (e.g. "CGST 9%") |
| `type` | `enum` | `'cgst'`, `'sgst'`, `'igst'`, `'utgst'`, `'flat'`, `'standard'` | Rate type classification |
| `rate` | `decimal(8,4)` | NOT NULL, DEFAULT `0.0000` | Percentage rate (e.g. `9.0000`) |
| `state_code` | `varchar(10)` | NULLable, Index | Applicable state (e.g. "MH") |
| `country_code` | `varchar(2)` | DEFAULT `'IN'` | Applicable country code |
| `is_active` | `boolean` | DEFAULT `true` | Rate status toggle |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | Last update timestamp |

---

## 6. API Requirements

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/v1/admin/tax-classes` | List paginated tax classes | `tax.view` |
| `POST` | `/api/v1/admin/tax-classes` | Create new tax class | `tax.create` |
| `GET` | `/api/v1/admin/tax-classes/{id}` | Get single tax class details | `tax.view` |
| `PUT` | `/api/v1/admin/tax-classes/{id}` | Update tax class | `tax.update` |
| `DELETE` | `/api/v1/admin/tax-classes/{id}` | Delete tax class | `tax.delete` |
| `POST` | `/api/v1/admin/tax-classes/{id}/set-default` | Set tax class as default | `tax.configure` |
| `GET` | `/api/v1/admin/tax-rates` | List paginated tax rates | `tax.view` |
| `POST` | `/api/v1/admin/tax-rates` | Create new tax rate component | `tax.create` |
| `PUT` | `/api/v1/admin/tax-rates/{id}` | Update tax rate | `tax.update` |
| `DELETE` | `/api/v1/admin/tax-rates/{id}` | Delete tax rate | `tax.delete` |
| `GET` | `/api/v1/admin/tax/settings` | Get global tax configuration | `tax.view` |
| `POST` | `/api/v1/admin/tax/settings` | Update global tax configuration | `tax.configure` |

---

## 7. UI Requirements (Admin Panel)

1. **Tax Classes View Tab**: Card/Grid layout listing active tax classes with badge indicator for the default tax class, assigned rates summary, and quick edit/delete buttons.
2. **Tax Rates Table Tab**: Comprehensive data table listing components (Name, Type, Rate %, State, Country, Status) with filter dropdowns for Tax Class and Component Type.
3. **Global Tax Settings Tab**: Form with radio buttons for Pricing Mode (`Tax Inclusive` vs `Tax Exclusive`), Default Tax Class dropdown, Store GSTIN input, and Store Origin State dropdown.
4. **Audit Log Panel**: Table displaying historical tax rule modifications including timestamp, admin user, action type, and JSON diff.

---

## 8. Validation Rules

- `name`: Required, string, max 150 characters.
- `code`: Required on store, string, max 50 characters, unique in `tax_classes`.
- `type`: Required on tax rate, in: `cgst`, `sgst`, `igst`, `utgst`, `flat`, `standard`.
- `rate`: Required on tax rate, numeric, min 0, max 100.
- `pricing_mode`: In: `tax_inclusive`, `tax_exclusive`.
- `store_gstin`: Nullable, string, regex `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/` (standard 15-digit GSTIN pattern).

---

## 9. Permission Rules

- `tax.view`: View tax classes, rates, and configuration.
- `tax.create`: Create new tax classes and rates.
- `tax.update`: Edit existing tax classes and rates.
- `tax.delete`: Delete tax classes and rates.
- `tax.configure`: Modify global tax pricing mode, default tax class, and audit settings.

---

## 10. Business Rules & Audit Logging

1. Setting a tax class as `is_default = true` automatically updates all other tax classes to `is_default = false`.
2. Tax configuration changes are saved to the `system_settings` or `store_settings` repository.
3. Every modification to `tax_classes`, `tax_rates`, or tax settings generates an entry in `audit_logs` containing `user_id`, `action`, `model_type`, `model_id`, `old_values`, `new_values`, `ip_address`, and `user_agent`.

---

## 11. Acceptance Criteria

- [ ] All 12 API endpoints implemented with Sanctum authentication & Spatie permissions.
- [ ] Setting default tax class correctly clears previous default.
- [ ] Audit logs captured for every tax mutation.
- [ ] Comprehensive PHPUnit tests for Tax Admin APIs passing.
- [ ] Vite production bundle builds without errors.
