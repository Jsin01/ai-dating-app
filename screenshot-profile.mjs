import { chromium } from "@playwright/test"

async function screenshot() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    await page.goto("http://localhost:3000")
    await page.waitForTimeout(2000)

    // Navigate to profile page
    await page.goto("http://localhost:3000/")
    await page.waitForTimeout(1000)

    // Click on profile tab if visible
    const profileTab = page.locator('text=Profile').first()
    if (await profileTab.count() > 0) {
      await profileTab.click()
      await page.waitForTimeout(2000)
    }

    await page.screenshot({
      path: "/Users/Jason/Screenshots/profile-page.png",
      fullPage: true
    })

    console.log("Screenshot saved to /Users/Jason/Screenshots/profile-page.png")

    await page.waitForTimeout(2000)
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await browser.close()
  }
}

screenshot()
