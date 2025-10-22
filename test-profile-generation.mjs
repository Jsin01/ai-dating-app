import { chromium } from "@playwright/test"

async function testProfileGeneration() {
  console.log("🧪 Testing Auto-Generated Profile Feature...")

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to the app
    console.log("📱 Opening app...")
    await page.goto("http://localhost:3000")
    await page.waitForTimeout(2000)

    // Clear any existing profile data
    console.log("🗑️  Clearing existing profile data...")
    await page.evaluate(() => {
      localStorage.removeItem("auto_generated_profile")
      localStorage.removeItem("echoMessages")
    })
    await page.reload()
    await page.waitForTimeout(1000)

    // Send several messages to build conversation history
    console.log("💬 Sending test messages to build conversation history...")

    const testMessages = [
      "hey! i'm really into hiking and outdoor adventures",
      "i love exploring new coffee shops in downtown LA",
      "i work as a product designer at a tech startup",
      "i'm looking for someone who's adventurous and creative",
      "i enjoy live music and going to concerts on weekends",
      "photography is my hobby, i love capturing urban landscapes"
    ]

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i]
      console.log(`  → Sending message ${i + 1}/${testMessages.length}: "${message}"`)

      // Find input and send message
      const input = await page.locator('textarea, input[type="text"]').first()
      await input.fill(message)
      await page.waitForTimeout(500)

      // Click send button
      const sendButton = await page.locator('button').filter({ hasText: /send/i }).first()
      if (await sendButton.count() > 0) {
        await sendButton.click()
      } else {
        // Try pressing Enter
        await input.press('Enter')
      }

      // Wait for AI response
      await page.waitForTimeout(3000)
    }

    console.log("✅ Messages sent successfully")

    // Navigate to profile page
    console.log("📄 Navigating to profile page...")

    // Try to find and click profile tab/button
    const profileButton = page.locator('button, a').filter({ hasText: /profile/i }).first()
    if (await profileButton.count() > 0) {
      await profileButton.click()
      await page.waitForTimeout(2000)
    } else {
      // Try navigating directly
      await page.goto("http://localhost:3000/profile")
      await page.waitForTimeout(2000)
    }

    // Wait for profile generation
    console.log("⏳ Waiting for profile generation...")
    await page.waitForTimeout(5000)

    // Check if profile was generated
    const profileData = await page.evaluate(() => {
      return localStorage.getItem("auto_generated_profile")
    })

    if (profileData) {
      const profile = JSON.parse(profileData)
      console.log("\n✅ SUCCESS! Profile auto-generated:")
      console.log("━".repeat(60))
      console.log("📝 Description:", profile.description)
      console.log("🎯 Interests:", profile.interests)
      console.log("✨ Vibe:", profile.vibe)
      console.log("━".repeat(60))
    } else {
      console.log("\n❌ FAILED: Profile was not auto-generated")
      console.log("Check console for errors")
    }

    // Take screenshot
    await page.screenshot({
      path: "profile-generation-test.png",
      fullPage: true
    })
    console.log("\n📸 Screenshot saved: profile-generation-test.png")

    // Keep browser open for inspection
    console.log("\n👀 Keeping browser open for 30 seconds for inspection...")
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await browser.close()
    console.log("\n✅ Test complete!")
  }
}

testProfileGeneration()
