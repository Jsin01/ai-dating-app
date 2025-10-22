import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 } // iPhone 14 Pro dimensions
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click on Profile tab (using a more specific selector)
    await page.locator('button:has-text("Profile")').last().click({ timeout: 60000 });
    await page.waitForTimeout(1000);

    // Take screenshot of initial state
    await page.screenshot({
      path: '/Users/Jason/Screenshots/profile-verification-initial.png',
      fullPage: true
    });
    console.log('✓ Screenshot 1: Initial state');

    // Click "Start Verification"
    await page.click('text=Start Verification');
    await page.waitForTimeout(500);

    // Take screenshot of capture state
    await page.screenshot({
      path: '/Users/Jason/Screenshots/profile-verification-capture.png',
      fullPage: true
    });
    console.log('✓ Screenshot 2: Capture state');

    // Click "Take Photo"
    await page.click('text=Take Photo');
    await page.waitForTimeout(500);

    // Take screenshot of verifying state
    await page.screenshot({
      path: '/Users/Jason/Screenshots/profile-verification-verifying.png',
      fullPage: true
    });
    console.log('✓ Screenshot 3: Verifying state');

    // Wait for verification to complete (3 seconds as per our mock)
    await page.waitForTimeout(3500);

    // Take screenshot of verified state with auto-filled form
    await page.screenshot({
      path: '/Users/Jason/Screenshots/profile-verification-complete.png',
      fullPage: true
    });
    console.log('✓ Screenshot 4: Verified state with auto-filled form');

    console.log('\n✅ All screenshots captured successfully!');

    // Keep browser open for manual inspection
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
