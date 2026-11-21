# Regression Test Matrix: Frontend Wishlist Management

**Module Name:** Frontend Wishlist Management  
**Module ID:** 10 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-wishlist.md`  

---

## 1. Wishlist Management Guardrails

To prevent regressions across wishlist toggling, session persistence, cart transfers, and navigation:
1. **Guest & User Session Sync**: Wishlist items MUST persist across page reloads via `X-Session-ID` guest token or Sanctum Bearer token.
2. **Real-Time Header Badge Sync**: Header wishlist count badge MUST update instantly without requiring full page refresh when items are added, removed, or moved to cart.
3. **Move-to-Cart Atomicity**: Transferring an item from wishlist to cart MUST atomically add item to cart drawer/context AND remove item from wishlist grid.
4. **Currency Formatting Sync**: All item prices in `WishlistGrid` MUST react dynamically to currency changes from `CurrencyContext`.

---

## 2. Regression Checklist

- [ ] `npx playwright test frontend/tests/e2e/wishlist.spec.js` passes 100% with zero failures.
- [ ] Toggling heart icon on catalog product card updates header wishlist count badge instantly.
- [ ] Toggling heart icon on PDP updates wishlist state and reflects in `/wishlist` grid.
- [ ] Navigating to `/wishlist` displays all saved items with thumbnail, title, price, discount badge, and stock status.
- [ ] Clicking "Move to Cart" transfers item to cart drawer and removes item from wishlist.
- [ ] Clicking remove button deletes single item and updates wishlist counter.
- [ ] Clearing all wishlist items renders `EmptyWishlist` placeholder view cleanly.
