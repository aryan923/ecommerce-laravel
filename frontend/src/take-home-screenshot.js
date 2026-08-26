const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const screenshotPath = 'C:/Users/Acer/.gemini/antigravity-ide/brain/7ff164d6-1596-4ff4-bf83-af378fd88a56/home_products_fix.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Home screenshot saved to:', screenshotPath);
  
  await browser.close();
})();
