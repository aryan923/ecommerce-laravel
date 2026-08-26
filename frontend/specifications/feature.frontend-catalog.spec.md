# Feature Specification: Frontend Product Catalog & Listing Pages Module

**Module Name:** Frontend Product Catalog & Listing Pages  
**Module ID:** 04 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-catalog.spec.md`  
**Version:** 1.0  
**Status:** Draft / Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 04), `frontend/Requirements/srs_pages.md` (§2.2)  

---

## 1. Module Overview

The **Product Catalog & Listing Pages** module provides dynamic browsing, searching, filtering, sorting, and pagination across all storefront products (`/products`), category collection pages (`/category/[slug]`), and brand storefront pages (`/brand/[slug]`). It features a multi-faceted filter sidebar (categories, price range slider, brand checkboxes, attribute swatches), sorting controls (price low/high, latest, popular, rating), layout view toggle (3/4 column grid vs list view), breadcrumb navigation, dynamic headers for category/brand routes, and page pagination. It connects directly to backend API endpoints: `GET /api/v1/products`, `GET /api/v1/categories/{slug}`, `GET /api/v1/brands/{slug}`, and `GET /api/v1/attributes`.

---

## 2. Page Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Breadcrumbs Navigation                                 |
+-----------------------------------------------------------------------------------+
|                     CategoryHeader / BrandHeader (Banners)                        |
+-----------------------------------------------------------------------------------+
|  FilterSidebar (Desktop Sidebar / Mobile Drawer)  |  SortToolbar (Sort & View Mode) |
|  - Category Tree TreeSelector                    |  - Item Result Counter          |
|  - Price Range Slider ($min - $max)               |  - Sort Selector Dropdown       |
|  - Brand Checkboxes                              |  - Grid / List Layout Toggle    |
|  - Attribute Swatches (Size/Color)               +---------------------------------+
|  - Active Filter Chips & Clear All               |  ProductGrid                    |
|                                                   |  - 3/4 Column Product Cards     |
|                                                   |  - Responsive Skeleton Loader   |
|                                                   +---------------------------------+
|                                                   |  Pagination (Page Navigation)   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Functional Requirements

- **FR-FCT-001**: System shall render the main Product Catalog route at `frontend/src/app/products/page.js` displaying all store products with page title, filter sidebar, sort toolbar, product grid, and pagination.
- **FR-FCT-002**: System shall render dynamic Category Collection routes at `frontend/src/app/category/[slug]/page.js` displaying category banner, description, parent/child category shortcuts, and pre-filtered product grid for `{slug}`.
- **FR-FCT-003**: System shall render dynamic Brand Collection routes at `frontend/src/app/brand/[slug]/page.js` displaying brand logo header, description, and pre-filtered product grid for `{slug}`.
- **FR-FCT-004**: System shall provide `FilterSidebar.jsx` supporting:
  - Category tree selection.
  - Interactive dual-thumb Price Range Slider filtering products by `price_min` and `price_max`.
  - Brand selection checkboxes.
  - Attribute chips (Size swatches like S/M/L, Color swatches).
  - Active filter tags with single-click remove buttons and "Clear All" action.
  - Mobile slide-out drawer toggle on small viewports (`< 768px`).
- **FR-FCT-005**: System shall provide `SortToolbar.jsx` with sorting dropdown supporting:
  - *Featured* (`sort=featured`)
  - *Price: Low to High* (`sort=price_asc`)
  - *Price: High to Low* (`sort=price_desc`)
  - *Newest Arrivals* (`sort=latest`)
  - *Customer Rating* (`sort=rating`)
  - Layout view toggling between **3-Column Grid**, **4-Column Grid**, and **List View**.
- **FR-FCT-006**: System shall provide `Breadcrumbs.jsx` rendering clickable path hierarchy (`Home > Catalog > Electronics > Headphones`).
- **FR-FCT-007**: Products in the grid shall render using `ProductCard.jsx` with instant "Add to Cart" drawer triggers, wishlist heart toggles, star ratings, and price formatting.
- **FR-FCT-008**: System shall provide `Pagination.jsx` rendering numbered page buttons and Previous/Next links while preserving active filter query parameters (`?category=fashion&price_min=50&sort=price_asc&page=2`).
- **FR-FCT-009**: System shall render responsive skeleton loading cards while API requests are pending.
- **FR-FCT-010**: System shall provide automated Playwright E2E test spec `frontend/tests/e2e/catalog.spec.js` validating catalog loading, category filtering, price slider updates, sorting dropdown options, pagination transitions, and dynamic category/brand pages.

---

## 4. Technical Specifications & File Map

| Component / Layer | Target File Location | Purpose |
|---|---|---|
| Products Route | `frontend/src/app/products/page.js` | Main products catalog page |
| Category Route | `frontend/src/app/category/[slug]/page.js` | Category collection catalog page |
| Brand Route | `frontend/src/app/brand/[slug]/page.js` | Brand storefront catalog page |
| Breadcrumbs | `frontend/src/components/common/Breadcrumbs.jsx` | Clickable breadcrumb path |
| Filter Sidebar | `frontend/src/components/catalog/FilterSidebar.jsx` | Category, price slider, brand & attribute filters |
| Sort Toolbar | `frontend/src/components/catalog/SortToolbar.jsx` | Sorting dropdown, counter & view toggles |
| Pagination | `frontend/src/components/catalog/Pagination.jsx` | Numbered page navigation |
| Catalog Layout | `frontend/src/components/catalog/CatalogLayout.jsx` | Layout container for sidebar, grid & toolbar |
| Category Header | `frontend/src/components/catalog/CategoryHeader.jsx` | Category banner, title & subcategory chips |
| Brand Header | `frontend/src/components/catalog/BrandHeader.jsx` | Brand header logo & bio banner |
| E2E Catalog Spec | `frontend/tests/e2e/catalog.spec.js` | Playwright E2E test suite for catalog module |

---

## 5. API Endpoint Mapping

- `GET /api/v1/products`: Fetches product grid items with query parameters (`category`, `brand`, `attribute`, `price_min`, `price_max`, `sort`, `search`, `page`, `per_page`).
- `GET /api/v1/categories/{slug}`: Fetches category metadata, banner image, child categories, and product count.
- `GET /api/v1/brands/{slug}`: Fetches brand metadata, logo, description, and product count.
- `GET /api/v1/attributes`: Fetches faceted attribute options (Color, Size, Material).
