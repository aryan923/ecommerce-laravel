# Test Cases: Frontend Shopping Cart & Coupon Engine

**Module Name:** Frontend Shopping Cart & Coupon Engine  
**Module ID:** 06 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-cart.md`  
**Specification:** `frontend/specifications/feature.frontend-cart.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/cart.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 06: Shopping Cart & Coupon Engine**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-CRT-001** | Open & Close Cart Drawer | Verify clicking header cart icon opens slide-over drawer | `CartDrawer` panel slides over from right with backdrop blur |
| **TC-CRT-002** | Add to Cart Drawer Trigger | Verify adding item from PDP opens cart drawer | Drawer auto-opens displaying added item and updated subtotal |
| **TC-CRT-003** | Cart Table Render on `/cart` | Verify dedicated cart page renders line items table | Product thumbnail, title, variant pills, price, and qty stepper render |
| **TC-CRT-004** | Line Item Quantity Manipulation | Verify clicking `[+]` and `[-]` buttons updates quantity | Line item quantity updates and subtotal recalculates |
| **TC-CRT-005** | Stock Quantity Bound Limit | Verify `[+]` button disables when max stock reached | Stepper prevents exceeding available `stock_qty` with feedback tooltip |
| **TC-CRT-006** | Single Item Removal | Verify clicking delete icon removes line item from cart | Line item is removed, items count decreases, totals update |
| **TC-CRT-007** | Valid Coupon Application | Verify applying valid code (`SAVE10`) recalculates total | Green coupon chip appears, discount line displays savings amount |
| **TC-CRT-008** | Invalid Coupon Error Alert | Verify entering invalid code (`INVALID99`) shows error | Red alert message renders indicating code is invalid or expired |
| **TC-CRT-009** | Remove Active Coupon | Verify clicking "Remove" on active coupon chip restores price | Coupon chip is removed, discount line disappears, total reverts |
| **TC-CRT-010** | Clear All Cart Items | Verify clicking "Clear Cart" empties all line items | All items are removed and `EmptyCartView` placeholder renders |
| **TC-CRT-011** | Empty Cart Placeholder Render | Verify accessing `/cart` with zero items renders empty state | Friendly empty cart illustration and "Browse Products" CTA render |
| **TC-CRT-012** | Checkout CTA Navigation | Verify clicking "Proceed to Checkout" redirects to `/checkout` | Page navigates to `/checkout` route with cart session intact |
