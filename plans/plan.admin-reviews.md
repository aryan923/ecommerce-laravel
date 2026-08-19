# Implementation Plan: Module 32 — Admin Review Moderation

## 1. Goal Description
The objective of Module 32 is to implement end-to-end Admin Review Moderation functionality in the Laravel backend API (`/api/v1/admin/reviews`) and React Admin SPA (`ReviewsPage.jsx`). This allows store administrators to moderate customer feedback, review ratings, approve/reject/hide reviews, view attached customer review photos, filter by star ratings, perform bulk moderation operations, and automatically sync approved customer reviews to public product catalog pages.

---

## 2. User Review Required
> [!NOTE]
> All review moderation status changes and bulk operations are restricted by RBAC permissions (`reviews.view`, `reviews.moderate`, `reviews.delete`) and automatically recorded in system audit logs (`audit_logs`).

---

## 3. Proposed Changes

### Backend API Layer (Laravel)

#### [NEW] [AdminReviewController.php](file:///var/www/html/ecom-panel/app/Http/Controllers/Api/V1/Admin/AdminReviewController.php)
- Implement `stats()`: Returns summary KPI counts (total, pending, approved, rejected, hidden, average rating, star breakdown).
- Implement `index()`: Returns paginated list of reviews with search, status filters, star rating filters, product filters, and sorting.
- Implement `show($id)`: Returns full review details including product details, customer profile, order verification, and audit logs.
- Implement `updateStatus($id)`: Updates review status (`approved`, `rejected`, `hidden`, `pending`) and records `admin_notes`, `moderated_by`, and `moderated_at`.
- Implement `bulkStatus()`: Performs bulk moderation status updates for an array of review IDs.
- Implement `destroy($id)` & `bulkDestroy()`: Deletes review records with audit logging.

#### [MODIFY] [api.php](file:///var/www/html/ecom-panel/routes/api.php)
- Add `/api/v1/admin/reviews` route group protected by `auth:sanctum` and RBAC permission middlewares:
  - `GET /api/v1/admin/reviews/stats`
  - `GET /api/v1/admin/reviews`
  - `GET /api/v1/admin/reviews/{id}`
  - `PATCH /api/v1/admin/reviews/{id}/status`
  - `POST /api/v1/admin/reviews/bulk-status`
  - `DELETE /api/v1/admin/reviews/{id}`
  - `POST /api/v1/admin/reviews/bulk-delete`

#### [NEW] [AdminReviewModerationTest.php](file:///var/www/html/ecom-panel/tests/Feature/Admin/AdminReviewModerationTest.php)
- PHPUnit tests covering:
  - Unauthenticated access rejection
  - Admin review listing and statistics API
  - Single and bulk review approval/rejection/hiding
  - Single and bulk review deletion
  - Audit log entries verification

---

### React Admin Frontend Layer (Vite + React)

#### [NEW] [ReviewsPage.jsx](file:///var/www/html/ecom-panel/resources/js/admin/pages/ReviewsPage.jsx)
- React Admin view designed to match `CustomerListPage.jsx` & `ShippingPage.jsx` styling:
  - **Header Row**: Title `Review Moderation & Feedback`, subtitle description, Refresh button, search bar.
  - **4 Executive KPI Summary Cards (`stat-cards-grid-4`)**: Total Reviews, Pending Approval, Approved Reviews, Average Customer Rating (with interactive click-to-filter border highlights).
  - **Single Line Enclosed Top Navigation Bar**: `All Reviews`, `Pending Moderation`, `Approved`, `Rejected`, `Hidden` tabs with count badges.
  - **Integrated Toolbar & Table**: Search by reviewer/product, 1-5 star rating filter dropdown, responsive table with customer avatar, product thumbnail, star rating visualizer, review title, image previews, status badges, and action buttons (`Approve`, `Reject`, `Hide`, `Delete`, `View Details`).
  - **Review Detail & Moderation Modal**: Interactive modal showing review content, customer order history badge, full-sized image gallery, and admin moderation notes text area.

#### [MODIFY] [App.jsx](file:///var/www/html/ecom-panel/resources/js/admin/App.jsx)
- Register `/reviews` route in `App.jsx` pointing to `<ReviewsPage />`.
- Add **Review Moderation** navigation item under **Sales & Customer Relations** sidebar section with `<MessageSquare size={17} />` icon.

---

### End-to-End Testing Layer (Playwright)

#### [NEW] [admin-reviews.spec.js](file:///var/www/html/ecom-panel/tests/e2e/admin-reviews.spec.js)
- Automated Playwright E2E tests verifying:
  - Navigation to Review Moderation page via sidebar
  - KPI summary metrics rendering
  - Filtering reviews by status tabs and star ratings
  - Opening review detail modal and updating review status (Approve/Reject)

---

## 4. Verification Plan

### Automated PHPUnit Tests
```bash
docker exec ecom-panel-app php artisan test --filter=AdminReviewModerationTest
```

### Automated Playwright E2E Tests
```bash
npx playwright test tests/e2e/admin-reviews.spec.js
```

### Production Build Verification
```bash
npm run build
```
