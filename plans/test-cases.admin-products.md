# Test Cases: Frontend Auth Hook Import Fix

**Module Name:** Admin Auth Module  
**Module ID:** 23  
**Test File:** `plans/test-cases.admin-products.md`  

---

## 1. Auth Import Test Scenarios

### TC-AUTH-001: Admin Login Page Load & Authentication Execution
- **Preconditions**: Open browser at `/admin/login`.
- **Input**: Inspect browser console.
- **Expected Result**: Page renders cleanly without `ReferenceError: useAuth is not defined` console errors, and admin login executes properly.
