# Implementation Plan: Media Preview URL Resolution Fix

**Module Name:** Media Management Module  
**Module ID:** 23  
**Plan File:** `plans/plan.admin-products.md`  
**Specification File:** `specifications/feature.admin-products.spec.md`  
**Target Completion:** Single-Session Implementation  

---

## 1. Goal Description

Ensure media previews load 100% reliably by adding a relative storage URL accessor in `Media.php`, updating `MediaService.php`, and adding URL formatting helper in `MediaLibraryModal.jsx`.

---

## 2. Task Breakdown Checklist

- [ ] **Task 1: Add `getUrlAttribute` Accessor in `Media.php` & Update `MediaService.php`** (Normalize storage URLs to relative `/storage/...`)
- [ ] **Task 2: Update `MediaLibraryModal.jsx` to Format Preview Image Sources**
- [ ] **Task 3: Production Asset Build & Verification** (`cmd /c npm run build`)
