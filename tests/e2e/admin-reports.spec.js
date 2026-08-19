import { test, expect } from '@playwright/test';

test.describe('Admin Reports & Analytics Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');

        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 })
        ]);
    });

    test('should navigate to Reports & Analytics and switch metric tabs', async ({ page }) => {
        await page.goto('/admin/reports');

        // Header Title
        await expect(page.locator('h2.page-header-title')).toHaveText('Executive Reports & Analytics');

        // Top Action Buttons
        await expect(page.getByText('Export Report', { exact: true })).toBeVisible();
        await expect(page.getByText('Refresh', { exact: true })).toBeVisible();

        // 6 Navigation Tabs
        await expect(page.getByText('Sales Report', { exact: true })).toBeVisible();
        await expect(page.getByText('Order Status', { exact: true })).toBeVisible();
        await expect(page.getByText('Product Performance', { exact: true })).toBeVisible();
        await expect(page.getByText('Customer Analytics', { exact: true })).toBeVisible();
        await expect(page.getByText('Inventory Movements', { exact: true })).toBeVisible();
        await expect(page.getByText('Tax Breakdown', { exact: true })).toBeVisible();

        // Switch to Order Status Report Tab
        await page.getByText('Order Status', { exact: true }).click();
        await expect(page.getByText('Order Status Breakdown & Distribution', { exact: true })).toBeVisible();

        // Switch to Customer Analytics Tab
        await page.getByText('Customer Analytics', { exact: true }).click();
        await expect(page.getByText('Top Lifetime Spend Customers', { exact: true })).toBeVisible();

        // Open Export Modal
        await page.getByText('Export Report', { exact: true }).click();
        await expect(page.getByText('File Format Selection', { exact: true })).toBeVisible();
        await page.getByText('Cancel', { exact: true }).click();
    });
});
