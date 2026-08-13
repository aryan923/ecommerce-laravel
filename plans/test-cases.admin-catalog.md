# Test Cases: Admin Category & Brand Management Module

**Module Name:** Admin Category & Brand Management  
**Module ID:** 24  
**Test File:** `plans/test-cases.admin-catalog.md`  
**Specification:** `specifications/feature.admin-catalog.spec.md`  
**Plan:** `plans/plan.admin-catalog.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / React 18 (Vite + React SPA) / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-ACAT-001: Admin Create Subcategory with Parent ID and Sort Order
- **Preconditions**: Parent Category "Electronics" exists (ID 1). Admin authenticated.
- **Input**: `POST /api/v1/admin/categories` with payload:
  `{"name": "Headphones", "parent_id": 1, "sort_order": 5, "status": "active"}`
- **Expected Result**: HTTP 201 Created, subcategory created with `parent_id = 1` and `sort_order = 5`.

### TC-ACAT-002: Admin Create Brand with Logo and SEO Metadata
- **Preconditions**: Admin authenticated.
- **Input**: `POST /api/v1/admin/brands` with payload:
  `{"name": "AudioTech", "logo_url": "https://cdn.example.com/logo.png", "status": "active"}`
- **Expected Result**: HTTP 201 Created, returns created brand with logo.

### TC-ACAT-003: Admin Add Attribute and Attribute Values
- **Preconditions**: Admin authenticated.
- **Input**: `POST /api/v1/admin/attributes` (`{"name": "Color"}`), followed by `POST /api/v1/admin/attributes/1/values` (`{"value": "Navy Blue"}`).
- **Expected Result**: HTTP 201 Created for attribute and attribute value.

---

## 2. Negative & Edge Case Scenarios

### TC-ACAT-004: Create Category with Duplicate Slug Fails Validation
- **Input**: `POST /api/v1/admin/categories` with existing slug.
- **Expected Result**: HTTP 422 Unprocessable Entity.

### TC-ACAT-005: Unauthenticated Category Creation Fails with 401
- **Input**: `POST /api/v1/admin/categories` without bearer token.
- **Expected Result**: HTTP 401 Unauthorized.
