# Feature Specification: Frontend Wishlist Management Module

**Module Name:** Frontend Wishlist Management  
**Module ID:** 10 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-wishlist.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 10), `frontend/Requirements/srs_pages.md` (§2.8)  

---

## 1. Module Overview

The **Wishlist Management** module enables customer and guest shoppers to save favorite products for future purchase, track price and stock changes, seamlessly transfer saved items into the shopping cart, and manage saved items from a dedicated Wishlist portal (`/wishlist`).

Wishlist persistence operates under dual session context:
1. **Authenticated Customers**: Wishlist records are bound to the customer profile in backend database tables and persist across devices.
2. **Guest Shoppers**: Wishlist items attach to the persistent `X-Session-ID` guest identifier and automatically merge into the user's account upon login (via `/api/v1/auth/login` and `/api/v1/cart/merge` pipeline).

The module connects directly to the following Laravel API endpoints:
- `GET /api/v1/wishlist` — Fetch customer/guest saved wishlist items list.
- `POST /api/v1/wishlist` — Add product/variant to wishlist (`{ product_id, variant_id }`).
- `DELETE /api/v1/wishlist/{id}` — Remove item from wishlist by wishlist item ID.
- `POST /api/v1/wishlist/{id}/move-to-cart` — Transfer item directly from wishlist into shopping cart.
- `DELETE /api/v1/wishlist` — Clear all items from customer wishlist.

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Header (Wishlist Heart Icon Badge)                     |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
|                            Wishlist Page (/wishlist)                              |
+-----------------------------------------------------------------------------------+
|  WishlistHeader / Toolbar                                                         |
|  - Page Title ("My Saved Wishlist") & Items Count Badge                           |
|  - "Clear All Items" Button & "Continue Shopping" CTA Link                        |
+-----------------------------------------------------------------------------------+
|  WishlistGrid Layout                                                              |
|  +---------------------------+  +---------------------------+                     |
|  | WishlistCard 1            |  | WishlistCard 2            |                     |
|  | - Product Image & Badge   |  | - Product Image & Badge   |                     |
|  | - Brand & Product Title   |  | - Brand & Product Title   |                     |
|  | - Price & Discount Badge  |  | - Price & Discount Badge  |                     |
|  | - Stock Indicator Badge   |  | - Stock Indicator Badge   |                     |
|  | - "Move to Cart" CTA      |  | - "Move to Cart" CTA      |                     |
|  | - Remove (Trash/X) Icon   |  | - Remove (Trash/X) Icon   |                     |
|  +---------------------------+  +---------------------------+                     |
+-----------------------------------------------------------------------------------+
|  EmptyWishlist View (Rendered when wishlist count == 0)                           |
|  - Heart Illustration, "Your Wishlist is Empty" text & "Explore Catalog" CTA       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Wishlist Response Payload (`GET /api/v1/wishlist`)
```json
{
  "success": true,
  "data": {
    "count": 2,
    "items": [
      {
        "id": 88,
        "product_id": 14,
        "variant_id": 35,
        "title": "Italian Leather Bifold Wallet",
        "slug": "italian-leather-wallet",
        "brand": "LUXORA Artisans",
        "image_url": "https://example.com/images/wallet.jpg",
        "price": 185.00,
        "original_price": 220.00,
        "discount_percent": 16,
        "in_stock": true,
        "stock_qty": 8,
        "attributes": {
          "Color": "Cognac Brown"
        },
        "created_at": "2026-09-09T08:30:00Z"
      },
      {
        "id": 89,
        "product_id": 22,
        "variant_id": 60,
        "title": "Chrono Automatic Gold Watch",
        "slug": "chrono-automatic-watch",
        "brand": "Vanguard Timepieces",
        "image_url": "https://example.com/images/watch.jpg",
        "price": 1450.00,
        "original_price": 1450.00,
        "discount_percent": 0,
        "in_stock": false,
        "stock_qty": 0,
        "attributes": {
          "Dial Color": "Emerald Green"
        },
        "created_at": "2026-09-09T09:15:00Z"
      }
    ]
  }
}
```

### 3.2 Add to Wishlist Request (`POST /api/v1/wishlist`)
```json
{
  "product_id": 14,
  "variant_id": 35
}
```

### 3.3 Move to Cart Response (`POST /api/v1/wishlist/{id}/move-to-cart`)
```json
{
  "success": true,
  "message": "Item moved to cart successfully.",
  "data": {
    "cart_items_count": 4,
    "remaining_wishlist_count": 1
  }
}
```

---

## 4. UI/UX & Functional Requirements

### 4.1 Global Wishlist Context (`WishlistContext.js`)
- Maintains live `wishlistItems` array and `wishlistCount` badge across app navigation.
- Provides utility helpers: `isWishlisted(productId)`, `toggleWishlist(product)`, `removeFromWishlist(wishlistId)`, `moveToCart(wishlistId)`, `clearWishlist()`.
- Synchronizes automatically with header badge count in `Header.jsx`.

### 4.2 Dedicated Wishlist Page (`/wishlist`)
- **Route**: `frontend/src/app/wishlist/page.jsx`
- **Wishlist Grid (`WishlistGrid.jsx`)**:
  - Responsive 2 to 4-column grid displaying saved items.
  - Each item card shows image thumbnail, brand name, product title, formatted price (with currency symbol and sale discount badge), variant attributes (e.g. Size/Color), stock indicator ("In Stock" badge or disabled "Out of Stock" state).
  - "Move to Cart" button: Adds item to cart via `POST /api/v1/wishlist/{id}/move-to-cart`, removes item from wishlist, updates cart count, and triggers Toast notification.
  - "Remove" icon button: Calls `DELETE /api/v1/wishlist/{id}` to remove item from wishlist with smooth fade out.
- **Wishlist Toolbar (`WishlistHeader.jsx`)**:
  - Header title "My Saved Wishlist", items count indicator, "Clear All Wishlist" action button, and "Continue Shopping" CTA button.
- **Empty State (`EmptyWishlist.jsx`)**:
  - Rendered when `wishlistCount === 0`.
  - Displays elegant placeholder illustration, "Your wishlist is currently empty" text, and "Explore Catalog" CTA leading to `/products`.

### 4.3 Heart Icon Integration Across Storefront
- **Product Card (`ProductCard.jsx`)**: Interactive heart icon overlay toggles wishlist status instantly with red active heart animation.
- **Product Detail Page (`AddToCartSection.jsx`)**: Heart icon button adjacent to "Add to Cart" toggles wishlist status.

---

## 5. Test Suite & Validation Criteria

- **Playwright E2E Test Suite (`frontend/tests/e2e/wishlist.spec.js`)**:
  1. Verify clicking heart icon on `ProductCard` toggles wishlist status and updates header badge count.
  2. Verify navigating to `/wishlist` renders saved items with image, title, price, and stock status.
  3. Verify clicking "Move to Cart" transfers item to cart drawer/context and removes it from wishlist grid.
  4. Verify clicking "Remove" deletes single item from wishlist.
  5. Verify clicking "Clear All" empties wishlist and displays `EmptyWishlist` placeholder state.
