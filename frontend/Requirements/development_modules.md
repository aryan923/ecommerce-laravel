# E-Commerce Next.js Storefront — Development Modules Roadmap

**Project:** E-Commerce Next.js Storefront (Customer Facing)  
**Tech Stack:** Next.js 16 (App Router) / React 19 / Tailwind CSS / Axios / Playwright  
**Backend Reference:** Laravel 12 API (`/api/v1/`)  
**Reference Documents:**
- `Requirements/srs_pages.md` — Storefront Pages & Component API Specifications  
- `Requirements/srs_apis.md` — Backend REST API Specification  
- `Requirements/development_modules.md` — Backend Development Roadmap  

---

> [!IMPORTANT]  
> **Development & Integration Standards:**
> 1. **Modular Page Architecture**: Every Next.js page in `frontend/src/app/` must be built modularly using reusable components (`frontend/src/components/`).
> 2. **API Endpoint Coupling**: Every page/feature must be directly attached to its corresponding Laravel API endpoint from `routes/api.php`.
> 3. **Persistent Guest & Customer Sessions**:
>    - Guest carts must send the `X-Session-ID` header generated and stored in cookies/localStorage.
>    - Authenticated customer requests must attach the `Authorization: Bearer <token>` header.
>    - Upon customer login, the frontend MUST trigger `POST /api/v1/cart/merge` to automatically combine guest cart items with the customer's account cart.
> 4. **SEO & App Router Conventions**: Every public page MUST export dynamic metadata using Next.js `generateMetadata` for search engine optimization.

---

## Storefront Development Module Index

| Module # | Module Name | Scope & Purpose | Priority | Depends On | Attached API Endpoints |
|---|---|---|---|---|---|
| **01** | **Core Architecture & API Client** | Axios client setup, Sanctum token & `X-Session-ID` middleware, Toast System, Global Providers | Critical | — | `/api/v1/health` |
| **02** | **Global Navigation & Layout** | Header, Navbar, Currency Switcher, Category Dropdown, Footer, Mobile Drawer | Critical | 01 | `GET /api/v1/categories`, `GET /api/v1/currencies` |
| **03** | **Home Page Storefront (`/`)** | Hero Carousel, Category Grid, Trending/Best Sellers, Promo Banners, Brand Logos | High | 02 | `GET /api/v1/categories`, `GET /api/v1/brands`, `GET /api/v1/products` |
| **04** | **Product Catalog & Listing** | Product Grid, Faceted Filters (Category, Brand, Price, Attributes), Sorting, Pagination | Critical | 02 | `GET /api/v1/products`, `GET /api/v1/categories/{slug}`, `GET /api/v1/brands/{slug}`, `GET /api/v1/attributes` |
| **05** | **Product Detail Page (PDP)** | Image Gallery, Variant Selector, Stock Check, Pincode Estimator, Specifications, Reviews | Critical | 04 | `GET /api/v1/products/{slug}`, `GET /api/v1/products/{id}/reviews`, `POST /api/v1/shipping/calculate`, `POST /api/v1/customer/reviews` |
| **06** | **Shopping Cart & Coupons** | Slide-over Drawer & Full Cart Page, Quantity Adjustment, Coupon Application, Totals Summary | Critical | 01, 05 | `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PUT /api/v1/cart/items/{id}`, `DELETE /api/v1/cart/items/{id}`, `POST /api/v1/cart/apply-coupon` |
| **07** | **Customer Authentication** | Login, Register, Forgot Password, Reset Password, Session Management & Cart Merge | Critical | 01, 06 | `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/cart/merge` |
| **08** | **Checkout & Order Processing** | Shipping Address Form, Shipping Method Selector, Tax Preview, Payment Gateways (COD, Card/UPI) | Critical | 06, 07 | `POST /api/v1/shipping/calculate`, `POST /api/v1/tax/calculate`, `GET /api/v1/payments/methods`, `POST /api/v1/checkout/process`, `POST /api/v1/payments/initiate` |
| **09** | **Customer Account Dashboard** | Profile Settings, Saved Addresses, Order History, Tracking, Cancel Order, Return Request, Bank Accounts | High | 07, 08 | `GET/PUT /api/v1/customer/profile`, `GET/POST/PUT/DELETE /api/v1/customer/addresses`, `GET /api/v1/customer/orders`, `POST /api/v1/customer/orders/{id}/cancel`, `GET/POST /api/v1/customer/returns` |
| **10** | **Wishlist Management** | Saved Wishlist Grid, Check Status, Move Item to Cart, Quick Clear | Medium | 05, 07 | `GET /api/v1/wishlist`, `POST /api/v1/wishlist`, `DELETE /api/v1/wishlist/{id}`, `POST /api/v1/wishlist/{id}/move-to-cart` |
| **11** | **Order Tracking & Info Pages** | Public Shipment Tracker, About Us, Contact Us, Shipping & Return Policy, Terms, Privacy | Medium | 01 | `GET /api/v1/shipments/track/{tracking_number}` |
| **12** | **Product Comparison Engine** | Side-by-side spec & price comparison (`/compare`), floating comparison bar | Low | 04, 05 | `GET /api/v1/products` |
| **13** | **OTP & Security Verification** | Email/Phone OTP verification modal & page (`/auth/verify-otp`) | High | 07 | `POST /api/v1/auth/register`, `Model: Otp` |

---

## Detailed Module Breakdown

### Module 01: Core Architecture & API Infrastructure
- **Purpose**: Establishes global frontend state, HTTP clients, and authentication token/session persistence.
- **Directory**: `frontend/src/lib/` & `frontend/src/context/`
- **Key Deliverables**:
  1. **`api-client.js`**: Axios instance configured with `baseURL` (`NEXT_PUBLIC_API_BASE_URL`). Automatically attaches:
     - `Authorization: Bearer <token>` if customer is logged in.
     - `X-Session-ID: <uuid>` generated and persisted in cookies for guest cart session identification.
  2. **`AuthContext.js`**: React context managing customer login state, user object, token storage, login/logout methods.
  3. **`CartContext.js`**: React context managing cart items count, slide-over drawer toggle, and live cart updates.
  4. **`ToastContext.js`**: Global toast notification system for success, error, and info popups.
  5. **`ErrorBoundary.js`**: Fallback UI component for unexpected page render errors.

---

### Module 02: Global Navigation & Layout
- **Purpose**: Provides persistent, accessible navigation across all storefront routes.
- **Components**:
  - `Header.jsx`: Logo, Search bar, Category dropdown menu, Currency switcher, Wishlist icon count, Cart drawer button, Customer Account dropdown / Login link.
  - `CategoryMenu.jsx`: Multi-level hover/click category drawer fetching dynamic hierarchy from `GET /api/v1/categories`.
  - `CurrencySwitcher.jsx`: Currency selector fetching available currencies from `GET /api/v1/currencies`.
  - `Footer.jsx`: Links to category catalog, customer helpdesk, social links, static policies, newsletter signup.
  - `MobileNav.jsx`: Mobile bottom tab bar for easy smartphone navigation.

---

### Module 03: Home Page Storefront (`/`)
- **Purpose**: High-converting, visually rich landing page.
- **Page File**: `frontend/src/app/page.js`
- **Components**:
  - `HeroSlider.jsx`: Dynamic promotional banners with CTA buttons.
  - `CategoryBanners.jsx`: Grid of top product categories with background images.
  - `ProductCarousel.jsx`: Reusable carousel showcasing **Featured Products**, **New Arrivals**, and **Best Sellers** (`GET /api/v1/products?featured=1`).
  - `PromoBanner.jsx`: Discount coupon promotion banner.
  - `BrandGrid.jsx`: Showcase of top brand logos fetched from `GET /api/v1/brands`.
  - `TrustBadges.jsx`: Value proposition badges (Free Shipping, 100% Secure Payment, Easy Returns, 24/7 Support).

---

### Module 04: Product Catalog & Listing Pages
- **Purpose**: Search, browse, and filter products with instant pagination and sorting.
- **Routes**:
  - `/products` (All products catalog)
  - `/category/[slug]` (Category-filtered catalog)
  - `/brand/[slug]` (Brand-filtered catalog)
- **Attached Endpoints**:
  - `GET /api/v1/products` (Filters: `category`, `brand`, `attribute`, `price_min`, `price_max`, `sort`, `search`, `page`)
  - `GET /api/v1/categories/{slug}`
  - `GET /api/v1/brands/{slug}`
  - `GET /api/v1/attributes` (Renders attribute filter options like Size, Color, Material)
- **Components**:
  - `FilterSidebar.jsx`: Accordion for Categories, Price Range Slider, Brand checkboxes, Attribute chips (Color/Size).
  - `SortDropdown.jsx`: Sorting options (Price: Low to High, Price: High to Low, Latest, Rating).
  - `ProductGrid.jsx`: Responsive grid of `ProductCard.jsx` items.
  - `ProductCard.jsx`: Product image, title, price (original vs sale), discount %, rating badge, quick Add to Cart button, Wishlist heart toggle.
  - `Pagination.jsx`: Page numbers & Previous/Next navigation.

---

### Module 05: Product Detail Page (PDP) (`/products/[slug]`)
- **Purpose**: Full product breakdown, variant selection, real-time stock indicator, delivery check, and reviews.
- **Route**: `frontend/src/app/products/[slug]/page.js`
- **Attached Endpoints**:
  - `GET /api/v1/products/{slug}`
  - `GET /api/v1/products/{product_id}/reviews`
  - `POST /api/v1/customer/reviews` (Authenticated)
  - `POST /api/v1/shipping/calculate` (Pincode serviceability estimator)
- **Components**:
  - `MediaGallery.jsx`: Main image viewer, thumbnail selector, image zoom modal.
  - `VariantPicker.jsx`: Interactive pills/swatches for selecting product variants (e.g. Size: M, Color: Blue). Updates price, SKU, and stock dynamically based on selected variant.
  - `StockBadge.jsx`: Real-time stock status ("In Stock", "Only 3 left in stock", "Out of Stock").
  - `PincodeChecker.jsx`: Form allowing customers to enter their pincode to verify shipping serviceability and estimated delivery timeframe.
  - `ProductTabs.jsx`: Tabbed view for Description, Technical Specifications, Shipping & Return Policy, and Customer Reviews.
  - `ReviewList.jsx` & `AddReviewModal.jsx`: Displays review distribution stats, verified buyer reviews, and review submission form.
  - `RelatedProducts.jsx`: Carousel of related products from the same category.

---

### Module 06: Shopping Cart & Coupon Engine
- **Purpose**: Manages cart items, quantity updates, coupon discount calculation, and checkout redirection.
- **Routes & Views**:
  - `CartDrawer.jsx`: Slide-over drawer accessible from header.
  - `/cart`: Full dedicated cart page (`frontend/src/app/cart/page.js`).
- **Attached Endpoints**:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `PUT /api/v1/cart/items/{id}`
  - `DELETE /api/v1/cart/items/{id}`
  - `DELETE /api/v1/cart`
  - `POST /api/v1/cart/apply-coupon`
  - `DELETE /api/v1/cart/remove-coupon`
  - `POST /api/v1/cart/validate`
- **Components**:
  - `CartTable.jsx`: List of cart items with thumbnail, title, selected variant attributes, price, quantity stepper `[-] [qty] [+]`, remove item button.
  - `CouponForm.jsx`: Coupon code input field with Apply/Remove functionality and error messaging.
  - `OrderSummaryCard.jsx`: Financial breakdown showing Subtotal, Coupon Discount, Tax Preview, Estimated Shipping, Total Amount, and "Proceed to Checkout" CTA button.

---

### Module 07: Customer Authentication & Session Merge
- **Purpose**: Customer signup, signin, password recovery, and automatic cart merging.
- **Routes**:
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`
  - `/auth/reset-password`
- **Attached Endpoints**:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
  - `POST /api/v1/cart/merge` (Triggers immediately after successful login to combine guest cart into user account)
- **Key Logic**:
  - Stores Sanctum token in HTTP-only cookie or secure storage.
  - Redirects user back to their intended destination (e.g. `/checkout` if redirected from cart).

---

### Module 08: Checkout & Order Processing
- **Purpose**: Multi-step checkout flow for guest and authenticated customers with payment gateway integration.
- **Routes**:
  - `/checkout` (`frontend/src/app/checkout/page.js`)
  - `/checkout/success/[order_number]` (`frontend/src/app/checkout/success/[order_number]/page.js`)
- **Attached Endpoints**:
  - `POST /api/v1/shipping/calculate` (Calculates exact shipping methods & costs for checkout address)
  - `POST /api/v1/tax/calculate` (Calculates GST/Tax breakdown)
  - `GET /api/v1/payments/methods` (Retrieves active payment gateways)
  - `POST /api/v1/checkout/process` (Generates order record in backend)
  - `POST /api/v1/payments/initiate` & `POST /api/v1/payments/verify` (Gateway integration)
  - `GET /api/v1/orders/{order_number}` (Fetches order details for confirmation receipt)
- **Components**:
  - `CheckoutSteps.jsx`: Stepper UI tracking Customer Info -> Shipping Address -> Shipping Method -> Payment Method.
  - `SavedAddressSelector.jsx`: Radio list of customer's saved addresses + "Add New Address" modal.
  - `ShippingMethodRadio.jsx`: Standard vs Express shipping option selector with pricing.
  - `PaymentGatewaySelector.jsx`: Radio choices (Credit/Debit Card, UPI, Netbanking, Cash on Delivery).
  - `OrderReceiptCard.jsx`: Detailed order confirmation receipt displaying order number, delivery address, items breakdown, payment status, and tracking link.

---

### Module 09: Customer Account Portal
- **Purpose**: Self-service portal for managing profile, addresses, orders, cancellations, returns, and notifications.
- **Route Namespace**: `/account/*`
- **Sub-pages**:
  - `/account` (Dashboard overview with quick metrics)
  - `/account/profile` (Edit name, phone, change password)
  - `/account/addresses` (Manage shipping/billing addresses)
  - `/account/orders` (Order history listing with status badges)
  - `/account/orders/[order_number]` (Order detail page with invoice download & tracking link)
  - `/account/returns` & `/account/returns/new` (View return requests & submit return request form)
  - `/account/bank-accounts` (Manage saved bank accounts for instant refund processing)
  - `/account/notifications` (In-app notifications list)
- **Attached Endpoints**:
  - `GET /api/v1/customer/profile` & `PUT /api/v1/customer/profile`
  - `POST /api/v1/customer/change-password`
  - `GET/POST/PUT/DELETE /api/v1/customer/addresses`
  - `GET /api/v1/customer/orders` & `GET /api/v1/customer/orders/{order_number}`
  - `POST /api/v1/customer/orders/{order_number}/cancel`
  - `GET/POST /api/v1/customer/returns`
  - `GET/POST/DELETE /api/v1/customer/bank-accounts`
  - `GET /api/v1/customer/notifications`

---

### Module 10: Wishlist Management
- **Purpose**: Save favorite products for later purchase.
- **Route**: `/wishlist` (`frontend/src/app/wishlist/page.js`)
- **Attached Endpoints**:
  - `GET /api/v1/wishlist`
  - `POST /api/v1/wishlist`
  - `DELETE /api/v1/wishlist/{id}`
  - `POST /api/v1/wishlist/{id}/move-to-cart`
  - `DELETE /api/v1/wishlist` (Clear all)
- **Components**:
  - `WishlistGrid.jsx`: Grid of saved wishlist items with "Move to Cart" and "Remove" actions.

---

### Module 11: Public Order Tracking & Information Pages
- **Purpose**: Guest tracking and informational pages.
- **Routes**:
  - `/track-order` (`frontend/src/app/track-order/page.js`)
  - `/about`, `/contact`, `/shipping-policy`, `/terms`, `/privacy`
- **Attached Endpoints**:
  - `GET /api/v1/shipments/track/{tracking_number}`
- **Components**:
  - `TrackingForm.jsx`: Input form to enter tracking number or order number.
  - `TrackingTimeline.jsx`: Visual step-by-step shipment timeline (Ordered -> Processed -> Shipped -> Out for Delivery -> Delivered).

---

### Module 12: Product Comparison Engine
- **Purpose**: Side-by-side spec, attribute, and pricing comparison matrix for up to 4 products.
- **Route**: `/compare` (`frontend/src/app/compare/page.js`)
- **Components**:
  - `CompareBar.jsx`: Floating sticky bottom bar showing selected products for comparison with "Compare Now" CTA.
  - `CompareMatrix.jsx`: Table comparing Image, Title, Price, Rating, Stock, Brand, and technical attribute rows.

---

### Module 13: OTP Verification & Account Security
- **Purpose**: Handles OTP-based account registration verification and password reset validation.
- **Route**: `/auth/verify-otp` (`frontend/src/app/auth/verify-otp/page.js`)
- **Components**:
  - `OtpInputModal.jsx`: 6-digit PIN input with resend timer.

---

---

## 3. Testing & Automated Quality Assurance Matrix

Every module implementation MUST be backed by Playwright End-to-End (E2E) automated tests in `frontend/tests/e2e/`.

### 3.1 E2E Test Suite Specification

| Module # | Module Name | Playwright Test Spec File | Test Scenarios Covered |
|---|---|---|---|
| **01** | Core Architecture | `frontend/tests/e2e/core.spec.js` | Axios interceptors, `X-Session-ID` cookie persistence, Error boundary fallback |
| **02** | Navigation & Layout | `frontend/tests/e2e/layout.spec.js` | Header links, Category menu hover/click, Currency switcher dropdown |
| **03** | Home Page | `frontend/tests/e2e/home.spec.js` | Hero slider navigation, Category grid cards, Best seller carousel, Newsletter signup |
| **04** | Catalog & Listing | `frontend/tests/e2e/catalog.spec.js` | Faceted search (price slider, brand/attribute filter), Sort options, Pagination click |
| **05** | Product Detail (PDP) | `frontend/tests/e2e/pdp.spec.js` | Variant selection (swatch click updating price/stock), Media gallery zoom, Pincode checker, Review submit form |
| **06** | Shopping Cart | `frontend/tests/e2e/cart.spec.js` | Add to cart, Cart drawer toggle, Item quantity stepper `[+]`/`[-]`, Coupon application, Remove item |
| **07** | Authentication | `frontend/tests/e2e/auth.spec.js` | Customer registration, Valid/invalid login, Cart merge execution post-login, Logout |
| **08** | Checkout & Order | `frontend/tests/e2e/checkout.spec.js` | Step 1-4 checkout flow, Shipping calculation update, Payment choice selection, Order creation & success receipt |
| **09** | Customer Account | `frontend/tests/e2e/account.spec.js` | Profile edit, Saved address add/edit/delete, Order history list, Order cancellation request |
| **10** | Wishlist | `frontend/tests/e2e/wishlist.spec.js` | Toggle wishlist heart icon, View wishlist page, Move item from wishlist to cart |
| **11** | Order Tracking | `frontend/tests/e2e/tracking.spec.js` | Submit tracking number, Verify shipment status timeline step rendering |

---

### 3.2 Automated Test Command & Validation Rule
- **Command**:
  ```bash
  cd frontend
  npm run test:e2e
  ```
- **Rule**: A module cannot be marked as **Completed** until all associated Playwright test scenarios pass with exit code `0`.
