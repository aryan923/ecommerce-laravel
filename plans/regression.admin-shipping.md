# Regression Test Plan: Admin Shipping Management Module

**Module Name:** Admin Shipping Management  
**Module ID:** 30  
**File Path:** `plans/regression.admin-shipping.md`  
**Specification Reference:** `specifications/feature.admin-shipping.spec.md`  

---

## 1. Zero Overwrite & Regression Safeguards

To prevent regression issues during the development of Admin Shipping Management (Module 30), the following core system workflows must be re-tested and verified:

1. **Storefront Checkout Shipping Fee Calculation**:
   - Verify that customer checkout (`POST /api/v1/checkout`) continues to correctly match customer address to active shipping zones and compute shipping costs without errors.

2. **Customer Order Status Workflow**:
   - Verify that when an admin creates a shipment or updates shipment status to `delivered`, customer order statuses (`shipped`, `delivered`) transition seamlessly without corrupting order history.

3. **Background Notification Triggers**:
   - Verify that customer email & push notification events trigger upon shipment AWB assignment and status transitions (`shipped`, `out_for_delivery`, `delivered`).

4. **Database Integrity & Cascades**:
   - Verify that soft-deleting or archiving shipping zones does NOT cascade delete historical shipped orders or corrupt historical financial reports.
