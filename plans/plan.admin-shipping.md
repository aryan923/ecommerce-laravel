# Implementation Plan: Admin Shipping Management Module

**Module Name:** Admin Shipping Management  
**Module ID:** 30  
**Plan File:** `plans/plan.admin-shipping.md`  
**Specification Reference:** `specifications/feature.admin-shipping.spec.md`  
**Version:** 1.0  
**Status:** Approved Technical Plan  
**Target Completion:** Single Phase Iteration  

---

## 1. Executive Technical Summary

The Admin Shipping Management module extends the store's logistics infrastructure by adding administrative controls for geographical shipping zones, delivery method pricing rules (flat rate, weight-tiered, order-value-tiered, free threshold), shipment creation, courier AWB tracking assignments, and packing slip printing.

This plan details the database migration additions, Eloquent models, admin API controller logic (`Admin\ShippingZoneController`, `Admin\ShippingMethodController`, `Admin\ShipmentController`), request validators, service enhancements (`ShippingService`, `ShipmentService`), and React Admin UI integration (`resources/js/admin/pages/ShippingPage.jsx`).

---

## 2. Component Architecture & Affected Files

### 2.1 Database Migrations [NEW]
1. `database/migrations/2026_08_18_000001_create_shipping_zones_table.php`
2. `database/migrations/2026_08_18_000002_create_shipping_zone_locations_table.php`
3. `database/migrations/2026_08_18_000003_create_shipping_methods_table.php`
4. `database/migrations/2026_08_18_000004_create_shipping_rates_table.php`
5. `database/migrations/2026_08_18_000005_create_shipments_table.php`
6. `database/migrations/2026_08_18_000006_create_shipment_items_table.php`

### 2.2 Eloquent Models & Relations [NEW & MODIFY]
1. `[NEW] App\Models\ShippingZone.php` — Relations: `locations()`, `methods()`
2. `[NEW] App\Models\ShippingZoneLocation.php` — Relation: `zone()`
3. `[NEW] App\Models\ShippingMethod.php` — Relations: `zone()`, `rates()`
4. `[NEW] App\Models\ShippingRate.php` — Relation: `method()`
5. `[NEW] App\Models\Shipment.php` — Relations: `order()`, `items()`
6. `[NEW] App\Models\ShipmentItem.php` — Relations: `shipment()`, `orderItem()`
7. `[MODIFY] App\Models\Order.php` — Add `shipments()` relationship

### 2.3 Form Request Validation [NEW]
1. `[NEW] App\Http\Requests\Admin\StoreShippingZoneRequest.php`
2. `[NEW] App\Http\Requests\Admin\UpdateShippingZoneRequest.php`
3. `[NEW] App\Http\Requests\Admin\StoreShippingMethodRequest.php`
4. `[NEW] App\Http\Requests\Admin\UpdateShippingMethodRequest.php`
5. `[NEW] App\Http\Requests\Admin\CreateShipmentRequest.php`
6. `[NEW] App\Http\Requests\Admin\UpdateShipmentStatusRequest.php`

### 2.4 Services & Logic Layer [NEW & MODIFY]
1. `[MODIFY] App\Services\ShippingService.php` — Add administrative zone/method/rate management functions & cache clear triggers.
2. `[NEW] App\Services\ShipmentService.php` — Handles shipment creation, partial order item calculation, tracking status transitions, and shipping label payload generation.

### 2.5 API Controllers & Routing [NEW & MODIFY]
1. `[NEW] App\Http\Controllers\Api\V1\Admin\ShippingZoneController.php` — Zone CRUD & location mapping.
2. `[NEW] App\Http\Controllers\Api\V1\Admin\ShippingMethodController.php` — Method CRUD & rate tier engine.
3. `[NEW] App\Http\Controllers\Api\V1\Admin\ShipmentController.php` — Order fulfillment, AWB tracking, and label generation.
4. `[MODIFY] routes/api.php` — Register Sanctum & Spatie permission guarded admin routes under `/v1/admin/shipping` & `/v1/admin/shipments`.

### 2.6 Frontend Admin Panel UI [NEW & MODIFY]
1. `[NEW] resources/js/admin/pages/ShippingPage.jsx` — Complete React view for Zone & Method configuration, Rate Tier Builders, and Order Shipment Dispatch.
2. `[MODIFY] resources/js/admin/App.jsx` — Register `/admin/shipping` route.
3. `[MODIFY] resources/js/admin/components/Sidebar.jsx` — Add "Shipping & Fulfillment" navigation item under Sales & Shipping.

---

## 3. Step-by-Step Implementation Sequence

### Step 1: Database Migrations & Models
- Run migrations for `shipping_zones`, `shipping_zone_locations`, `shipping_methods`, `shipping_rates`, `shipments`, and `shipment_items`.
- Establish relationships, scopes, and fillable attributes on models.

### Step 2: Request Validators & Business Logic
- Create Form Request classes validating inputs for unique zone codes, non-overlapping location patterns, non-negative monetary rate tiers, and valid order item shipment quantities.
- Extend `ShippingService` with zone matching and rate evaluation helpers.
- Implement `ShipmentService` with shipment creation, order status sync (`partially_shipped` vs `shipped`), and AWB assignment.

### Step 3: Admin API Controllers & OpenAPI Documentation
- Implement `ShippingZoneController`, `ShippingMethodController`, and `ShipmentController` extending `ApiResponseTrait`.
- Annotate all endpoints with comprehensive `@OA` Swagger docblocks.
- Register routes in `routes/api.php` under Sanctum auth & Spatie permissions (`shipping.view`, `shipping.create`, `shipping.update`, `shipping.delete`, `shipments.manage`).

### Step 4: Admin Panel UI Development
- Create `ShippingPage.jsx` featuring:
  - **KPI Cards**: Total Shipping Zones, Active Delivery Methods, Pending Fulfillment Shipments, In-Transit Shipments.
  - **Tabs**: `Shipping Zones & Rates` and `Order Shipments & Tracking`.
  - **Zone & Method Modals**: Zone location multi-selector and Rate tier rules table.
  - **Shipment Dispatch Dialog**: Select items to ship, courier carrier selector, AWB tracking input, and printable packing slip modal.
- Connect React UI to Admin API endpoints with toast notifications.

### Step 5: Automated Testing & Build Validation
- Create Feature Unit Tests: `tests/Feature/Admin/ShippingManagementTest.php`.
- Execute test suite (`php artisan test`).
- Compile static assets (`npm run build`).

---

## 4. Verification & Testing Plan

### Automated Tests
- `php artisan test --filter=ShippingManagementTest`
  - Validates Zone creation, location assignment, rate tier calculation, shipment dispatch, and permission enforcement.

### Manual UI Verification
- Access `http://localhost:8002/admin/shipping`.
- Create a Shipping Zone ("North America Regional") and add states/postal codes.
- Create a Shipping Method ("FedEx Express") with weight-based rate tiers.
- Dispatch an order item, assign tracking AWB number, print packing slip, and update shipment status.
