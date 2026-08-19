# Feature Specification: Admin Shipping Management Module

**Module Name:** Admin Shipping Management  
**Module ID:** 30  
**Specification File:** `specifications/feature.admin-shipping.spec.md`  
**Version:** 1.0  
**Status:** Approved Specification  
**SRS References:** `Requirements/srs_apis.md` (§Module 15 / §Shipping), `Requirements/admin_panel.md` (§25–§26), `Requirements/development_modules.md` (§Module 30)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permissions / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Admin Shipping Management module provides store administrators with comprehensive control over store fulfillment operations, geographical shipping zones, delivery methods, rate calculation rules, order shipment creation, courier AWB tracking assignments, and label printing workflows.

It enables admins to:
1. Define **Geographical Shipping Zones** based on countries, states/provinces, cities, and specific postal/ZIP codes.
2. Configure **Shipping Methods** (Standard Delivery, Express Courier, Same-Day Rush, Local Pickup) with custom delivery timeframes and status toggles.
3. Establish **Flexible Rate Calculation Engines** including Flat Rates, Weight-Based Tier Brackets, Order-Value Tier Brackets, and Free Shipping thresholds.
4. Manage **Order Fulfillment & Shipment Dispatch**, enabling partial item shipments, courier carrier assignments, tracking number (AWB) generation, shipping label/packing slip printing, and real-time shipment status updates (`pending_pickup`, `shipped`, `in_transit`, `out_for_delivery`, `delivered`, `failed_delivery`, `returned_to_origin`).

All administrative API endpoints strictly conform to standardized JSON formatting using `App\Traits\ApiResponseTrait` on `http://localhost:8002`, are guarded by Sanctum authentication and Spatie RBAC permission middleware (`permission:shipping.view`, `permission:shipping.create`, `permission:shipping.update`, `permission:shipping.delete`, `permission:shipments.manage`), and include complete OpenAPI 3.0 `@OA` docblocks for automated API documentation.

---

## 2. Business Flow & Use Cases

### 2.1 Shipping Zone Management Flow
1. Administrator views list of configured shipping zones (`GET /api/v1/admin/shipping/zones`).
2. Admin creates a new shipping zone (`POST /api/v1/admin/shipping/zones`):
   - Configures zone `name`, `description`, `is_active` status, and `sort_order`.
   - Assigns geographical boundaries (`locations`): list of `country_code` (ISO-2), `state_code`, `city`, and `postal_code_pattern` (wildcards/regex like `100*`, `90210-90215`).
3. Admin edits zone rules or toggles active status (`PUT /api/v1/admin/shipping/zones/{id}`).
4. System validates that location assignments do not create overlapping ambiguity unless explicitly prioritized by zone `sort_order`.

### 2.2 Shipping Method & Rate Configuration Flow
1. Admin selects a Shipping Zone to manage its assigned delivery methods (`GET /api/v1/admin/shipping/zones/{id}/methods`).
2. Admin adds a Shipping Method (`POST /api/v1/admin/shipping/methods`):
   - **Method Metadata**: `zone_id`, `name` (e.g., "Express Air Delivery"), `code` (`EXPRESS_AIR`), `carrier_name` (e.g., "FedEx"), `estimated_days_min`, `estimated_days_max`, `is_active`.
   - **Rate Calculation Type**: `flat_rate`, `weight_based`, `order_value_based`, `free_shipping`.
   - **Rate Rules**:
     - *Flat Rate*: `base_cost` amount.
     - *Weight-Based Brackets*: List of min/max weight tiers in kg with corresponding costs (`min_weight`, `max_weight`, `cost`, `per_extra_kg_cost`).
     - *Order-Value Brackets*: List of cart total monetary tiers (`min_order_amount`, `max_order_amount`, `cost`).
     - *Free Shipping Threshold*: `min_order_amount` required to make shipping $0.00.
     - *Handling Fee*: Optional fixed surcharge (`handling_fee`).
3. Admin updates method rates or toggles availability (`PUT /api/v1/admin/shipping/methods/{id}`).

### 2.3 Order Shipment & AWB Dispatch Flow
1. Admin views orders pending fulfillment (`GET /api/v1/admin/shipments` or `GET /api/v1/admin/orders?status=processing`).
2. Admin initiates shipment creation for an order (`POST /api/v1/admin/shipments`):
   - Selects items and quantities to include in this shipment (supports split/partial shipments).
   - Selects courier partner (`carrier_name`, e.g., "DHL Express").
   - Inputs or generates AWB tracking number (`tracking_number`, `tracking_url`).
   - Assigns package dimensions and weight (`weight_kg`, `dimensions_cm`).
   - Specifies shipping notes or special handling instructions.
3. System creates the `Shipment` record, updates order fulfillment status (`partially_shipped` or `shipped`), and fires notification triggers to the customer.
4. Admin prints Packing Slip / Shipping Label (`GET /api/v1/admin/shipments/{id}/label`).
5. Admin updates shipment delivery status (`PATCH /api/v1/admin/shipments/{id}/status`):
   - Status options: `pending_pickup`, `shipped`, `in_transit`, `out_for_delivery`, `delivered`, `failed_delivery`, `returned_to_origin`.
   - Adding tracking timeline entries (`location`, `status_message`, `timestamp`).

---

## 3. Data Architecture & Database Schema

### 3.1 `shipping_zones` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Unique zone identifier |
| `name` | `varchar(150)` | NOT NULL | Zone display name (e.g. "Domestic Tier-1", "North America") |
| `description` | `text` | NULLable | Zone scope overview |
| `is_active` | `boolean` | DEFAULT `true` | Zone operational toggle |
| `sort_order` | `integer` | DEFAULT `0` | Evaluation priority order |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Last update timestamp |

### 3.2 `shipping_zone_locations` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Location identifier |
| `shipping_zone_id` | `bigint` | Foreign Key → `shipping_zones.id` (ON DELETE CASCADE) | Parent zone |
| `country_code` | `varchar(2)` | NOT NULL, Index | ISO 2-letter country code (e.g. "US", "IN") |
| `state_code` | `varchar(50)` | NULLable, Index | State/province code |
| `city` | `varchar(100)` | NULLable | City name filter |
| `postal_code_pattern` | `varchar(50)` | NULLable | Wildcard/range (e.g. "100*", "90210") |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Last update timestamp |

### 3.3 `shipping_methods` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Unique method identifier |
| `shipping_zone_id` | `bigint` | Foreign Key → `shipping_zones.id` (ON DELETE CASCADE) | Target zone |
| `name` | `varchar(150)` | NOT NULL | Method title (e.g., "Standard Express") |
| `code` | `varchar(50)` | NOT NULL, Index | Unique method code |
| `carrier_name` | `varchar(100)` | NULLable | Default courier carrier (e.g., "FedEx") |
| `calculation_type` | `enum` | `'flat_rate'`, `'weight_based'`, `'order_value_based'`, `'free_shipping'` | Pricing calculation model |
| `base_cost` | `decimal(10,2)` | DEFAULT `0.00` | Flat rate or base fee |
| `handling_fee` | `decimal(10,2)` | DEFAULT `0.00` | Additional handling surcharge |
| `min_free_shipping_amount` | `decimal(10,2)` | NULLable | Minimum order threshold for free shipping |
| `estimated_days_min` | `integer` | DEFAULT `1` | Minimum delivery window (days) |
| `estimated_days_max` | `integer` | DEFAULT `7` | Maximum delivery window (days) |
| `is_active` | `boolean` | DEFAULT `true` | Method active status |
| `sort_order` | `integer` | DEFAULT `0` | Sorting display index |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Last update timestamp |

### 3.4 `shipping_rates` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Rate tier identifier |
| `shipping_method_id` | `bigint` | Foreign Key → `shipping_methods.id` (ON DELETE CASCADE) | Parent method |
| `min_value` | `decimal(10,2)` | DEFAULT `0.00` | Tier lower bound (kg or currency) |
| `max_value` | `decimal(10,2)` | NULLable | Tier upper bound (kg or currency, NULL = infinity) |
| `cost` | `decimal(10,2)` | NOT NULL | Rate cost for this tier |
| `per_extra_unit_cost` | `decimal(10,2)` | DEFAULT `0.00` | Surcharge per additional unit above tier |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Last update timestamp |

### 3.5 `shipments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Unique shipment identifier |
| `order_id` | `bigint` | Foreign Key → `orders.id` (ON DELETE CASCADE) | Associated customer order |
| `shipment_number` | `varchar(50)` | UNIQUE, NOT NULL | Shipment code (e.g. `SHP-2026-89412`) |
| `carrier_name` | `varchar(100)` | NOT NULL | Courier carrier name |
| `tracking_number` | `varchar(100)` | NULLable, Index | Courier AWB / tracking number |
| `tracking_url` | `varchar(255)` | NULLable | External tracking link |
| `status` | `enum` | `'pending_pickup'`, `'shipped'`, `'in_transit'`, `'out_for_delivery'`, `'delivered'`, `'failed_delivery'`, `'returned_to_origin'` | Current delivery status |
| `shipped_at` | `timestamp` | NULLable | Dispatch timestamp |
| `delivered_at` | `timestamp` | NULLable | Delivery completion timestamp |
| `notes` | `text` | NULLable | Internal dispatch notes |
| `created_at` | `timestamp` | NULLable | Creation timestamp |
| `updated_at` | `timestamp` | NULLable | Last update timestamp |

### 3.6 `shipment_items` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigint` | Primary Key, Auto Increment | Shipment item identifier |
| `shipment_id` | `bigint` | Foreign Key → `shipments.id` (ON DELETE CASCADE) | Parent shipment |
| `order_item_id` | `bigint` | Foreign Key → `order_items.id` (ON DELETE CASCADE) | Targeted order item |
| `quantity` | `integer` | NOT NULL | Shipped item count |
| `created_at` | `timestamp` | NULLable | Creation timestamp |

---

## 4. API Endpoints Specification

All endpoints run on `http://localhost:8002`, require `Bearer <sanctum_token>` authentication, and enforce Spatie permissions.

### 4.1 Shipping Zones APIs

#### `GET /api/v1/admin/shipping/zones`
- **Permission:** `shipping.view`
- **Description:** Fetch paginated list of shipping zones with locations and methods summary.
- **Parameters:** `search`, `is_active`, `sort_by`, `sort_order`, `per_page`.
- **Response:** 200 OK with zones data payload.

#### `POST /api/v1/admin/shipping/zones`
- **Permission:** `shipping.create`
- **Description:** Create a new shipping zone with assigned location constraints.
- **Payload:**
```json
{
  "name": "Domestic Metro Zone",
  "description": "Metropolitan cities fast fulfillment",
  "is_active": true,
  "sort_order": 1,
  "locations": [
    { "country_code": "US", "state_code": "NY", "city": "New York", "postal_code_pattern": "100*" },
    { "country_code": "US", "state_code": "CA", "city": "Los Angeles", "postal_code_pattern": "900*" }
  ]
}
```
- **Response:** 201 Created with zone payload.

#### `PUT /api/v1/admin/shipping/zones/{id}`
- **Permission:** `shipping.update`
- **Description:** Update existing shipping zone details and locations.
- **Response:** 200 OK with updated zone payload.

#### `DELETE /api/v1/admin/shipping/zones/{id}`
- **Permission:** `shipping.delete`
- **Description:** Archive/Delete shipping zone (only if no active pending orders depend solely on it).
- **Response:** 200 OK with success notification.

---

### 4.2 Shipping Methods & Rates APIs

#### `GET /api/v1/admin/shipping/methods`
- **Permission:** `shipping.view`
- **Description:** Fetch shipping methods list with optional zone filtering.
- **Parameters:** `zone_id`, `calculation_type`, `is_active`, `per_page`.
- **Response:** 200 OK with methods list.

#### `POST /api/v1/admin/shipping/methods`
- **Permission:** `shipping.create`
- **Description:** Create a shipping method with rate calculation rules.
- **Payload:**
```json
{
  "shipping_zone_id": 1,
  "name": "Express Priority Flight",
  "code": "EXPRESS_PRIORITY",
  "carrier_name": "FedEx",
  "calculation_type": "weight_based",
  "base_cost": 15.00,
  "handling_fee": 2.50,
  "min_free_shipping_amount": 250.00,
  "estimated_days_min": 1,
  "estimated_days_max": 2,
  "is_active": true,
  "rates": [
    { "min_value": 0.00, "max_value": 5.00, "cost": 15.00, "per_extra_unit_cost": 0.00 },
    { "min_value": 5.01, "max_value": 15.00, "cost": 30.00, "per_extra_unit_cost": 2.00 }
  ]
}
```
- **Response:** 201 Created.

#### `PUT /api/v1/admin/shipping/methods/{id}`
- **Permission:** `shipping.update`
- **Description:** Update method attributes, calculation rules, and rate tiers.
- **Response:** 200 OK.

#### `PATCH /api/v1/admin/shipping/methods/{id}/status`
- **Permission:** `shipping.update`
- **Description:** Quick toggle method active status (`is_active: true/false`).
- **Response:** 200 OK.

---

### 4.3 Shipment Dispatch & Tracking APIs

#### `GET /api/v1/admin/shipments`
- **Permission:** `shipments.manage`
- **Description:** List all order shipments with search, status filters, and courier tracking details.
- **Parameters:** `search`, `status`, `carrier_name`, `date_from`, `date_to`, `per_page`.
- **Response:** 200 OK with paginated shipments.

#### `POST /api/v1/admin/shipments`
- **Permission:** `shipments.manage`
- **Description:** Dispatch items and create a shipment for an order.
- **Payload:**
```json
{
  "order_id": 105,
  "carrier_name": "DHL Express",
  "tracking_number": "AWB-9988221144",
  "tracking_url": "https://www.dhl.com/track?trackingNumber=AWB-9988221144",
  "notes": "Packed in fragile box with bubble wrap.",
  "items": [
    { "order_item_id": 201, "quantity": 1 },
    { "order_item_id": 202, "quantity": 2 }
  ]
}
```
- **Response:** 201 Created with shipment object.

#### `PATCH /api/v1/admin/shipments/{id}/status`
- **Permission:** `shipments.manage`
- **Description:** Update shipment delivery status.
- **Payload:**
```json
{
  "status": "out_for_delivery",
  "location": "Central Distribution Hub, NY",
  "notes": "Out for delivery with courier agent John."
}
```
- **Response:** 200 OK.

#### `GET /api/v1/admin/shipments/{id}/label`
- **Permission:** `shipments.manage`
- **Description:** Retrieve HTML/PDF printable shipping label & packing slip for the package.
- **Response:** 200 OK (HTML/JSON label payload).

---

## 5. Validation Rules (`StoreShippingZoneRequest`, `StoreShippingMethodRequest`, `CreateShipmentRequest`)

1. **`StoreShippingZoneRequest`**:
   - `name`: `required|string|max:150`
   - `locations`: `required|array|min:1`
   - `locations.*.country_code`: `required|string|size:2`
   - `locations.*.postal_code_pattern`: `nullable|string|max:50`

2. **`StoreShippingMethodRequest`**:
   - `shipping_zone_id`: `required|exists:shipping_zones,id`
   - `name`: `required|string|max:150`
   - `code`: `required|string|max:50|alpha_dash`
   - `calculation_type`: `required|in:flat_rate,weight_based,order_value_based,free_shipping`
   - `base_cost`: `required|numeric|min:0`
   - `rates`: `nullable|array`
   - `rates.*.min_value`: `required_with:rates|numeric|min:0`
   - `rates.*.cost`: `required_with:rates|numeric|min:0`

3. **`CreateShipmentRequest`**:
   - `order_id`: `required|exists:orders,id`
   - `carrier_name`: `required|string|max:100`
   - `tracking_number`: `nullable|string|max:100`
   - `items`: `required|array|min:1`
   - `items.*.order_item_id`: `required|exists:order_items,id`
   - `items.*.quantity`: `required|integer|min:1`

---

## 6. Non-Functional & Operational Requirements

1. **Zero API Overwrite Policy**: Preserves pre-existing storefront `ShippingService` logic used during checkout calculation while providing admin configuration capabilities.
2. **Audit Trail**: All zone modifications, rate adjustments, and shipment status transitions are logged in `audit_logs`.
3. **Performance**: Zone matching and rate calculations execute in under 30ms using indexed country/state lookup caches.
4. **UI Integration**: Includes a responsive React Admin UI at `/admin/shipping` (`ShippingPage.jsx`) featuring zone configuration modals, rate rule builders, and shipment tracking dialogs.
