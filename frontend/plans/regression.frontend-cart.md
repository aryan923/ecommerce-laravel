# Regression Test Matrix: Frontend Shopping Cart & Coupon Engine

**Module Name:** Frontend Shopping Cart & Coupon Engine  
**Module ID:** 06 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-cart.md`  

---

## 1. Shopping Cart & Coupon Engine Guardrails

To prevent regressions across cart state, drawer interactions, and checkout handoff:
1. **Guest Session Persistence**: Guest cart MUST persist across page reloads and route navigation via `X-Session-ID` header stored in `localStorage`.
2. **Real-Time Currency Sync**: All line item prices, subtotals, coupon discount amounts, and grand totals MUST react instantly to global currency changes from `CurrencyContext`.
3. **Drawer Backdrop Lock**: Cart Drawer slide-over overlay MUST lock body scrolling when active and close cleanly on backdrop click or `Escape` key press.
4. **Stock Limit Enforcer**: Quantity stepper MUST disable increment button `[+]` when item quantity reaches available `stock_qty`.

---

## 2. Regression Checklist

- [ ] `npx playwright test frontend/tests/e2e/cart.spec.js` passes 100% with zero failures.
- [ ] Cart items added as guest persist after page refresh (`F5`).
- [ ] Cart Drawer auto-opens seamlessly upon clicking "Add to Cart" on any PDP or catalog product card.
- [ ] Entering a valid coupon code updates order summary subtotal, discount, and grand total in real-time.
- [ ] Removing a coupon code reverts order summary total back to original amount without page reload.
- [ ] Clicking "Proceed to Checkout" button redirects cleanly to `/checkout` with active cart payload.
