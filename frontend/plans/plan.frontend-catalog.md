# Implementation Plan: Frontend Product Catalog & Listing Pages

**Module Name:** Frontend Product Catalog & Listing Pages  
**Module ID:** 04 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-catalog.md`  
**Specification File:** `frontend/specifications/feature.frontend-catalog.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Ready for Implementation  

---

## 1. Module Summary

This implementation plan outlines the development strategy for **Frontend Module 04: Product Catalog & Listing Pages**. It builds the complete search, filter, sort, and browsing experience across `/products`, `/category/[slug]`, and `/brand/[slug]` routes. Key components include `Breadcrumbs.jsx`, `FilterSidebar.jsx` (category tree, price slider, brand checkboxes, attribute swatches), `SortToolbar.jsx` (sort selector, result counter, view mode toggle), `Pagination.jsx`, `CategoryHeader.jsx`, `BrandHeader.jsx`, `CatalogLayout.jsx`, and automated Playwright test suite `catalog.spec.js`.

---

## 2. Development Strategy

1. **Breadcrumbs Navigation Component**:
   - Implement `frontend/src/components/common/Breadcrumbs.jsx` rendering structured category hierarchy links (`Home > Catalog > Category`).
2. **Filter Sidebar Component**:
   - Implement `frontend/src/components/catalog/FilterSidebar.jsx` with category selection, price range slider, brand checkboxes, attribute chips, active filter tags, clear-all action, and mobile drawer.
3. **Sort Toolbar Component**:
   - Implement `frontend/src/components/catalog/SortToolbar.jsx` with item result count, sorting dropdown (Price, Latest, Rating), and grid/list view toggle buttons.
4. **Pagination Component**:
   - Implement `frontend/src/components/catalog/Pagination.jsx` rendering page buttons and handling query string URL state updates (`?page=2`).
5. **Catalog Header Banners**:
   - Implement `frontend/src/components/catalog/CategoryHeader.jsx` displaying category title, banner image, description, and subcategory pill links.
   - Implement `frontend/src/components/catalog/BrandHeader.jsx` displaying brand logo, banner, and bio.
6. **Catalog Layout Assembly**:
   - Implement `frontend/src/components/catalog/CatalogLayout.jsx` bringing together sidebar, toolbar, grid, and pagination with state handling and API calls.
7. **Assemble App Routes**:
   - Implement `frontend/src/app/products/page.js` for all-products catalog route.
   - Implement `frontend/src/app/category/[slug]/page.js` for category-filtered routes.
   - Implement `frontend/src/app/brand/[slug]/page.js` for brand-filtered routes.
8. **Automated E2E Testing**:
   - Implement `frontend/tests/e2e/catalog.spec.js` and run Playwright tests to verify grid loading, category filtering, price slider, sorting, pagination, and detail routes.

---

## 3. Task Breakdown

- [ ] **Task 1: Implement Breadcrumbs Component**
  - File: `frontend/src/components/common/Breadcrumbs.jsx`
  - Description: Reusable breadcrumb path component for navigation hierarchy.

- [ ] **Task 2: Implement FilterSidebar Component**
  - File: `frontend/src/components/catalog/FilterSidebar.jsx`
  - Description: Sidebar accordion for category tree, dual-thumb price slider, brand checkboxes, attribute chips, and clear filters.

- [ ] **Task 3: Implement SortToolbar Component**
  - File: `frontend/src/components/catalog/SortToolbar.jsx`
  - Description: Header bar with result count, sort dropdown options, and grid/list view toggle.

- [ ] **Task 4: Implement Pagination Component**
  - File: `frontend/src/components/catalog/Pagination.jsx`
  - Description: Numbered page pagination component preserving filter URL query params.

- [ ] **Task 5: Implement CategoryHeader & BrandHeader Components**
  - Files: `frontend/src/components/catalog/CategoryHeader.jsx` & `frontend/src/components/catalog/BrandHeader.jsx`
  - Description: Banner headers for category and brand listing routes.

- [ ] **Task 6: Implement CatalogLayout Component**
  - File: `frontend/src/components/catalog/CatalogLayout.jsx`
  - Description: Container assembling filter sidebar, sort toolbar, product grid, and pagination with API state.

- [ ] **Task 7: Implement Products Route (`/products`)**
  - File: `frontend/src/app/products/page.js`
  - Description: All-products catalog page wrapper.

- [ ] **Task 8: Implement Category (`/category/[slug]`) & Brand (`/brand/[slug]`) Routes**
  - Files: `frontend/src/app/category/[slug]/page.js` & `frontend/src/app/brand/[slug]/page.js`
  - Description: Dynamic category and brand catalog page wrappers.

- [ ] **Task 9: Implement Playwright E2E Catalog Test Suite**
  - File: `frontend/tests/e2e/catalog.spec.js`
  - Description: Automated Playwright test suite covering catalog grid rendering, filtering, sorting, pagination, and dynamic routes.
