import { test, expect } from '@playwright/test';

test.describe('Admin Review Moderation & Enhancements Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');

        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 })
        ]);
    });

    test('should navigate to Review Moderation page and render page title, KPI cards, and new enhancement features', async ({ page }) => {
        await page.goto('/admin/reviews');

        // Header Title & Actions
        await expect(page.locator('h2.page-header-title')).toHaveText('Review Moderation & Feedback');
        await expect(page.getByText('Export CSV', { exact: true })).toBeVisible();
        await expect(page.getByText('Rating Distribution', { exact: true })).toBeVisible();

        // Metric Cards
        await expect(page.getByText('Total Reviews', { exact: true })).toBeVisible();
        await expect(page.getByText('Pending Approval', { exact: true })).toBeVisible();
        await expect(page.getByText('Approved Reviews', { exact: true })).toBeVisible();
        await expect(page.getByText('Average Rating', { exact: true })).toBeVisible();

        // Tabs (including Flagged tab)
        await expect(page.locator('button', { hasText: 'All Reviews' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Pending Moderation' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Flagged / Spam' })).toBeVisible();

        // Click Rating Distribution toggle
        await page.getByText('Rating Distribution', { exact: true }).click();
        await expect(page.getByText('Star Rating Breakdown & Store Health', { exact: true })).toBeVisible();
        await expect(page.getByText('5 Stars', { exact: true })).toBeVisible();
    });
});
