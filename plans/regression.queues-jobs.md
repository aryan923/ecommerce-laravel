# Regression Plan: Module 40 — Background Jobs & Queues

**Module Name:** Background Jobs & Queues  
**Spec File:** [`specifications/feature.queues-jobs.spec.md`](file:///d:/Projects/ecommerce_laravel/specifications/feature.queues-jobs.spec.md)  
**Plan File:** [`plans/plan.queues-jobs.md`](file:///d:/Projects/ecommerce_laravel/plans/plan.queues-jobs.md)  

---

## 1. Impacted Feature Areas

1. **Email & Notification Engine (Module 34)**:
   - Ensuring async job dispatches do not crash synchronous notification APIs.
2. **Order & Checkout Processing (Module 11 & 12)**:
   - Confirming order placement dispatches confirmation emails asynchronously without delaying HTTP response time.
3. **Product & CSV Imports (Module 1)**:
   - Verifying bulk product CSV import runs in background jobs without worker timeout.

---

## 2. Regression Test Matrix

| Test ID | Affected Feature | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| REG-JOB-001 | Order Placement | Create new order | Order created in <100ms; `SendEmailJob` pushed to queue | High |
| REG-JOB-002 | Failed Jobs Admin API | Attempt retry on invalid failed job ID | Returns 404 error response | Medium |
