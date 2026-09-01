# Feature Specification: Frontend Product Detail Page (PDP) Module

**Module Name:** Frontend Product Detail Page (PDP)  
**Module ID:** 05 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-pdp.spec.md`  
**Version:** 1.0  
**Status:** Draft / Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 05), `frontend/Requirements/srs_pages.md` (§2.3)  

---

## 1. Module Overview

The **Product Detail Page (PDP)** module provides a complete, interactive product breakdown for individual items at `frontend/src/app/products/[slug]/page.js`. It renders a high-resolution product media gallery with thumbnail selection and image modal zoom, variant attribute selectors (swatches/pills for color, size, etc.) with real-time price and stock updates, pincode delivery serviceability estimator, quantity selection with cart drawer integration, tabbed product information (description, technical specs, shipping policy, reviews), verified customer review list with rating distribution, review submission modal, and category-based related products carousel.

It connects directly to backend REST endpoints:
- `GET /api/v1/products/{slug}`
- `GET /api/v1/products/{product_id}/reviews`
- `POST /api/v1/shipping/calculate`
- `POST /api/v1/customer/reviews`
- `POST /api/v1/wishlist` & `DELETE /api/v1/wishlist/{id}`

---

## 2. Page Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Breadcrumbs Navigation                                 |
+--------------------------------------------------+--------------------------------+
|  MediaGallery                                    |  ProductInfo                   |
|  - Main Display Image with Hover/Zoom            |  - Brand Link & Title          |
|  - Thumbnail Carousel / Swatches                 |  - Star Rating Summary & Count |
|  - Fullscreen Lightbox Modal Zoom                |  - Pricing (Original & Sale)   |
|                                                  |  - Discount Badge (%)          |
|                                                  +--------------------------------+
|                                                  |  VariantPicker                 |
|                                                  |  - Size / Color / Specs Pills  |
|                                                  |  - Dynamic SKU & Stock Update  |
|                                                  +--------------------------------+
|                                                  |  StockBadge                    |
|                                                  |  - In Stock / Low Stock Badge  |
|                                                  +--------------------------------+
|                                                  |  PincodeChecker                |
|                                                  |  - Pincode Input & Check Button|
|                                                  |  - Estimated Delivery Window   |
|                                                  +--------------------------------+
|                                                  |  AddToCartSection              |
|                                                  |  - Qty Stepper [-] [qty] [+]   |
|                                                  |  - "Add to Cart" CTA           |
|                                                  |  - "Buy Now" CTA               |
|                                                  |  - Wishlist Heart Toggle       |
+--------------------------------------------------+--------------------------------+
|  ProductTabs                                                                      |
|  - Description Tab | Specifications Tab | Shipping Policy Tab | Reviews Tab       |
|  +-----------------------------------------------------------------------------+  |
|  | ReviewList & AddReviewModal                                                 |  |
|  | - Star Rating Distribution Stats (1 to 5 Stars)                             |  |
|  | - Verified Customer Reviews List                                            |  |
|  | - "Write a Review" Modal Trigger (Authenticated)                            |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
|  RelatedProducts (Category Product Carousel)                                      |
+-----------------------------------------------------------------------------------+
```

---

## 3. Functional Requirements

- **FR-FPD-001**: System shall render the Product Detail Page dynamic route at `frontend/src/app/products/[slug]/page.js` fetching full product details from `GET /api/v1/products/{slug}` using Next.js `generateMetadata` for dynamic SEO meta tags.
- **FR-FPD-002**: System shall provide `MediaGallery.jsx` featuring:
  - High-res main image display with smooth image transition on thumbnail hover/click.
  - Image carousel/grid thumbnails highlighting the active preview item.
  - Fullscreen lightbox modal pop-up supporting click-to-zoom and keyboard navigation (Esc to close).
- **FR-FPD-003**: System shall provide `ProductInfo.jsx` rendering brand logo/link, product title, category breadcrumb link, rating summary badge, regular price, sale price, discount percentage badge, and SKU identifier.
- **FR-FPD-004**: System shall provide `VariantPicker.jsx` rendering interactive attribute pills/swatches (e.g. Size: S/M/L/XL, Color: Red/Blue/Black). Selecting a variant MUST dynamically recalculate and update:
  - Selected variant ID.
  - Product price and sale price formatting.
  - SKU code.
  - Real-time stock status badge and maximum selectable quantity.
- **FR-FPD-005**: System shall provide `StockBadge.jsx` displaying visually distinctive status badges:
  - *"In Stock"* (Green badge when `stock_quantity > 5`)
  - *"Only X left in stock"* (Amber warning badge when `1 <= stock_quantity <= 5`)
  - *"Out of Stock"* (Red disabled badge when `stock_quantity === 0`)
- **FR-FPD-006**: System shall provide `PincodeChecker.jsx` with input field and "Check Delivery" action posting pincode to `POST /api/v1/shipping/calculate` to render estimated delivery date window (e.g. "Delivered by Tuesday, Sep 2") and available shipping methods.
- **FR-FPD-007**: System shall provide `AddToCartSection.jsx` containing:
  - Quantity stepper input `[-] [qty] [+]` (min 1, max available stock).
  - Primary **"Add to Cart"** button triggering `CartContext.addItem()` and opening the `CartDrawer`.
  - Secondary **"Buy Now"** button adding item to cart and immediately navigating to `/checkout`.
  - Heart icon button toggling Wishlist state via `POST /api/v1/wishlist` / `DELETE /api/v1/wishlist/{id}`.
- **FR-FPD-008**: System shall provide `ProductTabs.jsx` tabbed interface switching between:
  - **Description**: Rich text HTML content display.
  - **Specifications**: Key-value table of technical attributes (Material, Weight, Dimensions, Warranty).
  - **Shipping & Returns**: Standard shipping SLAs, return window policies, and guarantee details.
  - **Customer Reviews**: Rating breakdown and review submission section.
- **FR-FPD-009**: System shall provide `ReviewList.jsx` and `AddReviewModal.jsx`:
  - Fetching reviews from `GET /api/v1/products/{product_id}/reviews`.
  - Displaying overall rating score (e.g., 4.5 / 5.0) and percentage bar breakdown per star level (5-star, 4-star, 3-star, 2-star, 1-star).
  - Rendering customer review cards with verified buyer badge, review title, rating stars, comment body, and date.
  - Providing "Write a Review" modal form accepting star rating select (1 to 5 stars), title, and review comment submitting to `POST /api/v1/customer/reviews`.
- **FR-FPD-010**: System shall provide `RelatedProducts.jsx` rendering a product carousel/grid of related products sharing the same category fetched from `GET /api/v1/products?category={category_slug}&limit=4`.
- **FR-FPD-011**: System shall provide automated Playwright E2E test spec `frontend/tests/e2e/pdp.spec.js` validating page render, variant selection price updates, media gallery image zoom, pincode serviceability check, add-to-cart action, review tab rendering, and related products loading.

---

## 4. Technical Specifications & File Map

| Component / File | Target Location | Purpose |
|---|---|---|
| PDP Dynamic Route | `frontend/src/app/products/[slug]/page.js` | Product detail page route component |
| Media Gallery | `frontend/src/components/pdp/MediaGallery.jsx` | Image gallery preview, thumbnails & zoom modal |
| Product Info | `frontend/src/components/pdp/ProductInfo.jsx` | Title, brand link, pricing & rating summary |
| Variant Picker | `frontend/src/components/pdp/VariantPicker.jsx` | Interactive variant swatches (size/color/material) |
| Stock Badge | `frontend/src/components/pdp/StockBadge.jsx` | Real-time stock status indicator badge |
| Pincode Checker | `frontend/src/components/pdp/PincodeChecker.jsx` | Pincode delivery serviceability & ETA calculator |
| Add To Cart Section | `frontend/src/components/pdp/AddToCartSection.jsx` | Qty stepper, Add to Cart, Buy Now & Wishlist buttons |
| Product Tabs | `frontend/src/components/pdp/ProductTabs.jsx` | Tab container for Description, Specs, Policy & Reviews |
| Review List | `frontend/src/components/pdp/ReviewList.jsx` | Rating breakdown stats & verified buyer reviews list |
| Add Review Modal | `frontend/src/components/pdp/AddReviewModal.jsx` | Star rating & review submission form modal |
| Related Products | `frontend/src/components/pdp/RelatedProducts.jsx` | Category related products carousel component |
| E2E PDP Spec | `frontend/tests/e2e/pdp.spec.js` | Playwright E2E test suite for PDP module |

---

## 5. API Endpoint Mapping

- `GET /api/v1/products/{slug}`: Fetches product detail object (id, title, slug, description, specs, price, sale_price, stock, sku, images, variants, attributes, category, brand).
- `GET /api/v1/products/{product_id}/reviews`: Fetches ratings breakdown (avg_rating, total_reviews, rating_counts) and paginated list of reviews.
- `POST /api/v1/shipping/calculate`: Payload: `{ pincode: "110001", items: [...] }`. Returns available shipping options and delivery estimate.
- `POST /api/v1/customer/reviews`: Payload: `{ product_id: 1, rating: 5, title: "Great product", comment: "..." }`. Requires `Authorization: Bearer <token>`.
- `POST /api/v1/wishlist` & `DELETE /api/v1/wishlist/{id}`: Toggle product in customer wishlist.
