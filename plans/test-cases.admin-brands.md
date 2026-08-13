# Test Cases: Brand Management Module (/admin/brands)

**Module Name:** Brand Management Module  
**Module ID:** 25  
**Test File:** `plans/test-cases.admin-brands.md`  

---

## 1. Responsiveness & Centralized Image Upload Test Scenarios

### TC-BRD-RESP-001: Mobile Search Toolbar Stacking
- **Preconditions**: Open `/admin/brands` on a 375px mobile screen.
- **Expected Result**: Search input and search button stack 100% width cleanly.

### TC-BRD-MEDIA-001: Brand Logo Image Selection via Centralized Media Library
- **Preconditions**: Open `BrandFormModal`.
- **Input**: Click "Select from Media Library" button for Brand Logo. Select a logo asset from `MediaLibraryModal`.
- **Expected Result**: `logo_url` field is populated, logo preview updates instantly, and saving updates brand logo.
