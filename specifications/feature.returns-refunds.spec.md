# Feature Specification: Returns & Refunds Module

**Module Name:** Returns & Refunds  
**Module ID:** 19  
**Specification File:** `specifications/feature.returns-refunds.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§50–§54), `Requirements/admin_panel.md` (§21–§22), `Requirements/development_modules.md` (§Module 19)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Returns & Refunds module provides a complete post-purchase lifecycle management system. It allows customers to request product returns for delivered orders within an eligible return window (e.g. 7 days post-delivery) and track return progress. It empowers store administrators to review return requests, update return status milestones (`requested` $\rightarrow$ `under_review` $\rightarrow$ `approved` $\rightarrow$ `pickup_scheduled` $\rightarrow$ `picked_up` $\rightarrow$ `received` $\rightarrow$ `quality_check` $\rightarrow$ `approved_for_refund` $\rightarrow$ `refunded` $\rightarrow$ `closed`), restock inspected items into inventory via `InventoryService`, and process full or partial refunds directly through payment gateways (Razorpay, Stripe) or manual/offline options.

All financial and return audit records are immutably preserved (financial records are never physically deleted), and API responses strictly follow `ApiResponseTrait` standards outputting JSON on `http://localhost:8002` with OpenAPI 3.0 annotations.

---

## 2. Business Flow

```text
  Customer Submits Return Request
  (POST /api/v1/customer/returns)
              │
              ▼
  Return Record Created ('requested')
              │
              ▼
  Admin Reviews Request
  (POST /api/v1/admin/returns/{id}/status)
              │
      ┌───────┴────────┐
      ▼                ▼
   Approved         Rejected
      │                │
      ▼                ▼
  Schedule Pickup    Mark 'rejected' & Close
      │
      ▼
  Received & Quality Check
      │
      ├──────────────────────────────────┐
      ▼                                  ▼
  Restock Inventory              Process Refund
  (InventoryService::adjustStock)  (POST /api/v1/admin/refunds/process)
                                         │
                                         ▼
                                 Gateway / Manual Refund
                                         │
                                         ▼
                                 Update Payment 'refunded'
                                 Update Return  'refunded'
```

### 2.1 Customer Return Request Flow (`POST /api/v1/customer/returns`)
1. Customer selects a delivered order (`orders.status = 'delivered'`) within the 7-day return window.
2. Customer selects specific line items, return quantities, reason (`defective`, `wrong_item`, `damaged`, `size_mismatch`, `not_as_described`), text description, and optional photo URLs.
3. System verifies return eligibility:
   - Order exists and belongs to customer.
   - Order status is `delivered`.
   - Delivered date is within return window policy (default 7 days).
   - Line item quantities do not exceed un-returned item quantities.
4. Creates `returns` record formatted as `RET-YYYYMMDD-{id}` with status `requested`.
5. Creates `return_items` records snapshotting item IDs and requested return quantities.
6. Records timeline event in `order_histories`.

### 2.2 Admin Return Review & Milestone Action Flow (`POST /api/v1/admin/returns/{id}/status`)
1. Admin lists pending returns (`GET /api/v1/admin/returns?status=requested`).
2. Admin reviews return reason and uploaded evidence photos.
3. Admin updates return status:
   - `approved`: Approves request and initiates pickup.
   - `rejected`: Rejects request with admin rejection notes.
   - `pickup_scheduled` / `picked_up` / `received`: Logistics progress steps.
   - `quality_check`: Quality check pass/fail evaluation.
   - `approved_for_refund`: Flags return ready for financial processing.

### 2.3 Inventory Restocking Flow (`POST /api/v1/admin/returns/{id}/restock`)
1. Once returned items pass physical quality check at the warehouse, Admin triggers restocking.
2. System calls `InventoryService::adjustStock()` with type `'add'` / `'return'` for each returned variant.
3. Records inventory transaction type `return`.

### 2.4 Refund Processing Flow (`POST /api/v1/admin/refunds/process`)
1. Admin initiates refund for an approved return or order cancellation.
2. Specifies refund amount (full or partial), refund method (`razorpay`, `stripe`, `manual_transfer`, `store_credit`), and reason.
3. Executes inside `DB::transaction`:
   - If gateway is Razorpay/Stripe, driver issues refund API request.
   - Creates `refunds` record formatted as `RFD-YYYYMMDD-{id}` with status `completed` (or `pending`).
   - Updates `payments.status` to `refunded` or `partially_refunded`.
   - Updates `returns.status` to `refunded`.
   - Appends audit log in `order_histories`.

---

## 3. Functional Requirements

- **FR-RET-001**: System shall provide customer return request submission API (`POST /api/v1/customer/returns`).
- **FR-RET-002**: System shall enforce return eligibility rules: order must be `delivered`, within return window (default 7 days), and requested return item quantity must not exceed purchasable bounds.
- **FR-RET-003**: System shall generate unique return public numbers formatted as `RET-YYYYMMDD-{id}`.
- **FR-RET-004**: System shall provide customer return list API (`GET /api/v1/customer/returns`) and detail API (`GET /api/v1/customer/returns/{return_number}`).
- **FR-RET-005**: System shall provide Admin Return Management APIs (`GET /api/v1/admin/returns`, `GET /api/v1/admin/returns/{id}`).
- **FR-RET-006**: System shall allow Admin to transition return statuses (`requested`, `approved`, `rejected`, `pickup_scheduled`, `received`, `quality_check`, `approved_for_refund`, `refunded`, `closed`).
- **FR-RET-007**: System shall allow Admin to restock returned variants into inventory via `InventoryService`.
- **FR-RET-008**: System shall provide Admin Refund Processing API (`POST /api/v1/admin/refunds/process`) supporting full and partial refunds via gateway or manual channels.
- **FR-RET-009**: System shall generate unique refund numbers formatted as `RFD-YYYYMMDD-{id}`.
- **FR-RET-010**: System shall update payment status to `refunded` or `partially_refunded` upon refund completion.
- **FR-RET-011**: Financial records and refund logs must never be physically deleted from database.
- **FR-RET-012**: Every endpoint must include OpenAPI 3.0 (`@OA`) documentation annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Authentication & RBAC**: Sanctum Guard (`auth:sanctum`) and Spatie Permission (`manage-returns`, `manage-refunds`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table: `returns`
Migration: `database/migrations/2026_08_11_000036_create_returns_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `return_number` | `string` | Unique, Index | Public Return Number (e.g. `RET-20260813-1001`) |
| `order_id` | `foreignId` | FK -> `orders` | Associated Order FK |
| `user_id` | `foreignId` | FK -> `users` | Customer FK |
| `status` | `enum` | `['requested', 'under_review', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'quality_check', 'approved_for_refund', 'refunded', 'closed']`, Default `'requested'` | Return lifecycle status |
| `reason` | `string` | | Return reason |
| `description` | `text` | Nullable | Customer detailed explanation |
| `images` | `json` | Nullable | Photo evidence URLs array |
| `admin_notes` | `text` | Nullable | Admin internal notes |
| `approved_at` | `timestamp` | Nullable | Approval timestamp |
| `rejected_at` | `timestamp` | Nullable | Rejection timestamp |
| `timestamps` | `timestamps` | | Timestamps |

### 5.2 Table: `return_items`
Migration: `database/migrations/2026_08_11_000037_create_return_items_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `return_id` | `foreignId` | FK -> `returns` | Parent Return FK |
| `order_item_id` | `foreignId` | FK -> `order_items` | Associated Order Item FK |
| `product_id` | `foreignId` | Nullable, FK -> `products` | Product FK |
| `product_variant_id` | `foreignId` | Nullable, FK -> `product_variants` | Variant FK |
| `quantity` | `integer` | | Return item quantity |
| `unit_price` | `decimal(12,2)` | | Item unit price snapshot |
| `refund_amount` | `decimal(12,2)` | Default `0.00` | Calculated item refund amount |
| `timestamps` | `timestamps` | | Timestamps |

### 5.3 Table: `refunds`
Migration: `database/migrations/2026_08_11_000038_create_refunds_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `refund_number` | `string` | Unique, Index | Public Refund Number (e.g. `RFD-20260813-1001`) |
| `order_id` | `foreignId` | FK -> `orders` | Associated Order FK |
| `payment_id` | `foreignId` | Nullable, FK -> `payments` | Associated Payment FK |
| `return_id` | `foreignId` | Nullable, FK -> `returns` | Associated Return FK |
| `amount` | `decimal(12,2)` | | Refund amount |
| `reason` | `string` | | Refund reason |
| `gateway` | `string` | Default `'manual'` | Gateway channel (`razorpay`, `stripe`, `manual_transfer`, `store_credit`) |
| `gateway_refund_id` | `string` | Nullable, Index | External gateway refund ID |
| `status` | `enum` | `['pending', 'processing', 'completed', 'failed']`, Default `'completed'` | Refund status |
| `processed_by` | `foreignId` | Nullable, FK -> `admin_users` | Admin User FK |
| `payload` | `json` | Nullable | Gateway refund payload |
| `completed_at` | `timestamp` | Nullable | Completion timestamp |
| `timestamps` | `timestamps` | | Timestamps |

---

## 6. API Endpoints Specification

### 6.1 Customer Return Endpoints (`auth:sanctum`)
- `POST /api/v1/customer/returns` — Submit return request.
- `GET /api/v1/customer/returns` — List customer return requests.
- `GET /api/v1/customer/returns/{return_number}` — View return request details.

### 6.2 Admin Return & Refund Endpoints (`auth:sanctum`)
- `GET /api/v1/admin/returns` — Admin list return requests with status/date filters.
- `GET /api/v1/admin/returns/{id}` — Admin view return details and item inspection data.
- `POST /api/v1/admin/returns/{id}/status` — Update return status milestone.
- `POST /api/v1/admin/returns/{id}/restock` — Restock returned items to inventory.
- `GET /api/v1/admin/refunds` — List refund transaction logs.
- `POST /api/v1/admin/refunds/process` — Process full or partial refund for order/return.

---

## 7. Verification & Acceptance Criteria

1. Database migrations run cleanly.
2. Return submission verifies delivery status and 7-day return window.
3. Admin return status updates log timeline events.
4. Restocking returned items updates inventory available quantity correctly via `InventoryService`.
5. Refund processing updates payment status to `refunded` or `partially_refunded`.
6. Financial refund records cannot be deleted.
7. OpenAPI documentation updates cleanly via `php artisan l5-swagger:generate`.
