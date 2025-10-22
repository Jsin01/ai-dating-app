import { chromium } from "@playwright/test"

async function openProfile() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    console.log("Opening app...")
    await page.goto("http://localhost:3001")
    await page.waitForTimeout(2000)

    // Click on Profile tab
    console.log("Clicking Profile tab...")
    const profileButton = page.locator('text=Profile').last()
    await profileButton.click()
    await page.waitForTimeout(3000)

    // Take screenshot
    console.log("Taking screenshot...")
    await page.screenshot({
      path: "/Users/Jason/Screenshots/profile-page-current.png",
      fullPage: true
    })

    console.log("Screenshot saved to /Users/Jason/Screenshots/profile-page-current.png")

    // Keep browser open for 60 seconds
    console.log("Keeping browser open for inspection...")
    await page.waitForTimeout(60000)

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await browser.close()
  }
}

openProfile()
