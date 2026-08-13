# Feature Specification: Customer Order Management Module

**Module Name:** Order Management (Customer)  
**Module ID:** 18  
**Specification File:** `specifications/feature.customer-orders.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§27, §49, §54), `Requirements/admin_panel.md` (§12–§15), `Requirements/development_modules.md` (§Module 18)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Customer Order Management module enables authenticated customers to view their order history, inspect comprehensive order details, track real-time fulfillment timelines, and request order cancellations within allowable lifecycle states.

The module enforces strict order status transition rules (e.g. allowing cancellation only when order status is `pending_payment`, `paid`, or `confirmed`, and rejecting cancellation once packed or shipped). Upon cancellation of an eligible order, the module automatically releases reserved inventory via `InventoryService` and records immutable audit log events in `order_histories`.

All API endpoints strictly follow `ApiResponseTrait` standards, outputting JSON on `http://localhost:8002` with OpenAPI 3.0 annotations.

---

## 2. Business Flow

```text
  Customer Views Orders List
  (GET /api/v1/customer/orders)
              │
              ▼
  Customer Selects Order Details
  (GET /api/v1/customer/orders/{order_number})
              │
              ├──────────────────────────────────┐
              ▼                                  ▼
   View Live Shipment Tracking           Request Order Cancellation
   (GET /customer/orders/{num}/tracking) (POST /customer/orders/{num}/cancel)
              │                                  │
              ▼                                  ▼
   Fetch Courier & Timeline Logs        Validate Status Eligibility
                                        (pending_payment / paid / confirmed)
                                                 │
                                                 ├──────────────────────┐
                                                 ▼                      ▼
                                            Eligible                Ineligible
                                                 │                 (shipped/packed)
                                                 ▼                      ▼
                                         Release Inventory &      Return 422 Error
                                         Update Status 'cancelled'
```

### 2.1 Customer Order Listing Flow (`GET /api/v1/customer/orders`)
1. Authenticated customer calls `GET /api/v1/customer/orders` with optional query parameters (`status`, `search`, `page`, `per_page`).
2. System queries `orders` table scoped strictly to the authenticated `user_id`.
3. Eager-loads `items` and `payments`.
4. Returns paginated list of customer orders with item count, total price, status, payment method, and main image thumbnail.

### 2.2 Order Detail Flow (`GET /api/v1/customer/orders/{order_number}`)
1. Customer requests `GET /api/v1/customer/orders/{order_number}`.
2. System retrieves order where `order_number` matches and `user_id` equals authenticated customer (returns HTTP 404 if not found or unauthorized).
3. Eager-loads `items`, `payments`, `histories`, and associated `shipments`.
4. Returns full order representation including historical line item snapshots, address snapshots, pricing breakdown, payment status, and timeline logs.

### 2.3 Order Tracking Timeline Flow (`GET /api/v1/customer/orders/{order_number}/tracking`)
1. Customer calls `GET /api/v1/customer/orders/{order_number}/tracking`.
2. System fetches order, shipment details (`shipments`), and tracking events (`shipment_tracking`).
3. Computes progress step index (`1: Order Placed`, `2: Confirmed`, `3: Processing`, `4: Packed`, `5: Shipped`, `6: Out for Delivery`, `7: Delivered`).
4. Returns current step index, courier name, AWB/tracking number, estimated delivery date, and sequential tracking event logs.

### 2.4 Customer Order Cancellation Flow (`POST /api/v1/customer/orders/{order_number}/cancel`)
1. Customer submits `POST /api/v1/customer/orders/{order_number}/cancel` with payload `{"reason": "...", "comments": "..."}`.
2. System verifies cancellation eligibility based on SRS §54 rules:
   - `pending_payment` $\rightarrow$ **Allowed**.
   - `paid` / `confirmed` $\rightarrow$ **Allowed** (triggers inventory release and flags for refund).
   - `processing` $\rightarrow$ **Allowed** (if not yet packed).
   - `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled` $\rightarrow$ **Rejected** with HTTP 422 error.
3. Upon approval:
   - Executes inside `DB::transaction`.
   - Releases reserved stock via `InventoryService::releaseStock()`.
   - Updates `orders.status` to `cancelled`.
   - Records timeline event in `order_histories` ("Order cancelled by customer. Reason: {reason}").
4. Returns updated order details and cancellation confirmation.

---

## 3. Functional Requirements

- **FR-ORD-001**: System shall provide customer order listing API (`GET /api/v1/customer/orders`) with status filtering and pagination.
- **FR-ORD-002**: System shall restrict customer order queries strictly to orders owned by the authenticated `user_id`.
- **FR-ORD-003**: System shall provide order detail API (`GET /api/v1/customer/orders/{order_number}`) returning line item snapshots, payment info, addresses, and status history timeline.
- **FR-ORD-004**: System shall provide order tracking timeline API (`GET /api/v1/customer/orders/{order_number}/tracking`) returning fulfillment progress steps, courier name, and tracking numbers.
- **FR-ORD-005**: System shall provide order cancellation API (`POST /api/v1/customer/orders/{order_number}/cancel`).
- **FR-ORD-006**: System shall enforce order cancellation status rules: allowed for `pending_payment`, `paid`, `confirmed`, `processing`; forbidden for `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`.
- **FR-ORD-007**: System shall automatically release reserved stock using `InventoryService` when an order is cancelled by the customer.
- **FR-ORD-008**: System shall log order cancellation timeline event in `order_histories`.
- **FR-ORD-009**: Every endpoint must include OpenAPI 3.0 (`@OA`) documentation annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Authentication**: Sanctum Guard (`auth:sanctum`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

This module utilizes existing tables established in previous modules:
- `orders`: Scoped by `user_id`, `order_number`, `status`.
- `order_items`: Immutable item snapshots.
- `payments`: Associated payment status and transaction details.
- `order_histories`: Audit timeline (`order_id`, `user_id`, `status`, `comment`, `created_at`).
- `shipments` & `shipment_tracking`: Courier AWB, tracking number, and status logs.

---

## 6. API Endpoints Specification

### Protected Customer Order Endpoints (`auth:sanctum`)
- `GET /api/v1/customer/orders` — List customer orders (supports `status`, `search`, `page`, `per_page`).
- `GET /api/v1/customer/orders/{order_number}` — View customer order details and historical snapshots.
- `GET /api/v1/customer/orders/{order_number}/tracking` — Fetch live shipment tracking timeline.
- `POST /api/v1/customer/orders/{order_number}/cancel` — Cancel order and release stock.

---

## 7. Validation Rules & Form Requests

### 7.1 Form Request: `CancelOrderRequest`
- `reason`: `required|string|max:255` (e.g. `changed_mind`, `bought_elsewhere`, `delayed_shipping`, `other`)
- `comments`: `nullable|string|max:1000`

---

## 8. Edge Cases & Error Handling

- **Unauthorized Order Access**: Customer attempting to access or cancel another user's order returns HTTP 404 Not Found.
- **Cancellation of Shipped Order**: Returns HTTP 422 Unprocessable Entity ("Orders that are already packed or shipped cannot be cancelled.").
- **Cancellation of Already Cancelled Order**: Returns HTTP 422 Unprocessable Entity ("Order is already cancelled.").
- **Guest Order Tracking**: Guest orders can be fetched via order number + guest email verification if required.

---

## 9. Verification & Acceptance Criteria

1. `GET /api/v1/customer/orders` returns only orders belonging to authenticated user.
2. `GET /api/v1/customer/orders/{order_number}` returns full details, item snapshots, and history logs.
3. `GET /api/v1/customer/orders/{order_number}/tracking` displays accurate progress step index and courier tracking.
4. `POST /api/v1/customer/orders/{order_number}/cancel` successfully cancels eligible orders, releases stock, and logs history event.
5. Ineligible order cancellation attempts return HTTP 422 with clear error messages.
6. Swagger documentation updates cleanly via `php artisan l5-swagger:generate`.
