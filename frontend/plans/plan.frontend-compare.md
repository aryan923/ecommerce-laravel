# Implementation Plan: Frontend Product Comparison Engine

**Module Name:** Frontend Product Comparison Engine  
**Module ID:** 12 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-compare.md`  
**Specification File:** `frontend/specifications/feature.frontend-compare.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Ready for Implementation  

---

## 1. Module Summary

This implementation plan outlines the step-by-step development strategy for **Frontend Module 12: Product Comparison Engine (`/compare`)**. It implements global comparison state management (`CompareContext.js`), sticky bottom viewport floating bar (`CompareBar.jsx`), product card compare toggle buttons, dedicated comparison matrix page (`frontend/src/app/compare/page.js`), comparison toolbar (`CompareHeader.jsx`), responsive comparison table (`CompareMatrix.jsx`), empty comparison placeholder (`EmptyCompare.jsx`), and an automated Playwright E2E test suite (`compare.spec.js`).

---

## 2. Development Strategy

1. **Global Comparison Context & Local Storage Persistence**:
   - Create `frontend/src/context/CompareContext.js` managing `comparedProducts` array (max 4 items), `localStorage` persistence, and helper functions (`addToCompare`, `removeFromCompare`, `clearCompare`, `isInCompare`, `toggleCompare`).
   - Wrap `AppProviders.jsx` with `CompareProvider`.
2. **Sticky Bottom Comparison Bar Component**:
   - Create `frontend/src/components/compare/CompareBar.jsx` rendering sticky bottom drawer with item thumbnails, remove badges, counter, "Compare Now" CTA, and "Clear All" action.
3. **Integrate Compare Toggle on Product Cards & PDP**:
   - Update `frontend/src/components/product/ProductCard.jsx` to render compare toggle checkbox/icon button.
   - Update `frontend/src/components/pdp/AddToCartSection.jsx` to add "Compare" toggle action.
4. **Compare Header & Matrix Components**:
   - Create `frontend/src/components/compare/CompareHeader.jsx` displaying page header, total compared count, "Highlight Differences" toggle, share comparison button, and clear all action.
   - Create `frontend/src/components/compare/CompareMatrix.jsx` rendering responsive side-by-side table comparing thumbnail, title, price, discount badge, rating, brand, stock status, attributes matrix, and direct "Add to Cart" button.
5. **Empty Compare Placeholder Component**:
   - Create `frontend/src/components/compare/EmptyCompare.jsx` rendering friendly empty compare view with icon, message, and CTA to explore catalog.
6. **Assemble Compare Route (`/compare`)**:
   - Create `frontend/src/app/compare/page.js` and `CompareClient.jsx` unifying toolbar, comparison matrix, empty state, and Next.js SEO metadata.
7. **Automated E2E Test Suite**:
   - Create `frontend/tests/e2e/compare.spec.js` and run `npm run test:e2e` to validate toggle actions, 4-product limit enforcement, sticky bar rendering, matrix table rendering, and clear compare flow.

---

## 3. Task Breakdown

- [ ] **Task 1: Implement Compare Context & State Provider**
  - File: `frontend/src/context/CompareContext.js`
  - Description: Global context managing compared items array (max 4), `localStorage` sync, toggle, remove, and clear functions.

- [ ] **Task 2: Integrate Compare Context in App Providers**
  - File: `frontend/src/components/providers/AppProviders.jsx`
  - Description: Wrap storefront with `CompareProvider` and mount floating `CompareBar.jsx`.

- [ ] **Task 3: Implement Sticky Bottom Floating Compare Bar**
  - File: `frontend/src/components/compare/CompareBar.jsx`
  - Description: Floating bottom bar with thumbnail pills, count badge, "Compare Now" CTA button, and clear action.

- [ ] **Task 4: Integrate Compare Toggle on Product Cards & PDP**
  - Files: `frontend/src/components/product/ProductCard.jsx` & `frontend/src/components/pdp/AddToCartSection.jsx`
  - Description: Compare toggle checkbox/icon button calling `toggleCompare()` with toast notifications.

- [ ] **Task 5: Implement Compare Matrix & Toolbar Components**
  - Files: `frontend/src/components/compare/CompareHeader.jsx` & `frontend/src/components/compare/CompareMatrix.jsx`
  - Description: Side-by-side matrix table with attribute rows, highlight differences toggle, remove item button, and "Add to Cart" action.

- [ ] **Task 6: Implement Empty Compare Placeholder Component**
  - File: `frontend/src/components/compare/EmptyCompare.jsx`
  - Description: Friendly empty comparison state view with scales icon, messaging, and catalog CTA.

- [ ] **Task 7: Assemble Product Compare Page Route (`/compare`)**
  - Files: `frontend/src/app/compare/page.js` & `CompareClient.jsx`
  - Description: Dedicated `/compare` route integrating toolbar, comparison matrix, empty state, and Next.js SEO metadata.

- [ ] **Task 8: Implement Automated Playwright E2E Compare Test Suite**
  - File: `frontend/tests/e2e/compare.spec.js`
  - Description: Automated Playwright test suite validating compare toggling, sticky bar rendering, 4-product limit enforcement, matrix table render, item deletion, and clear compare.

---

## 4. Verification Plan

### Automated Tests
- Run `npx playwright test frontend/tests/e2e/compare.spec.js` to execute E2E test scenarios.
- Run `npm run test:e2e` to verify zero regressions across the storefront suite.

### Manual Verification
- Click compare checkbox on 2 product cards on catalog page; verify floating `CompareBar` slides up from bottom with 2 thumbnail pills.
- Try adding a 5th product to comparison; verify toast warning appears ("Maximum 4 products can be compared").
- Click "Compare Now" CTA in floating bar; verify navigation to `/compare` route.
- On `/compare` page, verify matrix table renders products side-by-side with price, rating, brand, stock, and attributes.
- Click "Highlight Differences" toggle; verify identical attribute rows hide/dim.
- Click "Add to Cart" on a compared product column; verify item adds to cart drawer.
- Click "Clear All"; verify confirmation modal/action clears matrix and renders `EmptyCompare` placeholder view.
