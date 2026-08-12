# Feature Specification: Shipping Module

**Module Name:** Shipping Module  
**Module ID:** 15  
**Specification File:** `specifications/feature.shipping.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§44–§48), `Requirements/admin_panel.md` (§25–§26), `Requirements/development_modules.md` (§Module 15)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Shipping Module provides a complete logistics, shipping rate calculation, and shipment tracking engine. It allows administrators to define geographic Shipping Zones (Local, State, National, Remote) by state and postal code matching; set up Shipping Methods (Standard, Express, Same Day, Store Pickup); and configure Shipping Rates using Flat Rate, Weight-Based, Order-Value-Based, and Free Shipping Threshold rules.

The core `ShippingService` evaluates available shipping methods and exact shipping fees for customer carts during checkout, while shipment management APIs handle AWB/tracking generation, courier assignment, status updates, tracking history logs, and provider abstraction (supporting manual dispatch and extensible provider drivers like Shiprocket/Delhivery).

---

## 2. Business Flow

### 2.1 Admin Shipping Setup Flow
1. Admin navigates to Shipping Zone Management (`POST /api/v1/admin/shipping-zones`).
2. Admin creates geographic zones (e.g. `Local MH`, `National India`, `Remote North-East`) with matching states/postal codes arrays.
3. Admin creates Shipping Methods (`POST /api/v1/admin/shipping-methods`) e.g. `Standard Delivery` (3-5 days), `Express Delivery` (1-2 days), `Store Pickup`.
4. Admin configures Shipping Rates (`POST /api/v1/admin/shipping-rates`) linking zone + method with rule type:
   - `flat_rate`: Fixed delivery fee (e.g. ₹50).
   - `weight_based`: Cost tiered by item weight (e.g. ₹40 per kg).
   - `order_value_based`: Tiered by subtotal (e.g. ₹100 fee for orders under ₹500).
   - `free_shipping`: Free delivery when cart subtotal $\ge$ `free_threshold` (e.g. ₹999).

### 2.2 Shipping Rate Calculation Engine Flow (Cart / Checkout)
1. Customer enters destination state code and postal code during cart/checkout calculation (`POST /api/v1/shipping/calculate`).
2. System matches destination location to the appropriate `ShippingZone`.
3. System fetches active `ShippingRates` for that zone and calculates rates for eligible methods based on cart total weight and order subtotal.
4. If a promo coupon grants free shipping, shipping fee is overridden to `0.00`.
5. System returns list of available shipping options with estimated delivery days and exact fees.

### 2.3 Shipment Creation & Tracking Flow
1. Admin creates a shipment record (`POST /api/v1/admin/shipments`) specifying `order_id`, `courier_name`, `awb_number`, and `tracking_number`.
2. Admin logs shipment tracking events (`POST /api/v1/admin/shipments/{id}/tracking`).
3. Customer fetches live tracking progress (`GET /api/v1/shipments/track/{tracking_number}`).

---

## 3. Functional Requirements

- **FR-SHP-001**: System shall support creating, updating, viewing, and deleting `shipping_zones` with state and postal code matching.
- **FR-SHP-002**: System shall support creating, updating, viewing, and deleting `shipping_methods` (`standard`, `express`, `same_day`, `pickup`).
- **FR-SHP-003**: System shall support 4 shipping rate calculation models: `flat_rate`, `weight_based`, `order_value_based`, and `free_shipping`.
- **FR-SHP-004**: System shall calculate available shipping options and cost via `POST /api/v1/shipping/calculate`.
- **FR-SHP-005**: System shall enforce weight limit (`weight_limit`) and order value bounds (`min_value`, `max_value`) for shipping methods and rates.
- **FR-SHP-006**: System shall allow creating and updating shipment records (`shipments`) with courier, AWB, tracking number, and dispatch status.
- **FR-SHP-007**: System shall log shipment tracking timeline events in `shipment_tracking` table.
- **FR-SHP-008**: System shall provide public tracking API (`GET /api/v1/shipments/track/{tracking_number}`).
- **FR-SHP-009**: System shall provide Admin CRUD and shipment management endpoints with Spatie permission checks (`manage-shipping`).
- **FR-SHP-010**: Every endpoint must be documented with OpenAPI 3.0 `@OA` annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Provider Abstraction**: `App\Services\Shipping\ShippingProviderInterface`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table: `shipping_zones`
Migration: `database/migrations/2026_08_11_000027_create_shipping_zones_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `name` | `string` | | Zone title (e.g. Local MH) |
| `countries` | `json` | Nullable | Array of country codes |
| `states` | `json` | Nullable | Array of state codes (e.g. `["MH"]`) |
| `postal_codes` | `json` | Nullable | Array of matching pin codes/patterns |
| `is_global` | `boolean` | Default `false` | Fallback zone flag |
| `status` | `enum` | `['active', 'inactive']`, Default `'active'` | Status |
| `timestamps` | `timestamps` | | Timestamps |

### 5.2 Table: `shipping_methods`
Migration: `database/migrations/2026_08_11_000028_create_shipping_methods_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `name` | `string` | | Method title (e.g. Standard Delivery) |
| `type` | `enum` | `['standard', 'express', 'same_day', 'pickup']` | Type classification |
| `estimated_days` | `string` | Nullable | Display estimated days (e.g. "3-5 business days") |
| `weight_limit` | `decimal(10,2)` | Nullable | Max allowed weight in kg |
| `status` | `enum` | `['active', 'inactive']`, Default `'active'` | Status |
| `timestamps` | `timestamps` | | Timestamps |

### 5.3 Table: `shipping_rates`
Migration: `database/migrations/2026_08_11_000029_create_shipping_rates_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `zone_id` | `foreignId` | FK -> `shipping_zones` | Associated zone |
| `method_id` | `foreignId` | FK -> `shipping_methods` | Associated method |
| `rate_type` | `enum` | `['flat_rate', 'weight_based', 'order_value_based', 'free_shipping']` | Charge rule model |
| `min_value` | `decimal(12,2)` | Default `0.00` | Min order/weight threshold |
| `max_value` | `decimal(12,2)` | Nullable | Max order/weight threshold |
| `rate_value` | `decimal(12,2)` | Default `0.00` | Calculated fee |
| `free_threshold` | `decimal(12,2)` | Nullable | Subtotal for free delivery |
| `status` | `enum` | `['active', 'inactive']`, Default `'active'` | Status |
| `timestamps` | `timestamps` | | Timestamps |

### 5.4 Table: `shipments` & `shipment_tracking`
Migration: `database/migrations/2026_08_11_000030_create_shipments_table.php`

- `shipments`: `id`, `order_id` (nullable FK), `provider` (default `'manual'`), `courier_name`, `awb_number`, `tracking_number`, `status` (`pending`, `label_created`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `cancelled`), `shipped_at`, `delivered_at`, `timestamps`.
- `shipment_tracking`: `id`, `shipment_id` (FK), `status`, `location`, `description`, `occurred_at`.

---

## 6. API Endpoints Specification

### 6.1 Public / Customer Endpoints
- `POST /api/v1/shipping/calculate` — Calculate available shipping options and cost for cart.
- `GET /api/v1/shipments/track/{tracking_number}` — Public shipment tracking timeline.

### 6.2 Admin Endpoints (`auth:sanctum`)
- `GET/POST/PUT/DELETE /api/v1/admin/shipping-zones` — Shipping Zone CRUD.
- `GET/POST/PUT/DELETE /api/v1/admin/shipping-methods` — Shipping Method CRUD.
- `GET/POST/PUT/DELETE /api/v1/admin/shipping-rates` — Shipping Rate CRUD.
- `GET/POST /api/v1/admin/shipments` — Shipment creation and listing.
- `GET/PUT /api/v1/admin/shipments/{id}` — Shipment update & status sync.
- `POST /api/v1/admin/shipments/{id}/tracking` — Add shipment tracking log event.

---

## 7. Verification & Acceptance Criteria

1. Database migrations migrate cleanly.
2. `ShippingService` zone matching (by state or postal code) verified.
3. Shipping rate calculation rules (`flat_rate`, `weight_based`, `order_value_based`, `free_shipping`) tested.
4. Shipment creation, AWB generation, and tracking log updates pass.
5. Swagger documentation regenerates via `php artisan l5-swagger:generate`.
