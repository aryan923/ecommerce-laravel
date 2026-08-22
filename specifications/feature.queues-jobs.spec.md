# Feature Specification: Module 40 — Background Jobs & Queues

**Module Name:** Background Jobs & Queues  
**Layer:** Backend Infrastructure & Async Processing  
**Priority:** High  
**SRS References:** §59–§60, §96–§99  
**Spec File:** [`specifications/feature.queues-jobs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.queues-jobs.spec.md)  
**Plan File:** [`plans/plan.queues-jobs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.queues-jobs.md)  

---

## 1. Module Overview

The **Background Jobs & Queues** module provides a robust, scalable asynchronous job execution engine and automated task scheduler for the e-commerce platform. It offloads time-consuming tasks (email/SMS/push dispatches, heavy CSV imports/exports, payment gateway reconciliation, shipping carrier tracking sync, and report generation) from HTTP web worker threads to background queue workers, ensuring sub-100ms API response times.

Additionally, this module implements automated scheduled commands (Cron) for cart reservation expirations, coupon validity updates, low-stock alerts, abandoned cart recovery notifications, and temporary file cleanups, alongside an admin dashboard interface for monitoring failed queue jobs, inspecting exception stack traces, retrying jobs, and purging failed queues.

---

## 2. Business Flow

```
[ HTTP API Event / Scheduled Cron Trigger ]
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│      Dispatch Job to Queue (Redis / Database)     │
│   Queues: high, emails, notifications, default,   │
│                 reports, exports                 │
└──────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│          Background Queue Worker (Supervisor)    │
│            Executes Job Task Asynchronously      │
└──────────────────────────────────────────────────┘
        │                                  │
        ▼ (Success)                        ▼ (Failure)
┌───────────────────────┐        ┌────────────────────────────────┐
│ Job Finishes Cleanly  │        │ Max Tries Exceeded (3 Retries) │
└───────────────────────┘        └────────────────────────────────┘
                                                   │
                                                   ▼
                                 ┌────────────────────────────────┐
                                 │ Logged to `failed_jobs` Table  │
                                 │ Admin Alert & Manual Retry UI  │
                                 └────────────────────────────────┘
```

---

## 3. Functional Requirements

### 3.1 Asynchronous Job Pipeline
1. **Queued Job Classes (`app/Jobs`)**:
   - `SendEmailJob`: Queues HTML email templates (Order receipts, invoices, password resets, stock alerts).
   - `SendSmsJob`: Dispatches SMS notifications via third-party gateways asynchronously.
   - `SendPushNotificationJob`: Multi-channel push notification dispatches for customer web/mobile.
   - `ProcessPaymentReconciliationJob`: Audits pending/unsettled gateway transactions.
   - `SyncShippingStatusJob`: Queries third-party logistics APIs (Shiprocket/Delhivery/Bluedart) for tracking updates.
   - `GenerateReportJob`: Generates heavy sales, tax, and inventory analytics reports asynchronously.
   - `ImportProductsJob`: Processes bulk CSV/Excel product imports in background batches.
   - `SendLowStockAlertJob`: Generates & sends low stock summary digests to store admins.
   - `ExportDataJob`: Generates downloadable CSV exports for orders, customers, audit logs, and products.

### 3.2 Scheduled Commands / Cron Scheduler (`app/Console/Kernel.php`)
1. **`cart:expire`**: Runs every 15 minutes; releases expired cart reservations.
2. **`coupons:expire`**: Runs daily at midnight; updates expired coupon statuses to inactive.
3. **`stock:check-alerts`**: Runs hourly; checks inventory levels below default thresholds and enqueues `SendLowStockAlertJob`.
4. **`payments:reconcile`**: Runs daily at 2:00 AM; triggers `ProcessPaymentReconciliationJob`.
5. **`cleanup:temp-files`**: Runs daily at 3:00 AM; purges temporary export files older than 24 hours.
6. **`carts:recover-abandoned`**: Runs daily at 10:00 AM; sends abandoned cart recovery reminders.

### 3.3 Failed Job Management & Admin API
1. **Failed Job Inspection**:
   - List failed jobs with filters by queue name, job class, and date range.
   - Retrieve detailed failed job exception stack trace, payload, and retry attempts.
2. **Retry & Flush Actions**:
   - Single job retry (`POST /api/v1/admin/failed-jobs/{id}/retry`).
   - Bulk job retry (`POST /api/v1/admin/failed-jobs/bulk-retry`).
   - Single job delete (`DELETE /api/v1/admin/failed-jobs/{id}`).
   - Flush all failed jobs (`DELETE /api/v1/admin/failed-jobs/flush`).

---

## 4. Technical Requirements

- **Queue Drivers**: Support `redis`, `database`, and `sync` queue drivers configurable via `.env`.
- **Queue Priorities**:
  - `high`: Payment reconciliation, OTPs.
  - `emails`: Order receipts, password reset links.
  - `notifications`: Push notifications, SMS.
  - `default`: Product imports, inventory adjustments.
  - `reports`: Heavy CSV/PDF exports.
- **Retry Policy**: Default 3 attempts with exponential backoff (`backoff = [10, 30, 60]`).

---

## 5. Database Schema

### 5.1 `jobs` Table (Database Queue Driver)
- `id` (bigint, PK)
- `queue` (string, indexed)
- `payload` (longtext)
- `attempts` (tinyint)
- `reserved_at` (unsigned int, nullable)
- `available_at` (unsigned int)
- `created_at` (unsigned int)

### 5.2 `failed_jobs` Table
- `id` (bigint, PK)
- `uuid` (string, unique)
- `connection` (text)
- `queue` (text)
- `payload` (longtext)
- `exception` (longtext)
- `failed_at` (timestamp, default CURRENT_TIMESTAMP)

---

## 6. API Requirements

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/v1/admin/failed-jobs` | List failed jobs with pagination & filters | `settings.view` |
| `GET` | `/api/v1/admin/failed-jobs/{id}` | View failed job details & stack trace | `settings.view` |
| `POST` | `/api/v1/admin/failed-jobs/{id}/retry` | Retry a specific failed job | `settings.update` |
| `POST` | `/api/v1/admin/failed-jobs/bulk-retry` | Retry multiple selected failed jobs | `settings.update` |
| `DELETE` | `/api/v1/admin/failed-jobs/{id}` | Delete a failed job entry | `settings.update` |
| `DELETE` | `/api/v1/admin/failed-jobs` | Flush all failed job records | `settings.update` |

---

## 7. UI Requirements (Admin Settings / Queue Monitor)

- **KPI Cards**:
  - Total Queued Jobs
  - Active Queue Workers
  - Failed Jobs Count
  - Processed Jobs Today
- **Failed Jobs Table**:
  - Columns: ID, Queue, Job Class, Failed At, Exception Snippet, Action (View Trace, Retry, Delete).
- **Stack Trace Inspector Modal**:
  - View full payload parameters and exception trace.

---

## 8. Validation & Permission Rules

- Only authenticated Super Admin / Admin Users with `settings.view` and `settings.update` permissions can access failed jobs endpoints.

---

## 9. Acceptance Criteria

- [ ] All 9 queued job classes implement `ShouldQueue` and handling logic properly.
- [ ] Automated Cron schedule defined in `app/Console/Kernel.php`.
- [ ] Admin API endpoints for listing, retrying, and deleting failed jobs function cleanly.
- [ ] Unit & Feature tests pass with 100% success code exit 0.
