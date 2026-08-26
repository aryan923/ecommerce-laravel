# E-Commerce Next.js Storefront — Functional Page Specifications & API Bindings

**Project:** Next.js Storefront  
**Backend:** Laravel REST API (`/api/v1/`)  
**Reference Document:** `Requirements/development_modules.md`  

---

## 1. Global Architecture & API Interceptor Specification

### 1.1 API Client (`frontend/src/lib/api-client.js`)
All communication with the Laravel backend MUST pass through a centralized Axios instance.

```javascript
// Base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token & Guest Session ID
apiClient.interceptors.request.use((config) => {
  // Attach Sanctum Bearer Token if available
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach X-Session-ID for persistent guest cart
  const sessionId = getOrCreateGuestSessionId();
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }

  return config;
});
```

---

## 2. Page-by-Page Specifications & Endpoint Bindings

### 2.1 Home Page (`/`)
- **Route File**: `frontend/src/app/page.js`
- **Render Mode**: Server Component with Client Component sub-sections for carousels.
- **Attached Endpoints**:
  1. `GET /api/v1/categories` -> Top categories grid with image thumbnails.
  2. `GET /api/v1/brands` -> Featured brand logos.
  3. `GET /api/v1/products?featured=1&limit=8` -> Featured products section.
  4. `GET /api/v1/products?sort=latest&limit=8` -> New arrivals section.
- **UI Components**:
  - `HeroBanner`: Visual carousel with promotional banners & CTA links.
  - `CategoryGrid`: 4-column card layout displaying category thumbnails and product counts.
  - `ProductSection`: Section title, tab filters (Featured, Best Sellers, New Arrivals), and responsive grid of `ProductCard`.
  - `BrandCarousel`: Infinite scroll or standard carousel of brand logos.
  - `NewsletterForm`: Email subscription form.

---

### 2.2 Product Catalog Page (`/products`) & Category/Brand Listing (`/category/[slug]`, `/brand/[slug]`)
- **Route Files**:
  - `frontend/src/app/products/page.js`
  - `frontend/src/app/category/[slug]/page.js`
  - `frontend/src/app/brand/[slug]/page.js`
- **Render Mode**: Server Component with dynamic route parameters & client-side filter state.
- **Attached Endpoints**:
  1. `GET /api/v1/products`
     - **Query Parameters**: `category`, `brand`, `attribute`, `price_min`, `price_max`, `sort`, `search`, `page`, `per_page`
     - **Sample Request**: `GET /api/v1/products?category=electronics&price_min=100&price_max=5000&sort=price_low_high&page=1`
  2. `GET /api/v1/categories/{slug}` -> Category banner, title, description, parent/child categories.
  3. `GET /api/v1/brands/{slug}` -> Brand header image & description.
  4. `GET /api/v1/attributes` -> Faceted filter panel options (e.g. Size: S/M/L, Color: Red/Blue).
- **UI Components**:
  - `Breadcrumbs`: Category path navigation (`Home > Electronics > Headphones`).
  - `FilterSidebar`: Mobile-responsive drawer / desktop sidebar with price range slider, category tree selector, brand checkboxes, attribute swatches.
  - `CatalogHeader`: Title, total products counter, view toggle (Grid / List), sorting dropdown.
  - `ProductGrid`: 3 or 4 column grid of `ProductCard`.
  - `Pagination`: Page numbers & Previous/Next navigation.

---

### 2.3 Product Detail Page (PDP) (`/products/[slug]`)
- **Route File**: `frontend/src/app/products/[slug]/page.js`
- **Render Mode**: Server Component with Client Components for gallery, variant selection, and pincode checker.
- **Attached Endpoints**:
  1. `GET /api/v1/products/{slug}` -> Full product payload including variants, attributes, images, stock, SKU, price, discount.
  2. `GET /api/v1/products/{product_id}/reviews` -> Customer review list & rating distribution stats (1 to 5 stars).
  3. `POST /api/v1/shipping/calculate` -> Check delivery serviceability for entered pincode.
  4. `POST /api/v1/customer/reviews` -> (Auth Required) Submit product rating and review comment.
  5. `POST /api/v1/wishlist` & `DELETE /api/v1/wishlist/{id}` -> Add/remove from wishlist.
- **UI Components**:
  - `MediaGallery`: Main image viewer, thumbnail selector, image zoom modal.
  - `ProductInfo`: Brand title, product name, rating star summary, pricing (Regular price, Sale price, Discount % badge).
  - `VariantSelector`: Interactive attribute buttons/swatches (e.g. Size, Color). Updates price, SKU, and stock dynamically based on selected variant.
  - `StockIndicator`: Displays "In Stock", "Low Stock (x items left)", or disabled "Out of Stock" button.
  - `PincodeChecker`: Pincode input field with "Check Serviceability" button. Renders estimated delivery date and available shipping methods.
  - `AddToCartSection`: Quantity stepper, "Add to Cart" button (adds to cart & opens drawer), "Buy Now" button (adds to cart & redirects to checkout).
  - `ProductTabs`: Tabs for Description, Specifications Table, Shipping & Returns Policy, and Customer Reviews.
  - `ReviewList.jsx` & `AddReviewModal.jsx`: Displays review distribution stats, verified buyer reviews, and review submission form.
  - `RelatedProducts.jsx`: Carousel of related products from the same category.

---

### 2.4 Shopping Cart Page (`/cart`) & Cart Drawer
- **Route File**: `frontend/src/app/cart/page.js`
- **Component File**: `frontend/src/components/cart/CartDrawer.jsx`
- **Attached Endpoints**:
  1. `GET /api/v1/cart` -> Fetches cart items, items count, subtotal, applied coupon, discount amount, tax estimate, total.
  2. `POST /api/v1/cart/items` -> Payload: `{ variant_id: 12, quantity: 1 }`
  3. `PUT /api/v1/cart/items/{id}` -> Payload: `{ quantity: 2 }`
  4. `DELETE /api/v1/cart/items/{id}` -> Remove single item.
  5. `DELETE /api/v1/cart` -> Clear all cart items.
  6. `POST /api/v1/cart/apply-coupon` -> Payload: `{ code: "SAVE20" }`
  7. `DELETE /api/v1/cart/remove-coupon` -> Remove applied coupon.
- **UI Components**:
  - `CartItemList`: Table/list of cart items with thumbnail, product title, variant details, price, quantity controls, delete button.
  - `CouponSection`: Coupon code input, Apply button, applied coupon badge with remove button.
  - `SummaryCard`: Breakdown of Subtotal, Discount, Estimated Shipping, Estimated Tax, Final Total, "Proceed to Checkout" CTA button.

---

### 2.5 Customer Authentication (`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`)
- **Route Files**:
  - `frontend/src/app/auth/login/page.js`
  - `frontend/src/app/auth/register/page.js`
  - `frontend/src/app/auth/forgot-password/page.js`
  - `frontend/src/app/auth/reset-password/page.js`
- **Attached Endpoints**:
  1. `POST /api/v1/auth/login` -> Request: `{ email, password }`. Response: `{ token, user }`.
  2. `POST /api/v1/auth/register` -> Request: `{ first_name, last_name, email, phone, password, password_confirmation }`.
  3. `POST /api/v1/auth/forgot-password` -> Request: `{ email }`.
  4. `POST /api/v1/auth/reset-password` -> Request: `{ token, email, password, password_confirmation }`.
  5. `POST /api/v1/cart/merge` -> Automated payload sent immediately upon login to merge guest cart into customer account cart.

---

### 2.6 Checkout (`/checkout`) & Order Confirmation (`/checkout/success/[order_number]`)
- **Route Files**:
  - `frontend/src/app/checkout/page.js`
  - `frontend/src/app/checkout/success/[order_number]/page.js`
- **Attached Endpoints**:
  1. `POST /api/v1/shipping/calculate` -> Input shipping address details -> Returns shipping options & costs.
  2. `POST /api/v1/tax/calculate` -> Returns tax breakdown based on shipping address.
  3. `GET /api/v1/payments/methods` -> Returns active payment gateways (`cod`, `razorpay`, `stripe`, `bank_transfer`).
  4. `POST /api/v1/checkout/process` -> Creates order in database.
  5. `POST /api/v1/payments/initiate` & `POST /api/v1/payments/verify` -> Handles online payment authorization & verification.
  6. `GET /api/v1/orders/{order_number}` -> Fetches confirmed order details for success screen.
- **UI Components**:
  - `CheckoutForm`:
    - Step 1: Customer Contact Email/Phone (Guest or Auth).
    - Step 2: Shipping Address Form (Saved address selector for logged-in users + inline address form).
    - Step 3: Shipping Method Radio Group (Standard Shipping, Express Shipping).
    - Step 4: Payment Gateway Radio Group (Cash on Delivery, Credit/Debit Card, UPI).
  - `OrderSummarySidebar`: Cart items thumbnail preview, subtotal, shipping fee, tax, coupon discount, grand total.
  - `OrderSuccessCard`: Order confirmation receipt displaying Order ID, tracking details, delivery address summary, items ordered, and "Continue Shopping" CTA.

---

### 2.7 Customer Account Portal (`/account/*`)
- **Route Files**:
  - `/account/page.js` (Account Overview)
  - `/account/profile/page.js` (Profile & Password Settings)
  - `/account/addresses/page.js` (Saved Shipping & Billing Addresses)
  - `/account/orders/page.js` (Order History List)
  - `/account/orders/[order_number]/page.js` (Order Invoice & Detail)
  - `/account/returns/page.js` & `/account/returns/new/page.js` (Returns Management)
  - `/account/bank-accounts/page.js` (Bank Account Management for Refunds)
  - `/account/notifications/page.js` (Customer Notifications)
- **Attached Endpoints**:
  1. `GET /api/v1/customer/profile` & `PUT /api/v1/customer/profile`
  2. `POST /api/v1/customer/change-password`
  3. `GET/POST/PUT/DELETE /api/v1/customer/addresses`
  4. `GET /api/v1/customer/orders` & `GET /api/v1/customer/orders/{order_number}`
  5. `POST /api/v1/customer/orders/{order_number}/cancel`
  6. `GET/POST /api/v1/customer/returns`
  7. `GET/POST/DELETE /api/v1/customer/bank-accounts`
  8. `GET /api/v1/customer/notifications`

---

### 2.8 Wishlist Page (`/wishlist`)
- **Route File**: `frontend/src/app/wishlist/page.js`
- **Attached Endpoints**:
  1. `GET /api/v1/wishlist`
  2. `POST /api/v1/wishlist`
  3. `DELETE /api/v1/wishlist/{id}`
  4. `POST /api/v1/wishlist/{id}/move-to-cart`
- **UI Components**:
  - `WishlistGrid`: Grid of saved items with price, stock status, "Move to Cart" button, and "Remove" icon.

---

### 2.9 Public Shipment Tracking (`/track-order`)
- **Route File**: `frontend/src/app/track-order/page.js`
- **Attached Endpoint**:
  1. `GET /api/v1/shipments/track/{tracking_number}`
- **UI Components**:
  - `TrackingForm`: Input field for Tracking Number or Order Number.
  - `TrackingStatusTimeline`: Step-by-step visual tracker showing status history (Order Placed -> Order Dispatched -> In Transit -> Out for Delivery -> Delivered).

---

### 2.10 Product Compare Page (`/compare`)
- **Route File**: `frontend/src/app/compare/page.js`
- **Attached Endpoint**:
  1. `GET /api/v1/products` (Fetches full product details for compared product IDs)
- **UI Components**:
  - `CompareHeader`: Title, clear all button, and share comparison link.
  - `CompareTable`: Responsive matrix grid comparing images, pricing, ratings, brand, variant specs, and stock availability side-by-side.

---

### 2.11 OTP Verification Page (`/auth/verify-otp`)
- **Route File**: `frontend/src/app/auth/verify-otp/page.js`
- **UI Components**:
  - `OtpForm`: 6-digit passcode input with auto-focus, countdown timer, and "Resend OTP" button.

---

---

## 3. Page Testing & E2E Validation Strategy

### 3.1 Playwright E2E Integration Setup
- **Config**: [`frontend/playwright.config.js`](file:///d:/Projects/ecommerce_laravel/frontend/playwright.config.js)
- **Browser**: Chromium (`Desktop Chrome`)
- **Server Startup**: `webServer` automatically boots `npm run dev` at `http://localhost:3000`.

### 3.2 Page Verification Requirements
Every page implementation must be verified with an automated Playwright spec validating:
1. **Successful Render**: HTTP `200` status and visible key elements.
2. **API Data Binding**: Mocked or live API response rendering in UI components.
3. **User Interaction**: Button clicks, form inputs, modal toggles, and route transitions.
4. **Error & Loading States**: Skeleton loaders during API fetch and error toast display on API failure.
