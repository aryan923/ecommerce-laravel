# Test Cases: Frontend Home Page Storefront

**Module Name:** Frontend Home Page Storefront  
**Module ID:** 03 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-home.md`  
**Specification:** `frontend/specifications/feature.frontend-home.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/home.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 03**. Tests will be executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-HOM-001** | Hero Slider Render & Navigation | Verify HeroSlider renders banners and slide CTAs | Banner title, subtitle, and "Shop Now" CTA are visible |
| **TC-HOM-002** | Trust Badges Section Render | Verify TrustBadges displays 4 value icons | Badges for Free Shipping, Secure Payment, Returns, Support exist |
| **TC-HOM-003** | Category Banners Grid Fetch | Verify CategoryBanners renders categories from API | Grid cards display category titles and image containers |
| **TC-HOM-004** | Product Section Tab Switching | Verify switching tabs (Featured / New / Best) updates grid | Clicking "New Arrivals" fetches and displays latest products |
| **TC-HOM-005** | Product Card Add to Cart Action | Verify clicking "Add to Cart" on a ProductCard updates cart | Cart item count increases and CartDrawer opens |
| **TC-HOM-006** | Promo Banner Coupon Render | Verify PromoBanner displays coupon code and claim CTA | Promotional banner renders discount code badge |
| **TC-HOM-007** | Brand Grid Showcase Fetch | Verify BrandGrid displays brand logos from API | Brand logo grid renders brand items fetched from backend |
