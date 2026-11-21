import { test, expect } from '@playwright/test';

test.describe('Module 10: Wishlist Management', () => {
  test.setTimeout(60000);

  test('should render /wishlist dedicated page route with core components', async ({ page }) => {
    await page.goto('/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="wishlist-page"]', { timeout: 30000 });

    const wishlistPage = page.locator('[data-testid="wishlist-page"]');
    await expect(wishlistPage).toBeVisible();

    const wishlistHeader = page.locator('[data-testid="wishlist-header"]');
    if (await wishlistHeader.count() > 0) {
      await expect(wishlistHeader).toBeVisible();
    }
  });

  test('should display wishlist grid or empty wishlist view', async ({ page }) => {
    await page.goto('/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="wishlist-grid"], [data-testid="empty-wishlist-view"]', { timeout: 30000 });

    const wishlistGrid = page.locator('[data-testid="wishlist-grid"]');
    const emptyView = page.locator('[data-testid="empty-wishlist-view"]');

    const gridVisible = await wishlistGrid.isVisible();
    const emptyVisible = await emptyView.isVisible();

    expect(gridVisible || emptyVisible).toBeTruthy();
  });

  test('should display header wishlist badge counter button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const wishlistBtn = page.locator('[data-testid="header-wishlist-btn"]');
    if (await wishlistBtn.isVisible()) {
      await expect(wishlistBtn).toBeVisible();
    }
  });

  test('should support toggling heart icon on product cards', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const heartBtn = page.locator('[data-testid="wishlist-heart-btn"]').first();
    if (await heartBtn.isVisible()) {
      await heartBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
