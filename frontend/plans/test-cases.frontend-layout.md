# Test Cases: Frontend Global Navigation & Layout

**Module Name:** Frontend Global Navigation & Layout  
**Module ID:** 02 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-layout.md`  
**Specification:** `frontend/specifications/feature.frontend-layout.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/layout.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 02**. Tests will be executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-LAY-001** | Header Render & Brand Logo Link | Verify Header renders logo linking to `/` | Logo is visible and links to home page |
| **TC-LAY-002** | Category Menu Fetch & Render | Verify CategoryMenu displays categories from API | Category dropdown renders items fetched from `GET /api/v1/categories` |
| **TC-LAY-003** | Live Search Auto-Suggest | Verify typing query in search bar shows auto-suggest popup | Search dropdown opens with matching product results |
| **TC-LAY-004** | Currency Switcher Dropdown | Verify selecting currency updates active currency symbol | Prices format using selected currency symbol |
| **TC-LAY-005** | Cart Drawer Toggle | Verify clicking Cart button opens slide-over CartDrawer | CartDrawer opens showing items or empty state |
| **TC-LAY-006** | Account Dropdown Render | Verify Account dropdown shows login link or user name | Sign In link for guests, profile links for authenticated users |
| **TC-LAY-007** | Footer Links Render | Verify Footer displays quick links, policy links, and newsletter | Footer renders all section links and subscription input |
| **TC-LAY-008** | Mobile Navigation Bar Render | Verify MobileNav is visible on mobile viewports (`< 768px`) | Fixed bottom bar renders on mobile viewport size |
