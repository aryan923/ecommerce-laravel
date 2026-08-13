# Feature Specification: Attribute & Variant Management Module (/admin/attributes)

**Module Name:** Attribute & Variant Management Module  
**Module ID:** 26  
**Specification File:** `specifications/feature.admin-attributes.spec.md`  
**Version:** 2.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  

---

## 1. Module Overview

The Attribute & Variant Management module allows store admins to manage product variant attributes (e.g. Size, Color, Material) and their option values (e.g. Small, Medium, Large, Navy Blue) with eager loaded relationships, inline value deletion capabilities, and 100% responsive grid layouts across all screen resolutions (320px smartphones to 4K displays).

---

## 2. Bug Fix & Data Flow Specifications

- **Root Cause**: `AttributeService::list()` used `Attribute::withCount('values')` without eager loading `with('values')`, causing the API response to omit attribute option values.
- **Backend Fix**: Eager load `with('values')` in `AttributeService::list()`.
- **Frontend Fix & Value Management**:
  - Render option value pills with quick delete actions (`handleDeleteValue`).
  - Eagerly refresh attribute catalog on value option creation and deletion.

---

## 3. Responsive UI Design Specifications

| Viewport Target | Resolution | UI Adaptations |
|---|---|---|
| **Mobile Extra Small (xs)** | `< 576px` | Header actions stack; attribute cards grid collapses to 1-column layout (`repeat(auto-fit, minmax(260px, 1fr))`); value option pills wrap gracefully; modals scale to 95vw. |
| **Tablet / Laptop (sm/md)** | `576px - 1024px` | 2-column attribute cards grid. |
| **Desktop (lg/xl)** | `>= 1025px` | Multi-column attribute grid; fixed left navigation sidebar. |

---

## 4. Core Functional Requirements

- **FR-ATT-001**: Attribute CRUD management (Create, Delete).
- **FR-ATT-002**: Attribute Value Option CRUD management (Create Value, Delete Value, List Values).
- **FR-ATT-003**: 100% responsive attribute card grid and modal dialogs.
