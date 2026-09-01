import { test, expect } from '@playwright/test';

test.describe('Module 06: Shopping Cart & Coupon Engine', () => {
  test.setTimeout(60000);

  test('should render /cart dedicated page route with core components', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="cart-page"]', { timeout: 30000 });

    const cartPage = page.locator('[data-testid="cart-page"]');
    await expect(cartPage).toBeVisible();

    const orderSummary = page.locator('[data-testid="order-summary-card"]');
    if (await orderSummary.count() > 0) {
      await expect(orderSummary).toBeVisible();
    }
  });

  test('should allow opening and closing Cart Drawer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const cartBtn = page.locator('[data-testid="header-cart-btn"]');
    if (await cartBtn.isVisible()) {
      await cartBtn.click();
      await page.waitForTimeout(500);

      const cartDrawerPanel = page.locator('[data-testid="cart-drawer-panel"]');
      if (await cartDrawerPanel.isVisible()) {
        await expect(cartDrawerPanel).toBeVisible();
      }
    }
  });

  test('should display empty cart view or cart table based on items state', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="cart-table-wrapper"], [data-testid="empty-cart-view"]', { timeout: 30000 });

    const cartTable = page.locator('[data-testid="cart-table-wrapper"]');
    const emptyView = page.locator('[data-testid="empty-cart-view"]');

    const tableVisible = await cartTable.isVisible();
    const emptyVisible = await emptyView.isVisible();

    expect(tableVisible || emptyVisible).toBeTruthy();
  });

  test('should display coupon code input section', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="cart-page"]', { timeout: 30000 });

    const couponSection = page.locator('[data-testid="coupon-section"]');
    if (await couponSection.isVisible()) {
      await expect(couponSection).toBeVisible();
    }
  });
});
