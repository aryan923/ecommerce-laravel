# Feature Specification: Product Management Module (/admin/products) & Frontend Auth Import Fix

**Module Name:** Product Management & Admin Authentication  
**Module ID:** 23  
**Specification File:** `specifications/feature.admin-products.spec.md`  
**Version:** 8.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  

---

## 1. Module Overview

The Product Management and Admin Authentication modules provide catalog management, RBAC authentication, and **Clean Frontend Hook Imports**.

---

## 2. Admin Login Page Specifications

- **AuthContext Hook Import**:
  - Add explicit `import { useAuth } from '../context/AuthContext';` to `resources/js/admin/pages/LoginPage.jsx`.
  - Resolves `Uncaught ReferenceError: useAuth is not defined` crash on login page load.

---

## 3. Core Functional Requirements

- **FR-PRD-001**: Support Simple, Variable, and Digital products.
- **FR-PRD-002**: Multi-currency display switcher (`INR`, `USD`, `EUR`, `GBP`).
- **FR-PRD-003**: Polymorphic Media attachment integration.
- **FR-PRD-004**: Explicit import of `useAuth` hook in `LoginPage.jsx`.
