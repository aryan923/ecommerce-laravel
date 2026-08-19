# Test Cases: Module 36 — Admin Media Library

## 1. Test Suite Summary
**Module Name**: Module 36 — Admin Media Library  
**Layer**: Backend REST API & Frontend React SPA  
**Specification Reference**: `specifications/feature.admin-media.spec.md`  

---

## 2. Test Cases Matrix

| Test ID | Domain | Category | Scenario | Expected Outcome |
|---|---|---|---|---|
| TC-MED-001 | Auth | Security | Unauthenticated request to `/api/v1/admin/media` | HTTP 401 Unauthorized |
| TC-MED-002 | Media List | API | GET `/api/v1/admin/media` with pagination & search filter | HTTP 200 with paginated media records matching search query |
| TC-MED-003 | Media Upload | API | POST `/api/v1/admin/media/upload` with valid image file | HTTP 201 Created with media record, URL, and metadata |
| TC-MED-004 | Batch Upload | API | POST `/api/v1/admin/media/upload` with multiple files | HTTP 201 Created returning array of created media assets |
| TC-MED-005 | Detail Fetch | API | GET `/api/v1/admin/media/{id}` for valid media ID | HTTP 200 with single media asset metadata |
| TC-MED-006 | Attach Media | API | POST `/api/v1/admin/media/attach` to attach media to product | HTTP 200 with updated attachment binding |
| TC-MED-007 | Detach Media | API | POST `/api/v1/admin/media/detach` to unbind media from model | HTTP 200 with detached status |
| TC-MED-008 | Metadata Update | API | PUT `/api/v1/admin/media/{id}` with alt text & asset type | HTTP 200 with updated alt text and type attributes |
| TC-MED-009 | Delete Protection | API / Safety | DELETE `/api/v1/admin/media/{id}` on attached asset without force flag | HTTP 422 Unprocessable Entity with safety warning message |
| TC-MED-010 | Force Delete | API / File | DELETE `/api/v1/admin/media/{id}?force=1` | HTTP 200, record removed from DB & file deleted from storage |
| TC-MED-011 | Purge Unused | API / Batch | DELETE `/api/v1/admin/media/unused?older_than_days=1` | HTTP 200 returning `purged_count` of orphaned files deleted |
| TC-MED-012 | SPA E2E | Playwright | Admin logs in, navigates to Media page, filters by image, uploads file, copies URL, deletes unused media | Page title, stat cards, grid render; upload drawer operates, URL copied to clipboard |
