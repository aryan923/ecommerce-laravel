# Feature Specification: Admin Dashboard Module (Backend & React UI)

**Module Name:** Admin Dashboard  
**Module ID:** 22  
**Specification File:** `specifications/feature.admin-dashboard.spec.md`  
**Version:** 2.0 (Updated with React Admin UI)  
**Status:** Approved / Extended with React Admin UI  
**Base SRS References:** `Requirements/srs_apis.md` (§61), `Requirements/admin_panel.md` (§3), `Requirements/development_modules.md` (§Module 22)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite + React SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Dashboard module provides store administrators with real-time operational visibility, executive KPI metrics, sales analytics, order status distribution, top-performing product/category breakdowns, and critical stock alert highlights.

The module incorporates both **Backend Admin APIs** (`/api/v1/admin/dashboard/*`) and a **Vite + React Admin Single Page Application (SPA)** mounted at `/admin` featuring a sleek, responsive dashboard UI with dark/light theme options, interactive period selector filters, visual sales charts, KPI cards, recent order tables, and low-stock alert widgets.

---

## 2. Architecture & Business Flow

```text
  Browser Navigation to /admin
              │
              ▼
  Laravel Routes (routes/web.php) -> resources/views/admin.blade.php
              │
              ▼
  Vite React App (resources/js/admin/main.jsx)
  ├── Admin Layout (Sidebar, Header with Quick Controls, Breadcrumbs)
  ├── Dashboard View Component (resources/js/admin/pages/DashboardPage.jsx)
  │     ├── Summary KPI Cards Widget (Fetches /api/v1/admin/dashboard/kpis)
  │     ├── Interactive Sales Chart Widget (Fetches /api/v1/admin/dashboard/sales-chart?period=...)
  │     ├── Order Status Breakdown Component (Fetches /api/v1/admin/dashboard/order-stats)
  │     ├── Top Selling Products & Categories (Fetches /api/v1/admin/dashboard/top-performers)
  │     └── Recent Orders & Low Stock Alert Widgets (Fetches /api/v1/admin/dashboard/highlights)
```

---

## 3. Functional Requirements

### 3.1 Backend API Requirements
- **FR-DASH-001**: Dashboard KPI endpoint (`GET /api/v1/admin/dashboard/kpis`) shall return total revenue, today's revenue, monthly revenue, total orders, today's orders, pending orders, delivered orders, cancelled orders, total customers, new customers (last 30 days), total active products, low-stock products count, pending returns count, and pending refunds count.
- **FR-DASH-002**: Sales chart endpoint (`GET /api/v1/admin/dashboard/sales-chart`) shall support date filtering (`period`: `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_month`, `last_month`, `custom`) and return time-series revenue and order counts.
- **FR-DASH-003**: Order statistics endpoint (`GET /api/v1/admin/dashboard/order-stats`) shall return counts for every order status.
- **FR-DASH-004**: Top performers endpoint (`GET /api/v1/admin/dashboard/top-performers`) shall return top 5 selling products and top categories.
- **FR-DASH-005**: Dashboard highlights endpoint (`GET /api/v1/admin/dashboard/highlights`) shall return 5 most recent orders and low-stock inventory highlights.

### 3.2 React Admin UI Requirements
- **FR-DASH-UI-001**: Mount React SPA at `/admin` via `resources/views/admin.blade.php` and `resources/js/admin/main.jsx`.
- **FR-DASH-UI-002**: Provide a modern, responsive layout with collapsible Sidebar, Header, Breadcrumbs, and Theme styling.
- **FR-DASH-UI-003**: Display 10+ executive KPI card widgets showing live statistics with loading skeletons.
- **FR-DASH-UI-004**: Display an interactive Sales Chart with a period filter dropdown (`Today`, `Last 7 Days`, `Last 30 Days`, `This Month`, `Custom Date Range`).
- **FR-DASH-UI-005**: Display Order Status distribution cards, Top Selling Products ranking table, Top Categories table, Recent Orders list, and Low Stock Alert panel.

---

## 4. Verification Criteria

1. Navigating to `/admin` loads the Vite + React Admin SPA.
2. Dashboard view fetches and renders live KPI data from API endpoints.
3. Changing period filter updates sales chart dynamically.
4. All unit and feature tests continue to pass cleanly.
