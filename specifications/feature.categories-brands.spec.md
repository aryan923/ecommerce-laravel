# Feature Specification: Categories & Brands Module

**Module Name:** Categories & Brands  
**Module ID:** 04  
**Specification File:** `specifications/feature.categories-brands.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§14, §15, §68, §100), `Requirements/admin_panel.md` (§7, §8), `Requirements/development_modules.md` (§Module 04)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Categories & Brands module manages the store's taxonomy, category tree structure, brand profiles, and catalog organization. It supports an unlimited-depth category hierarchy with self-referencing parent-child relationships, automatic slug generation, SEO fields, image/banner attributes, and brand management. It exposes both Admin CRUD APIs (protected by Sanctum and `permission:categories.*`, `permission:brands.*`) and Public Storefront APIs (active items only). All endpoints extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and MUST include OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Category Management Business Flow
1. Admin creates a top-level or sub-category via `POST /api/v1/admin/categories` providing `name`, optional `parent_id`, `description`, `image`, `banner`, `status`, and SEO metadata.
2. System validates input, verifies `parent_id` existence (preventing self-parenting loops), generates a unique `slug`, and saves record to `categories` table.
3. Admin views category tree via `GET /api/v1/admin/categories?tree=true` or flat paginated list.
4. Admin reorders category sorting via `POST /api/v1/admin/categories/reorder`.
5. Admin updates or toggles status of a category.
6. Admin attempts category deletion via `DELETE /api/v1/admin/categories/{id}`. System checks if category has child subcategories or attached products; if found, deletion is blocked with HTTP 422.
7. Customer site requests `GET /api/v1/categories` (active categories only, formatted as a nested tree) or fetches category details by slug via `GET /api/v1/categories/{slug}`.

### 2.2 Brand Management Business Flow
1. Admin creates a brand via `POST /api/v1/admin/brands` providing `name`, `logo`, `description`, `website`, `status`, and SEO fields.
2. System validates input, generates unique `slug`, and saves to `brands` table.
3. Admin lists, views, updates, toggles status, or deletes brands. Deletion is blocked if active products are associated with the brand.
4. Customer site requests active brands via `GET /api/v1/brands` or brand details by slug via `GET /api/v1/brands/{slug}`.

---

## 3. Functional Requirements

- **FR-CAT-001**: System shall support an unlimited-depth hierarchical category tree using `parent_id` foreign key.
- **FR-CAT-002**: System shall automatically generate unique URL-friendly slugs for categories and brands from their names.
- **FR-CAT-003**: System shall support SEO metadata fields (`seo_title`, `seo_description`, `meta_keywords`) for both categories and brands.
- **FR-CAT-004**: System shall support category image and banner URLs, and brand logo URLs.
- **FR-CAT-005**: System shall provide Admin Category CRUD APIs (`index`, `store`, `show`, `update`, `destroy`, `toggleStatus`, `reorder`) protected by `permission:categories.*`.
- **FR-CAT-006**: System shall provide Admin Brand CRUD APIs (`index`, `store`, `show`, `update`, `destroy`, `toggleStatus`) protected by `permission:brands.*`.
- **FR-CAT-007**: System shall prevent category self-parenting or circular hierarchy loops.
- **FR-CAT-008**: System shall block category deletion if sub-categories exist.
- **FR-CAT-009**: System shall provide Public Storefront APIs (`GET /api/v1/categories`, `GET /api/v1/categories/{slug}`, `GET /api/v1/brands`, `GET /api/v1/brands/{slug}`) returning active records only.
- **FR-CAT-010**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Middleware**: `auth:sanctum` and `permission:<name>` for Admin APIs; Public APIs are unauthenticated.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `categories` Table Migration
Migration: `database/migrations/2026_08_11_000007_create_categories_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `parent_id` | `foreignId` | `nullable`, `constrained('categories')`, `onDelete('cascade')` | Parent category reference |
| `name` | `string` | | Category name |
| `slug` | `string` | `unique` | URL slug |
| `description` | `text` | `nullable` | Short/Long description |
| `image` | `string` | `nullable` | Thumbnail image URL |
| `banner` | `string` | `nullable` | Banner image URL |
| `status` | `enum` | `['active', 'inactive']`, `default('active')` | Display status |
| `sort_order` | `integer` | `default(0)` | Display sort order |
| `seo_title` | `string` | `nullable` | Meta SEO Title |
| `seo_description` | `text` | `nullable` | Meta SEO Description |
| `meta_keywords` | `string` | `nullable` | Meta SEO Keywords |
| `timestamps` | `timestamps` | | Created / Updated at |

### 5.2 Create `brands` Table Migration
Migration: `database/migrations/2026_08_11_000008_create_brands_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `name` | `string` | | Brand name |
| `slug` | `string` | `unique` | URL slug |
| `logo` | `string` | `nullable` | Logo URL |
| `description` | `text` | `nullable` | Brand description |
| `website` | `string` | `nullable` | Official website URL |
| `status` | `enum` | `['active', 'inactive']`, `default('active')` | Status |
| `sort_order` | `integer` | `default(0)` | Sort order |
| `seo_title` | `string` | `nullable` | Meta SEO Title |
| `seo_description` | `text` | `nullable` | Meta SEO Description |
| `timestamps` | `timestamps` | | Created / Updated at |

---

## 6. API Requirements

### 6.1 Admin Category APIs (`/api/v1/admin/categories`)
- `GET /api/v1/admin/categories` — Flat or tree listing with search, parent filter, status filter, pagination (`permission:categories.view`)
- `POST /api/v1/admin/categories` — Create category (`permission:categories.create`)
- `GET /api/v1/admin/categories/{id}` — Show single category (`permission:categories.view`)
- `PUT /api/v1/admin/categories/{id}` — Update category (`permission:categories.update`)
- `PATCH /api/v1/admin/categories/{id}/status` — Toggle category status (`permission:categories.update`)
- `DELETE /api/v1/admin/categories/{id}` — Delete category (`permission:categories.delete`)
- `POST /api/v1/admin/categories/reorder` — Update sort orders (`permission:categories.update`)

### 6.2 Admin Brand APIs (`/api/v1/admin/brands`)
- `GET /api/v1/admin/brands` — List brands with search, status filter, pagination (`permission:brands.view`)
- `POST /api/v1/admin/brands` — Create brand (`permission:brands.create`)
- `GET /api/v1/admin/brands/{id}` — Show brand details (`permission:brands.view`)
- `PUT /api/v1/admin/brands/{id}` — Update brand (`permission:brands.update`)
- `PATCH /api/v1/admin/brands/{id}/status` — Toggle brand status (`permission:brands.update`)
- `DELETE /api/v1/admin/brands/{id}` — Delete brand (`permission:brands.delete`)

### 6.3 Public Storefront APIs (`/api/v1`)
- `GET /api/v1/categories` — Public active categories tree
- `GET /api/v1/categories/{slug}` — Public category details by slug
- `GET /api/v1/brands` — Public active brands list
- `GET /api/v1/brands/{slug}` — Public brand details by slug

---

## 7. Validation Rules

### Category Rules
- `name`: `required|string|max:150`
- `slug`: `nullable|string|max:160|unique:categories,slug,{id}`
- `parent_id`: `nullable|exists:categories,id`
- `status`: `sometimes|in:active,inactive`
- `sort_order`: `sometimes|integer|min:0`

### Brand Rules
- `name`: `required|string|max:150`
- `slug`: `nullable|string|max:160|unique:brands,slug,{id}`
- `website`: `nullable|url|max:255`
- `status`: `sometimes|in:active,inactive`

---

## 8. Permission Rules

- Admin Category Endpoints:
  - `GET /api/v1/admin/categories*` → `permission:categories.view`
  - `POST /api/v1/admin/categories` → `permission:categories.create`
  - `PUT /api/v1/admin/categories/{id}` → `permission:categories.update`
  - `PATCH /api/v1/admin/categories/{id}/status` → `permission:categories.update`
  - `POST /api/v1/admin/categories/reorder` → `permission:categories.update`
  - `DELETE /api/v1/admin/categories/{id}` → `permission:categories.delete`
- Admin Brand Endpoints:
  - `GET /api/v1/admin/brands*` → `permission:brands.view`
  - `POST /api/v1/admin/brands` → `permission:brands.create`
  - `PUT /api/v1/admin/brands/{id}` → `permission:brands.update`
  - `PATCH /api/v1/admin/brands/{id}/status` → `permission:brands.update`
  - `DELETE /api/v1/admin/brands/{id}` → `permission:brands.delete`
- Public Endpoints (`/categories`, `/brands`): Unauthenticated

---

## 9. Error Handling

- **401 Unauthorized**: Unauthenticated request on admin routes.
- **403 Forbidden**: Lacks required permission.
- **404 Not Found**: Category or brand ID/slug not found.
- **422 Unprocessable Entity**: Validation failure, self-parenting loop, or deleting category with children.

---

## 10. Acceptance Criteria

- [ ] Database migrations create `categories` and `brands` tables cleanly.
- [ ] Category model supports recursive parent/children relationships and tree building.
- [ ] Category & Brand CRUD APIs function with search, status filtering, and sorting.
- [ ] Category deletion blocked if child sub-categories exist.
- [ ] Category self-parenting prevention enforced.
- [ ] Public endpoints return active categories/brands only.
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec for all Category & Brand endpoints targeting `http://localhost:8002`.
- [ ] 100% test coverage with all feature tests passing.

---

## 11. Dependencies

- `Module 01: Foundation & Infrastructure`
- `Module 03: Admin Authentication & RBAC`
