# Regression Test Matrix: Admin CMS / Banners / Pages (Module 35)

## 1. Overview
This document outlines system regression risks and verification checklists for Module 35 (Admin CMS / Banners / Pages). Introducing content management and marketing banners impacts storefront landing pages, footer navigation, policy links, SEO routing, and administrative access control.

---

## 2. Affected System Components

- **Storefront Homepage**: Hero banner carousel (`/api/v1/banners?placement=home_hero`).
- **Storefront Category Pages**: Header promo banners (`/api/v1/banners?placement=category_banner`).
- **Storefront Footer & Nav Links**: Policy links (About Us, Terms, Privacy, Returns, FAQs) pointing to dynamic CMS pages (`/pages/{slug}`).
- **SEO & Meta Routing**: Meta title and meta description tags rendered from dynamic CMS pages.
- **Role-Based Access Control (RBAC)**: Permission gates (`banners.*`, `pages.*`) across staff roles.
- **Audit Logging**: Audit log entries recorded upon content updates.

---

## 3. Regression Test Checklist

| Scenario ID | Affected Component | Regression Test Procedure | Expected Result | Risk Level |
|---|---|---|---|---|
| **REG-CMS-001** | Homepage Hero Carousel | Load storefront homepage with active scheduled banners | Hero banner carousel renders correct images, CTA links, and button labels in sort order | High |
| **REG-CMS-002** | Footer Policy Links | Click "Privacy Policy" or "Terms & Conditions" links in footer | Directs to `/pages/privacy-policy`, rendering sanitized HTML content and updated SEO tags | High |
| **REG-CMS-003** | Router Slug Conflicts | Create a page with slug identical to an existing frontend route (e.g., `products`, `cart`) | Page creation is blocked by reserved slug validation | Medium |
| **REG-CMS-004** | Storefront Banner Performance | Execute `GET /api/v1/banners` with 50+ database records | Query executes efficiently using indexed `(placement, is_active, sort_order)` composite index | Medium |
| **REG-CMS-005** | Admin RBAC Isolation | Log in as Store Staff role without CMS edit permissions | CMS & Banner menu items hidden or restricted with 403 on API call | High |
| **REG-CMS-006** | XSS Script Prevention | Create CMS page containing malicious `<script>alert('xss')</script>` in content | HTML sanitizer scrubs script tags; page renders safely without script execution | High |
| **REG-CMS-007** | Cache Invalidation | Update an active banner or published CMS page | Cache is purged/updated; storefront displays updated banner/page immediately | Medium |

---

## 4. Smoke Verification Suite

Before marking Module 35 complete, run the following smoke tests:
1. `php artisan test --filter=CmsManagementTest`
2. Verify public `GET /api/v1/banners` returns 200 OK.
3. Verify public `GET /api/v1/pages/about-us` returns 200 OK with valid page content.
4. Verify admin `GET /api/v1/admin/banners` and `GET /api/v1/admin/pages` return expected datasets for authorized admin users.
