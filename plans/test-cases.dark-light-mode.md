# Test Cases: Dark & Light Mode Theme Engine

**Module Name:** Dark & Light Mode Theme Engine  
**Module ID:** 25  
**Test File:** `plans/test-cases.dark-light-mode.md`  
**Specification:** `specifications/feature.dark-light-mode.spec.md`  
**Plan:** `plans/plan.dark-light-mode.md`  
**Version:** 1.0  
**Target Stack:** React 18 / CSS Variables / Vite  

---

## 1. Happy Path Scenarios

### TC-THEME-001: Header Theme Toggle Switching
- **Preconditions**: Admin user is logged in on `ProductsPage`. Current theme is Dark Mode.
- **Input**: Click Sun icon toggle button in top header bar.
- **Expected Result**: `html` element receives `data-theme="light"`. All page cards, tables, search inputs, modal overlays, sidebars, and headers transition to clean Light Mode palette. `localStorage.getItem('admin_theme')` returns `'light'`.

### TC-THEME-002: Theme Persistence Across Refresh & Navigation
- **Preconditions**: Theme is set to Light Mode.
- **Input**: Refresh browser or navigate from `ProductsPage` to `CategoriesPage` to `ProductFormModal`.
- **Expected Result**: Light Mode is retained without dark/white flash. All modal inputs, category trees, and product matrix tables render in Light Mode styling.
