# Implementation Plan: Frontend Product Detail Page (PDP)

**Module Name:** Frontend Product Detail Page (PDP)  
**Module ID:** 05 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-pdp.md`  
**Specification File:** `frontend/specifications/feature.frontend-pdp.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Completed  

---

## 1. Module Summary

This implementation plan outlines the development roadmap for **Frontend Module 05: Product Detail Page (PDP) (`/products/[slug]`)**. It builds all PDP components including `MediaGallery.jsx`, `ProductInfo.jsx`, `VariantPicker.jsx`, `StockBadge.jsx`, `PincodeChecker.jsx`, `AddToCartSection.jsx`, `ProductTabs.jsx`, `ReviewList.jsx`, `AddReviewModal.jsx`, `RelatedProducts.jsx`, integrates them inside dynamic route `frontend/src/app/products/[slug]/page.js`, and implements an automated Playwright E2E test suite (`pdp.spec.js`).

---

## 2. Development Strategy

1. **Media Gallery & Image Lightbox**:
   - Implement `frontend/src/components/pdp/MediaGallery.jsx` featuring high-res main preview image, hover zoom lens effect, thumbnail carousel selector, and fullscreen modal lightbox viewer.
2. **Product Details & Stock Badge**:
   - Implement `frontend/src/components/pdp/ProductInfo.jsx` rendering title, brand, rating star summary, pricing, discount badges, and SKU.
   - Implement `frontend/src/components/pdp/StockBadge.jsx` rendering stock indicator pill (In Stock, Low Stock count, Out of Stock).
3. **Interactive Variant Picker**:
   - Implement `frontend/src/components/pdp/VariantPicker.jsx` rendering attribute swatches (size, color, material). Dynamically update active variant selection, price calculation, SKU, and stock bounds upon variant click.
4. **Pincode Delivery Estimator**:
   - Implement `frontend/src/components/pdp/PincodeChecker.jsx` allowing users to enter a 6-digit pincode and call `POST /api/v1/shipping/calculate` to render delivery estimates and available shipping methods.
5. **Add to Cart, Buy Now & Wishlist Controls**:
   - Implement `frontend/src/components/pdp/AddToCartSection.jsx` with quantity stepper, "Add to Cart" CTA (triggers `CartContext.addItem` & opens drawer), "Buy Now" CTA (adds item & redirects to `/checkout`), and Wishlist heart toggle.
6. **Tabbed Product Specifications & Reviews**:
   - Implement `frontend/src/components/pdp/ProductTabs.jsx` for switching between Description, Technical Specifications, Shipping Policy, and Reviews.
   - Implement `frontend/src/components/pdp/ReviewList.jsx` and `frontend/src/components/pdp/AddReviewModal.jsx` to fetch reviews from `GET /api/v1/products/{id}/reviews`, show rating distribution, list reviews, and allow authenticated review submissions to `POST /api/v1/customer/reviews`.
7. **Category Related Products Carousel**:
   - Implement `frontend/src/components/pdp/RelatedProducts.jsx` fetching products from `GET /api/v1/products?category={slug}&limit=4` and rendering `ProductCard` carousel.
8. **Assemble Dynamic PDP Route**:
   - Create `frontend/src/app/products/[slug]/page.js` uniting all components with Next.js dynamic metadata and skeleton loader fallback.
9. **Automated Playwright E2E Test Suite**:
   - Create `frontend/tests/e2e/pdp.spec.js` and execute `npm run test:e2e` to validate PDP page loading, variant switching, image modal zoom, pincode estimator, cart addition, and reviews.

---

## 3. Task Breakdown

- [x] **Task 1: Implement MediaGallery Component**
  - File: `frontend/src/components/pdp/MediaGallery.jsx`
  - Description: High-resolution image preview, thumbnail carousel selector, and fullscreen zoom lightbox modal.

- [x] **Task 2: Implement ProductInfo & StockBadge Components**
  - Files: `frontend/src/components/pdp/ProductInfo.jsx` & `frontend/src/components/pdp/StockBadge.jsx`
  - Description: Title, brand info, star rating summary, pricing display, discount badges, and stock availability badge.

- [x] **Task 3: Implement VariantPicker Component**
  - File: `frontend/src/components/pdp/VariantPicker.jsx`
  - Description: Interactive attribute swatches (Size, Color, Material) updating selected variant ID, price, stock, and SKU.

- [x] **Task 4: Implement PincodeChecker Component**
  - File: `frontend/src/components/pdp/PincodeChecker.jsx`
  - Description: Pincode delivery serviceability form calling `POST /api/v1/shipping/calculate` to show shipping timelines.

- [x] **Task 5: Implement AddToCartSection Component**
  - File: `frontend/src/components/pdp/AddToCartSection.jsx`
  - Description: Quantity stepper, Add to Cart (with drawer toggle), Buy Now redirect CTA, and Wishlist heart button.

- [x] **Task 6: Implement ProductTabs Component**
  - File: `frontend/src/components/pdp/ProductTabs.jsx`
  - Description: Tabbed navigation container for Description, Technical Specs Table, Shipping & Return Policy, and Reviews.

- [x] **Task 7: Implement ReviewList & AddReviewModal Components**
  - Files: `frontend/src/components/pdp/ReviewList.jsx` & `frontend/src/components/pdp/AddReviewModal.jsx`
  - Description: Review stats distribution bars, verified buyer reviews list, and review submission modal form.

- [x] **Task 8: Implement RelatedProducts Component & Dynamic Route**
  - Files: `frontend/src/components/pdp/RelatedProducts.jsx` & `frontend/src/app/products/[slug]/page.js`
  - Description: Category related products carousel and PDP page route assembly with Next.js SEO metadata.

- [x] **Task 9: Implement Playwright E2E PDP Test Suite**
  - File: `frontend/tests/e2e/pdp.spec.js`
  - Description: Playwright E2E test suite validating PDP render, variant switching, image zoom modal, pincode estimator, cart actions, and reviews.
