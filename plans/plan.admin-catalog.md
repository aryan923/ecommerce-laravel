# Implementation Plan: Module 24 — Admin Category & Brand Management (Backend & React UI)

**Module Name:** Admin Category & Brand Management  
**Module ID:** 24  
**Plan File:** `plans/plan.admin-catalog.md`  
**Specification File:** `specifications/feature.admin-catalog.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 24 (Admin Category & Brand Management) delivering both backend API enhancements and dedicated **React Admin UI views** for Categories (`/admin/categories`), Brands (`/admin/brands`), and Attributes (`/admin/attributes`). This includes form modals, hierarchy tree indicators, search & status filters, OpenAPI 3.0 annotations, and automated feature tests.

---

## 2. User Review Required

> [!NOTE]
> - Backend APIs and React UI components delivered together for Module 24.
> - Views:
>   - **Categories Page (`/admin/categories`)**: Parent-child hierarchy, sort order, category form modal (Name, Slug, Parent, Sort Order, Image, Banner, Status, SEO).
>   - **Brands Page (`/admin/brands`)**: Brand listing, logo preview, brand form modal (Name, Slug, Logo URL, Status, SEO).
>   - **Attributes Page (`/admin/attributes`)**: Attributes list & attribute values creation modal.

---

## 3. Open Questions

*None at this time. All SRS (§11–§14) and Admin Panel specs (§7–§9) requirements are fully defined.*

---

## 4. Proposed Changes & Task Breakdown

### React Admin UI Components & Pages
- **[NEW]** [`resources/js/admin/pages/CategoriesPage.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/pages/CategoriesPage.jsx) — Admin Categories Management data table & filters.
- **[NEW]** [`resources/js/admin/components/CategoryFormModal.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/components/CategoryFormModal.jsx) — Create/Edit Category Modal dialog.
- **[NEW]** [`resources/js/admin/pages/BrandsPage.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/pages/BrandsPage.jsx) — Admin Brands Management data table & logo previews.
- **[NEW]** [`resources/js/admin/components/BrandFormModal.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/components/BrandFormModal.jsx) — Create/Edit Brand Modal dialog.
- **[NEW]** [`resources/js/admin/pages/AttributesPage.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/pages/AttributesPage.jsx) — Admin Attributes & Values Management UI.
- **[MODIFY]** [`resources/js/admin/App.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/App.jsx) — Add sidebar navigation links and routes for `/categories`, `/brands`, and `/attributes`.

### Testing & Verification
- **[NEW]** [`tests/Feature/AdminCatalogManagementTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/AdminCatalogManagementTest.php) — Feature test suite.

---

## 5. Detailed Task Checklist

- [ ] **Task 1: Build React Categories Management Page & Modal**
  - Path: `resources/js/admin/pages/CategoriesPage.jsx`
  - Path: `resources/js/admin/components/CategoryFormModal.jsx`
  - Description: Build Categories data table with search, parent filter, sort order, and form modal.

- [ ] **Task 2: Build React Brands Management Page & Modal**
  - Path: `resources/js/admin/pages/BrandsPage.jsx`
  - Path: `resources/js/admin/components/BrandFormModal.jsx`
  - Description: Build Brands data table with logo preview, search, and form modal.

- [ ] **Task 3: Build React Attributes Management Page**
  - Path: `resources/js/admin/pages/AttributesPage.jsx`
  - Description: Build Attributes and Values management UI.

- [ ] **Task 4: Update App.jsx Routing & Sidebar Links**
  - Path: `resources/js/admin/App.jsx`
  - Description: Add sidebar links and routes for `/categories`, `/brands`, `/attributes`.

- [ ] **Task 5: Compile Vite Production Bundle & Run Feature Tests**
  - Commands: `npm run build`, `php vendor/bin/phpunit tests/Feature/AdminCatalogManagementTest.php`
  - Description: Verify zero build errors and 100% test pass.

---

## 6. Verification Plan

### Automated Tests
- Feature Test Suite: `php vendor/bin/phpunit tests/Feature/AdminCatalogManagementTest.php`
- OpenAPI Build: `php artisan l5-swagger:generate`
- Asset Build: `npm run build`

### Manual Verification
- Navigate to `/admin/categories` $\rightarrow$ Create category $\rightarrow$ Edit sort order $\rightarrow$ Toggle status.
- Navigate to `/admin/brands` $\rightarrow$ Create brand with logo $\rightarrow$ Edit brand.
- Navigate to `/admin/attributes` $\rightarrow$ Add attribute value.
