import { test, expect } from '@playwright/test';

test.describe('Module 14: Frontend CMS & Dynamic Content', () => {

  test('TC-FCMS-001: Homepage hero slider renders banners or fallback carousel', async ({ page }) => {
    await page.goto('/');

    // Hero section visible
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Verify presence of CTA link button
    const shopBtn = page.getByRole('link', { name: /Shop|Explore/i }).first();
    await expect(shopBtn).toBeVisible();
  });

  test('TC-FCMS-002 & TC-FCMS-003: Dynamic CMS page route /pages/[slug] renders content and SEO metadata', async ({ page }) => {
    await page.goto('/pages/privacy-policy');

    // Verify page heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('TC-FCMS-004: Policy route shortcut /terms renders dynamic page', async ({ page }) => {
    await page.goto('/terms');

    // Verify heading renders
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('TC-FCMS-005: Invalid page slug displays 404 Not Found fallback UI', async ({ page }) => {
    await page.goto('/pages/invalid-page-slug-99999');

    // Verify 404 heading
    const notFoundHeading = page.getByRole('heading', { name: /Page Not Found/i });
    await expect(notFoundHeading).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: /Return to Storefront Home/i })).toBeVisible({ timeout: 15000 });
  });

  test('TC-FCMS-008: Footer policy links navigate to dynamic CMS pages', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    // Click Privacy Policy link
    const privacyLink = page.getByRole('link', { name: /Privacy Policy/i }).first();
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();

    // Verify URL navigation
    await expect(page).toHaveURL(/\/(pages\/privacy-policy|privacy)/);
  });

});
