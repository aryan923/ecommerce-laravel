# Regression Strategy: Admin Review Moderation Module

**Module Name:** Admin Review Moderation  
**Module ID:** 32  
**Regression Document:** `plans/regression.admin-reviews.md`  
**Specification Reference:** `specifications/feature.admin-reviews.spec.md`  

---

## 1. Affected Existing Features

- **Product Catalog (Module 6 / Module 23)**: Public product details rating summary & star score display.
- **Customer Account Profile (Module 10 / Module 26)**: Customer detail tabs showing submitted reviews.
- **Customer Commerce Reviews (Module 20)**: Customer submission of post-purchase reviews.
- **Admin Audit Trail System (Module 39)**: Audit log entries for moderation actions.

---

## 2. Regression Test Scenarios

| Scenario ID | Affected Component | Test Description | Expected Result | Priority |
|---|---|---|---|---|
| `REG-REV-001` | Public Product Reviews | Submit new customer review (`status: pending`) and check product page | Pending review does NOT appear publicly | Critical |
| `REG-REV-002` | Admin Approval Sync | Approve pending review in Admin UI and refresh public product page | Approved review appears publicly with updated avg rating | High |
| `REG-REV-003` | Admin Hiding Sync | Change status of approved review to `hidden` | Review disappears from public page without deleting data | High |
| `REG-REV-004` | Customer Profile Tab | View customer details in Admin Customer Management page | Customer's reviews tab lists all submitted reviews | Medium |
| `REG-REV-005` | Audit Log Persistence | Perform bulk approval of reviews in Admin UI | Audit log records bulk moderation event with admin ID | Medium |

---

## 3. Integration & Verification Commands

- **Backend PHPUnit Test Suite**:
  ```bash
  docker exec ecom-panel-app php artisan test --filter=AdminReviewModerationTest
  ```

- **Playwright E2E Navigation & Moderation Suite**:
  ```bash
  npx playwright test tests/e2e/admin-reviews.spec.js
  ```

- **Vite Bundle Build**:
  ```bash
  npm run build
  ```
