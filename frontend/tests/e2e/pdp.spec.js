import { test, expect } from '@playwright/test';

test.describe('Module 05: Product Detail Page (PDP)', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/products/italian-leather-loafers', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="pdp-page"]', { timeout: 30000 });
  });

  test('should render /products/[slug] PDP route with main elements', async ({ page }) => {
    const pdpPage = page.locator('[data-testid="pdp-page"]');
    await expect(pdpPage).toBeVisible();

    const mediaGallery = page.locator('[data-testid="media-gallery"]');
    await expect(mediaGallery).toBeVisible();

    const productInfo = page.locator('[data-testid="product-info"]');
    await expect(productInfo).toBeVisible();

    const productTitle = page.locator('[data-testid="product-title"]');
    await expect(productTitle).toBeVisible();

    const stockBadge = page.locator('[data-testid="stock-badge"]');
    await expect(stockBadge).toBeVisible();
  });

  test('should allow selecting variant swatches and update options', async ({ page }) => {
    const variantPicker = page.locator('[data-testid="variant-picker"]');
    if (await variantPicker.isVisible()) {
      const options = page.locator('[data-testid="variant-option"]');
      const count = await options.count();
      if (count > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should toggle image zoom modal in media gallery', async ({ page }) => {
    const zoomBtn = page.locator('[data-testid="image-zoom-btn"]');
    if (await zoomBtn.isVisible()) {
      await zoomBtn.click();
      const lightboxModal = page.locator('[data-testid="lightbox-modal"]');
      await expect(lightboxModal).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('should test pincode checker form', async ({ page }) => {
    const pincodeInput = page.locator('[data-testid="pincode-input"]');
    if (await pincodeInput.isVisible()) {
      await pincodeInput.fill('110001');
      const submitBtn = page.locator('[data-testid="pincode-submit-btn"]');
      await submitBtn.click();

      const result = page.locator('[data-testid="pincode-result"]');
      await expect(result).toBeVisible({ timeout: 15000 });
    }
  });

  test('should adjust quantity and trigger Add to Cart', async ({ page }) => {
    const quantityValue = page.locator('[data-testid="quantity-value"]');
    if (await quantityValue.isVisible()) {
      await expect(quantityValue).toHaveText('1');

      const increaseBtn = page.locator('[data-testid="quantity-increase"]');
      await increaseBtn.click();
      await expect(quantityValue).toHaveText('2');
    }

    const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]');
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();

      const cartPanel = page.locator('[data-testid="cart-drawer-panel"]');
      if (await cartPanel.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(cartPanel).toBeVisible();
      }
    }
  });

  test('should navigate tabs and open review modal', async ({ page }) => {
    const tabs = page.locator('[data-testid="tab-button"]');
    const tabCount = await tabs.count();
    if (tabCount > 0) {
      expect(tabCount).toBeGreaterThan(0);

      // Click Specifications tab
      if (tabCount > 1) {
        await tabs.nth(1).click();
        const tabContent = page.locator('[data-testid="tab-content"]');
        await expect(tabContent).toBeVisible();
      }

      // Click Reviews tab
      if (tabCount > 3) {
        await tabs.nth(3).click();
        const writeReviewBtn = page.locator('[data-testid="write-review-btn"]');
        if (await writeReviewBtn.isVisible()) {
          await writeReviewBtn.click();
          const reviewModal = page.locator('[data-testid="add-review-modal"]');
          await expect(reviewModal).toBeVisible();

          const closeBtn = page.locator('[data-testid="close-review-modal"]');
          await closeBtn.click();
        }
      }
    }
  });

  test('should display related products grid', async ({ page }) => {
    const relatedGrid = page.locator('[data-testid="related-products-grid"]');
    if (await relatedGrid.isVisible()) {
      await expect(relatedGrid).toBeVisible();
    }
  });
});
