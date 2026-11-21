# Feature Specification: Frontend Public Order Tracking & Information Pages Module

**Module Name:** Frontend Public Order Tracking & Information Pages  
**Module ID:** 11 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-tracking.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 11), `frontend/Requirements/srs_pages.md` (§2.9)  

---

## 1. Module Overview

The **Public Order Tracking & Information Pages** module provides guest and authenticated shoppers with real-time visibility into shipment logistics without requiring login, alongside static informational pages necessary for e-commerce legal compliance, customer support, and brand trust.

The module encompasses six public routes:
1. **Public Order Tracking (`/track-order`)**: Interactive order search form allowing customers to look up live shipment status using a tracking number or order number. Renders a step-by-step shipment timeline, estimated delivery date, courier carrier details, activity logs, and item summary.
2. **About Us (`/about`)**: Brand story, mission, operational metrics, quality commitments, and team leadership showcase.
3. **Contact Us (`/contact`)**: Customer inquiry contact form (Name, Email, Phone, Subject, Message), contact details grid (Address, Support Phone, Email, Hours), and an interactive FAQ accordion.
4. **Shipping & Delivery Policy (`/shipping-policy`)**: Comprehensive policy detailing processing times, domestic/international rates, courier partners, customs rules, and delivery exception handlers.
5. **Terms of Service (`/terms`)**: Legal agreement covering account terms, intellectual property, pricing errors, limitation of liability, and governing law.
6. **Privacy Policy (`/privacy`)**: Data governance disclosure explaining personal data collection, cookies, third-party sharing, security measures, and user data rights.

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Public Order Tracking (/track-order)                  |
+-----------------------------------------------------------------------------------+
|  TrackingHeader                                                                   |
|  - Page Title ("Track Your Order") & Informative Subheading                      |
+-----------------------------------------------------------------------------------+
|  TrackingForm                                                                     |
|  - Input: Tracking Number / Order Number                                          |
|  - Input (Optional): Email / Phone for Guest Verification                         |
|  - Button: "Track Shipment" (with loading spinner state)                          |
+-----------------------------------------------------------------------------------+
|  TrackingResult Container (Rendered when valid tracking result loaded)           |
|  +-----------------------------------------------------------------------------+  |
|  |  ShipmentSummaryCard                                                        |  |
|  |  - Order #, Tracking #, Courier Partner, Current Status Badge, Est. Delivery  |  |
|  +-----------------------------------------------------------------------------+  |
|  |  TrackingStatusTimeline                                                     |  |
|  |  - Step 1: Order Placed (Done)                                            |  |
|  |  - Step 2: Order Processed & Packed (Done)                                |  |
|  |  - Step 3: In Transit / Shipped (Done)                                    |  |
|  |  - Step 4: Out for Delivery (Active / Pending)                            |  |
|  |  - Step 5: Delivered (Pending)                                            |  |
|  +-----------------------------------------------------------------------------+  |
|  |  ShipmentActivityLog                                                        |  |
|  |  - Timestamped chronological checkpoints (Location, Hub, Status update)    |  |
|  +-----------------------------------------------------------------------------+  |
|  |  TrackedItemsList                                                           |  |
|  |  - Product thumbnail, Title, Quantity, SKU                                  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
|                          Informational Pages Layout Wrapper                        |
+-----------------------------------------------------------------------------------+
|  /about: AboutClient.jsx (MetricsGrid, StorySection, ValuesGrid, TeamSection)    |
|  /contact: ContactClient.jsx (ContactForm, ContactInfoCards, FaqAccordion)        |
|  /shipping-policy: PolicyLayout.jsx (Table of Contents, PolicyContent)            |
|  /terms: PolicyLayout.jsx (TermsContent)                                          |
|  /privacy: PolicyLayout.jsx (PrivacyContent)                                      |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Tracking Search Endpoint (`GET /api/v1/shipments/track/{tracking_number}`)

- **Request URL**: `/api/v1/shipments/track/{tracking_number}`
- **Method**: `GET`
- **Query Parameters**: Optional `?email=customer@example.com`

#### Sample Success Response Payload (`200 OK`):
```json
{
  "success": true,
  "data": {
    "tracking_number": "TRK-9823471029",
    "order_number": "ORD-2026-8819",
    "status": "in_transit",
    "status_label": "In Transit",
    "courier_name": "FedEx Express",
    "carrier_tracking_url": "https://www.fedex.com/fedextrack/?trknbr=TRK-9823471029",
    "estimated_delivery": "2026-09-18T18:00:00Z",
    "shipped_at": "2026-09-14T09:15:00Z",
    "delivered_at": null,
    "origin": "Dallas Fulfillment Center, TX",
    "destination": "Seattle, WA 98101",
    "timeline_steps": [
      {
        "key": "placed",
        "label": "Order Placed",
        "completed": true,
        "timestamp": "2026-09-13T14:30:00Z"
      },
      {
        "key": "processed",
        "label": "Processed & Packed",
        "completed": true,
        "timestamp": "2026-09-13T18:45:00Z"
      },
      {
        "key": "shipped",
        "label": "Shipped",
        "completed": true,
        "timestamp": "2026-09-14T09:15:00Z"
      },
      {
        "key": "out_for_delivery",
        "label": "Out for Delivery",
        "completed": false,
        "timestamp": null
      },
      {
        "key": "delivered",
        "label": "Delivered",
        "completed": false,
        "timestamp": null
      }
    ],
    "activity_log": [
      {
        "timestamp": "2026-09-15T04:20:00Z",
        "location": "Regional Sorting Hub - Boise, ID",
        "status": "In Transit",
        "description": "Package arrived at regional sorting facility."
      },
      {
        "timestamp": "2026-09-14T09:15:00Z",
        "location": "Dallas Distribution Center, TX",
        "status": "Departed Facility",
        "description": "Shipment handed over to courier driver."
      }
    ],
    "items": [
      {
        "product_id": 14,
        "title": "Italian Leather Bifold Wallet",
        "sku": "WLT-LEA-COG",
        "quantity": 1,
        "image_url": "https://example.com/images/wallet.jpg"
      }
    ]
  }
}
```

#### Sample Not Found Response Payload (`404 Not Found`):
```json
{
  "success": false,
  "message": "No shipment found matching tracking number 'TRK-0000000'."
}
```

---

### 3.2 Contact Form Submission Endpoint (`POST /api/v1/contact`)

- **Request URL**: `/api/v1/contact`
- **Method**: `POST`
- **Request Payload**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 (555) 234-5678",
  "subject": "Order Delivery Inquiry",
  "message": "I would like to update my shipping address for order ORD-2026-8819."
}
```

#### Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Thank you for contacting us! Your inquiry (Ticket #TKT-44102) has been received. Our support team will reply within 24 hours."
}
```

---

## 4. Detailed Component Specifications

### 4.1 TrackingForm (`frontend/src/components/tracking/TrackingForm.jsx`)
- **Inputs**:
  - `tracking_number`: Required text input, auto-trimmed. Accepts tracking code (e.g. `TRK-9823471029`) or order ID (e.g. `ORD-2026-8819`).
  - `email`: Optional email address input for added verification security.
- **Validation**:
  - Requires non-empty input before submit. Shows inline error if blank upon submission.
- **Actions**:
  - Triggers submit handler, calls API, updates URL search query string (`/track-order?tracking_number=...`), displays skeleton loader while fetching.

### 4.2 TrackingStatusTimeline (`frontend/src/components/tracking/TrackingStatusTimeline.jsx`)
- **Properties**: `timeline_steps` array.
- **Behavior**:
  - Displays a horizontal step tracker on desktop and vertical timeline on mobile.
  - Finished steps feature checkmark icons in brand green/primary color.
  - Active step features pulsing highlight.
  - Future pending steps render in muted gray.

### 4.3 ContactForm & FaqAccordion (`frontend/src/components/contact/`)
- **ContactForm**: Full validation (email format, minimum 10 char message). Shows success alert box on submission.
- **FaqAccordion**: Interactive collapsible accordion component with search filter for quick resolution of common shipping/return questions.

---

## 5. Non-Functional Requirements & SEO

1. **SEO Meta Tags**: Dynamic title tags (`Track Order | Storefront`, `About Us | Storefront`, `Contact Us | Storefront`, etc.) and structured JSON-LD schema for Organization and Support Contact.
2. **Accessibility**: All form inputs bound to explicit `<label>` elements; keyboard navigable FAQ accordion items with `aria-expanded` attributes.
3. **Responsive Design**: Fluid grid adapting seamlessly across mobile (320px+), tablet (768px+), and desktop (1200px+).
