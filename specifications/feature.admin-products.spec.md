# Feature Specification: Product Management Module (/admin/products) & Media Preview URL Fix

**Module Name:** Product Management & Media Preview Resolution  
**Module ID:** 23  
**Specification File:** `specifications/feature.admin-products.spec.md`  
**Version:** 10.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  

---

## 1. Module Overview

The Product Management and Media Asset modules provide catalog management, centralized media library uploads, and **Relative Host Storage URL Resolution**.

---

## 2. Media Preview URL Specifications

- **Media Model URL Accessor**:
  - Add `getUrlAttribute` accessor in `app/Models/Media.php` to convert `http://localhost/storage/...` to relative `/storage/...` URLs.
- **Media Service Storage URL Normalization**:
  - Update `MediaService.php` to store relative `/storage/` asset URLs upon upload.
- **Media Library Modal Preview Normalization**:
  - Update `MediaLibraryModal.jsx` image `src` rendering to format storage URLs cleanly for browser preview cards.

---

## 3. Core Functional Requirements

- **FR-PRD-001**: Support Simple, Variable, and Digital products.
- **FR-PRD-002**: Multi-currency display switcher (`INR`, `USD`, `EUR`, `GBP`).
- **FR-PRD-003**: Polymorphic Media attachment integration.
- **FR-PRD-004**: Relative host storage URL resolution for 100% media preview image loading.
