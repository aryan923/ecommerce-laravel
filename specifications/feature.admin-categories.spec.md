# Feature Specification: Category Management Module (/admin/categories)

**Module Name:** Category Management Module  
**Module ID:** 24  
**Specification File:** `specifications/feature.admin-categories.spec.md`  
**Version:** 2.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  
**Tech Stack:** React 18 / MediaLibraryModal / Laravel Media API  

---

## 1. Module Overview

The Category Management module allows store admins to manage hierarchical product categories and subcategories, integrate Centralized Media Library upload pickers for category thumbnails (`image_url`) and banner graphics (`banner_url`), preview image assets, display category thumbnail columns in the data table, and ensure 100% responsiveness across all viewports.

---

## 2. Centralized Image Upload Specifications

- **Integration Component**: `MediaLibraryModal.jsx` (`resources/js/admin/components/MediaLibraryModal.jsx`).
- **Category Thumbnail (`image_url`)**:
  - Image picker trigger button opening Centralized Media Library.
  - Image preview card (60x60px) with Remove/Replace buttons.
  - Text input fallback for manual URL entry.
- **Category Banner (`banner_url`)**:
  - Image picker trigger button opening Centralized Media Library.
  - Banner preview container with Remove/Replace buttons.
  - Text input fallback for manual URL entry.
- **Categories Table Display**:
  - Add 48x48px image thumbnail column in `CategoriesPage.jsx` rendering `image_url` with fallback icon (`Tag`).

---

## 3. Core Functional Requirements

- **FR-CAT-001**: Hierarchical category tree structure with subcategory indicators (`CornerDownRight`).
- **FR-CAT-002**: Quick status toggle (`active` / `inactive`).
- **FR-CAT-003**: Integration of Centralized Media Library modal picker for Category Image Thumbnail and Banner Image.
- **FR-CAT-004**: 100% responsive toolbar, modal grid, and touch-scrollable data table.
