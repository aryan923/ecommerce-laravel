# Regression Strategy: Full-Device Responsive Layout Engine

**Module Name:** Full-Device Responsive Layout Engine  
**Module ID:** 26  
**Regression File:** `plans/regression.responsive-design.md`  
**Specification:** `specifications/feature.responsive-design.spec.md`  
**Plan:** `plans/plan.responsive-design.md`  
**Version:** 1.0  
**Target Stack:** React 18 / CSS Media Queries / Vite  

---

## 1. Existing Affected Features

Responsive Layout Engine impacts:
- **All 6 Admin Pages**: `LoginPage`, `DashboardPage`, `ProductsPage`, `CategoriesPage`, `BrandsPage`, `AttributesPage`.
- **All 6 Modals & Components**: `ProductFormModal`, `CategoryFormModal`, `BrandFormModal`, `MediaLibraryModal`, `ImportProductsModal`, `BulkActionsBar`.

---

## 2. Regression Scenarios

### REG-RESP-001: Desktop Viewport Integrity
- **Scenario**: Verify that responsive media queries do not break desktop layout on 1440px+ screens.
- **Priority**: Critical
- **Expected Result**: Full sidebar fixed on left; multi-column grids render cleanly without unnecessary stacking.

---

## 3. Smoke & Integration Test Suite

1. Verify layout across 320px, 375px, 768px, 1024px, and 1440px viewports.
2. Build Vite asset bundle with `cmd /c npm run build`.
