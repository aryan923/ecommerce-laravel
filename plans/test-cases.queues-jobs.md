# Test Cases: Module 40 — Background Jobs & Queues

**Module Name:** Background Jobs & Queues  
**Spec File:** [`specifications/feature.queues-jobs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.queues-jobs.spec.md)  
**Plan File:** [`plans/plan.queues-jobs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.queues-jobs.md)  

---

## 1. Test Suite Structure

| Test ID | Category | Description | Expected Outcome |
|---|---|---|---|
| TC-JOB-001 | Queue Dispatch | Dispatch `SendEmailJob` to queue | Job pushed onto `emails` queue |
| TC-JOB-002 | Queue Dispatch | Dispatch `SendSmsJob` to queue | Job pushed onto `notifications` queue |
| TC-JOB-003 | Failed Jobs | List failed jobs via API | Returns paginated list of `failed_jobs` records |
| TC-JOB-004 | Failed Jobs | View single failed job stack trace | Returns 200 with exception details and payload |
| TC-JOB-005 | Failed Jobs | Retry specific failed job | Executes `Artisan::call('queue:retry', ...)` and returns success |
| TC-JOB-006 | Failed Jobs | Delete failed job | Removes record from `failed_jobs` table |
| TC-JOB-007 | Failed Jobs | Flush all failed jobs | Deletes all records from `failed_jobs` table |
| TC-CRON-008 | Schedule | Run `cart:expire` scheduled task | Replaces expired cart reservations |
| TC-CRON-009 | Schedule | Run `coupons:expire` scheduled task | Inactivates expired coupons |
