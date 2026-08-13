# Implementation Plan: Dark & Light Mode Theme Engine

**Module Name:** Dark & Light Mode Theme Engine  
**Module ID:** 25  
**Plan File:** `plans/plan.dark-light-mode.md`  
**Specification File:** `specifications/feature.dark-light-mode.spec.md`  
**Target Completion:** Completed  

---

## 1. Goal Description

Implement Dark & Light Mode Theme Engine providing comprehensive theme switching across all Admin Panel pages (`LoginPage`, `DashboardPage`, `ProductsPage`, `CategoriesPage`, `BrandsPage`, `AttributesPage`), components, and modals (`ProductFormModal`, `CategoryFormModal`, `BrandFormModal`, `MediaLibraryModal`, `ImportProductsModal`, `BulkActionsBar`).

---

## 2. User Review Required

> [!NOTE]
> - **Dark & Light Mode Engine**:
>   - Defines light mode tokens in `resources/css/admin.css` under `[data-theme="light"]`.
>   - Creates `ThemeContext.jsx` with `localStorage` persistence and OS auto-detection.
>   - Adds interactive Sun/Moon theme toggle switch to top header & sidebar.
>   - Refactors all inline fixed colors across all 6 pages and 6 modals to use CSS variables.

---

## 3. Task Breakdown Checklist

- [x] **Task 1: Define Light & Dark CSS Tokens System in `resources/css/admin.css`**
- [x] **Task 2: Create React `ThemeContext.jsx` & Hook (`useTheme`)**
- [x] **Task 3: Add Header & Sidebar Theme Toggle Button Component**
- [x] **Task 4: Audit & Refactor Inline Colors Across All 6 Admin Pages** (`LoginPage`, `DashboardPage`, `ProductsPage`, `CategoriesPage`, `BrandsPage`, `AttributesPage`)
- [x] **Task 5: Audit & Refactor Inline Colors Across All 6 Modals & Components** (`ProductFormModal`, `CategoryFormModal`, `BrandFormModal`, `MediaLibraryModal`, `ImportProductsModal`, `BulkActionsBar`)
- [x] **Task 6: Comprehensive Feature & Regression Validation** (Vite build + UI theme switching tests)
