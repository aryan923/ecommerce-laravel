const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // Click on Categories button in header
  const categoryBtn = page.locator('button:has-text("Categories")');
  if (await categoryBtn.isVisible()) {
    console.log('Clicking Categories header menu...');
    await categoryBtn.click();
    await page.waitForTimeout(1000);
  }
  
  const screenshotPath = 'C:/Users/Acer/.gemini/antigravity-ide/brain/7ff164d6-1596-4ff4-bf83-af378fd88a56/category_menu_redesign.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Category menu screenshot saved to:', screenshotPath);
  
  await browser.close();
})();
