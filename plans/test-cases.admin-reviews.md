# Test Cases: Admin Review Moderation Module

**Module Name:** Admin Review Moderation  
**Module ID:** 32  
**Test Suite File:** `plans/test-cases.admin-reviews.md`  
**Specification Reference:** `specifications/feature.admin-reviews.spec.md`  

---

## 1. Happy Path Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMREV-001` | Retrieve Review Statistics | Send `GET /api/v1/admin/reviews/stats` with Bearer token | Returns 200 OK with total, pending, approved, rejected, hidden counts & average rating | Planned |
| `TC-ADMREV-002` | List Reviews with Filters | Send `GET /api/v1/admin/reviews?status=pending&rating=5` | Returns 200 OK with matching 5-star pending reviews | Planned |
| `TC-ADMREV-003` | View Single Review Detail | Send `GET /api/v1/admin/reviews/{id}` | Returns 200 OK with product info, customer profile, verified purchase order badge, and media | Planned |
| `TC-ADMREV-004` | Approve Review | Send `PATCH /api/v1/admin/reviews/{id}/status` with `status: approved` | Review status updated to `approved`, audit logged | Planned |
| `TC-ADMREV-005` | Reject Review with Notes | Send `PATCH /api/v1/admin/reviews/{id}/status` with `status: rejected`, `admin_notes` | Review status updated to `rejected`, admin notes saved, audit logged | Planned |
| `TC-ADMREV-006` | Hide Review | Send `PATCH /api/v1/admin/reviews/{id}/status` with `status: hidden` | Review status updated to `hidden`, hidden from public pages | Planned |
| `TC-ADMREV-007` | Bulk Approve Reviews | Send `POST /api/v1/admin/reviews/bulk-status` with `ids: [1, 2, 3]`, `status: approved` | All 3 reviews approved in single transaction | Planned |
| `TC-ADMREV-008` | Delete Review Record | Send `DELETE /api/v1/admin/reviews/{id}` | Record deleted from database and audit logged | Planned |

---

## 2. Negative & Validation Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMREV-009` | Unauthenticated Access | Send `GET /api/v1/admin/reviews` without token | Returns 401 Unauthorized | Planned |
| `TC-ADMREV-010` | Invalid Moderation Status | Send `PATCH /api/v1/admin/reviews/{id}/status` with `status: invalid_status` | Returns 422 Unprocessable Entity with validation error | Planned |
| `TC-ADMREV-011` | Non-Existent Review ID | Send `GET /api/v1/admin/reviews/999999` | Returns 404 Not Found | Planned |
| `TC-ADMREV-012` | Empty Bulk Selection | Send `POST /api/v1/admin/reviews/bulk-status` with empty `ids: []` | Returns 422 Validation Error | Planned |

---

## 3. Permission & RBAC Tests

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMREV-013` | Unauthorized Staff Moderation | Perform review status update as staff user lacking `reviews.moderate` permission | Returns 403 Forbidden | Planned |
| `TC-ADMREV-014` | Super Admin Full Access | Perform all review moderation endpoints as `super_admin` | All endpoints execute successfully | Planned |

---

## 4. Edge Cases & Public Visibility

| Test ID | Title | Steps | Expected Result | Status |
|---|---|---|---|---|
| `TC-ADMREV-015` | Public Rating Recalculation | Approve a new 5-star review for product | Product's public average rating recalculates | Planned |
| `TC-ADMREV-016` | Public Visibility Filtering | Query storefront `GET /api/v1/products/{id}/reviews` | Only `approved` reviews are visible to customers | Planned |
