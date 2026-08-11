# Feature Specification: Attributes & Attribute Values Module

**Module Name:** Attributes & Attribute Values  
**Module ID:** 05  
**Specification File:** `specifications/feature.attributes.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§13, §100), `Requirements/admin_panel.md` (§9), `Requirements/development_modules.md` (§Module 05)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Attributes & Attribute Values module manages product specifications and variant dimensions (e.g., Color, Size, Storage, RAM, Material). It provides structured attribute definitions (`attributes`) and their associated values (`attribute_values`, e.g., Color → Red, Blue, Black). It exposes Admin CRUD APIs for attributes and values (protected by Sanctum and `permission:attributes.*`) and Public Storefront APIs for generating product filter controls. All endpoints extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and MUST include OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Attribute Management Business Flow
1. Admin navigates to Attributes Management in Admin Panel.
2. Admin creates an attribute via `POST /api/v1/admin/attributes` providing `name`, `code` (auto-generated or custom e.g., `color`, `size`), `type` (`select`, `radio`, `color_picker`, `button`), `is_filterable`, `status`, and `sort_order`.
3. System validates uniqueness of `code` and creates record in `attributes` table.
4. Admin lists attributes via `GET /api/v1/admin/attributes` or views attribute details with attached values via `GET /api/v1/admin/attributes/{id}`.
5. Admin updates or toggles status of an attribute.
6. Admin deletes an attribute via `DELETE /api/v1/admin/attributes/{id}`. System deletes the attribute and cascades deletion of its associated values.

### 2.2 Attribute Value Management Business Flow
1. Admin selects an attribute (e.g., Color) and adds values via `POST /api/v1/admin/attributes/{attribute_id}/values` providing `value`, optional `color_code` (e.g., `#FF0000` for red), and `sort_order`.
2. System validates input and inserts record into `attribute_values` table.
3. Admin lists values for an attribute via `GET /api/v1/admin/attributes/{attribute_id}/values`.
4. Admin updates an attribute value via `PUT /api/v1/admin/attribute-values/{id}`.
5. Admin deletes an attribute value via `DELETE /api/v1/admin/attribute-values/{id}`.

### 2.3 Public Storefront Attribute Filter Flow
1. Storefront catalog calls `GET /api/v1/attributes` (unauthenticated).
2. System queries active, filterable attributes with their active values, sorted by `sort_order`.
3. Storefront renders faceted filter UI (color swatches, size buttons, dropdowns) for customer product filtering.

---

## 3. Functional Requirements

- **FR-ATT-001**: System shall manage product attributes (`name`, `code`, `type`, `is_filterable`, `status`, `sort_order`).
- **FR-ATT-002**: System shall support attribute display types: `select`, `radio`, `color_picker`, `button`.
- **FR-ATT-003**: System shall manage attribute values linked to attributes (`attribute_id`, `value`, `color_code`, `sort_order`).
- **FR-ATT-004**: System shall provide Admin Attribute CRUD APIs (`index`, `store`, `show`, `update`, `destroy`, `toggleStatus`) protected by `permission:attributes.*`.
- **FR-ATT-005**: System shall provide Admin Attribute Value APIs (`index`, `store`, `update`, `destroy`) protected by `permission:attributes.*`.
- **FR-ATT-006**: System shall provide a Public Storefront API (`GET /api/v1/attributes`) returning active filterable attributes and values.
- **FR-ATT-007**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Middleware**: `auth:sanctum` and `permission:<name>` for Admin APIs; Public APIs are unauthenticated.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `attributes` Table Migration
Migration: `database/migrations/2026_08_11_000009_create_attributes_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `name` | `string` | | Attribute display name (e.g. Color) |
| `code` | `string` | `unique` | Attribute unique code (e.g. color) |
| `type` | `enum` | `['select', 'radio', 'color_picker', 'button']`, `default('select')` | Frontend input/filter control type |
| `is_filterable` | `boolean` | `default(true)` | Enable in storefront product filters |
| `status` | `enum` | `['active', 'inactive']`, `default('active')` | Display status |
| `sort_order` | `integer` | `default(0)` | Display sort order |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `attribute_values` Table Migration
Migration: `database/migrations/2026_08_11_000010_create_attribute_values_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `attribute_id` | `foreignId` | `constrained('attributes')`, `onDelete('cascade')` | Parent attribute ID |
| `value` | `string` | | Value label (e.g. Red, XL, 128GB) |
| `color_code` | `string` | `nullable` | Hex color code for color swatches (e.g. #FF0000) |
| `sort_order` | `integer` | `default(0)` | Sort order |
| `timestamps` | `timestamps` | | Created / Updated at |

---

## 6. API Requirements

### 6.1 Admin Attribute APIs (`/api/v1/admin/attributes`)
- `GET /api/v1/admin/attributes` — List attributes with search, type filter, status filter, pagination (`permission:attributes.view`)
- `POST /api/v1/admin/attributes` — Create attribute (`permission:attributes.create`)
- `GET /api/v1/admin/attributes/{id}` — Show single attribute with values (`permission:attributes.view`)
- `PUT /api/v1/admin/attributes/{id}` — Update attribute (`permission:attributes.update`)
- `PATCH /api/v1/admin/attributes/{id}/status` — Toggle attribute status (`permission:attributes.update`)
- `DELETE /api/v1/admin/attributes/{id}` — Delete attribute (`permission:attributes.delete`)

### 6.2 Admin Attribute Value APIs
- `GET /api/v1/admin/attributes/{attribute_id}/values` — List values for an attribute (`permission:attributes.view`)
- `POST /api/v1/admin/attributes/{attribute_id}/values` — Add value to attribute (`permission:attributes.create`)
- `PUT /api/v1/admin/attribute-values/{id}` — Update attribute value (`permission:attributes.update`)
- `DELETE /api/v1/admin/attribute-values/{id}` — Delete attribute value (`permission:attributes.delete`)

### 6.3 Public Storefront API
- `GET /api/v1/attributes` — Public list of active, filterable attributes with active values

---

## 7. Validation Rules

### Attribute Rules
- `name`: `required|string|max:100`
- `code`: `nullable|string|max:100|unique:attributes,code,{id}`
- `type`: `sometimes|in:select,radio,color_picker,button`
- `is_filterable`: `sometimes|boolean`
- `status`: `sometimes|in:active,inactive`
- `sort_order`: `sometimes|integer|min:0`

### Attribute Value Rules
- `value`: `required|string|max:150`
- `color_code`: `nullable|string|max:20|regex:/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/`
- `sort_order`: `sometimes|integer|min:0`

---

## 8. Permission Rules

- Admin Attribute Endpoints:
  - `GET /api/v1/admin/attributes*` → `permission:attributes.view`
  - `POST /api/v1/admin/attributes*` → `permission:attributes.create`
  - `PUT /api/v1/admin/attributes/{id}` & `PUT /api/v1/admin/attribute-values/{id}` → `permission:attributes.update`
  - `PATCH /api/v1/admin/attributes/{id}/status` → `permission:attributes.update`
  - `DELETE /api/v1/admin/attributes/{id}` & `DELETE /api/v1/admin/attribute-values/{id}` → `permission:attributes.delete`
- Public Endpoint (`/api/v1/attributes`): Unauthenticated

---

## 9. Error Handling

- **401 Unauthorized**: Unauthenticated request on admin routes.
- **403 Forbidden**: Lacks required permission.
- **404 Not Found**: Attribute or attribute value ID not found.
- **422 Unprocessable Entity**: Validation failure (e.g., duplicate code, invalid hex color code).

---

## 10. Acceptance Criteria

- [ ] Database migrations create `attributes` and `attribute_values` tables cleanly.
- [ ] Attribute and AttributeValue Eloquent models with relationships (`hasMany`, `belongsTo`) and scopes.
- [ ] Admin Attribute CRUD APIs and Attribute Value APIs function with search, status filtering, and sorting.
- [ ] Public endpoint `/api/v1/attributes` returns active filterable attributes and values for storefront UI.
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec for all Attribute endpoints targeting `http://localhost:8002`.
- [ ] 100% test coverage with all feature tests passing.

---

## 11. Dependencies

- `Module 01: Foundation & Infrastructure`
- `Module 03: Admin Authentication & RBAC`
