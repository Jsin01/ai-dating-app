import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the homepage
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Add the image glimpse to localStorage
  await page.evaluate(() => {
    const glimpse = {
      id: 'glimpse_1761097567323_yxb53h7',
      title: 'Coffee & Good Conversation',
      description: 'omg alice wait, this guy debugs code *and* brews a perfect pour-over, this could be your deep conversation, spontaneous adventure match made in tech heaven.',
      prompt: 'Photorealistic cinematic image: ...',
      videoUrl: undefined, // NO VIDEO - this is an image glimpse
      thumbnailUrl: '/glimpses/glimpse_1761097567323_yxb53h7.jpg',
      status: 'ready',
      createdAt: new Date().toISOString(),
      matchName: 'Marcus',
      scenario: 'coffee shop date'
    };

    // Add glimpse to localStorage
    const existingGlimpses = JSON.parse(localStorage.getItem('glimpses') || '[]');
    existingGlimpses.push(glimpse);
    localStorage.setItem('glimpses', JSON.stringify(existingGlimpses));

    // Add a message that references this glimpse
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(
      {
        role: 'user',
        content: 'show me a glimpse of a coffee shop date',
        timestamp: new Date().toISOString()
      },
      {
        role: 'ai',
        content: 'let me show you something special...',
        timestamp: new Date().toISOString(),
        glimpseId: 'glimpse_1761097567323_yxb53h7'
      }
    );
    localStorage.setItem('messages', JSON.stringify(messages));
  });

  // Reload the page to load the glimpse
  await page.reload();
  await page.waitForTimeout(3000);

  // Scroll to bottom to see the glimpse
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({
    path: '/Users/Jason/Screenshots/image-glimpse-display.png',
    fullPage: true
  });

  console.log('Screenshot saved to /Users/Jason/Screenshots/image-glimpse-display.png');

  await browser.close();
})();
