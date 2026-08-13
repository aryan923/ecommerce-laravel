# Implementation Plan: Module 22 — Admin Dashboard (Backend & React UI)

**Module Name:** Admin Dashboard  
**Module ID:** 22  
**Plan File:** `plans/plan.admin-dashboard.md`  
**Specification File:** `specifications/feature.admin-dashboard.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 22 (Admin Dashboard) featuring both the backend APIs (`/api/v1/admin/dashboard/*`) and the **React Admin UI SPA** mounted at `/admin`. The React Admin UI will provide executive KPI card widgets, an interactive sales chart with period selector, order lifecycle distribution cards, top-performing product/category rankings, and recent orders & low-stock highlight panels.

---

## 2. User Review Required

> [!NOTE]
> - React SPA setup using Vite + React mounted at `/admin` (`resources/js/admin/main.jsx`).
> - Modern dashboard styling using CSS variables, custom charts, glassmorphism header, responsive sidebar navigation.
> - Live data integration with `/api/v1/admin/dashboard/*` endpoints.

---

## 3. Open Questions

*None at this time. All API endpoints and React UI specifications are finalized.*

---

## 4. Proposed Changes & Task Breakdown

### React Admin Framework & Environment Setup
- **[MODIFY]** [`package.json`](file:///d:/Projects/ecommerce_laravel/package.json) — Add React 18, `react-dom`, `@vitejs/plugin-react`, `lucide-react`, `axios`, `react-router-dom`.
- **[MODIFY]** [`vite.config.js`](file:///d:/Projects/ecommerce_laravel/vite.config.js) — Configure `@vitejs/plugin-react` and `resources/js/admin/main.jsx`.
- **[NEW]** [`resources/views/admin.blade.php`](file:///d:/Projects/ecommerce_laravel/resources/views/admin.blade.php) — Blade layout mounting `#admin-root`.
- **[MODIFY]** [`routes/web.php`](file:///d:/Projects/ecommerce_laravel/routes/web.php) — Route `/admin/{any?}` to `admin.blade.php`.

### React Admin Components & Layout
- **[NEW]** [`resources/js/admin/main.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/main.jsx) — React SPA entrypoint.
- **[NEW]** [`resources/js/admin/App.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/App.jsx) — Main Admin Layout (Sidebar, Topbar, Breadcrumbs, Navigation).
- **[NEW]** [`resources/js/admin/pages/DashboardPage.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/pages/DashboardPage.jsx) — Admin Dashboard Page with KPIs, Sales Chart, Order Stats, Top Performers, Highlights.
- **[NEW]** [`resources/css/admin.css`](file:///d:/Projects/ecommerce_laravel/resources/css/admin.css) — Custom dashboard theme styles.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Implement AdminDashboardService**
- [x] **Task 2: Implement AdminDashboardController**
- [x] **Task 3: Register API Routes**
- [x] **Task 4: Generate Swagger Docs**
- [x] **Task 5: Feature Testing**
- [ ] **Task 6: Setup Vite + React Admin SPA Infrastructure** (`package.json`, `vite.config.js`, `admin.blade.php`, `web.php`)
- [ ] **Task 7: Build React Admin Layout & Theme** (`main.jsx`, `App.jsx`, `admin.css`)
- [ ] **Task 8: Build React Admin Dashboard View** (`DashboardPage.jsx` with KPIs, Chart, Stats, Highlights)
