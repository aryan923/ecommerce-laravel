# Feature Specification: Product Catalog Module

**Module Name:** Product Catalog  
**Module ID:** 06  
**Specification File:** `specifications/feature.products.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§10–§11, §17–§19, §67–§71, §100), `Requirements/admin_panel.md` (§5), `Requirements/development_modules.md` (§Module 06)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Product Catalog module manages master product records, physical and digital product properties, pricing models, category associations, brand relationships, and storefront catalog discovery. It supports three product types: `simple` (standalone physical item), `variable` (parent item for variant matrices), and `digital` (downloadable virtual product). It exposes Admin CRUD APIs (protected by Sanctum and `permission:products.*`) and Public Storefront Catalog APIs with multi-faceted filtering, sorting, pagination, and full product detail views. All endpoints extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and MUST include OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Admin Product Management Business Flow
1. Admin navigates to Product Management in Admin Panel.
2. Admin submits product creation form via `POST /api/v1/admin/products` providing:
   - Basic details: `name`, `type` (`simple`, `variable`, `digital`), `status` (`draft`, `active`, `inactive`, `archived`), `brand_id`, `category_ids`, `primary_category_id`.
   - Pricing & Tax: `price`, `sale_price`, `cost_price`, `tax_class`, `tax_rate`.
   - Specifications & Dimensions: `sku`, `weight`, `length`, `width`, `height`.
   - Digital Product Config (if type=`digital`): `download_url`, `download_limit`, `download_expiry_days`.
   - SEO: `seo_title`, `seo_description`, `meta_keywords`.
3. System validates input, auto-generates unique `slug` (if omitted) and unique `sku` (if omitted), attaches categories in `product_categories` pivot table with `is_primary` flag, and saves record to `products` table.
4. Admin lists products via `GET /api/v1/admin/products` with filters (type, status, brand, category, search, price range).
5. Admin updates product details via `PUT /api/v1/admin/products/{id}` or toggles status via `PATCH /api/v1/admin/products/{id}/status`.
6. Admin deletes product via `DELETE /api/v1/admin/products/{id}`.

### 2.2 Public Storefront Discovery & Detail Flow
1. Customer visits storefront catalog calling `GET /api/v1/products` with optional parameters: `search`, `category` (slug), `brand` (slug), `min_price`, `max_price`, `featured` (bool), `sort_by` (`latest`, `price_low_high`, `price_high_low`, `name_asc`), and `per_page`.
2. System queries active products (`status = 'active'`), filters records, attaches brand and category relationships, and returns paginated result.
3. Customer clicks product calling `GET /api/v1/products/{slug}`.
4. System returns full product detail payload including brand, primary category, category breadcrumb trail, and related products in same category/brand.

---

## 3. Functional Requirements

- **FR-PRD-001**: System shall support product types: `simple`, `variable`, `digital`.
- **FR-PRD-002**: System shall support product statuses: `draft`, `active`, `inactive`, `archived`.
- **FR-PRD-003**: System shall automatically generate unique URL slugs and SKUs if not explicitly provided.
- **FR-PRD-004**: System shall support multi-category attachment (`product_categories` pivot) with one primary category (`is_primary`).
- **FR-PRD-005**: System shall support brand assignment (`brand_id` foreign key).
- **FR-PRD-006**: System shall support product-level pricing (`price`, `sale_price`, `cost_price`) and tax configuration (`tax_class`, `tax_rate`).
- **FR-PRD-007**: System shall support physical dimensions (`weight`, `length`, `width`, `height`).
- **FR-PRD-008**: System shall support digital product properties (`download_url`, `download_limit`, `download_expiry_days`) when `type = 'digital'`.
- **FR-PRD-009**: System shall provide Admin Product CRUD APIs (`index`, `store`, `show`, `update`, `destroy`, `toggleStatus`) protected by `permission:products.*`.
- **FR-PRD-010**: System shall provide Public Storefront APIs (`GET /api/v1/products`, `GET /api/v1/products/{slug}`) returning active products only.
- **FR-PRD-011**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Middleware**: `auth:sanctum` and `permission:<name>` for Admin APIs; Public APIs are unauthenticated.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `products` Table Migration
Migration: `database/migrations/2026_08_11_000011_create_products_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `brand_id` | `foreignId` | `nullable`, `constrained('brands')`, `onDelete('set null')` | Brand FK |
| `name` | `string` | | Product name |
| `slug` | `string` | `unique` | URL slug |
| `sku` | `string` | `unique` | Stock Keeping Unit |
| `type` | `enum` | `['simple', 'variable', 'digital']`, `default('simple')` | Product type |
| `status` | `enum` | `['draft', 'active', 'inactive', 'archived']`, `default('draft')` | Product status |
| `featured` | `boolean` | `default(false)` | Featured product flag |
| `short_description` | `text` | `nullable` | Short overview |
| `description` | `longText` | `nullable` | Full HTML description |
| `price` | `decimal` | `10,2`, `default(0.00)` | Regular selling price |
| `sale_price` | `decimal` | `10,2`, `nullable` | Promotional sale price |
| `cost_price` | `decimal` | `10,2`, `nullable` | Cost of goods price |
| `tax_class` | `json` | `nullable` | Array of tax classification codes (e.g. ["standard", "gst_18"]) |
| `weight` | `decimal` | `8,2`, `nullable` | Weight in kg |
| `length` | `decimal` | `8,2`, `nullable` | Length in cm |
| `width` | `decimal` | `8,2`, `nullable` | Width in cm |
| `height` | `decimal` | `8,2`, `nullable` | Height in cm |
| `download_url` | `text` | `nullable` | Digital download URL |
| `download_limit` | `integer` | `nullable` | Max download count |
| `download_expiry_days` | `integer` | `nullable` | Expiry period in days |
| `seo_title` | `string` | `nullable` | Meta SEO Title |
| `seo_description` | `text` | `nullable` | Meta SEO Description |
| `meta_keywords` | `string` | `nullable` | Meta SEO Keywords |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `product_categories` Pivot Migration
Migration: `database/migrations/2026_08_11_000012_create_product_categories_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `product_id` | `foreignId` | `constrained('products')`, `onDelete('cascade')` | Product FK |
| `category_id` | `foreignId` | `constrained('categories')`, `onDelete('cascade')` | Category FK |
| `is_primary` | `boolean` | `default(false)` | Primary category indicator |
| `primary_key` | `primary` | `['product_id', 'category_id']` | Compound primary key |

---

## 6. API Requirements

### 6.1 Admin Product APIs (`/api/v1/admin/products`)
- `GET /api/v1/admin/products` — List products with search, category, brand, type, status filters, price range, sorting, pagination (`permission:products.view`)
- `POST /api/v1/admin/products` — Create product (`permission:products.create`)
- `GET /api/v1/admin/products/{id}` — Show product details with categories & brand (`permission:products.view`)
- `PUT /api/v1/admin/products/{id}` — Update product (`permission:products.update`)
- `PATCH /api/v1/admin/products/{id}/status` — Toggle product status (`permission:products.update`)
- `DELETE /api/v1/admin/products/{id}` — Delete product (`permission:products.delete`)

### 6.2 Public Storefront Catalog APIs (`/api/v1/products`)
- `GET /api/v1/products` — Public active products catalog with search, category slug, brand slug, price range, sorting, pagination
- `GET /api/v1/products/{slug}` — Public product detail view by slug with brand, primary category, category breadcrumbs, and related products

---

## 7. Validation Rules

### Store Product Request
- `name`: `required|string|max:255`
- `slug`: `nullable|string|max:255|unique:products,slug`
- `sku`: `nullable|string|max:100|unique:products,sku`
- `type`: `required|in:simple,variable,digital`
- `status`: `sometimes|in:draft,active,inactive,archived`
- `brand_id`: `nullable|exists:brands,id`
- `category_ids`: `required|array`
- `category_ids.*`: `exists:categories,id`
- `primary_category_id`: `nullable|exists:categories,id`
- `price`: `required|numeric|min:0`
- `sale_price`: `nullable|numeric|min:0|lt:price`
- `cost_price`: `nullable|numeric|min:0`
- `tax_class`: `nullable|string|max:50`
- `tax_rate`: `nullable|numeric|min:0|max:100`
- `weight`: `nullable|numeric|min:0`
- `length`: `nullable|numeric|min:0`
- `width`: `nullable|numeric|min:0`
- `height`: `nullable|numeric|min:0`
- `download_url`: `required_if:type,digital|nullable|url`
- `download_limit`: `nullable|integer|min:1`
- `download_expiry_days`: `nullable|integer|min:1`

---

## 8. Permission Rules

- Admin Product Endpoints:
  - `GET /api/v1/admin/products*` → `permission:products.view`
  - `POST /api/v1/admin/products` → `permission:products.create`
  - `PUT /api/v1/admin/products/{id}` → `permission:products.update`
  - `PATCH /api/v1/admin/products/{id}/status` → `permission:products.update`
  - `DELETE /api/v1/admin/products/{id}` → `permission:products.delete`
- Public Storefront Endpoints (`/api/v1/products*`): Unauthenticated

---

## 9. Error Handling

- **401 Unauthorized**: Unauthenticated request on admin routes.
- **403 Forbidden**: Lacks required permission.
- **404 Not Found**: Product ID or slug not found.
- **422 Unprocessable Entity**: Validation failure (e.g., duplicate SKU, sale price higher than regular price, missing digital download URL for digital product).

---

## 10. Acceptance Criteria

- [ ] Database migrations create `products` and `product_categories` tables cleanly.
- [ ] Product model supports `simple`, `variable`, `digital` types and `draft`, `active`, `inactive`, `archived` statuses.
- [ ] Automatic SKU and unique slug generation when omitted.
- [ ] Admin Product CRUD APIs with search, multi-field filtering, and category pivot sync.
- [ ] Public Storefront Catalog APIs (`/products` and `/products/{slug}`) returning active products only with category breadcrumbs and related items.
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec for all Product endpoints targeting `http://localhost:8002`.
- [ ] 100% test coverage with all feature tests passing.

---

## 11. Dependencies

- `Module 01: Foundation & Infrastructure`
- `Module 03: Admin Authentication & RBAC`
- `Module 04: Categories & Brands`
- `Module 05: Attributes & Attribute Values`
