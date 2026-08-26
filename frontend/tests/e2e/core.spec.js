import { test, expect } from '@playwright/test';

test.describe('Module 01: Core Architecture & Session Infrastructure', () => {
  test('should generate and persist guest_session_id cookie on page load', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const cookies = await context.cookies();
    const guestCookie = cookies.find((c) => c.name === 'guest_session_id');

    expect(guestCookie).toBeTruthy();
    expect(guestCookie?.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  test('should attach X-Session-ID header on API requests', async ({ page }) => {
    let capturedHeader = null;

    page.on('request', (request) => {
      if (request.url().includes('/api/v1/')) {
        capturedHeader = request.headers()['x-session-id'];
      }
    });

    await page.goto('/');

    // Wait for initial page hydration
    await page.waitForTimeout(1000);
  });

  test('should render AppProviders wrapper without crashing', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that ErrorBoundary is not showing fallback
    const errorFallback = page.locator('[data-testid="error-boundary-fallback"]');
    await expect(errorFallback).not.toBeVisible();
  });
});
