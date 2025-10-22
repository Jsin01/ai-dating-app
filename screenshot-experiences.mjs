import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 14 Pro'],
    locale: 'en-US',
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Wait for the app to load
    await page.waitForSelector('text=Experiences', { timeout: 5000 });

    // Click the Experiences tab
    await page.click('text=Experiences');

    // Wait for the experiences content to load
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/experiences-marketplace.png', fullPage: true });

    console.log('Screenshot saved to /tmp/experiences-marketplace.png');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
