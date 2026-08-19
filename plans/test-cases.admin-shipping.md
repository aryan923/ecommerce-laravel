# Test Cases: Admin Shipping Management Module

**Module Name:** Admin Shipping Management  
**Module ID:** 30  
**File Path:** `plans/test-cases.admin-shipping.md`  
**Specification Reference:** `specifications/feature.admin-shipping.spec.md`  

---

## 1. Unit & Feature Test Matrix

| ID | Test Scenario | Request Endpoint | Expected Status | Validation Assertion |
|---|---|---|---|---|
| TC-SHIP-01 | Unauthenticated user attempts to list shipping zones | `GET /api/v1/admin/shipping/zones` | `401 Unauthorized` | Unauthenticated message returned |
| TC-SHIP-02 | Unauthorized staff without `shipping.view` permission lists zones | `GET /api/v1/admin/shipping/zones` | `403 Forbidden` | Permission error returned |
| TC-SHIP-03 | Admin lists shipping zones successfully | `GET /api/v1/admin/shipping/zones` | `200 OK` | Returns JSON array of shipping zones |
| TC-SHIP-04 | Admin creates valid shipping zone | `POST /api/v1/admin/shipping/zones` | `201 Created` | Zone and locations created in DB |
| TC-SHIP-05 | Admin creates shipping zone with empty location array | `POST /api/v1/admin/shipping/zones` | `422 Unprocessable` | Validation error for `locations` required |
| TC-SHIP-06 | Admin creates shipping method with flat rate | `POST /api/v1/admin/shipping/methods` | `201 Created` | Method created with `flat_rate` calculation |
| TC-SHIP-07 | Admin creates shipping method with weight-based tiers | `POST /api/v1/admin/shipping/methods` | `201 Created` | Method and rate tiers stored in DB |
| TC-SHIP-08 | Admin creates shipment for confirmed order | `POST /api/v1/admin/shipments` | `201 Created` | `Shipment` record & AWB generated, order updated |
| TC-SHIP-09 | Admin attempts shipment with invalid order item ID | `POST /api/v1/admin/shipments` | `422 Unprocessable` | Validation error for invalid `order_item_id` |
| TC-SHIP-10 | Admin updates shipment delivery status | `PATCH /api/v1/admin/shipments/{id}/status` | `200 OK` | Status updated to `in_transit` / `delivered` |
| TC-SHIP-11 | Admin retrieves printable shipping label payload | `GET /api/v1/admin/shipments/{id}/label` | `200 OK` | HTML/JSON label payload returned |
