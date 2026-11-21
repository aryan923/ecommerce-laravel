# Test Cases Matrix: Admin CMS / Banners / Pages (Module 35)

## 1. Overview
This document defines the comprehensive test case matrix for Module 35 (Admin CMS / Banners / Pages). It encompasses API happy path execution, validation rules, RBAC authorization checks, storefront public content rendering, and UI interaction test scenarios.

---

## 2. Test Cases Matrix

| Test ID | Category | Description | Input / Condition | Expected Result | Priority |
|---|---|---|---|---|---|
| **TC-CMS-001** | Happy Path | Create Banner via Admin API | Valid title, desktop image URL, placement `home_hero`, active status | HTTP 201 Created, Banner returned with ID, stored in DB | High |
| **TC-CMS-002** | Happy Path | Fetch Active Storefront Banners | `GET /api/v1/banners?placement=home_hero` | HTTP 200 OK, returns active banners in date range ordered by `sort_order` | High |
| **TC-CMS-003** | Happy Path | Create CMS Page with Auto Slug | Title: `"About Our Company"`, status `published` | HTTP 201 Created, slug auto-generated as `"about-our-company"` | High |
| **TC-CMS-004** | Happy Path | Fetch Storefront CMS Page by Slug | `GET /api/v1/pages/about-our-company` | HTTP 200 OK, returns page title, HTML content, and SEO metadata | High |
| **TC-CMS-005** | Validation | Reject Banner End Date Before Start Date | `starts_at`: `2026-10-01`, `ends_at`: `2026-09-01` | HTTP 422 Unprocessable Entity, validation error on `ends_at` | Medium |
| **TC-CMS-006** | Validation | Reject Duplicate Page Slug | Create page with existing slug `"privacy-policy"` | HTTP 422 Unprocessable Entity, `"slug has already been taken"` error | High |
| **TC-CMS-007** | Validation | Enforce Kebab-Case Slug Format | Slug: `"About Us & Policies!"` | HTTP 422 Unprocessable Entity, invalid format regex error | Medium |
| **TC-CMS-008** | Business Rule | Hide Inactive Banners on Storefront | Banner `is_active = false` | Excluded from `GET /api/v1/banners` response array | High |
| **TC-CMS-009** | Business Rule | Hide Expired Banners on Storefront | Current date past `ends_at` | Excluded from `GET /api/v1/banners` response array | High |
| **TC-CMS-010** | Business Rule | Prevent Storefront Access to Draft Pages | Page status = `'draft'`, `GET /api/v1/pages/{slug}` | HTTP 404 Not Found returned to public user | High |
| **TC-CMS-011** | Permission | Block Unauthorized Banner Creation | User without `banners.create` permission | HTTP 403 Forbidden returned | High |
| **TC-CMS-012** | Permission | Allow Content Manager Page Edit | User with `pages.update` permission | HTTP 200 OK, page updated successfully | High |
| **TC-CMS-013** | Admin UI | Reorder Banners Drag & Drop | POST array of updated IDs and `sort_order` | Banners reordered, new order reflected on API response | Medium |
| **TC-CMS-014** | Admin UI | SEO Live SERP Preview Rendering | Enter title and meta description in `PageEditorModal` | SERP snippet preview updates dynamically in real time | Medium |
| **TC-CMS-015** | Audit Log | Verify Banner/Page Modification Audit | Create or update banner/page | Record added to `audit_logs` table with actor and payload | Medium |
| **TC-CMS-016** | Edge Case | Reserved System Slug Blocking | Create page with slug `"admin"` or `"checkout"` | HTTP 422 Unprocessable Entity, reserved slug error | Medium |

---

## 3. Automated Test Suite Outline (`CmsManagementTest.php`)

```php
// Test 1: Admin can create and list banners
public function test_admin_can_create_and_list_banners()

// Test 2: Storefront returns only active banners in current date range
public function test_storefront_returns_active_banners_in_date_range()

// Test 3: Admin can create CMS page with unique slug
public function test_admin_can_create_cms_page_with_unique_slug()

// Test 4: Draft pages return 404 on public endpoint
public function test_draft_page_returns_404_on_storefront()

// Test 5: RBAC restricts staff without permissions
public function test_unauthorized_staff_cannot_delete_pages()
```
