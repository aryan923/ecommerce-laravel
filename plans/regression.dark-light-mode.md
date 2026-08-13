# Regression Strategy: Dark & Light Mode Theme Engine

**Module Name:** Dark & Light Mode Theme Engine  
**Module ID:** 25  
**Regression File:** `plans/regression.dark-light-mode.md`  
**Specification:** `specifications/feature.dark-light-mode.spec.md`  
**Plan:** `plans/plan.dark-light-mode.md`  
**Version:** 1.0  
**Target Stack:** React 18 / CSS Variables / Vite  

---

## 1. Existing Affected Features

Dark & Light Mode Theme Engine impacts:
- **All 6 Admin Pages**: `LoginPage`, `DashboardPage`, `ProductsPage`, `CategoriesPage`, `BrandsPage`, `AttributesPage`.
- **All 6 Modals & Components**: `ProductFormModal`, `CategoryFormModal`, `BrandFormModal`, `MediaLibraryModal`, `ImportProductsModal`, `BulkActionsBar`.

---

## 2. Regression Scenarios

### REG-THEME-001: Modal Input Visibility in Light Mode
- **Scenario**: Verify that form inputs, dropdowns, check boxes, and textareas inside `ProductFormModal` have high contrast text, white background, and clear slate borders when opened in Light Mode.
- **Priority**: Critical
- **Expected Result**: Clean text contrast with no invisible dark text on dark backgrounds.

---

## 3. Smoke & Integration Test Suite

1. Verify theme toggle on all 6 pages.
2. Build Vite asset bundle with `cmd /c npm run build`.
