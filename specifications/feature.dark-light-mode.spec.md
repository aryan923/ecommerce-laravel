# Feature Specification: Dark & Light Mode Theme Engine (Master Specification)

**Module Name:** Dark & Light Mode Theme Engine  
**Module ID:** 25  
**Specification File:** `specifications/feature.dark-light-mode.spec.md`  
**Version:** 1.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  
**Tech Stack:** React 18 / CSS Custom Properties / `localStorage` / ThemeContext / Vanilla CSS Design Tokens  

---

## 1. Module Overview

The Dark & Light Mode Theme Engine provides seamless, instantaneous theme switching across all Admin Panel pages, modals, tables, forms, sidebars, headers, cards, badges, and controls.

It features persistent user theme preference (`localStorage`), OS system preference auto-detection (`prefers-color-scheme`), smooth CSS color transitions, and zero un-styled flash on initial page render.

---

## 2. Complete Scope of Pages & Components Covered

Every page, component, modal, and element in the application is explicitly scoped:

```text
Admin Panel Layout & System
├── Top Navigation Bar (Header theme toggle switch, user profile menu, notification icons)
├── Sidebar Navigation (Brand logo, active page links, hover states, bottom theme quick switch)
│
Pages (100% Coverage)
├── 1. LoginPage (/admin/login) - Dark & Light card, form inputs, branding banner
├── 2. DashboardPage (/admin/dashboard) - Analytics KPI stat cards, charts container, quick action buttons, recent order tables
├── 3. ProductsPage (/admin/products) - Filter controls, search input, currency switcher, products data table, pagination, status badges
├── 4. CategoriesPage (/admin/categories) - Category hierarchy tree, search bar, status toggles, action buttons
├── 5. BrandsPage (/admin/brands) - Brands grid cards, logo previews, search filters, pagination
└── 6. AttributesPage (/admin/attributes) - Attribute list, values pills, matrix tool inputs
│
Modals & Components (100% Coverage)
├── 1. ProductFormModal.jsx - General, Variants & Attributes, Shipping & Specs, Pricing & Tax, Centralized Media, SEO, Digital tabs
├── 2. CategoryFormModal.jsx - Parent category dropdown, slug generator, status toggle, thumbnail uploader
├── 3. BrandFormModal.jsx - Brand name, logo uploader, featured toggle, description editor
├── 4. MediaLibraryModal.jsx - Centralized media uploader, dropzone, asset grid, filter tabs, asset details panel
├── 5. ImportProductsModal.jsx - Drag-and-drop CSV parser, record preview table, downloadable sample template button
└── 6. BulkActionsBar.jsx - Floating action bar, selected items counter, bulk delete/update buttons
```

---

## 3. CSS Tokens & Color Palette Mapping

### 3.1 Dark Mode Tokens (`[data-theme="dark"]` - Default)

| CSS Variable | Color Value | Usage |
|---|---|---|
| `--admin-bg` | `#0f172a` (Slate 900) | Main background |
| `--admin-sidebar-bg` | `#1e293b` (Slate 800) | Sidebar & Header background |
| `--admin-card-bg` | `#1e293b` (Slate 800) | Card & Panel container |
| `--admin-card-hover` | `#26354a` | Hover states |
| `--admin-border` | `#334155` (Slate 700) | Borders & Dividers |
| `--admin-text` | `#f8fafc` (Slate 50) | Primary body text |
| `--admin-muted` | `#94a3b8` (Slate 400) | Muted captions & secondary labels |
| `--admin-input-bg` | `#0f172a` (Slate 900) | Form input backgrounds |

### 3.2 Light Mode Tokens (`[data-theme="light"]`)

| CSS Variable | Color Value | Usage |
|---|---|---|
| `--admin-bg` | `#f8fafc` (Slate 50) | Main background |
| `--admin-sidebar-bg` | `#ffffff` (Pure White) | Sidebar & Header background |
| `--admin-card-bg` | `#ffffff` (Pure White) | Card & Panel container |
| `--admin-card-hover` | `#f1f5f9` (Slate 100) | Hover states |
| `--admin-border` | `#e2e8f0` (Slate 200) | Borders & Dividers |
| `--admin-text` | `#0f172a` (Slate 900) | Primary body text |
| `--admin-muted` | `#64748b` (Slate 500) | Muted captions & secondary labels |
| `--admin-input-bg` | `#ffffff` (Pure White) | Form input backgrounds |

---

## 4. Functional Requirements

- **FR-THEME-001**: React `ThemeContext` shall manage active theme state (`dark` | `light`).
- **FR-THEME-002**: Active theme shall be stored in `localStorage.setItem('admin_theme', theme)`.
- **FR-THEME-003**: System shall apply `data-theme="light"` or `data-theme="dark"` attribute to `document.documentElement` (`<html>` element).
- **FR-THEME-004**: Top Header and Sidebar shall feature an interactive Sun (`Sun`) / Moon (`Moon`) theme toggle button with smooth icon transition.
- **FR-THEME-005**: All pages, modals, tables, forms, inputs, dropdowns, tabs, pagination, tooltips, badges, and modals shall respond immediately to theme changes without requiring a page reload.

---

## 5. Technical Requirements

- **Framework**: React 18 / CSS Custom Properties / `localStorage`.
- **Zero-Flash Script**: Inline script in `index.blade.php` reads `localStorage` before DOM render to prevent white/dark flash.
- **CSS Transitions**: `transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease`.

---

## 6. Verification Criteria & Acceptance Checklist

1. Light/Dark toggle button in Top Header and Sidebar switches themes instantly across 100% of pages and modals.
2. Theme choice persists across browser refreshes and page navigation.
3. No hardcoded fixed color inline styles interfere with theme variables.
4. All backend and frontend builds complete cleanly (`cmd /c npm run build`).
