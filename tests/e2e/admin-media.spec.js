import { test, expect } from '@playwright/test';

test.describe('Admin Media Library Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');

        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 })
        ]);
    });

    test('should navigate to Media Asset Library and manage media assets', async ({ page }) => {
        await page.goto('/admin/media');

        // Header Title & Subtitle
        await expect(page.locator('h2.page-header-title')).toHaveText('Media Asset Library');

        // Top Action Buttons
        await expect(page.getByText('Refresh', { exact: true })).toBeVisible();
        await expect(page.getByText('Purge Orphaned', { exact: true })).toBeVisible();
        await expect(page.getByText('Upload Media', { exact: true })).toBeVisible();

        // 4 KPI Summary Stat Cards
        await expect(page.getByText('Total Media Assets', { exact: true })).toBeVisible();
        await expect(page.getByText('Image Files', { exact: true })).toBeVisible();
        await expect(page.getByText('Documents / Files', { exact: true })).toBeVisible();
        await expect(page.getByText('Unattached / Orphaned', { exact: true })).toBeVisible();

        // Open Upload Modal
        await page.getByText('Upload Media', { exact: true }).click();
        await expect(page.getByText('Upload Media Files', { exact: true })).toBeVisible();
        await expect(page.getByText('Drag and drop files here', { exact: true })).toBeVisible();
        await page.getByText('Cancel', { exact: true }).click();

        // Open Purge Orphaned Modal
        await page.getByText('Purge Orphaned', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Purge Orphaned Media' })).toBeVisible();
        await page.getByText('Cancel', { exact: true }).click();
    });
});
