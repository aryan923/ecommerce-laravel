# Implementation Plan: Module 23 — Admin Product Management (Backend & React UI)

**Module Name:** Admin Product Management  
**Module ID:** 23  
**Plan File:** `plans/plan.admin-products.md`  
**Specification File:** `specifications/feature.admin-products.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 23 (Admin Product Management) featuring both the backend APIs (`/api/v1/admin/products/*`) and the **React Admin Product Management UI** mounted at `/admin/products`. The UI will provide real-time product search & filtering, paginated data table, quick status toggle, product duplication, bulk operations floating toolbar, and a CSV product import modal.

---

## 2. User Review Required

> [!NOTE]
> - React Admin Product Management view mounted at `/admin/products` (`resources/js/admin/pages/ProductsPage.jsx`).
> - Interactive search, filters (type, status, brand, category), product duplication, bulk operations toolbar, and CSV import modal.

---

## 3. Open Questions

*None at this time. All API endpoints and React UI specifications are finalized.*

---

## 4. Proposed Changes & Task Breakdown

### React Admin Product Management Components
- **[NEW]** [`resources/js/admin/pages/ProductsPage.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/pages/ProductsPage.jsx) — Admin Product Management Data Table, Filters, Duplication, Bulk Actions Bar, CSV Import Modal.
- **[NEW]** [`resources/js/admin/components/BulkActionsBar.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/components/BulkActionsBar.jsx) — Reusable floating bulk actions toolbar.
- **[NEW]** [`resources/js/admin/components/ImportProductsModal.jsx`](file:///d:/Projects/ecommerce_laravel/resources/js/admin/components/ImportProductsModal.jsx) — Reusable CSV/JSON product import dialog.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Implement ImportProductsJob & ProductService Extensions**
- [x] **Task 2: Implement Form Request Classes**
- [x] **Task 3: Update ProductController with OpenAPI Annotations**
- [x] **Task 4: Register API Routes**
- [x] **Task 5: Generate Swagger Docs**
- [x] **Task 6: Feature Testing**
- [ ] **Task 7: Build React Admin Products Management View** (`ProductsPage.jsx`, `BulkActionsBar.jsx`, `ImportProductsModal.jsx`)
