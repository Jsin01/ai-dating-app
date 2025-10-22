import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate directly to the glimpse viewer page
  await page.goto('http://localhost:3000/glimpse/glimpse_1761095750323_28cc1gz');
  await page.waitForTimeout(3000);

  // Click Play button if visible
  try {
    const playButton = await page.locator('button:has-text("View Glimpse")');
    if (await playButton.isVisible({ timeout: 2000 })) {
      await playButton.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log('No play button or already playing');
  }

  // Take screenshot
  await page.screenshot({
    path: '/Users/Jason/Screenshots/glimpse-image-viewer.png',
    fullPage: true
  });

  console.log('Screenshot saved to /Users/Jason/Screenshots/glimpse-image-viewer.png');

  await browser.close();
})();
