# Test Cases: Category Management Module (/admin/categories)

**Module Name:** Category Management Module  
**Module ID:** 24  
**Test File:** `plans/test-cases.admin-categories.md`  

---

## 1. Centralized Image Upload Test Scenarios

### TC-CAT-MEDIA-001: Category Image Thumbnail Selection via Centralized Media Library
- **Preconditions**: Open `CategoryFormModal`.
- **Input**: Click "Select from Media Library" button for Image Thumbnail. Select an image asset from `MediaLibraryModal`.
- **Expected Result**: `image_url` field is populated, image preview updates instantly, and saving updates category thumbnail.

### TC-CAT-MEDIA-002: Category Banner Image Selection via Centralized Media Library
- **Preconditions**: Open `CategoryFormModal`.
- **Input**: Click "Select from Media Library" button for Banner Image. Select a banner asset from `MediaLibraryModal`.
- **Expected Result**: `banner_url` field is populated, banner preview updates instantly, and saving updates category banner.
