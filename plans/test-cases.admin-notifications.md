# Test Cases: Module 33 — Admin Notification Templates & Delivery Logs

## 1. Unit & Feature Test Scenarios (PHPUnit)

| Test ID | Scenario | Input / Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-NT-01** | Unauthenticated Access | `GET /api/v1/admin/notifications/templates` without Sanctum token | 401 Unauthorized |
| **TC-NT-02** | Fetch Stats & Templates | `GET /api/v1/admin/notifications/templates` with admin token | 200 OK, returns templates grouped by channel & event keys |
| **TC-NT-03** | Create Template | `POST /api/v1/admin/notifications/templates` with valid payload | 201 Created, template saved with variables array |
| **TC-NT-04** | Update Template | `PUT /api/v1/admin/notifications/templates/{id}` | 200 OK, subject & body updated |
| **TC-NT-05** | Toggle Status | `PATCH /api/v1/admin/notifications/templates/{id}/toggle-status` | 200 OK, `is_active` toggled between true/false |
| **TC-NT-06** | Test Dispatch | `POST /api/v1/admin/notifications/test-dispatch` with recipient & variables | 200 OK, mock notification dispatched, delivery log recorded |
| **TC-NT-07** | List Delivery Logs | `GET /api/v1/admin/notifications/logs?channel=email&status=failed` | 200 OK, returns filtered log entries |
| **TC-NT-08** | Retry Log Dispatch | `POST /api/v1/admin/notifications/logs/{id}/retry` | 200 OK, log retried and status updated to sent/queued |

---

## 2. E2E Integration Test Scenarios (Playwright)

| Test ID | Scenario | Input / Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-E2E-NT-01** | Navigation & Rendering | Click "Notifications" sidebar link or navigate to `/admin/notifications` | Page renders title, 4 KPI cards, and channel tabs |
| **TC-E2E-NT-02** | Channel Tab Switching | Click `SMS Templates` and `Delivery Audit Logs` tabs | Active view updates, table displays corresponding records |
| **TC-E2E-NT-03** | Edit Template Modal | Click "Edit" on an Email template | Modal opens with subject, HTML body editor, and variable chip bar |
| **TC-E2E-NT-04** | Live Variable Preview | Type `Hello {{customer_name}}` in template body | Preview box updates dynamically showing mock rendered text |
| **TC-E2E-NT-05** | Delivery Log Inspection | Click "Inspect" on a failed log entry | Log modal opens displaying recipient, status timeline, and error trace |
