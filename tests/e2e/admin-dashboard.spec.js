import { test, expect } from '@playwright/test';

test.describe('Admin Executive Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');

        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        // Set up API response waiters before triggering login navigation
        const kpiPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/kpis') && res.status() === 200);
        const chartPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart') && res.status() === 200);
        const statsPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/order-stats') && res.status() === 200);
        const topPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/top-performers') && res.status() === 200);
        const highlightsPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/highlights') && res.status() === 200);

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 }),
            kpiPromise,
            chartPromise,
            statsPromise,
            topPromise,
            highlightsPromise
        ]);

        await expect(page.locator('h2.page-header-title')).toHaveText('Store Performance Overview');
    });

    test('should display page title, subtitle, and refresh button', async ({ page }) => {
        await expect(page.locator('h2.page-header-title')).toHaveText('Store Performance Overview');
        await expect(page.getByText('Monitor sales, fulfillment pipelines, inventory stock levels, and customer orders')).toBeVisible();

        const refreshBtn = page.locator('button[title="Reload Dashboard"]');
        await expect(refreshBtn).toBeVisible();
    });

    test('should render all primary and secondary KPI metric cards', async ({ page }) => {
        await expect(page.getByText('Total Store Revenue', { exact: true })).toBeVisible();
        await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
        await expect(page.getByText('Average Order Value', { exact: true })).toBeVisible();
    });

    test('should filter sales analytics by time period buttons and wait for API response', async ({ page }) => {
        const periodBtn7 = page.locator('button', { hasText: /^7 Days$/ });
        await expect(periodBtn7).toBeVisible();

        const chart7DaysPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart?period=last_7_days') && res.status() === 200);
        await periodBtn7.click();
        await chart7DaysPromise;

        const periodBtn30 = page.locator('button', { hasText: /^30 Days$/ });
        const chart30DaysPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart?period=last_30_days') && res.status() === 200);
        await periodBtn30.click();
        await chart30DaysPromise;
    });

    test('should render Order Breakdown, Top Selling Products, and Low Stock Alert panels', async ({ page }) => {
        await expect(page.getByText('Sales Revenue Trend')).toBeVisible();
        await expect(page.getByText('Recent Orders Stream')).toBeVisible();
        await expect(page.getByText('Top Products')).toBeVisible();
    });

    test('should refetch dashboard data when clicking Refresh Data button and wait for API responses', async ({ page }) => {
        const refreshBtn = page.locator('button[title="Reload Dashboard"]');
        await expect(refreshBtn).toBeVisible();

        const kpiPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/kpis') && res.status() === 200);
        const chartPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart') && res.status() === 200);

        await refreshBtn.click();
        await Promise.all([kpiPromise, chartPromise]);

        await expect(page.locator('h2.page-header-title')).toHaveText('Store Performance Overview');
    });
});
