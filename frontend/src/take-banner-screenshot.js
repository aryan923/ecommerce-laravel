const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000/products...');
  await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const screenshotPath = 'C:/Users/Acer/.gemini/antigravity-ide/brain/7ff164d6-1596-4ff4-bf83-af378fd88a56/luxury_banner_redesign.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to:', screenshotPath);
  
  await browser.close();
})();
