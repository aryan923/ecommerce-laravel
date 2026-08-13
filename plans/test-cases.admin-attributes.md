# Test Cases: Attribute & Variant Management Module (/admin/attributes)

**Module Name:** Attribute & Variant Management Module  
**Module ID:** 26  
**Test File:** `plans/test-cases.admin-attributes.md`  

---

## 1. Responsiveness & Value Listing Test Scenarios

### TC-ATT-LIST-001: Attribute Values Listing & Saving
- **Preconditions**: Open `/admin/attributes`.
- **Input**: Add a new option value (e.g. "XL" to Size attribute).
- **Expected Result**: Value is saved to database and rendered instantly as a pill badge under the attribute card.

### TC-ATT-RESP-001: Attribute Card Grid Responsiveness
- **Preconditions**: Open `/admin/attributes` on a mobile viewport (< 576px).
- **Expected Result**: Attribute cards grid collapses to a clean 1-column stacked layout.
