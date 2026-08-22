# Feature Specification: Admin Store Settings Module

**Module Name:** Admin Store Settings  
**Module ID:** 37  
**Specification File:** `specifications/feature.admin-settings.spec.md`  
**Version:** 1.0  
**Status:** Approved Specification  
**SRS References:** `Requirements/srs_apis.md` (§72–§73), `Requirements/admin_panel.md` (§40–§44), `Requirements/development_modules.md` (§Module 37)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permissions / React / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The **Admin Store Settings Module** provides store administrators with a unified, centralized control center to configure global e-commerce operation settings, store identity, localization parameters, commerce and order workflow controls, SEO configurations, payment gateway & shipping integration defaults, and multi-currency management.

Key functional capabilities include:
1. **Store Identity & General Settings**: Store name, logo, favicon, official support email, phone number, physical store address, and store tax identification / GSTIN.
2. **Localization & Formatting Settings**: Default currency (e.g. INR), default timezone (e.g. Asia/Kolkata), date format (`Y-m-d`, `d/m/Y`, `m/d/Y`), number format, and default language/locale.
3. **Commerce & Operational Settings**: Guest checkout toggle, automated inventory tracking toggle, product customer reviews toggle, minimum order value, and maximum order value limits.
4. **Integration Summaries & Gateways**: Centralized overview for Payment Gateway configurations (Razorpay, Stripe, PayPal, COD) and Shipping Provider settings.
5. **SEO & Search Engine Configuration**: Store-wide default meta title, meta description, default OpenGraph (OG) image, sitemap status, and robots text directives.
6. **Currencies & Exchange Rate Management**: Full CRUD interface for supported store currencies (Code, Name, Symbol, Exchange Rate relative to base currency, Decimal places, Default status flag).
7. **Audit Logging & Security**: Strict Spatie RBAC permission protection (`settings.view`, `settings.update`, `settings.configure`, `currency.view`, `currency.manage`) and audit logging for every configuration change.

All backend API endpoints follow standard RESTful conventions, utilize `App\Traits\ApiResponseTrait`, operate on `http://localhost:8002`, and feature OpenAPI 3.0 `@OA` documentation.

---

## 2. Business Flow & Use Cases

### 2.1 Viewing Store Settings
1. Administrator navigates to **Store Settings** in the Admin Panel (`resources/js/admin/pages/SettingsPage.jsx`).
2. System calls `GET /api/v1/admin/settings` to retrieve all key-value settings grouped by domain (`general`, `localization`, `commerce`, `seo`, `payment`, `shipping`, `tax`).
3. Frontend populates setting forms with stored values, displaying appropriate toggles, input fields, and drop-down selectors.

### 2.2 Updating Settings Group
1. Administrator modifies parameters within a settings group (e.g., updates Store Support Email or Minimum Order Value in Commerce Settings).
2. Administrator clicks **Save Settings**.
3. Frontend submits `POST /api/v1/admin/settings/{group}` with updated key-value pairs.
4. Backend validates input payload according to group-specific rules.
5. Backend updates or inserts values in the `store_settings` table, invalidates setting cache, and logs an entry in `settings_audit_logs`.
6. System returns a success response via `ApiResponseTrait`.

### 2.3 Managing Store Currencies
1. Administrator selects the **Currencies** tab (`GET /api/v1/admin/currencies`).
2. System renders a data table displaying all configured currencies (e.g., INR, USD, EUR, GBP) along with exchange rates, symbol, and default status.
3. Administrator creates a new currency (`POST /api/v1/admin/currencies`) or updates exchange rates (`PUT /api/v1/admin/currencies/{id}`).
4. Administrator sets a currency as default (`POST /api/v1/admin/currencies/{id}/set-default`), which automatically resets `is_default = false` on all other currencies.

---

## 3. Functional Requirements

- **FR-ADMSET-001**: System shall maintain key-value settings grouped into categories: `general`, `localization`, `commerce`, `seo`, `payment`, `shipping`, `tax`.
- **FR-ADMSET-002**: System shall allow updating settings by group endpoint `POST /api/v1/admin/settings/{group}`.
- **FR-ADMSET-003**: System shall store general identity details: store name, store logo URL, favicon URL, store email, support phone, address, store GSTIN/Tax ID.
- **FR-ADMSET-004**: System shall store localization preferences: default currency code, timezone, date format, number format, and default language.
- **FR-ADMSET-005**: System shall store commerce options: guest checkout allowed (`true`/`false`), stock management enabled (`true`/`false`), reviews enabled (`true`/`false`), minimum order value, maximum order value.
- **FR-ADMSET-006**: System shall store global SEO parameters: default meta title, default meta description, default OG image URL, sitemap enabled status, and custom robots.txt directives.
- **FR-ADMSET-007**: System shall provide CRUD endpoints for managing multi-currency records (`currencies` table).
- **FR-ADMSET-008**: System shall enforce that exactly one currency is flagged as `is_default = true`.
- **FR-ADMSET-009**: System shall prevent deletion of the default currency.
- **FR-ADMSET-010**: System shall write an audit log entry for every setting update or currency modification.
- **FR-ADMSET-011**: System shall mask sensitive API keys or secret credentials in settings API responses.
- **FR-ADMSET-012**: System shall enforce Spatie permissions (`settings.view`, `settings.update`, `settings.configure`, `currency.view`, `currency.manage`).

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4
- **Authentication**: Sanctum Guard (`auth:sanctum`)
- **Authorization**: Spatie Permissions (`permission:settings.view|settings.update|settings.configure|currency.view|currency.manage`)
- **API Response Trait**: `App\Traits\ApiResponseTrait`
- **Target URL / Port**: `http://localhost:8002`
- **API Documentation**: OpenAPI 3.0 `@OA` docblocks on all controller methods.

---

## 5. Database Schema Specification

### 5.1 `store_settings` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Unique setting record ID |
| `group` | `varchar(50)` | NOT NULL, Index | Group classification (`general`, `localization`, `commerce`, `seo`, `payment`, `shipping`) |
| `key` | `varchar(100)` | NOT NULL, Unique Index | Unique key identifier (e.g. `store_name`, `guest_checkout`) |
| `value` | `text` | NULLable | Stored setting value (serialized JSON or string) |
| `type` | `enum` | `'string'`, `'boolean'`, `'integer'`, `'float'`, `'json'` DEFAULT `'string'` | Data type cast |
| `is_public` | `boolean` | DEFAULT `false` | Whether setting is exposed to public store API |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Modification timestamp |

### 5.2 `currencies` Table (Enhancement Verification)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Currency ID |
| `code` | `varchar(10)` | NOT NULL, Unique | ISO currency code (e.g., `INR`, `USD`, `EUR`) |
| `name` | `varchar(100)` | NOT NULL | Full name (e.g., "Indian Rupee") |
| `symbol` | `varchar(10)` | NOT NULL | Symbol (e.g., `₹`, `$`, `€`) |
| `exchange_rate` | `decimal(12,6)` | NOT NULL, DEFAULT `1.000000` | Rate relative to base currency |
| `decimal_places` | `tinyint` | DEFAULT `2` | Number of decimal places for formatting |
| `is_default` | `boolean` | DEFAULT `false` | Default store currency indicator |
| `status` | `enum` | `'active'`, `'inactive'` DEFAULT `'active'` | Operational status |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Modification timestamp |

### 5.3 `settings_audit_logs` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Audit log ID |
| `admin_user_id` | `bigint` | Foreign Key → `admin_users.id` (ON DELETE SET NULL) | Admin who made change |
| `group` | `varchar(50)` | NOT NULL | Settings group updated |
| `action` | `varchar(50)` | NOT NULL | Action type (`settings_updated`, `currency_created`, etc.) |
| `old_values` | `json` | NULLable | State before modification |
| `new_values` | `json` | NULLable | State after modification |
| `ip_address` | `varchar(45)` | NULLable | Origin IP address |
| `created_at` | `timestamp` | NULLable | Action timestamp |

---

## 6. API Requirements

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/v1/admin/settings` | Get all store settings grouped by module | `settings.view` |
| `GET` | `/api/v1/admin/settings/{group}` | Get settings for specific group | `settings.view` |
| `POST` | `/api/v1/admin/settings/{group}` | Bulk update settings for specific group | `settings.update` |
| `GET` | `/api/v1/admin/currencies` | List paginated currencies | `currency.view` |
| `POST` | `/api/v1/admin/currencies` | Create new currency | `currency.manage` |
| `GET` | `/api/v1/admin/currencies/{id}` | Get single currency details | `currency.view` |
| `PUT` | `/api/v1/admin/currencies/{id}` | Update currency | `currency.manage` |
| `DELETE` | `/api/v1/admin/currencies/{id}` | Delete currency | `currency.manage` |
| `POST` | `/api/v1/admin/currencies/{id}/set-default` | Set currency as store default | `currency.manage` |
| `GET` | `/api/v1/admin/settings/audit-logs` | Retrieve settings audit logs | `settings.configure` |

---

## 7. UI Requirements (Admin Panel)

The frontend page `resources/js/admin/pages/SettingsPage.jsx` shall provide a tabbed administration interface:

1. **General & Store Info Tab**:
   - Store Name, Store Support Email, Phone, Address textarea, Logo media picker, Favicon media picker, Store Tax ID / GSTIN input field.
2. **Localization Tab**:
   - Default Currency dropdown, Timezone selector, Date format picker (`Y-m-d`, `d/m/Y`, `m/d/Y`), Number format dropdown, Default Language.
3. **Commerce & Orders Tab**:
   - Toggle switch for Guest Checkout.
   - Toggle switch for Inventory Tracking.
   - Toggle switch for Customer Reviews.
   - Numeric inputs for Minimum Order Value and Maximum Order Value.
4. **SEO & Meta Tab**:
   - Store Default Meta Title (with character counter).
   - Store Default Meta Description (with character counter).
   - Default OpenGraph Image URL picker.
   - Sitemap Status toggle.
   - Custom Robots.txt directives textarea.
5. **Currencies Management Tab**:
   - Table of currencies with columns: Code, Name, Symbol, Exchange Rate, Decimals, Default Badge, Status Badge, Actions (Edit, Set Default, Delete).
   - Modal dialog for adding/editing currencies.
6. **Audit Logs Tab**:
   - Data table displaying settings change history with timestamps, admin name, group, and JSON diff modal.

---

## 8. Validation Rules

- `store_name`: Optional/Required on group save, string, max 255.
- `store_email`: Optional/Required on group save, valid email format.
- `store_phone`: Nullable, string, max 30.
- `timezone`: String, valid PHP timezone identifier (e.g. `Asia/Kolkata`, `UTC`).
- `date_format`: String, in: `Y-m-d`, `d/m/Y`, `m/d/Y`, `d-m-Y`.
- `guest_checkout`: Boolean.
- `stock_management`: Boolean.
- `reviews_enabled`: Boolean.
- `min_order_value`: Nullable, numeric, min 0.
- `max_order_value`: Nullable, numeric, min 0, greater than or equal to `min_order_value`.
- `code` (Currency): Required on create, string, length 3, uppercase (e.g. `USD`).
- `symbol` (Currency): Required on create, string, max 10.
- `exchange_rate` (Currency): Required, numeric, min 0.000001.

---

## 9. Permission Rules

- `settings.view`: Allows reading store settings and currency lists.
- `settings.update`: Allows saving changes to general, localization, commerce, and SEO settings.
- `settings.configure`: Access to integration secrets and viewing settings audit logs.
- `currency.view`: Allows viewing currency list and rates.
- `currency.manage`: Allows creating, updating, deleting, and setting default currency.

---

## 10. Business Rules

1. **Base Currency Benchmark**: All non-default currencies store exchange rates relative to the base default currency (`exchange_rate = 1.000000` for default currency).
2. **Default Currency Protection**: Deleting a currency that is marked `is_default = true` is strictly prohibited.
3. **Secret Masking**: Sensitive keys (API secrets, webhook secret tokens) must be returned masked (`********`) in GET API responses unless explicit configure permissions are present and unmasking is requested.
4. **Cache Invalidation**: Whenever settings are updated, the system-wide settings cache tag/key is automatically cleared.

---

## 11. Error Handling

- `400 Bad Request`: Returned when setting validation fails or trying to delete default currency.
- `403 Forbidden`: Returned when user lacks appropriate Spatie permission.
- `404 Not Found`: Returned when requesting non-existent setting group or currency ID.
- `422 Unprocessable Entity`: Standard validation errors with field error dictionary.

---

## 12. Acceptance Criteria

- [ ] All 10 API endpoints registered and functional with Sanctum and Spatie RBAC.
- [ ] Group settings API allows fetching and updating `general`, `localization`, `commerce`, and `seo` settings seamlessly.
- [ ] Currencies API supports full CRUD and default currency switching.
- [ ] Audit logs are properly recorded upon settings modifications.
- [ ] React frontend `SettingsPage.jsx` provides interactive tabs, modals, form states, and notifications.
- [ ] Unit/Feature tests written in `tests/Feature/Admin/StoreSettingsManagementTest.php` pass with 100% success.
- [ ] Frontend build (`npm run build`) completes without warnings or errors.

---

## 13. Edge Cases

- **Setting Group Not Found**: Requesting an invalid group string returns `404 Not Found`.
- **Default Currency Deletion**: Attempting to delete the default currency returns `422 Unprocessable Entity` with message "Cannot delete the store default currency".
- **Zero Exchange Rate**: Attempting to set exchange rate to `0` returns validation error.
- **Concurrent Setting Updates**: Database transactions ensure setting updates within a group are atomic.

---

## 14. Dependencies

- `App\Models\Currency` (existing model, extended with default flag logic)
- `App\Traits\ApiResponseTrait` (standardized REST responses)
- `Spatie\Permission` package for RBAC rules

---

## 15. Open Questions

- None. Requirements are aligned with SRS §72–§73 and Admin Panel specifications §40–§44.
