# Implementation Plan: Frontend Shopping Cart & Coupon Engine

**Module Name:** Frontend Shopping Cart & Coupon Engine  
**Module ID:** 06 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-cart.md`  
**Specification File:** `frontend/specifications/feature.frontend-cart.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Completed  

---

## 1. Module Summary

This implementation plan outlines the development roadmap for **Frontend Module 06: Shopping Cart & Coupon Engine (`/cart` & `CartDrawer.jsx`)**. It implements global cart state management (`CartContext.js`), slide-over cart drawer (`CartDrawer.jsx`), dedicated cart page route (`frontend/src/app/cart/page.js`), cart items table (`CartTable.jsx`), promotional coupon engine (`CouponForm.jsx`), financial order breakdown (`OrderSummaryCard.jsx`), empty cart placeholder (`EmptyCartView.jsx`), and an automated Playwright E2E test suite (`cart.spec.js`).

---

## 2. Development Strategy

1. **Global Cart Context & Session State**:
   - Create `frontend/src/context/CartContext.js` providing cart items, totals, drawer visibility state (`isOpen`), guest session ID (`X-Session-ID`), and helper methods (`addItem`, `updateQuantity`, `removeItem`, `clearCart`, `applyCoupon`, `removeCoupon`).
2. **Slide-Over Cart Drawer**:
   - Implement `frontend/src/components/cart/CartDrawer.jsx` featuring smooth slide-over animation, backdrop blur overlay, line item list, quantity stepper `[-] [qty] [+]`, subtotal preview, and CTAs.
3. **Cart Table & Line Items**:
   - Implement `frontend/src/components/cart/CartTable.jsx` rendering table of cart items with thumbnail, product title, variant attributes, price, quantity controls, line total, and delete button.
4. **Promotional Coupon Engine**:
   - Implement `frontend/src/components/cart/CouponForm.jsx` for applying promotional codes via `POST /api/v1/cart/apply-coupon`, displaying active coupon chips with discount amount, error alerts, and remove coupon actions.
5. **Order Financial Summary**:
   - Implement `frontend/src/components/cart/OrderSummaryCard.jsx` displaying Subtotal, Discount, Estimated Tax, Estimated Shipping, Grand Total, and "Proceed to Checkout" CTA button.
6. **Empty Cart Placeholder**:
   - Implement `frontend/src/components/cart/EmptyCartView.jsx` rendering friendly empty cart message and "Browse Products" CTA button.
7. **Assemble Cart Route**:
   - Create `frontend/src/app/cart/page.js` and `CartClient.jsx` bringing together cart components with skeleton loading state and page metadata.
8. **Automated E2E Test Suite**:
   - Create `frontend/tests/e2e/cart.spec.js` and execute `npm run test:e2e` to validate drawer opening, adding items, quantity updates, coupon application, and checkout navigation.

---

## 3. Task Breakdown

- [x] **Task 1: Implement Cart Context & Session State**
  - File: `frontend/src/context/CartContext.js`
  - Description: Global state provider managing cart items, guest session ID (`X-Session-ID`), drawer toggle, and API integration.

- [x] **Task 2: Implement CartDrawer Component**
  - File: `frontend/src/components/cart/CartDrawer.jsx`
  - Description: Global slide-over cart drawer with backdrop blur, item list, quantity controls, subtotal preview, and checkout CTAs.

- [x] **Task 3: Implement CartTable Component**
  - File: `frontend/src/components/cart/CartTable.jsx`
  - Description: Line items table layout for `/cart` displaying thumbnail, title, variant details, price, quantity stepper, and remove button.

- [x] **Task 4: Implement CouponForm Component**
  - File: `frontend/src/components/cart/CouponForm.jsx`
  - Description: Promotional code input form with uppercase formatting, Apply button, feedback alerts, and active coupon chip with Remove button.

- [x] **Task 5: Implement OrderSummaryCard Component**
  - File: `frontend/src/components/cart/OrderSummaryCard.jsx`
  - Description: Financial breakdown card displaying Subtotal, Coupon Discount, Tax Preview, Estimated Shipping, Total Amount, and Checkout CTA button.

- [x] **Task 6: Implement EmptyCartView Component**
  - File: `frontend/src/components/cart/EmptyCartView.jsx`
  - Description: Friendly empty cart placeholder with shopping icon and "Browse Products" CTA button.

- [x] **Task 7: Assemble Cart Page & Route**
  - Files: `frontend/src/app/cart/page.js` & `frontend/src/app/cart/CartClient.jsx`
  - Description: Dedicated `/cart` page route uniting all components with skeleton loader and SEO metadata.

- [x] **Task 8: Implement Automated Playwright E2E Test Suite**
  - File: `frontend/tests/e2e/cart.spec.js`
  - Description: Automated Playwright tests validating cart drawer, quantity manipulation, coupon application/removal, and checkout redirect.

---

## 4. Verification Plan

### Automated Tests
- Run `npx playwright test frontend/tests/e2e/cart.spec.js` to execute E2E tests.
- Run `npm run test:e2e` to verify zero regressions across the frontend suite.

### Manual Verification
- Open header cart icon to verify drawer slide-over animation.
- Add product to cart from PDP and verify drawer auto-opens with correct item and subtotal.
- Update quantity using stepper `[-] [qty] [+]` and verify subtotal updates.
- Enter coupon code `SAVE10` on `/cart` page and verify discount line item appears.
- Remove coupon code and verify total updates back to original amount.
- Click "Proceed to Checkout" button and verify redirection to `/checkout`.
