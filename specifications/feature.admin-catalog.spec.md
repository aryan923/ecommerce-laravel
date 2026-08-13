# Feature Specification: Admin Category & Brand Management Module (Backend & React UI)

**Module Name:** Admin Category & Brand Management  
**Module ID:** 24  
**Specification File:** `specifications/feature.admin-catalog.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§11–§14), `Requirements/admin_panel.md` (§7–§9), `Requirements/development_modules.md` (§Module 24)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite + React SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Category & Brand Management module provides store administrators with full catalog structure controls, including parent-child category hierarchies, category image/banner attachments, sort order positioning, brand logo definitions, attribute definitions (e.g., Size, Color, Material), and attribute value management.

Per the Admin Panel Frontend Requirement, this module delivers both the **Laravel Backend APIs** and the corresponding **React Admin UI Views** (`/admin/categories`, `/admin/brands`, `/admin/attributes`) within the React Admin SPA.

All API responses strictly follow `ApiResponseTrait` standards outputting JSON on `http://localhost:8002` with OpenAPI 3.0 annotations.

---

## 2. Architecture & Business Flow

```text
  React Admin SPA Navigation
  ├── Categories Management View (/admin/categories)
  │     ├── Category Data Table with Hierarchy & Sort Order
  │     ├── Search & Parent Filter Controls
  │     ├── Category Form Modal (Create/Edit with Name, Slug, Parent, Sort, Status, SEO)
  │     └── Row Actions (Edit, Status Toggle, Delete)
  ├── Brands Management View (/admin/brands)
  │     ├── Brand Data Table & Logo Thumbnails
  │     ├── Search Bar & Status Filter
  │     ├── Brand Form Modal (Create/Edit with Name, Slug, Logo, Status, SEO)
  │     └── Row Actions (Edit, Status Toggle, Delete)
  └── Attributes Management View (/admin/attributes)
        ├── Attributes List (Size, Color, Material, RAM, Storage)
        └── Attribute Values Grid & Creation Modal
```

---

## 3. Functional Requirements

### 3.1 Backend API Requirements
- **FR-ACAT-001**: Admin category CRUD endpoints (`GET/POST/PUT/DELETE /api/v1/admin/categories`) supporting hierarchy (`parent_id`), sort order, status toggle, and image/banner parameters.
- **FR-ACAT-002**: Admin brand CRUD endpoints (`GET/POST/PUT/DELETE /api/v1/admin/brands`) supporting logo, SEO metadata, and status toggle.
- **FR-ACAT-003**: Admin attribute & value CRUD endpoints (`/api/v1/admin/attributes`, `/api/v1/admin/attributes/{id}/values`).
- **FR-ACAT-004**: Endpoints shall be protected by Sanctum guard (`auth:sanctum`) and permission middleware.
- **FR-ACAT-005**: All endpoints shall generate OpenAPI 3.0 (`@OA`) annotations.

### 3.2 React Admin UI Requirements
- **FR-ACAT-UI-001**: Render Categories Management page at `/admin/categories` with parent-child relationship display, search, sort order editor, and Category Form Modal.
- **FR-ACAT-UI-002**: Render Brands Management page at `/admin/brands` with logo preview, search, status toggle, and Brand Form Modal.
- **FR-ACAT-UI-003**: Render Attributes Management page at `/admin/attributes` allowing addition of attributes and attribute values.
- **FR-ACAT-UI-004**: Integrate with global Auth Context and protected routes.

---

## 4. Verification Criteria

1. Navigating to `/admin/categories`, `/admin/brands`, and `/admin/attributes` loads the respective React Admin UI screens.
2. Creating/Editing categories and brands via React modals updates backend DB records.
3. Automated PHPUnit tests for category, brand, and attribute endpoints pass 100% green.
4. Vite build compiles with zero errors.
