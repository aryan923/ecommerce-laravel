# Feature Specification: Product Management Module (/admin/products) & Database Seeder Cleanup

**Module Name:** Product Management & Database Seeder Cleanup  
**Module ID:** 23  
**Specification File:** `specifications/feature.admin-products.spec.md`  
**Version:** 7.0  
**Status:** Approved / Pending Implementation  
**Base SRS References:** `Requirements/admin_panel.md`, `Requirements/development_modules.md`  

---

## 1. Module Overview

The Product Management and Database Seeder modules provide catalog management, RBAC system seeding, and **Clean Seeder Architecture (RBAC Only)**.

---

## 2. Seeder Cleanup Specifications

- **Database Seeders**:
  - Retain `DatabaseSeeder.php` and `RbacSeeder.php`.
  - Remove all non-RBAC seeders (`AddressSeeder`, `AttributeSeeder`, `BrandSeeder`, `CartSeeder`, `CategorySeeder`, `CouponSeeder`, `CurrencySeeder`, `InventorySeeder`, `MediaSeeder`, `NotificationSeeder`, `OrderSeeder`, `PaymentSeeder`, `ProductSeeder`, `ProductVariantSeeder`, `ReturnRefundSeeder`, `ReviewSeeder`, `ShipmentSeeder`, `ShippingSeeder`, `SuperAdminSeeder`, `TaxSeeder`, `UserSeeder`, `WishlistSeeder`).
- **Store Populate Command**:
  - Remove `PopulateStoreDataApiCommand.php` command.

---

## 3. Core Functional Requirements

- **FR-PRD-001**: Support Simple, Variable, and Digital products.
- **FR-PRD-002**: Multi-currency display switcher (`INR`, `USD`, `EUR`, `GBP`).
- **FR-PRD-003**: Polymorphic Media attachment integration.
- **FR-PRD-004**: Clean Seeder Architecture calling solely `RbacSeeder::class` in `DatabaseSeeder.php`.
