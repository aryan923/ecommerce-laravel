# Implementation Plan: Frontend Checkout & Order Processing

**Module Name:** Frontend Checkout & Order Processing  
**Module ID:** 08 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-checkout.md`  
**Specification File:** `frontend/specifications/feature.frontend-checkout.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Completed  

---

## 1. Module Summary

This implementation plan details the development roadmap for **Frontend Module 08: Checkout & Order Processing (`/checkout` & `/checkout/success/[order_number]`)**. It delivers a multi-step checkout workflow, address manager, shipping method selector, payment gateway selector, real-time financial order summary sidebar, order placement execution, confirmation receipt screen, and an automated Playwright E2E test suite (`checkout.spec.js`).

---

## 2. Development Strategy

1. **Checkout Stepper Component**:
   - Implement `frontend/src/components/checkout/CheckoutSteps.jsx` providing a step progress bar (1. Contact -> 2. Address -> 3. Shipping -> 4. Payment).
2. **Saved Address & Address Input Component**:
   - Implement `frontend/src/components/checkout/SavedAddressSelector.jsx` supporting address radio choices for authenticated users and an inline form for guest checkout.
3. **Shipping Method Radio Selector**:
   - Implement `frontend/src/components/checkout/ShippingMethodRadio.jsx` calling `/api/v1/shipping/calculate` to render Standard vs Express shipping choices.
4. **Payment Gateway Selector**:
   - Implement `frontend/src/components/checkout/PaymentGatewaySelector.jsx` fetching `/api/v1/payments/methods` to render COD, Card, and UPI choices.
5. **Checkout Summary Sidebar**:
   - Implement `frontend/src/components/checkout/CheckoutSummarySidebar.jsx` showing cart thumbnails, subtotal, discount, shipping, tax, grand total, and Place Order CTA.
6. **Checkout Main Page & Client Layout (`/checkout`)**:
   - Implement `frontend/src/app/checkout/CheckoutClient.jsx` and `frontend/src/app/checkout/page.js` combining all checkout steps and submitting orders to `/api/v1/checkout/process`.
7. **Order Confirmation Receipt Page (`/checkout/success/[order_number]`)**:
   - Implement `frontend/src/components/checkout/OrderReceiptCard.jsx`, `frontend/src/app/checkout/success/[order_number]/CheckoutSuccessClient.jsx`, and `frontend/src/app/checkout/success/[order_number]/page.js`.
8. **Automated Playwright E2E Test Suite**:
   - Create `frontend/tests/e2e/checkout.spec.js` testing checkout rendering, address entry, shipping method selection, order placement, and success receipt display.

---

## 3. Task Breakdown

- [x] **Task 1: Implement CheckoutSteps Stepper Component**
  - File: `frontend/src/components/checkout/CheckoutSteps.jsx`
  - Description: Step tracker UI for Contact, Address, Shipping Method, and Payment.

- [x] **Task 2: Implement SavedAddressSelector & Address Form**
  - File: `frontend/src/components/checkout/SavedAddressSelector.jsx`
  - Description: Address selector radio cards for logged-in users + inline form for guest checkout.

- [x] **Task 3: Implement ShippingMethodRadio Component**
  - File: `frontend/src/components/checkout/ShippingMethodRadio.jsx`
  - Description: Shipping options selector with dynamic cost calculation.

- [x] **Task 4: Implement PaymentGatewaySelector Component**
  - File: `frontend/src/components/checkout/PaymentGatewaySelector.jsx`
  - Description: Payment choices selector for Cash on Delivery, Credit/Debit Card, UPI.

- [x] **Task 5: Implement CheckoutSummarySidebar Component**
  - File: `frontend/src/components/checkout/CheckoutSummarySidebar.jsx`
  - Description: Order items thumbnail list, subtotal, shipping fee, tax, grand total, and Place Order CTA.

- [x] **Task 6: Implement Main `/checkout` Page Route**
  - Files: `frontend/src/app/checkout/CheckoutClient.jsx` & `frontend/src/app/checkout/page.js`
  - Description: Multi-step checkout page route handling order submission to `/api/v1/checkout/process`.

- [x] **Task 7: Implement Order Receipt Card & `/checkout/success/[order_number]` Route**
  - Files: `frontend/src/components/checkout/OrderReceiptCard.jsx`, `frontend/src/app/checkout/success/[order_number]/CheckoutSuccessClient.jsx`, & `frontend/src/app/checkout/success/[order_number]/page.js`
  - Description: Order confirmation receipt screen displaying order details, tracking information, items table, and action CTAs.

- [x] **Task 8: Implement Automated Playwright E2E Test Suite**
  - File: `frontend/tests/e2e/checkout.spec.js`
  - Description: Playwright test suite for checkout rendering, step navigation, shipping method selection, order placement, and success receipt.

---

## 4. Verification Plan

### Automated Tests
- Run `npx playwright test frontend/tests/e2e/checkout.spec.js` to execute E2E tests.

### Manual Verification
- Navigate to `/checkout` with items in cart.
- Verify checkout step progress bar and order summary sidebar.
- Select shipping method and payment gateway.
- Click "Place Order" and verify redirection to `/checkout/success/[order_number]`.
- Verify order receipt details render correctly.
