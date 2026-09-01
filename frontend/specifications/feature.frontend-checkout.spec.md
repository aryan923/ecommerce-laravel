# Feature Specification: Frontend Checkout & Order Processing Module

**Module Name:** Frontend Checkout & Order Processing  
**Module ID:** 08 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-checkout.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 08), `frontend/Requirements/srs_pages.md` (§2.6)  

---

## 1. Module Overview

The **Checkout & Order Processing** module delivers a seamless multi-step checkout workflow for both guest and authenticated customers, payment gateway integration, and order confirmation receipt views across two dedicated routes:
1. **Checkout Route (`/checkout`)**: Multi-step checkout form comprising Customer Contact Info, Shipping Address selection/entry, Shipping Method selection, Payment Gateway selection, and real-time Financial Summary Sidebar.
2. **Order Confirmation Success Route (`/checkout/success/[order_number]`)**: Comprehensive order receipt screen displaying order number, estimated delivery date, shipping address summary, line items breakdown, financial totals, payment status badge, and "Continue Shopping" / "Track Order" CTA actions.

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                              Checkout Page (/checkout)                            |
+---------------------------------------------------+-------------------------------+
|  Checkout Form & Steps Column                     |  Order Summary Sidebar        |
|  - CheckoutSteps.jsx (Step Progress Bar)          |  - Item Thumbnails & Qty      |
|  - Step 1: Customer Contact Info (Email/Phone)    |  - Subtotal & Discount Line   |
|  - Step 2: SavedAddressSelector / Address Form    |  - Shipping Fee & Taxes       |
|  - Step 3: ShippingMethodRadio (Standard/Express) |  - Grand Total Price          |
|  - Step 4: PaymentGatewaySelector (COD/Card/UPI)  |  - "Place Order" CTA Button   |
+---------------------------------------------------+-------------------------------+

+-----------------------------------------------------------------------------------+
|               Order Confirmation Success Page (/checkout/success/[order_number])  |
+-----------------------------------------------------------------------------------+
|  OrderReceiptCard.jsx                                                             |
|  - Order Number & Placed Timestamp Badge                                          |
|  - Shipping & Delivery Address Breakdown                                          |
|  - Purchased Items Line Table                                                     |
|  - Payment Method & Financial Summary                                             |
|  - Action CTAs ("Track Shipment", "Continue Shopping")                            |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Calculate Shipping Endpoint (`POST /api/v1/shipping/calculate`)
**Request:**
```json
{
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country": "India"
}
```
**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "standard", "name": "Standard Shipping", "cost": 0, "estimated_days": "3-5 Business Days" },
    { "id": "express", "name": "Express Delivery", "cost": 150, "estimated_days": "1-2 Business Days" }
  ]
}
```

### 3.2 Calculate Tax Endpoint (`POST /api/v1/tax/calculate`)
**Request:** `{ "postal_code": "400001", "subtotal": 1200 }`  
**Response:** `{ "success": true, "data": { "tax_rate": 18, "tax_amount": 216 } }`

### 3.3 Payment Gateways Endpoint (`GET /api/v1/payments/methods`)
**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "cod", "name": "Cash on Delivery (COD)", "description": "Pay cash upon physical delivery." },
    { "id": "card", "name": "Credit / Debit Card", "description": "Visa, Mastercard, RuPay, Amex." },
    { "id": "upi", "name": "UPI / Instant Transfer", "description": "Google Pay, PhonePe, Paytm." }
  ]
}
```

### 3.4 Process Order Checkout Endpoint (`POST /api/v1/checkout/process`)
**Request:**
```json
{
  "customer_email": "customer@example.com",
  "customer_name": "Jane Doe",
  "customer_phone": "+91 9876543210",
  "shipping_address": {
    "address_line_1": "123 Marine Drive",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India"
  },
  "shipping_method_id": "standard",
  "payment_method_id": "cod",
  "notes": "Please deliver between 10am-5pm."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_number": "ORD-2026-88492",
    "status": "pending",
    "total_amount": 1416
  }
}
```

### 3.5 Fetch Order Receipt Endpoint (`GET /api/v1/orders/{order_number}`)
**Response:**
```json
{
  "success": true,
  "data": {
    "order_number": "ORD-2026-88492",
    "created_at": "2026-09-01T10:00:00Z",
    "status": "confirmed",
    "payment_status": "unpaid",
    "payment_method": "Cash on Delivery (COD)",
    "customer_name": "Jane Doe",
    "customer_email": "customer@example.com",
    "shipping_address": "123 Marine Drive, Mumbai, Maharashtra 400001",
    "subtotal": 1200,
    "shipping_fee": 0,
    "tax_amount": 216,
    "total_amount": 1416,
    "items": [
      { "id": 1, "product_name": "Wireless Noise-Canceling Headphones", "quantity": 1, "unit_price": 1200, "total_price": 1200 }
    ]
  }
}
```

---

## 4. UI/UX & Functional Requirements

### 4.1 Multi-Step Checkout Form (`/checkout`)
- **Step 1: Contact Information**: Email & Phone number inputs.
- **Step 2: Shipping Address**:
  - For Logged-in Customers: Radio selector of saved addresses + "Add New Address" modal button.
  - For Guests: Inline Address Line 1, Address Line 2, City, State, Postal Code, Country fields.
- **Step 3: Shipping Method Selection**: Radio group for Standard vs Express shipping with price tag.
- **Step 4: Payment Gateway Selection**: Radio group for COD, Card, UPI, Netbanking.
- **Summary Sidebar**: Real-time breakdown of line items, subtotal, discount, shipping, tax, grand total, and "Place Order" CTA.

### 4.2 Order Confirmation Receipt Page (`/checkout/success/[order_number]`)
- Displays celebratory success header with order badge.
- Renders detailed receipt card with order summary, delivery timeline, line items breakdown, and action buttons ("Continue Shopping" / "View Order History").

---

## 5. Test Suite & Validation Criteria

- **Unit & Integration Testing**:
  - Verify shipping fee and tax updates dynamically when postal code changes.
  - Verify form validation prevents proceeding to payment without valid address details.
- **E2E Playwright Specs (`frontend/tests/e2e/checkout.spec.js`)**:
  1. Test rendering `/checkout` route with step progress bar and order summary sidebar.
  2. Test filling contact info and shipping address fields.
  3. Test selecting shipping methods and payment gateways.
  4. Test order placement and redirection to `/checkout/success/[order_number]`.
  5. Test rendering `/checkout/success/[order_number]` order receipt details.
