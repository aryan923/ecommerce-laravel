# Feature Specification: Frontend Product Comparison Engine Module

**Module Name:** Frontend Product Comparison Engine  
**Module ID:** 12 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-compare.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 12), `frontend/Requirements/srs_pages.md` (§2.10)  

---

## 1. Module Overview

The **Product Comparison Engine** module empowers shoppers to compare up to 4 products side-by-side in a detailed comparison matrix (`/compare`). It enables users to make informed purchasing decisions by contrasting images, pricing, discounts, customer ratings, stock availability, brand details, and technical spec attributes.

The module consists of:
1. **Global Comparison Context (`CompareContext.js`)**: Manages the list of selected products for comparison (`comparedProducts`), maximum item limit (4 items), session persistence in `localStorage`, and helper actions (`addToCompare`, `removeFromCompare`, `clearCompare`, `isInCompare`).
2. **Floating Sticky Bottom Bar (`CompareBar.jsx`)**: Appears fixed at the bottom of the viewport whenever 1 or more products are selected for comparison across catalog pages (`/products`, `/category/[slug]`, `/brand/[slug]`) and PDPs. Renders product thumbnail pills, item count badge, "Compare Now" CTA button leading to `/compare`, and "Clear All" action.
3. **Compare Matrix Route (`/compare`)**: Dedicated route rendering the comparison toolbar (`CompareHeader.jsx`), sticky column headers, side-by-side comparison matrix table (`CompareMatrix.jsx`), attribute diff highlight toggle ("Highlight Differences"), direct "Add to Cart" action buttons, and an empty state view (`EmptyCompare.jsx`).

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Global Layout Header & Storefront                      |
+-----------------------------------------------------------------------------------+
|  Product Card / PDP Compare Toggle Button                                          |
|  - Checkbox / Scales Icon ("Add to Compare")                                      |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
|                        Floating Compare Bar (Sticky Bottom Viewport)              |
+-----------------------------------------------------------------------------------+
|  Rendered when comparedProducts.length > 0                                        |
|  - Selected product thumbnails (up to 4) with remove (X) badge                     |
|  - Counter badge ("3/4 Products Selected")                                        |
|  - Action: "Compare Now" CTA -> /compare                                          |
|  - Action: "Clear All"                                                            |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
|                            Compare Page Route (/compare)                          |
+-----------------------------------------------------------------------------------+
|  CompareHeader / Toolbar                                                          |
|  - Page Title ("Product Comparison Matrix") & Count Badge                         |
|  - Toggle Switch: "Highlight Differences Only"                                    |
|  - Action: "Share Comparison Link"                                                |
|  - Action: "Clear All Products"                                                   |
+-----------------------------------------------------------------------------------+
|  CompareMatrix Layout (Table / Grid)                                              |
|  +---------------------+-------------------+-------------------+------------------+
|  | Attributes          | Product 1         | Product 2         | Product 3        |
|  +---------------------+-------------------+-------------------+------------------+
|  | Product Overview    | Image, Title      | Image, Title      | Image, Title     |
|  | Price & Discount    | $185.00 (-16%)    | $1,450.00         | $89.00 (-10%)    |
|  | Rating & Reviews    | ★ 4.8 (42)        | ★ 4.9 (128)       | ★ 4.5 (18)       |
|  | Brand               | LUXORA Artisans   | Vanguard          | Aero Lifestyle   |
|  | Stock Status        | In Stock (8 left) | Out of Stock      | In Stock         |
|  | Technical Specs     | Leather, Brown    | Gold/Steel, Black | Cotton, White    |
|  | Actions             | "Add to Cart"     | "Notify Me"       | "Add to Cart"    |
|  +---------------------+-------------------+-------------------+------------------+
+-----------------------------------------------------------------------------------+
|  EmptyCompare View (Rendered when comparedProducts.length == 0)                   |
|  - Scales illustration, "No Products Selected for Comparison" & Catalog CTA       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Fetch Products for Comparison (`GET /api/v1/products`)

- **Request URL**: `/api/v1/products?ids=14,22,35`
- **Method**: `GET`
- **Query Parameters**: `ids` (comma-separated product ID list)

#### Sample Success Response Payload (`200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 14,
      "title": "Italian Leather Bifold Wallet",
      "slug": "italian-leather-wallet",
      "brand": "LUXORA Artisans",
      "image_url": "https://example.com/images/wallet.jpg",
      "price": 185.00,
      "original_price": 220.00,
      "discount_percent": 16,
      "rating": 4.8,
      "reviews_count": 42,
      "in_stock": true,
      "stock_qty": 8,
      "attributes": {
        "Material": "Genuine Italian Calfskin Leather",
        "Color": "Cognac Brown",
        "Dimensions": "4.5 x 3.5 inches",
        "Warranty": "2 Years"
      }
    },
    {
      "id": 22,
      "title": "Chrono Automatic Gold Watch",
      "slug": "chrono-automatic-watch",
      "brand": "Vanguard Timepieces",
      "image_url": "https://example.com/images/watch.jpg",
      "price": 1450.00,
      "original_price": 1450.00,
      "discount_percent": 0,
      "rating": 4.9,
      "reviews_count": 128,
      "in_stock": false,
      "stock_qty": 0,
      "attributes": {
        "Material": "18K Gold Plated Stainless Steel",
        "Color": "Gold / Black Dial",
        "Dimensions": "42mm Case",
        "Warranty": "5 Years"
      }
    }
  ]
}
```

---

## 4. Detailed Component Specifications

### 4.1 CompareContext (`frontend/src/context/CompareContext.js`)
- **State**:
  - `comparedProducts`: Array of selected product objects or IDs (`[14, 22]`). Max length: `4`.
- **Functions**:
  - `addToCompare(product)`: Adds product to array. If array length reaches 4, triggers warning toast ("Maximum 4 products can be compared at a time").
  - `removeFromCompare(productId)`: Removes product by ID.
  - `clearCompare()`: Resets compare array to empty `[]`.
  - `isInCompare(productId)`: Returns boolean check.
  - `toggleCompare(product)`: Adds if absent, removes if present.
- **Persistence**: Synchronizes state with `localStorage` key `luxora_compare_items`.

### 4.2 CompareBar (`frontend/src/components/compare/CompareBar.jsx`)
- **Placement**: Fixed sticky bottom bar (`fixed bottom-0 left-0 right-0 z-50 bg-stone-900 text-white`).
- **Elements**:
  - Item thumbnails with remove `(X)` badge button.
  - Count text: `3 of 4 products selected`.
  - CTA Button: `Compare Now` leading to `/compare`.
  - Action link: `Clear All`.

### 4.3 CompareMatrix (`frontend/src/components/compare/CompareMatrix.jsx`)
- **Table Grid**: Side-by-side comparison table where columns represent compared products and rows represent attributes.
- **Highlight Differences Toggle**: When enabled, rows with matching attribute values are dimmed/hidden, highlighting unique differences across products.
- **Direct Actions**: Each product column includes "Add to Cart" CTA connected directly to `CartContext`.

---

## 5. Non-Functional Requirements & SEO

1. **SEO Meta Tags**: Page title `Product Comparison Matrix | Luxora` and meta description.
2. **Responsiveness**: Horizontal scrollable container for mobile viewports to prevent table clipping.
3. **Accessibility**: Screen-reader accessible comparison checkable buttons with `aria-label="Add product to comparison"`.
