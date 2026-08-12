# Test Cases: Shipping Module

**Module Name:** Shipping Module  
**Module ID:** 15  
**Test File:** `plans/test-cases.shipping.md`  
**Specification:** `specifications/feature.shipping.spec.md`  
**Plan:** `plans/plan.shipping.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-SHP-001: Admin Create Shipping Zone & Method
- **Preconditions**: Authenticated Admin with `manage-shipping` permission.
- **Input**:
  - `POST /api/v1/admin/shipping-zones` with `name: "Local MH Zone", states: ["MH"], postal_codes: ["400001", "400002"]`.
  - `POST /api/v1/admin/shipping-methods` with `name: "Standard Delivery", type: "standard", estimated_days: "3-5 business days"`.
- **Expected Result**: HTTP 201 Created for both records.

### TC-SHP-002: Admin Create Flat Rate & Free Shipping Threshold Rate
- **Input**: `POST /api/v1/admin/shipping-rates` with `zone_id: 1, method_id: 1, rate_type: "flat_rate", rate_value: 50.00, free_threshold: 999.00`.
- **Expected Result**: HTTP 201 Created.

### TC-SHP-003: Calculate Shipping Below Free Threshold
- **Preconditions**: Zone 1 (MH), Method 1 (Flat ₹50, Free above ₹999). Cart subtotal: 500.00.
- **Input**: `POST /api/v1/shipping/calculate` with `state_code: "MH", postal_code: "400001", subtotal: 500.00`.
- **Expected Result**: HTTP 200 OK, returns `available_methods` with method `Standard Delivery`, fee: 50.00.

### TC-SHP-004: Calculate Shipping Above Free Threshold (Free Shipping)
- **Preconditions**: Cart subtotal: 1200.00 (Exceeds free threshold 999.00).
- **Input**: `POST /api/v1/shipping/calculate` with `state_code: "MH", postal_code: "400001", subtotal: 1200.00`.
- **Expected Result**: HTTP 200 OK, returns fee: 0.00 (`is_free: true`).

### TC-SHP-005: Admin Create Shipment & Add Tracking Log
- **Input**:
  - `POST /api/v1/admin/shipments` with `courier_name: "Delhivery", awb_number: "DL123456789", tracking_number: "TRK987654"`.
  - `POST /api/v1/admin/shipments/1/tracking` with `status: "in_transit", location: "Mumbai Hub", description: "Dispatched from warehouse"`.
- **Expected Result**: HTTP 201 Created for shipment and HTTP 200 OK for tracking event.

### TC-SHP-006: Public Track Shipment Progress
- **Input**: `GET /api/v1/shipments/track/TRK987654`.
- **Expected Result**: HTTP 200 OK, returns shipment details, courier name, current status `in_transit`, and full tracking timeline array.

---

## 2. Negative & Edge Case Scenarios

### TC-SHP-007: Calculate Shipping for Unserviced Location (No Matching Zone)
- **Input**: `POST /api/v1/shipping/calculate` with unserviced state/postal code and no global zone configured.
- **Expected Result**: HTTP 200 OK, `available_methods` is empty array, `is_deliverable: false`.

### TC-SHP-008: Calculate Weight-Based Shipping Exceeding Weight Limit
- **Preconditions**: Method weight limit = 5.0 kg. Cart total weight = 10.0 kg.
- **Input**: `POST /api/v1/shipping/calculate` with `total_weight: 10.0`.
- **Expected Result**: Method excluded from available options due to weight limit violation.
