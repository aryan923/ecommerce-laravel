# Implementation Plan: Admin CMS / Banners / Pages (Module 35)

## 1. Module Summary

Module 35 delivers the Admin CMS, Banner Management, and Page Authoring suite for the e-commerce system. It includes backend migrations, models, services, controllers, form requests, and public/admin API endpoints, paired with dedicated React Admin UI screens (`BannersPage.jsx`, `PagesPage.jsx`, `PageEditorModal.jsx`).

---

## 2. Development Strategy

1. **Database & Core Backend**:
   - Create migrations for `banners` and `pages` tables.
   - Implement Eloquent models (`App\Models\Banner`, `App\Models\Page`) with fillables, casts, scopes, and helper methods.
   - Define Form Request validation classes for banner and page mutations.
   - Create Service layer (`App\Services\BannerService`, `App\Services\PageService`) encapsulating date filters, slug generation, sanitization, and audit logging.

2. **API Controllers & Routing**:
   - Implement `App\Http\Controllers\Api\V1\Public\BannerController` and `PageController` for storefront public consumption.
   - Implement `App\Http\Controllers\Api\V1\Admin\AdminBannerController` and `AdminPageController` for staff management.
   - Register routes in `routes/api.php` under public and authenticated admin groups with RBAC permission middleware (`permission:banners.view`, `permission:pages.view`, etc.).

3. **React Admin UI**:
   - Build `BannersPage.jsx` with placement tabs, banner grid/table, status toggles, sort ordering, and banner modal form.
   - Build `PagesPage.jsx` with page table, status badges, slug copy button, and filter controls.
   - Build `PageEditorModal.jsx` featuring title input, auto-slug generator, WYSIWYG HTML editor, SEO inputs, live Google SERP snippet preview card, and publish controls.

4. **Testing & Validation**:
   - Write Feature/Unit tests (`tests/Feature/Admin/CmsManagementTest.php`).
   - Run build and test suite (`php artisan test`).

---

## 3. Architecture & Components

```text
Backend Architecture:
├── database/migrations/
│   ├── 2026_09_17_000001_create_banners_table.php
│   └── 2026_09_17_000002_create_pages_table.php
├── app/Models/
│   ├── Banner.php
│   └── Page.php
├── app/Http/Requests/Admin/
│   ├── StoreBannerRequest.php
│   ├── UpdateBannerRequest.php
│   ├── StorePageRequest.php
│   └── UpdatePageRequest.php
├── app/Services/
│   ├── BannerService.php
│   └── PageService.php
├── app/Http/Controllers/Api/V1/Public/
│   ├── BannerController.php
│   └── PageController.php
└── app/Http/Controllers/Api/V1/Admin/
    ├── AdminBannerController.php
    └── AdminPageController.php

Frontend Architecture:
├── frontend/src/admin/pages/
│   ├── BannersPage.jsx
│   └── PagesPage.jsx
└── frontend/src/admin/components/cms/
    ├── BannerModal.jsx
    └── PageEditorModal.jsx
```

---

## 4. Task Breakdown

- [x] **Task 1: Database Migrations**
  - Create migration `create_banners_table` with `id`, `title`, `image_desktop`, `image_mobile`, `link_url`, `button_text`, `placement`, `sort_order`, `is_active`, `starts_at`, `ends_at`, `created_by`, timestamps, and indexes.
  - Create migration `create_pages_table` with `id`, `title`, `slug`, `content`, `seo_title`, `seo_description`, `status`, `created_by`, `updated_by`, timestamps, and indexes.

- [x] **Task 2: Eloquent Models**
  - Create `App\Models\Banner` with `$fillable`, `$casts` (`is_active` => boolean, `starts_at` => datetime, `ends_at` => datetime), scope `active()`, scope `forPlacement($placement)`.
  - Create `App\Models\Page` with `$fillable`, `$casts`, scope `published()`, and auto-slug generation helper.

- [x] **Task 3: Form Request Validations**
  - Create `StoreBannerRequest` and `UpdateBannerRequest` enforcing title, placement, date range checks (`ends_at` after `starts_at`).
  - Create `StorePageRequest` and `UpdatePageRequest` enforcing title, slug uniqueness (regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`), status enum.

- [x] **Task 4: Service Layer Implementation**
  - Implement `BannerService`: CRUD, bulk reorder, active date filter calculation, audit logging.
  - Implement `PageService`: CRUD, HTML sanitization, slug availability check, audit logging.

- [x] **Task 5: Public API Controllers & Routes**
  - Implement `BannerController@index` for storefront active banners.
  - Implement `PageController@show` for storefront published CMS page by slug.
  - Register public routes in `routes/api.php` under `v1/banners` and `v1/pages/{slug}`.

- [x] **Task 6: Admin API Controllers & Routes**
  - Implement `AdminBannerController` (index, store, show, update, destroy, updateStatus, reorder).
  - Implement `AdminPageController` (index, store, show, update, destroy, updateStatus).
  - Register admin routes in `routes/api.php` with Sanctum auth and Spatie RBAC permission middleware (`permission:banners.*`, `permission:pages.*`).

- [x] **Task 7: React Admin Banners UI (`BannersPage.jsx` & `BannerModal.jsx`)**
  - Implement KPI summary cards, placement filter tabs, banner data table with thumbnail previews, status switches, sort order edit, and create/edit modal.

- [x] **Task 8: React Admin CMS Pages UI (`PagesPage.jsx`)**
  - Implement KPI summary cards, search filter, page listing table with status badges, slug copy button, and action controls.

- [x] **Task 9: React Admin Page Editor Component (`PageEditorModal.jsx`)**
  - Implement page editor form: title input, slug customizer button/field, HTML rich content editor, SEO Meta Title/Description inputs with live Google SERP preview card, and status selector.

- [x] **Task 10: Automated Testing & Verification**
  - Write PHPUnit / Pest tests (`tests/Feature/Admin/CmsManagementTest.php`) covering banner active scheduling, page slug uniqueness, RBAC permission authorization, public storefront responses, and admin CRUD.
  - Run `php artisan test` and verify 100% pass rate.
