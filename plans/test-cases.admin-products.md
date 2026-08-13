# Test Cases: Database Seeder Cleanup & Command Removal

**Module Name:** Database Seeder Module  
**Module ID:** 23  
**Test File:** `plans/test-cases.admin-products.md`  

---

## 1. Seeder Test Scenarios

### TC-SEED-001: RBAC Seeder Execution & Clean Fresh Database Seeding
- **Preconditions**: Run fresh database migration and seeder.
- **Input**: Run `php artisan db:seed`.
- **Expected Result**: Seeder executes cleanly, creating system permissions, roles (`super_admin`, `store_manager`, `order_manager`, `product_manager`), and Super Admin user (`admin@example.com`), without generating dummy products, categories, or orders.
