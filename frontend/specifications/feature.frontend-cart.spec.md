# Feature Specification: Frontend Shopping Cart & Coupon Engine Module

**Module Name:** Frontend Shopping Cart & Coupon Engine  
**Module ID:** 06 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-cart.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 06), `frontend/Requirements/srs_pages.md` (§2.4)  

---

## 1. Module Overview

The **Shopping Cart & Coupon Engine** module manages cart item persistence, quantity manipulation, discount calculations, coupon code validation, and checkout handoff across two primary UI surfaces:
1. **Cart Drawer (`CartDrawer.jsx`)**: A slide-over drawer accessible globally from the header icon or triggered automatically upon "Add to Cart" actions.
2. **Dedicated Cart Page (`/cart`)**: A full-page layout at `frontend/src/app/cart/page.js` with comprehensive line item tables, coupon code application, tax and shipping estimates, order financial summary, and checkout CTA.

The module connects to backend REST endpoints using persistent guest session identifiers (`X-Session-ID` header) or authenticated user Bearer tokens:
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PUT /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart/items/{id}`
- `DELETE /api/v1/cart`
- `POST /api/v1/cart/apply-coupon`
- `DELETE /api/v1/cart/remove-coupon`
- `POST /api/v1/cart/validate`

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Header (Cart Icon Badge)                               |
+-----------------------------------------------------------------------------------+
|  CartDrawer (Slide-Over Panel)                                                    |
|  - Drawer Header (Items Count & Close 'X')                                        |
|  - Scrollable Cart Item List (Thumbnail, Title, Variant, Qty Stepper, Delete)      |
|  - Mini Subtotal & Applied Coupon Badge                                           |
|  - "View Full Cart" CTA & "Proceed to Checkout" CTA                               |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
|                            Dedicated Cart Page (/cart)                            |
+---------------------------------------------------+-------------------------------+
|  CartTable / Item List                            |  OrderSummaryCard             |
|  - Product Thumbnail & Title                      |  - Subtotal                   |
|  - Variant Attributes (Color, Size, SKU)          |  - Applied Coupon Discount    |
|  - Unit Price & Line Total                        |  - Estimated Tax & Shipping   |
|  - Quantity Stepper [-] [qty] [+]                 |  - Final Grand Total          |
|  - Remove Item Icon Button                        |  - "Proceed to Checkout" CTA  |
|  - Clear All Cart Button                          +-------------------------------+
|  - Continue Shopping Link                         |  CouponForm                   |
|                                                   |  - Code Input & Apply Button  |
|                                                   |  - Active Coupon Chip & Remove|
+---------------------------------------------------+-------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Cart Response Payload (`GET /api/v1/cart`)
```json
{
  "success": true,
  "data": {
    "id": 42,
    "items_count": 3,
    "subtotal": 299.99,
    "coupon_discount": 30.00,
    "tax_estimate": 15.00,
    "shipping_estimate": 0.00,
    "total": 284.99,
    "coupon": {
      "code": "SAVE10",
      "discount_type": "percentage",
      "discount_value": 10
    },
    "items": [
      {
        "id": 101,
        "product_id": 5,
        "variant_id": 12,
        "name": "Wireless Noise Cancelling Headphones",
        "slug": "wireless-headphones",
        "image_url": "https://example.com/images/hp.jpg",
        "variant_sku": "HP-BLK-01",
        "attributes": {
          "Color": "Black",
          "Size": "Standard"
        },
        "price": 149.99,
        "quantity": 2,
        "line_total": 299.98,
        "stock_qty": 15
      }
    ]
  }
}
```

### 3.2 Add to Cart Payload (`POST /api/v1/cart/items`)
```json
{
  "variant_id": 12,
  "quantity": 1
}
```

### 3.3 Apply Coupon Payload (`POST /api/v1/cart/apply-coupon`)
```json
{
  "code": "SAVE10"
}
```

---

## 4. UI/UX & Functional Requirements

### 4.1 Cart Drawer Component (`CartDrawer.jsx`)
- **Slide-Over Animation**: Smooth right-to-left slide-over panel with fixed backdrop blur overlay.
- **Header**: Title "Shopping Cart", active badge counter, and close icon (`X`).
- **Items Section**: Compact line item list showing product thumbnail, title, selected variant attributes, unit price, quantity stepper `[-] [qty] [+]`, and delete icon.
- **Footer Section**:
  - Subtotal & Discount breakdown.
  - Applied coupon status chip.
  - "View Cart Page" button (`/cart`).
  - "Checkout Now" button (`/checkout`).

### 4.2 Dedicated Cart Page (`/cart`)
- **Route**: `frontend/src/app/cart/page.js`
- **Cart Table (`CartTable.jsx`)**:
  - Displays product thumbnail, title link, variant attributes pill tags, SKU, unit price, quantity stepper `[-] [qty] [+]` bounded by stock availability, line total, and remove button.
  - Provides a "Clear Shopping Cart" confirmation action.
- **Coupon Engine (`CouponForm.jsx`)**:
  - Input field for promotional code with uppercase transform.
  - "Apply" button triggering `POST /api/v1/cart/apply-coupon`.
  - Displays green success chip with savings amount or red error alert for invalid/expired codes.
  - Includes a "Remove" button calling `DELETE /api/v1/cart/remove-coupon`.
- **Order Summary (`OrderSummaryCard.jsx`)**:
  - Displays Subtotal, Discount amount, Estimated Tax, Estimated Shipping, and Grand Total.
  - Primary CTA button "Proceed to Checkout" leading to `/checkout`.
- **Empty State (`EmptyCartView.jsx`)**:
  - Friendly placeholder with shopping bag icon, "Your cart is currently empty" message, and "Start Shopping" button linking to `/products`.

---

## 5. Test Suite & Validation Criteria

- **Unit & Component Testing**:
  - Verify `CartTable` handles quantity increments, decrements, and stock max limits.
  - Verify `CouponForm` displays error messages for empty or invalid codes.
- **E2E Playwright Specs (`frontend/tests/e2e/cart.spec.js`)**:
  1. Test opening Cart Drawer from header.
  2. Test adding item to cart from PDP and verifying Drawer auto-open.
  3. Test updating item quantity and verifying subtotal recalculation.
  4. Test applying valid coupon code (`SAVE10`) and checking discount line item.
  5. Test removing single item and clearing cart.
  6. Test navigating from `/cart` to `/checkout`.
