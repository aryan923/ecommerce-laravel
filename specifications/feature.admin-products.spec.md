# Feature Specification: Admin Product Management Module (Backend & React UI)

**Module Name:** Admin Product Management  
**Module ID:** 23  
**Specification File:** `specifications/feature.admin-products.spec.md`  
**Version:** 2.0 (Updated with React Admin UI)  
**Status:** Approved / Extended with React Admin UI  
**Base SRS References:** `Requirements/srs_apis.md` (§68–§70), `Requirements/admin_panel.md` (§5–§6), `Requirements/development_modules.md` (§Module 23)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite + React SPA) / Vanilla Modern CSS / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Product Management module provides store administrators with comprehensive catalog operations, including full product CRUD, multi-variant combination management, product duplication, bulk status & pricing operations, queue-based product import capability, and an interactive **React Admin UI interface** at `/admin/products`.

---

## 2. Architecture & Business Flow

```text
  React Admin SPA (/admin/products)
  ├── Product Listing Table Component (resources/js/admin/pages/ProductsPage.jsx)
  │     ├── Live Search & Filter Bar (Name/SKU Search, Status, Type, Brand, Category)
  │     ├── Action Toolbar (Create Product, Bulk Operations Bar, CSV Import Modal Trigger)
  │     ├── Paginated Data Table with Status Badges, Pricing, Stock Level Indicator
  │     └── Item Row Actions (Edit, Duplicate, Quick Status Toggle, Delete)
  ├── Product Duplication Trigger (Calls POST /api/v1/admin/products/{id}/duplicate)
  ├── Bulk Actions Bar (Selection checkboxes -> Calls POST /api/v1/admin/products/bulk)
  └── CSV Product Import Modal (File drag-drop -> Calls POST /api/v1/admin/products/import)
```

---

## 3. Functional Requirements

### 3.1 Backend API Requirements
- **FR-APRD-001**: Admin shall have complete CRUD control over products with search, multi-field filtering, sorting, and pagination.
- **FR-APRD-002**: Product duplication endpoint (`POST /api/v1/admin/products/{id}/duplicate`) clones product data, category attachments, and variants.
- **FR-APRD-003**: Bulk operations endpoint (`POST /api/v1/admin/products/bulk`) handles `activate`, `deactivate`, `archive`, `delete`, `update_category`, `update_price`, `update_stock`.
- **FR-APRD-004**: Product import endpoint (`POST /api/v1/admin/products/import`) enqueues `ImportProductsJob`.

### 3.2 React Admin UI Requirements
- **FR-APRD-UI-001**: Render Product Management view at `/admin/products` within the React Admin SPA layout.
- **FR-APRD-UI-002**: Data table listing products with image thumbnail, SKU, name, status pill badge, price, stock badge, and action buttons.
- **FR-APRD-UI-003**: Search and filter toolbar for real-time query parameters (`search`, `status`, `type`, `brand_id`, `category_id`).
- **FR-APRD-UI-004**: Interactive Duplicate action on each product row showing success notification upon cloning.
- **FR-APRD-UI-005**: Multi-select Bulk Actions floating bar allowing batch activation, deactivation, archiving, deletion, price update, and stock update.
- **FR-APRD-UI-006**: CSV Product Import modal dialog with JSON/CSV file upload parser and validation response preview.

---

## 4. Verification Criteria

1. Navigating to `/admin/products` loads the React Product Management UI.
2. Search and filter controls query the API dynamically.
3. Clicking Duplicate clones the product and updates the table list.
4. Bulk operations execute successfully on selected items.
5. All backend tests pass cleanly.
