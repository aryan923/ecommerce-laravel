# Test Cases: Frontend Wishlist Management

**Module Name:** Frontend Wishlist Management  
**Module ID:** 10 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-wishlist.md`  
**Specification:** `frontend/specifications/feature.frontend-wishlist.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/wishlist.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 10: Wishlist Management**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-WSH-001** | Header Wishlist Badge Sync | Verify header heart icon renders live item count | Badge counter matches active `wishlistCount` in context |
| **TC-WSH-002** | Toggle Heart on Product Card | Verify clicking heart icon on `ProductCard` adds item to wishlist | Heart turns red, toast notification displays, header count increments |
| **TC-WSH-003** | Untoggle Heart on Product Card | Verify clicking active red heart removes item from wishlist | Heart returns to outline state, toast notification displays, count decrements |
| **TC-WSH-004** | Toggle Heart on PDP | Verify clicking heart button on product detail page updates wishlist | Wishlist state toggles and updates global context |
| **TC-WSH-005** | Wishlist Page Render (`/wishlist`) | Verify `/wishlist` route renders grid of saved items | Grid displays thumbnail, brand, title, variant, price, and stock badge |
| **TC-WSH-006** | Stock Status Indicator Display | Verify stock availability badge renders accurately for saved items | Shows green "In Stock" badge or amber/red "Out of Stock" state |
| **TC-WSH-007** | Move Item to Cart Transfer | Verify clicking "Move to Cart" transfers item into shopping cart | Item is added to cart, removed from wishlist, and cart drawer updates |
| **TC-WSH-008** | Single Item Removal | Verify clicking remove icon deletes single item from wishlist | Line item disappears from grid and wishlist count updates |
| **TC-WSH-009** | Clear All Wishlist Items | Verify clicking "Clear All Wishlist" empties saved list | Confirmation modal clears all items and renders `EmptyWishlist` view |
| **TC-WSH-010** | Empty Wishlist Placeholder Render | Verify accessing `/wishlist` with zero items renders empty state | Friendly illustration, message, and "Explore Catalog" CTA render |
| **TC-WSH-011** | Guest Session Wishlist Merge | Verify guest wishlist items persist post-login | Guest session wishlist items automatically merge into user profile |
