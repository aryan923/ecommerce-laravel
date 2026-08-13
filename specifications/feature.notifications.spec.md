# Feature Specification: Notifications System Module

**Module Name:** Notifications System  
**Module ID:** 21  
**Specification File:** `specifications/feature.notifications.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§57–§60), `Requirements/admin_panel.md` (§38–§39), `Requirements/development_modules.md` (§Module 21)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Notifications System module provides multi-channel (Email, SMS, Push, In-App) automated notification dispatch and template management for key e-commerce lifecycle events (Customer Registration, OTP, Order Placed, Payment Success, Payment Failure, Order Shipped, Order Delivered, Order Cancelled, Return Approved, Refund Completed, and Low Stock Alerts).

The system uses non-blocking queue-based dispatch (`SendNotificationJob`) to deliver notifications asynchronously without delaying customer HTTP request cycles. Administrators can configure dynamic notification templates with variable interpolation syntax (e.g. `{{customer_name}}`, `{{order_number}}`, `{{order_total}}`, `{{tracking_number}}`), test dispatch notifications, and inspect complete delivery audit logs (`notification_logs`) tracking delivery statuses (`queued` $\rightarrow$ `sent` $\rightarrow$ `delivered` $\rightarrow$ `failed`).

All API responses strictly follow `ApiResponseTrait` standards outputting JSON on `http://localhost:8002` with OpenAPI 3.0 annotations.

---

## 2. Business Flow

```text
  System Event Occurs
  (Order Placed, Payment Success, Shipped, etc.)
              │
              ▼
  NotificationService::dispatchNotification()
              │
              ▼
  Fetch Active NotificationTemplate for Event & Channels
              │
              ▼
  Interpolate {{variables}} with Event Payload Data
              │
              ▼
  Create NotificationLog ('queued')
              │
              ▼
  Dispatch Async Queue Job (SendNotificationJob)
              │
              ▼
  Execute Channel Provider Delivery (Email, SMS, Push, In-App)
              │
      ┌───────┴────────┐
      ▼                ▼
   Success          Failure
      │                │
      ▼                ▼
  Status 'sent'    Status 'failed'
  sent_at = now()  Record failure_reason
```

---

## 3. Functional Requirements

- **FR-NOT-001**: System shall support notification channels: `email`, `sms`, `push`, `in_app`.
- **FR-NOT-002**: System shall support notification events: `registration`, `verification`, `password_reset`, `order_placed`, `payment_success`, `payment_failed`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`, `return_approved`, `refund_completed`, `low_stock`.
- **FR-NOT-003**: System shall allow Admin to create, list, view, and update notification templates (`notification_templates`).
- **FR-NOT-004**: Notification templates shall support dynamic variable placeholders (e.g. `{{customer_name}}`, `{{order_number}}`, `{{order_total}}`, `{{tracking_number}}`).
- **FR-NOT-005**: System shall dispatch notifications asynchronously via Laravel Queue jobs (`SendNotificationJob`).
- **FR-NOT-006**: System shall record delivery logs in `notification_logs` tracking recipient, channel, rendered content, status (`queued`, `sent`, `delivered`, `failed`), and failure reasons.
- **FR-NOT-007**: System shall provide Admin test dispatch API (`POST /api/v1/admin/notifications/test-dispatch`).
- **FR-NOT-008**: System shall provide customer in-app notification listing (`GET /api/v1/customer/notifications`) and mark-as-read capability (`PATCH /api/v1/customer/notifications/{id}/read`).
- **FR-NOT-009**: Every endpoint must include OpenAPI 3.0 (`@OA`) documentation annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Authentication & RBAC**: Sanctum Guard (`auth:sanctum`) and Spatie Permission (`manage-notifications`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table: `notification_templates`
Migration: `database/migrations/2026_08_11_000040_create_notification_templates_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `event` | `string` | Index | Event name (e.g. `order_placed`) |
| `channel` | `enum` | `['email', 'sms', 'push', 'in_app']` | Notification channel |
| `subject` | `string` | Nullable | Email/Push subject title |
| `body` | `text` | | Template body with `{{variable}}` syntax |
| `variables` | `json` | Nullable | Supported variables list array |
| `status` | `boolean` | Default `true` | Active/Inactive flag |
| `timestamps` | `timestamps` | | Timestamps |

**Unique Constraint:** `(event, channel)`

### 5.2 Table: `notification_logs`
Migration: `database/migrations/2026_08_11_000041_create_notification_logs_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `event` | `string` | Index | Associated event name |
| `channel` | `enum` | `['email', 'sms', 'push', 'in_app']` | Delivery channel |
| `recipient` | `string` | Index | Recipient email, phone, or token |
| `user_id` | `foreignId` | Nullable, FK -> `users` | Customer FK |
| `subject` | `string` | Nullable | Rendered subject |
| `content` | `text` | | Rendered message content |
| `status` | `enum` | `['queued', 'sent', 'delivered', 'failed']`, Default `'queued'` | Delivery status |
| `failure_reason` | `text` | Nullable | Error log message if delivery failed |
| `read_at` | `timestamp` | Nullable | In-app read timestamp |
| `sent_at` | `timestamp` | Nullable | Completion timestamp |
| `timestamps` | `timestamps` | | Timestamps |

---

## 6. API Endpoints Specification

### 6.1 Customer Notification Endpoints (`auth:sanctum`)
- `GET /api/v1/customer/notifications` — List customer in-app notifications.
- `PATCH /api/v1/customer/notifications/{id}/read` — Mark in-app notification as read.

### 6.2 Admin Notification Endpoints (`auth:sanctum`)
- `GET /api/v1/admin/notifications/templates` — List notification templates.
- `POST /api/v1/admin/notifications/templates` — Create notification template.
- `GET /api/v1/admin/notifications/templates/{id}` — View notification template details.
- `PUT /api/v1/admin/notifications/templates/{id}` — Update notification template.
- `GET /api/v1/admin/notifications/logs` — List notification delivery logs (filters: channel, status, search).
- `POST /api/v1/admin/notifications/test-dispatch` — Test dispatch notification for an event.

---

## 7. Verification & Acceptance Criteria

1. Database migrations run cleanly with unique constraints.
2. Template variable replacement correctly interpolates `{{customer_name}}`, `{{order_number}}`, etc.
3. Notification dispatch enqueues queue jobs and records `notification_logs`.
4. Delivery completion updates status to `sent`/`delivered` with timestamp.
5. In-app notifications are retrievable by customer and markable as read.
6. OpenAPI documentation updates cleanly via `php artisan l5-swagger:generate`.
