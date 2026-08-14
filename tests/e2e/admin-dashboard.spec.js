import { test, expect } from '@playwright/test';

test.describe('Admin Executive Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');

        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('12345678');

        // Set up API response waiters before triggering login navigation
        const kpiPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/kpis') && res.status() === 200);
        const chartPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart') && res.status() === 200);
        const statsPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/order-stats') && res.status() === 200);
        const topPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/top-performers') && res.status() === 200);
        const highlightsPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/highlights') && res.status() === 200);

        await page.locator('button[type="submit"]').click();
        await page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 });

        // Wait for all 5 dashboard API responses to resolve successfully
        await Promise.all([kpiPromise, chartPromise, statsPromise, topPromise, highlightsPromise]);
        await expect(page.locator('h2.page-header-title')).toHaveText('Executive Dashboard');
    });

    test('should display page title, subtitle, and refresh button', async ({ page }) => {
        await expect(page.locator('h2.page-header-title')).toHaveText('Executive Dashboard');
        await expect(page.getByText('Real-time store metrics, sales analytics, and operational alerts')).toBeVisible();

        const refreshBtn = page.locator('button:has-text("Refresh Data")');
        await expect(refreshBtn).toBeVisible();
    });

    test('should render all primary and secondary KPI metric cards', async ({ page }) => {
        await expect(page.getByText('Total Revenue', { exact: true })).toBeVisible();
        await expect(page.getByText("Today's Revenue", { exact: true })).toBeVisible();
        await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
        await expect(page.getByText('Low Stock Alerts', { exact: true })).toBeVisible();

        await expect(page.getByText('Total Customers', { exact: true })).toBeVisible();
        await expect(page.getByText('Delivered Orders', { exact: true })).toBeVisible();
        await expect(page.getByText('Pending Returns / Refunds', { exact: true })).toBeVisible();
        await expect(page.getByText('Total Active Products', { exact: true })).toBeVisible();
    });

    test('should filter sales analytics by time period dropdown and wait for API response', async ({ page }) => {
        const periodSelect = page.locator('select.form-select');
        await expect(periodSelect).toBeVisible();
        await expect(periodSelect).toHaveValue('last_30_days');

        // Select "Last 7 Days" & wait for sales-chart API response
        const chart7DaysPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart?period=last_7_days') && res.status() === 200);
        await periodSelect.selectOption('last_7_days');
        await chart7DaysPromise;
        await expect(periodSelect).toHaveValue('last_7_days');

        // Select "This Month" & wait for sales-chart API response
        const chartThisMonthPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart?period=this_month') && res.status() === 200);
        await periodSelect.selectOption('this_month');
        await chartThisMonthPromise;
        await expect(periodSelect).toHaveValue('this_month');
    });

    test('should render Order Breakdown, Top Selling Products, and Low Stock Alert panels', async ({ page }) => {
        await expect(page.getByText('Sales Revenue Analytics')).toBeVisible();
        await expect(page.getByText('Order Status Breakdown')).toBeVisible();

        await expect(page.getByText('Top Selling Products')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Units Sold' })).toBeVisible();

        await expect(page.getByText('Low Stock Alert Panel')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Available Qty' })).toBeVisible();
    });

    test('should refetch dashboard data when clicking Refresh Data button and wait for API responses', async ({ page }) => {
        const refreshBtn = page.locator('button:has-text("Refresh Data")');
        await expect(refreshBtn).toBeVisible();

        const kpiPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/kpis') && res.status() === 200);
        const chartPromise = page.waitForResponse((res) => res.url().includes('/api/v1/admin/dashboard/sales-chart') && res.status() === 200);

        await refreshBtn.click();
        await Promise.all([kpiPromise, chartPromise]);

        await expect(page.locator('h2.page-header-title')).toHaveText('Executive Dashboard');
    });
});
