# Implementation Plan: Frontend Customer Account Portal Module

**Module Name:** Frontend Customer Account Portal  
**Module ID:** 09 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-account.md`  
**Specification File:** `frontend/specifications/feature.frontend-account.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Completed  

---

## 1. Module Summary

This implementation plan outlines the architecture, sub-routes, component hierarchy, API integrations, and verification tests for **Frontend Module 09: Customer Account Portal (`/account/*`)**. It delivers an authenticated portal for profile management, saved address book CRUD, order history, order cancellation, shipment tracking timeline, return request processing, bank account management for refunds, and in-app customer notifications.

---

## 2. Development Strategy

1. **Shared Account Layout & Sidebar Navigation**:
   - Implement `frontend/src/components/account/AccountSidebar.jsx` and `frontend/src/app/account/layout.js` rendering user avatar, greeting, navigation links with active tab highlights, and logout action.
2. **Dashboard Overview Sub-route (`/account`)**:
   - Implement `frontend/src/components/account/AccountOverviewClient.jsx` and `frontend/src/app/account/page.js` rendering stat counters (Orders, Returns, Addresses), recent orders summary card, and quick link tiles.
3. **Profile & Password Sub-route (`/account/profile`)**:
   - Implement `frontend/src/components/account/ProfileSettingsClient.jsx` and `frontend/src/app/account/profile/page.js` connecting to `PUT /api/v1/customer/profile` and `POST /api/v1/customer/change-password`.
4. **Saved Addresses Sub-route (`/account/addresses`)**:
   - Implement `frontend/src/components/account/AddressesClient.jsx` and `frontend/src/app/account/addresses/page.js` connecting to `GET/POST/PUT/DELETE /api/v1/customer/addresses`.
5. **Order History Sub-route (`/account/orders`)**:
   - Implement `frontend/src/components/account/OrderHistoryClient.jsx` and `frontend/src/app/account/orders/page.js` connecting to `GET /api/v1/customer/orders` with status filtering tabs.
6. **Order Detail & Invoice Sub-route (`/account/orders/[order_number]`)**:
   - Implement `frontend/src/components/account/OrderDetailClient.jsx` and `frontend/src/app/account/orders/[order_number]/page.js` connecting to `GET /api/v1/customer/orders/{order_number}` and `POST /api/v1/customer/orders/{order_number}/cancel`.
7. **Returns & Exchange Sub-routes (`/account/returns` & `/account/returns/new`)**:
   - Implement `frontend/src/components/account/ReturnsClient.jsx`, `frontend/src/components/account/NewReturnRequestClient.jsx`, `frontend/src/app/account/returns/page.js`, and `frontend/src/app/account/returns/new/page.js`.
8. **Refund Bank Accounts Sub-route (`/account/bank-accounts`)**:
   - Implement `frontend/src/components/account/BankAccountsClient.jsx` and `frontend/src/app/account/bank-accounts/page.js` connecting to `GET/POST/DELETE /api/v1/customer/bank-accounts`.
9. **Customer Notifications Sub-route (`/account/notifications`)**:
   - Implement `frontend/src/components/account/NotificationsClient.jsx` and `frontend/src/app/account/notifications/page.js` connecting to `GET /api/v1/customer/notifications`.
10. **Automated Playwright E2E Test Suite**:
    - Create `frontend/tests/e2e/account.spec.js` testing navigation across all `/account/*` sub-routes, profile edits, address additions, and order detail rendering.

---

## 3. Task Breakdown

- [ ] **Task 1: Account Layout & Sidebar Component**
  - Files: `frontend/src/components/account/AccountSidebar.jsx`, `frontend/src/app/account/layout.js`
  - Description: Shared portal sidebar layout with tab indicators, user info, and mobile menu.

- [ ] **Task 2: Account Overview Dashboard (`/account`)**
  - Files: `frontend/src/components/account/AccountOverviewClient.jsx`, `frontend/src/app/account/page.js`
  - Description: Overview cards for metrics, recent orders, default address preview.

- [ ] **Task 3: Profile & Password Settings (`/account/profile`)**
  - Files: `frontend/src/components/account/ProfileSettingsClient.jsx`, `frontend/src/app/account/profile/page.js`
  - Description: Profile detail editor and password change form.

- [ ] **Task 4: Saved Address Book Management (`/account/addresses`)**
  - Files: `frontend/src/components/account/AddressesClient.jsx`, `frontend/src/app/account/addresses/page.js`
  - Description: Address cards grid + add/edit/delete address drawer/modal.

- [ ] **Task 5: Order History List (`/account/orders`)**
  - Files: `frontend/src/components/account/OrderHistoryClient.jsx`, `frontend/src/app/account/orders/page.js`
  - Description: Paginated list of customer orders with filter status tabs.

- [ ] **Task 6: Order Detail & Tracking (`/account/orders/[order_number]`)**
  - Files: `frontend/src/components/account/OrderDetailClient.jsx`, `frontend/src/app/account/orders/[order_number]/page.js`
  - Description: Itemized order breakdown, shipment tracker timeline, and cancellation trigger.

- [ ] **Task 7: Returns & Exchange System (`/account/returns` & `/account/returns/new`)**
  - Files: `frontend/src/components/account/ReturnsClient.jsx`, `frontend/src/components/account/NewReturnRequestClient.jsx`, `frontend/src/app/account/returns/page.js`, `frontend/src/app/account/returns/new/page.js`
  - Description: View active returns list and submit new RMA return requests.

- [ ] **Task 8: Refund Bank Accounts Management (`/account/bank-accounts`)**
  - Files: `frontend/src/components/account/BankAccountsClient.jsx`, `frontend/src/app/account/bank-accounts/page.js`
  - Description: Form to add and manage saved bank accounts for instant refund processing.

- [ ] **Task 9: In-App Customer Notifications (`/account/notifications`)**
  - Files: `frontend/src/components/account/NotificationsClient.jsx`, `frontend/src/app/account/notifications/page.js`
  - Description: Notifications list with unread markers and read status toggles.

- [ ] **Task 10: Automated Playwright E2E Tests (`account.spec.js`)**
  - File: `frontend/tests/e2e/account.spec.js`
  - Description: End-to-end suite verifying all account portal sub-routes and interaction flows.

---

## 4. Verification Plan

### Automated Tests
- Next.js Build: `npm run build`
- Playwright E2E Suite: `npx playwright test tests/e2e/account.spec.js --workers=1`

### Manual Verification
- Login as test user and navigate through all `/account/*` tabs.
