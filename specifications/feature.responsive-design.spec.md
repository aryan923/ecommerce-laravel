# Feature Specification: Full-Device Responsive Layout Engine (Master Specification)

**Module Name:** Full-Device Responsive Layout Engine  
**Module ID:** 26  
**Specification File:** `specifications/feature.responsive-design.spec.md`  
**Version:** 1.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  
**Tech Stack:** React 18 / CSS3 Flexbox & Grid / Media Queries / Vite / Mobile Drawer Layout Engine  

---

## 1. Module Overview

The Full-Device Responsive Layout Engine transforms all Admin Panel pages, modals, tables, forms, sidebars, headers, cards, toolbars, and controls into an adaptively responsive interface across all screen resolutions—from mobile smartphones (320px) to iPads/tablets (768px), laptops (1024px), and 4K ultra-wide monitors (1920px+).

---

## 2. Complete Scope of Pages & Components Covered

Every page, component, modal, and layout element in the application is explicitly scoped for 100% responsiveness:

```text
Responsive Layout Shell & Mobile Drawer
├── Mobile Hamburger Toggle Button in Header (renders on < 1024px screens)
├── Collapsible Mobile Drawer Sidebar overlay with backdrop dismiss
├── Adaptive Header Bar (Collapses user email/name on mobile, stacks page title)
│
Pages (100% Responsive Coverage)
├── 1. LoginPage (/admin/login) - Fluid centered card, mobile keyboard input optimization
├── 2. DashboardPage (/admin/dashboard) - Responsive KPI grid (1-col mobile, 2-col tablet, 4-col desktop), responsive chart height, stacked order tables
├── 3. ProductsPage (/admin/products) - Responsive toolbar (stack search, filters, actions on mobile), horizontally scrollable data table with touch-friendly checkboxes
├── 4. CategoriesPage (/admin/categories) - Responsive category tree & action buttons stack
├── 5. BrandsPage (/admin/brands) - Fluid brand cards grid (1-col mobile, 2-col tablet, 4-col desktop)
└── 6. AttributesPage (/admin/attributes) - Responsive attribute matrix builder & value pills wrapper
│
Modals & Components (100% Responsive Coverage)
├── 1. ProductFormModal.jsx - Responsive modal card width (100% width on mobile), horizontally scrollable tabs bar, 1-column grid stack on mobile for inputs & shipping fields
├── 2. CategoryFormModal.jsx - Responsive 100% width mobile modal card & touch-friendly select fields
├── 3. BrandFormModal.jsx - Responsive image preview upload box & full-width buttons
├── 4. MediaLibraryModal.jsx - Responsive media grid (2-col mobile, 4-col tablet, 6-col desktop), stacked sidebar details panel on small screens
├── 5. ImportProductsModal.jsx - Responsive CSV drag-and-drop box & scrollable preview table
└── 6. BulkActionsBar.jsx - Fixed responsive floating toolbar with compact icon buttons on mobile
```

---

## 3. Responsive Breakpoints Specification

| Breakpoint Target | Width Range | Layout Adaptations |
|---|---|---|
| **Mobile Extra Small (xs)** | `< 576px` | Sidebar hidden into overlay drawer; 1-column grids; stacked headers; full-screen modals |
| **Mobile Landscape / Small (sm)** | `576px - 767px` | 1 to 2 column grids; scrollable tables; touch-optimized buttons |
| **Tablet Portrait (md)** | `768px - 991px` | 2-column KPI grids; compact sidebar option; responsive table columns |
| **Laptop / Desktop (lg)** | `992px - 1199px` | Full sidebar visible; 4-column KPI grids; side-by-side modal panels |
| **Ultra-Wide Desktop (xl/2xl)** | `>= 1200px` | Maximum container width cap; multi-pane dashboard widgets |

---

## 4. Functional Requirements

- **FR-RESP-001**: Sidebar shall automatically collapse into a slide-over mobile drawer on screens `< 1024px`.
- **FR-RESP-002**: Top header bar shall display a mobile hamburger menu button on screens `< 1024px` to open/close the sidebar drawer.
- **FR-RESP-003**: All data tables (`ProductsPage`, `DashboardPage`, `ImportProductsModal`) shall feature smooth touch horizontal scrolling with fixed column widths so data is never clipped or truncated.
- **FR-RESP-004**: All modals (`ProductFormModal`, `CategoryFormModal`, `BrandFormModal`, `MediaLibraryModal`, `ImportProductsModal`) shall scale smoothly to 100% viewport width with mobile padding on small screens.
- **FR-RESP-005**: All form grids (2-column and 3-column input layouts) shall wrap automatically into 1-column stacked layouts on screens `< 768px`.

---

## 5. Technical Requirements

- **CSS Media Queries**: Extended rules in `resources/css/admin.css` for `@media (max-width: 1024px)`, `@media (max-width: 768px)`, and `@media (max-width: 480px)`.
- **Touch Optimization**: Minimum touch target size `44px x 44px` for mobile buttons & checkboxes.

---

## 6. Verification Criteria & Acceptance Checklist

1. Application layout and all 6 pages scale adaptively on 320px, 375px, 768px, 1024px, and 1440px viewport resolutions.
2. Hamburger button toggles mobile drawer on screens `< 1024px`.
3. All modals expand smoothly without horizontal page overflow.
4. Production Vite asset build completes cleanly (`cmd /c npm run build`).
