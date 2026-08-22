# Implementation Plan: Module 40 — Background Jobs & Queues

**Module Name:** Background Jobs & Queues  
**Spec File:** [`specifications/feature.queues-jobs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.queues-jobs.spec.md)  
**Plan File:** [`plans/plan.queues-jobs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.queues-jobs.md)  
**Test Cases File:** [`plans/test-cases.queues-jobs.md`](file:///d:/Projects/ecommerce_laravel/plans/test-cases.queues-jobs.md)  
**Regression File:** [`plans/regression.queues-jobs.md`](file:///d:/Projects/ecommerce_laravel/plans/regression.queues-jobs.md)  

---

## 1. Module Summary

This module establishes the background job processing infrastructure, queued job classes, scheduled command task runner, and failed job management APIs for the e-commerce system.

---

## 2. Development Strategy

1. **Database & Infrastructure**:
   - Ensure `jobs` and `failed_jobs` table migrations exist and are executed.
   - Configure queue driver settings in `config/queue.php`.
2. **Queued Job Classes (`app/Jobs`)**:
   - Implement `SendEmailJob`, `SendSmsJob`, `SendPushNotificationJob`, `ProcessPaymentReconciliationJob`, `SyncShippingStatusJob`, `GenerateReportJob`, `ImportProductsJob`, `SendLowStockAlertJob`, and `ExportDataJob`.
3. **Scheduled Console Commands (`app/Console/Kernel.php`)**:
   - Register scheduled tasks: `cart:expire`, `coupons:expire`, `stock:check-alerts`, `payments:reconcile`, `cleanup:temp-files`, `carts:recover-abandoned`.
4. **Admin Failed Jobs Controller & Routes**:
   - Create `AdminFailedJobController.php` with `index`, `show`, `retry`, `bulkRetry`, `destroy`, and `flush` methods using `App\Traits\ApiResponseTrait`.
   - Register `/api/v1/admin/failed-jobs/*` routes in `routes/api.php`.
5. **Feature Test Suite**:
   - Create `tests/Feature/Admin/AdminFailedJobTest.php` verifying failed job management and job dispatching.

---

## 3. Task Breakdown

- [x] **Task 1**: Verify `jobs` & `failed_jobs` migrations and run `php artisan migrate`.
- [x] **Task 2**: Create missing Queued Job classes in `app/Jobs/` (`SendEmailJob.php`, `SendSmsJob.php`, `SendPushNotificationJob.php`, `ProcessPaymentReconciliationJob.php`, `SyncShippingStatusJob.php`, `GenerateReportJob.php`, `SendLowStockAlertJob.php`, `ExportDataJob.php`).
- [x] **Task 3**: Register scheduled Cron tasks in `app/Console/Kernel.php`.
- [x] **Task 4**: Create `AdminFailedJobController.php` with API responses.
- [x] **Task 5**: Register API routes in `routes/api.php` under Sanctum auth.
- [x] **Task 6**: Create feature test suite `tests/Feature/Admin/AdminFailedJobTest.php`.
- [x] **Task 7**: Run `npm run build` and `php artisan test --filter=AdminFailedJobTest`.

---

## 4. Verification Plan

### Automated Tests
- Run `php artisan test --filter=AdminFailedJobTest`
- Verify 100% clean passage.
