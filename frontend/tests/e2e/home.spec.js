import { test, expect } from '@playwright/test';

test.describe('Module 03: Home Page Storefront', () => {
  test.setTimeout(60000);
  test('should render HeroSlider with title and CTA buttons', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText(/(Discover|Elevate)/);

    const primaryCta = page.getByRole('link', { name: 'Shop New Arrivals' });
    await expect(primaryCta).toBeVisible();
  });

  test('should render CategoryBanners section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const heading = page.getByText('Explore Our Collections');
    await expect(heading).toBeVisible();

    const fashionCard = page.getByText('Fashion').first();
    await expect(fashionCard).toBeVisible();
  });

  test('should render ProductSection and switch tabs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const sectionTitle = page.getByText('Curated For You').first();
    await expect(sectionTitle).toBeVisible();

    const newArrivalsTab = page.getByRole('button', { name: 'New Arrivals' });
    await expect(newArrivalsTab).toBeVisible();
    await newArrivalsTab.click();

    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should trigger Add to Cart from ProductCard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const addToCartBtn = page.locator('[data-testid="product-card"]').first().getByRole('button', { name: 'Add to Cart' });
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click({ force: true });

    const cartPanel = page.locator('[data-testid="cart-drawer-panel"]');
    await expect(cartPanel).toBeVisible({ timeout: 10000 });
  });

  test('should render PromoBanner with offer code', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const promoHeading = page.getByText('Elevate Your Everyday');
    await expect(promoHeading).toBeVisible();
    await expect(page.getByText('WELCOME20')).toBeVisible();
  });

  test('should render TrustBadges section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const fastDelivery = page.getByText('Fast Delivery');
    await expect(fastDelivery).toBeVisible();
  });
});
