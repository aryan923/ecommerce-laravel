# Test Cases: Frontend Public Order Tracking & Information Pages

**Module Name:** Frontend Public Order Tracking & Information Pages  
**Module ID:** 11 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-tracking.md`  
**Specification:** `frontend/specifications/feature.frontend-tracking.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/tracking.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 11: Public Order Tracking & Information Pages**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-TRK-001** | Tracking Form Blank Validation | Verify submitting blank form displays validation error | Form prevents API call and highlights required input field |
| **TC-TRK-002** | Valid Tracking Lookup | Verify entering valid tracking number fetches shipment details | Displays shipment summary card, carrier details, and estimated delivery |
| **TC-TRK-003** | Shipment Timeline Step Render | Verify 5-step visual timeline renders completed/pending states | Completed steps render checkmarks; active step highlights correctly |
| **TC-TRK-004** | Activity Checkpoints Display | Verify chronological location logs render accurately | Activity log table lists timestamps, location hubs, and status updates |
| **TC-TRK-005** | Invalid Tracking Number Error | Verify entering non-existent tracking code renders 404 message | Error alert box displays "No shipment found matching tracking number" |
| **TC-TRK-006** | Direct URL Query Lookup | Access `/track-order?tracking_number=TRK-9823471029` directly | Automatically triggers search and renders tracking results on page load |
| **TC-TRK-007** | About Us Page Render | Verify `/about` route renders company mission, metrics, and team | Page title, statistics grid, values cards, and team section render cleanly |
| **TC-TRK-008** | Contact Us Form Submission | Verify submitting contact inquiry form updates UI | Form validates input, submits payload, and displays success banner |
| **TC-TRK-009** | FAQ Accordion Expand/Collapse | Verify clicking FAQ questions toggles answer visibility | Answer panel expands on click and collapses on secondary click |
| **TC-TRK-010** | Shipping Policy Page Render | Verify `/shipping-policy` route renders policy sections | Renders delivery timeframes table, courier list, and shipping rate rules |
| **TC-TRK-011** | Terms & Privacy Pages Render | Verify `/terms` and `/privacy` legal pages render content | Pages display valid legal headings, text sections, and footer links |
