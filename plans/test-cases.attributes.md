# Test Cases: Attributes & Attribute Values Module

**Module Name:** Attributes & Attribute Values  
**Module ID:** 05  
**Test File:** `plans/test-cases.attributes.md`  
**Specification:** `specifications/feature.attributes.spec.md`  
**Plan:** `plans/plan.attributes.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-ATT-001: Create Attribute Success
- **Preconditions**: Authenticated admin with `attributes.create` permission.
- **Input**: `POST /api/v1/admin/attributes` with `name: "Color"`, `type: "color_picker"`, `is_filterable: true`.
- **Expected Result**: HTTP 201 Created, record inserted into `attributes` table with auto-generated `code: "color"`.

### TC-ATT-002: Create Attribute Value Success
- **Preconditions**: Attribute "Color" (ID 1) exists.
- **Input**: `POST /api/v1/admin/attributes/1/values` with `value: "Red"`, `color_code: "#FF0000"`.
- **Expected Result**: HTTP 201 Created, record inserted into `attribute_values` table.

### TC-ATT-003: List Attributes (Admin)
- **Input**: `GET /api/v1/admin/attributes`.
- **Expected Result**: HTTP 200 OK, paginated list of attributes with `values_count`.

### TC-ATT-004: Update Attribute Value Success
- **Preconditions**: Attribute Value ID 1 exists.
- **Input**: `PUT /api/v1/admin/attribute-values/1` with `value: "Crimson Red"`.
- **Expected Result**: HTTP 200 OK, record updated in database.

### TC-ATT-005: Public Storefront Active Filterable Attributes
- **Input**: `GET /api/v1/attributes`.
- **Expected Result**: HTTP 200 OK, returns active filterable attributes with active values without authentication required.

---

## 2. Negative Test Scenarios

### TC-ATT-006: Create Attribute with Duplicate Code
- **Preconditions**: Attribute with `code: "color"` exists.
- **Input**: `POST /api/v1/admin/attributes` with `name: "Color"`, `code: "color"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `code`.

### TC-ATT-007: Create Attribute Value with Invalid Hex Color Code
- **Input**: `POST /api/v1/admin/attributes/1/values` with `value: "Invalid"`, `color_code: "NOT_A_HEX"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `color_code`.

### TC-ATT-008: Delete Attribute Cascades Attribute Values
- **Preconditions**: Attribute 1 has values attached.
- **Input**: `DELETE /api/v1/admin/attributes/1`.
- **Expected Result**: HTTP 200 OK, attribute and its values deleted from database.

### TC-ATT-009: Unauthorized Admin Attribute Creation
- **Preconditions**: Admin user without `attributes.create` permission.
- **Input**: `POST /api/v1/admin/attributes`.
- **Expected Result**: HTTP 403 Forbidden.

---

## 3. Security & Validation Tests

- **TC-ATT-010**: Public storefront route `/api/v1/attributes` does not expose inactive or non-filterable attributes.
- **TC-ATT-011**: Admin attribute routes require valid Sanctum Bearer token.
- **TC-ATT-012**: Swagger UI contains all Attribute endpoints (`/admin/attributes`, `/admin/attributes/{id}/values`, `/admin/attribute-values/{id}`, `/attributes`).
