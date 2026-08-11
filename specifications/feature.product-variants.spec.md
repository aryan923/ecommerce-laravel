# Feature Specification: Product Variants Module

**Module Name:** Product Variants  
**Module ID:** 07  
**Specification File:** `specifications/feature.product-variants.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§12, §13, §100), `Requirements/admin_panel.md` (§5), `Requirements/development_modules.md` (§Module 07)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Product Variants module enables variant management for variable products. It supports automatic variant matrix generation from attribute value combinations (e.g. Color: Red/Blue x Size: S/M -> 4 variants) as well as manual variant creation. Each variant maintains individual pricing (`price`, `sale_price`, `cost_price`), inventory tracking (`stock_qty`), physical dimensions (`weight`, `length`, `width`, `height`), `barcode`, `image`, and `status`. It exposes Admin CRUD and Matrix Generation APIs (protected by Sanctum and `permission:products.*`) and incorporates variant options into the Public Product Detail API. All endpoints extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and MUST include OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Admin Variant Matrix Generation Business Flow
1. Admin creates a variable product (`type = 'variable'`) in Module 06.
2. Admin opens Variant Management for the product and selects attribute values (e.g., Color: Red, Blue; Size: S, M, L).
3. Admin calls `POST /api/v1/admin/products/{product_id}/variants/generate` passing arrays of selected `attribute_value_ids`.
4. System computes Cartesian product of attribute value sets, checks for existing variants with matching attribute value sets, and generates new `ProductVariant` records with unique auto-generated SKUs (e.g. `SKU-RED-S`).
5. System attaches corresponding attribute value records in `product_variant_attribute_values` pivot table.

### 2.2 Admin Variant Maintenance Business Flow
1. Admin lists variants for a product via `GET /api/v1/admin/products/{product_id}/variants`.
2. Admin manually creates a single variant via `POST /api/v1/admin/products/{product_id}/variants`.
3. Admin updates variant details (price, stock_qty, barcode, image) via `PUT /api/v1/admin/variants/{id}`.
4. Admin toggles variant status via `PATCH /api/v1/admin/variants/{id}/status`.
5. Admin deletes a variant via `DELETE /api/v1/admin/variants/{id}`.

### 2.3 Public Storefront Product Detail Variant Matrix Flow
1. Customer visits product detail page calling `GET /api/v1/products/{slug}`.
2. If product `type = 'variable'`, response includes an active `variants` list with assigned attribute values, allowing the frontend to build interactive option pickers (e.g., Color swatches, Size buttons) and display dynamic price/stock updates upon option selection.

---

## 3. Functional Requirements

- **FR-VAR-001**: System shall maintain product variants in `product_variants` table (`product_id`, `sku`, `barcode`, `price`, `sale_price`, `cost_price`, `stock_qty`, `weight`, `length`, `width`, `height`, `image`, `status`).
- **FR-VAR-002**: System shall maintain variant-attribute associations in `product_variant_attribute_values` pivot table (`product_variant_id`, `attribute_value_id`).
- **FR-VAR-003**: System shall support automatic Cartesian product matrix generation from selected attribute value arrays.
- **FR-VAR-004**: System shall auto-generate unique SKUs for variants if not explicitly supplied.
- **FR-VAR-005**: System shall provide Admin Variant APIs (`index`, `generate`, `store`, `update`, `destroy`, `toggleStatus`) protected by `permission:products.*`.
- **FR-VAR-006**: Public Storefront Product Detail API (`GET /api/v1/products/{slug}`) shall include active variants and attribute option matrices for variable products.
- **FR-VAR-007**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Middleware**: `auth:sanctum` and `permission:<name>` for Admin APIs; Public APIs are unauthenticated.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `product_variants` Table Migration
Migration: `database/migrations/2026_08_11_000013_create_product_variants_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `product_id` | `foreignId` | `constrained('products')`, `onDelete('cascade')` | Parent Product FK |
| `sku` | `string` | `unique` | Unique variant SKU |
| `barcode` | `string` | `nullable` | Barcode / EAN / UPC |
| `price` | `decimal` | `10,2`, `default(0.00)` | Variant selling price |
| `sale_price` | `decimal` | `10,2`, `nullable` | Promotional sale price |
| `cost_price` | `decimal` | `10,2`, `nullable` | Cost of goods price |
| `stock_qty` | `integer` | `default(0)` | Stock quantity |
| `weight` | `decimal` | `8,2`, `nullable` | Variant weight in kg |
| `length` | `decimal` | `8,2`, `nullable` | Variant length in cm |
| `width` | `decimal` | `8,2`, `nullable` | Variant width in cm |
| `height` | `decimal` | `8,2`, `nullable` | Variant height in cm |
| `image` | `text` | `nullable` | Primary variant image URL |
| `status` | `enum` | `['active', 'inactive']`, `default('active')` | Variant status |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `product_variant_attribute_values` Pivot Migration
Migration: `database/migrations/2026_08_11_000014_create_product_variant_attribute_values_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `product_variant_id` | `foreignId` | `constrained('product_variants')`, `onDelete('cascade')` | Variant FK |
| `attribute_value_id` | `foreignId` | `constrained('attribute_values')`, `onDelete('cascade')` | Attribute Value FK |
| `primary_key` | `primary` | `['product_variant_id', 'attribute_value_id']` | Pivot primary key |

---

## 6. API Requirements

### 6.1 Admin Variant APIs
- `GET /api/v1/admin/products/{product_id}/variants` — List variants of a product (`permission:products.view`)
- `POST /api/v1/admin/products/{product_id}/variants/generate` — Generate variant matrix from attribute values (`permission:products.create`)
- `POST /api/v1/admin/products/{product_id}/variants` — Create single variant manually (`permission:products.create`)
- `PUT /api/v1/admin/variants/{id}` — Update variant details (`permission:products.update`)
- `PATCH /api/v1/admin/variants/{id}/status` — Toggle variant status (`permission:products.update`)
- `DELETE /api/v1/admin/variants/{id}` — Delete variant (`permission:products.delete`)

---

## 7. Validation Rules

### Generate Matrix Request
- `attribute_value_ids`: `required|array|min:1`
- `attribute_value_ids.*`: `array|min:1`
- `attribute_value_ids.*.*`: `exists:attribute_values,id`
- `base_price`: `nullable|numeric|min:0`
- `base_stock`: `nullable|integer|min:0`

### Store / Update Variant Request
- `sku`: `nullable|string|max:100|unique:product_variants,sku,{id}`
- `barcode`: `nullable|string|max:100`
- `price`: `required|numeric|min:0`
- `sale_price`: `nullable|numeric|min:0|lt:price`
- `cost_price`: `nullable|numeric|min:0`
- `stock_qty`: `sometimes|integer|min:0`
- `attribute_value_ids`: `sometimes|array`
- `attribute_value_ids.*`: `exists:attribute_values,id`

---

## 8. Permission Rules

- Admin Variant Endpoints:
  - `GET /api/v1/admin/products/{product_id}/variants` → `permission:products.view`
  - `POST /api/v1/admin/products/{product_id}/variants*` → `permission:products.create`
  - `PUT /api/v1/admin/variants/{id}` & `PATCH /api/v1/admin/variants/{id}/status` → `permission:products.update`
  - `DELETE /api/v1/admin/variants/{id}` → `permission:products.delete`

---

## 9. Error Handling

- **401 Unauthorized**: Unauthenticated request on admin routes.
- **403 Forbidden**: Lacks required permission.
- **404 Not Found**: Product ID or Variant ID not found.
- **422 Unprocessable Entity**: Validation failure (e.g., duplicate variant SKU, invalid attribute value IDs).

---

## 10. Acceptance Criteria

- [ ] Database migrations create `product_variants` and `product_variant_attribute_values` pivot cleanly.
- [ ] ProductVariant model with relationships to Product and AttributeValues.
- [ ] Cartesian product matrix generator in `VariantService`.
- [ ] Admin Variant APIs function with full CRUD, status toggling, and matrix generation.
- [ ] Public Storefront Product Detail API (`/api/v1/products/{slug}`) includes active variants for variable products.
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec targeting `http://localhost:8002`.
- [ ] 100% test coverage with all feature tests passing.

---

## 11. Dependencies

- `Module 01: Foundation & Infrastructure`
- `Module 03: Admin Authentication & RBAC`
- `Module 05: Attributes & Attribute Values`
- `Module 06: Product Catalog`
