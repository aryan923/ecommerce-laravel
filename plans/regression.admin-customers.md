# Regression Test Suite — Module 26: Admin Customer Management

**Module Name:** Admin Customer Management  
**Module ID:** 26  

---

## Pre-Existing API Safety Verification

To strictly enforce the **Zero API/Service Overwrite Policy**, the following pre-existing modules and endpoints MUST be regression tested before and after implementing Module 26:

### 1. Pre-Existing User & Customer APIs
- `GET /api/v1/user` — Authenticated customer profile endpoint must remain unaffected.
- `PUT /api/v1/user/profile` — Customer self-service profile updates must function normally.
- `GET /api/v1/user/addresses` — Customer self-service address management must remain unaffected.

### 2. Pre-Existing Admin Modules
- `AdminInventoryManagementTest.php` — Inventory management APIs.
- `AdminProductManagementTest.php` — Product catalog management APIs.
- `AdminCategoryManagementTest.php` — Category management APIs.

---

## Automated Regression Command

```powershell
$env:DB_HOST="127.0.0.1"; $env:DB_PORT="3307"; vendor/bin/phpunit tests/Feature/AdminCustomerManagementTest.php tests/Feature/AdminProductManagementTest.php tests/Feature/AdminInventoryManagementTest.php
```
