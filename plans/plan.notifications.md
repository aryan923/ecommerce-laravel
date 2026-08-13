# Implementation Plan: Module 21 — Notifications System

**Module Name:** Notifications System  
**Module ID:** 21  
**Plan File:** `plans/plan.notifications.md`  
**Specification File:** `specifications/feature.notifications.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Implement Module 21 (Notifications System) to provide multi-channel (Email, SMS, Push, In-App) automated notification dispatch, variable template interpolation, queue job processing, and delivery log audit tracking. This includes database migrations for `notification_templates` and `notification_logs`; Eloquent models (`NotificationTemplate`, `NotificationLog`); `NotificationService` for template rendering, variable replacement (`{{customer_name}}`, `{{order_number}}`), log creation, and queue dispatch (`SendNotificationJob`); customer and admin controllers; OpenAPI annotations; and automated feature tests.

---

## 2. User Review Required

> [!NOTE]
> - Supported channels: `email`, `sms`, `push`, `in_app`.
> - Supported events: `registration`, `verification`, `password_reset`, `order_placed`, `payment_success`, `payment_failed`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`, `return_approved`, `refund_completed`, `low_stock`.
> - Notification dispatch uses Laravel Queues (`SendNotificationJob`) for non-blocking asynchronous delivery.

---

## 3. Open Questions

*None at this time. SRS specifications (§57–§60) and Admin Panel specs (§38–§39) fully define multi-channel notifications, dynamic template variables, queue processing, and delivery logs.*

---

## 4. Proposed Changes & Task Breakdown

### Database Layer
- **[NEW]** [`database/migrations/2026_08_11_000040_create_notification_templates_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000040_create_notification_templates_table.php) — Migration for `notification_templates` table.
- **[NEW]** [`database/migrations/2026_08_11_000041_create_notification_logs_table.php`](file:///d:/Projects/ecommerce_laravel/database/migrations/2026_08_11_000041_create_notification_logs_table.php) — Migration for `notification_logs` table.

### Model Layer
- **[NEW]** [`app/Models/NotificationTemplate.php`](file:///d:/Projects/ecommerce_laravel/app/Models/NotificationTemplate.php) — Eloquent model for templates.
- **[NEW]** [`app/Models/NotificationLog.php`](file:///d:/Projects/ecommerce_laravel/app/Models/NotificationLog.php) — Eloquent model for delivery logs.

### Queue Job & Service Layer
- **[NEW]** [`app/Jobs/SendNotificationJob.php`](file:///d:/Projects/ecommerce_laravel/app/Jobs/SendNotificationJob.php) — Asynchronous queued job for channel delivery execution.
- **[NEW]** [`app/Services/NotificationService.php`](file:///d:/Projects/ecommerce_laravel/app/Services/NotificationService.php) — Service for template variable interpolation, log creation, job dispatch, test dispatching, and template/log administration.

### Request Validation Layer
- **[NEW]** [`app/Http/Requests/Notification/CreateTemplateRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Notification/CreateTemplateRequest.php)
- **[NEW]** [`app/Http/Requests/Notification/UpdateTemplateRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Notification/UpdateTemplateRequest.php)
- **[NEW]** [`app/Http/Requests/Notification/TestDispatchRequest.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Requests/Notification/TestDispatchRequest.php)

### Controller Layer
- **[NEW]** [`app/Http/Controllers/Api/V1/Customer/CustomerNotificationController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Customer/CustomerNotificationController.php) — Customer in-app notification endpoints.
- **[NEW]** [`app/Http/Controllers/Api/V1/Admin/NotificationAdminController.php`](file:///d:/Projects/ecommerce_laravel/app/Http/Controllers/Api/V1/Admin/NotificationAdminController.php) — Admin template CRUD, delivery logs, and test dispatch endpoints.

### Routes & Testing
- **[MODIFY]** [`routes/api.php`](file:///d:/Projects/ecommerce_laravel/routes/api.php) — Register customer and admin notification routes.
- **[NEW]** [`tests/Feature/NotificationTest.php`](file:///d:/Projects/ecommerce_laravel/tests/Feature/NotificationTest.php) — Feature test suite.

---

## 5. Detailed Task Checklist

- [x] **Task 1: Create Database Migrations**
  - Path: `database/migrations/2026_08_11_000040_create_notification_templates_table.php`
  - Path: `database/migrations/2026_08_11_000041_create_notification_logs_table.php`
  - Description: Create migrations for `notification_templates` and `notification_logs`. Run `php artisan migrate`.

- [x] **Task 2: Create Eloquent Models**
  - Path: `app/Models/NotificationTemplate.php`
  - Path: `app/Models/NotificationLog.php`
  - Description: Implement models with fillables, casts, and relations.

- [x] **Task 3: Implement Queue Job & NotificationService**
  - Path: `app/Jobs/SendNotificationJob.php`
  - Path: `app/Services/NotificationService.php`
  - Description: Implement template rendering, variable substitution, queue dispatching, channel execution, and log management.

- [x] **Task 4: Implement Form Requests & Controllers**
  - Path: `app/Http/Requests/Notification/CreateTemplateRequest.php`
  - Path: `app/Http/Requests/Notification/UpdateTemplateRequest.php`
  - Path: `app/Http/Requests/Notification/TestDispatchRequest.php`
  - Path: `app/Http/Controllers/Api/V1/Customer/CustomerNotificationController.php`
  - Path: `app/Http/Controllers/Api/V1/Admin/NotificationAdminController.php`
  - Description: Build controllers with OpenAPI 3.0 annotations.

- [x] **Task 5: Register API Routes**
  - Path: `routes/api.php`
  - Description: Add routes under `/api/v1/customer/notifications` and `/api/v1/admin/notifications`.

- [x] **Task 6: Generate Swagger Docs**
  - Command: `php artisan l5-swagger:generate`
  - Description: Update live API documentation.

- [x] **Task 7: Feature Testing**
  - Path: `tests/Feature/NotificationTest.php`
  - Command: `php vendor/bin/phpunit tests/Feature/NotificationTest.php`
  - Description: Verify template variable interpolation, log creation, queue dispatching, test dispatching, and in-app customer notification reading.

---

## 6. Verification Plan

### Automated Tests
1. Module Feature Test:
   `php vendor/bin/phpunit tests/Feature/NotificationTest.php`
2. Full Suite Test:
   `php vendor/bin/phpunit`

### Manual Verification
1. Verify admin can create a template with variables `{{customer_name}}` and `{{order_number}}`.
2. Verify test dispatch replaces variables and records `notification_logs` status `sent` / `delivered`.
3. Verify customer can retrieve in-app notifications and mark them as read.
