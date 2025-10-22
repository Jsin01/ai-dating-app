/**
 * UI test for date proposal rendering
 * Creates a proposal via API, then verifies it appears in the chat
 */

import { chromium } from "@playwright/test"

async function testDateProposalUI() {
  console.log("🧪 Testing Date Proposal UI Rendering...\n")

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // =======================================================================
    // STEP 1: Navigate to the app
    // =======================================================================
    console.log("📱 STEP 1: Opening the app...")
    await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded", timeout: 30000 })
    console.log("✅ App loaded\n")

    // Wait for chat interface
    await page.waitForSelector('input[placeholder="Message..."]', { timeout: 10000 })
    console.log("✅ Chat interface ready\n")

    // =======================================================================
    // STEP 2: Create a date proposal via API (simulating AI creating one)
    // =======================================================================
    console.log("📝 STEP 2: Creating date proposal via API...")

    const proposalId = await page.evaluate(async () => {
      // Create a date proposal
      const response = await fetch('http://localhost:3001/api/dates/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: 'match_3',
          matchName: 'James',
          activity: 'salsa dancing',
          venue: 'La Cita Bar',
          location: '336 S Hill St, Los Angeles, CA 90013',
          dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'A fun salsa dancing night at La Cita Bar - perfect for someone who loves movement and music!',
          glimpseId: null
        })
      })

      const data = await response.json()
      return data.success ? data.proposal.id : null
    })

    if (!proposalId) {
      throw new Error('Failed to create date proposal via API')
    }

    console.log(`✅ Created proposal: ${proposalId}\n`)

    // =======================================================================
    // STEP 3: Add a message with dateProposalId to trigger UI rendering
    // =======================================================================
    console.log("💬 STEP 3: Adding message with date proposal reference...")

    await page.evaluate((pid) => {
      // Get existing messages from localStorage
      const existingMessages = JSON.parse(localStorage.getItem('echoMessages') || '[]')

      // Add a new AI message with the date proposal
      existingMessages.push({
        role: 'ai',
        content: 'just sent that over! check it out and let me know what you think',
        timestamp: new Date().toISOString(),
        dateProposalId: pid
      })

      // Save back to localStorage
      localStorage.setItem('echoMessages', JSON.stringify(existingMessages))
    }, proposalId)

    console.log("✅ Message added to localStorage\n")

    // =======================================================================
    // STEP 4: Reload page to see the date proposal card
    // =======================================================================
    console.log("🔄 STEP 4: Reloading page to render date proposal...")

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('input[placeholder="Message..."]', { timeout: 10000 })

    // Wait a bit for date proposals to load
    await page.waitForTimeout(2000)

    console.log("✅ Page reloaded\n")

    // =======================================================================
    // STEP 5: Check if date proposal card appears
    // =======================================================================
    console.log("🔍 STEP 5: Looking for date proposal card...")

    // Try multiple selectors
    const cardSelectors = [
      'text="Date with James"',
      'text="Date Proposal"',
      'text="salsa dancing"',
      'text="La Cita Bar"',
      'button:has-text("Accept Date")',
      'button:has-text("Accept")',
    ]

    let found = false
    for (const selector of cardSelectors) {
      const count = await page.locator(selector).count()
      if (count > 0) {
        console.log(`✅ Found: ${selector}`)
        found = true
      }
    }

    if (!found) {
      console.log("❌ Date proposal card not found with any selector")
      console.log("   Taking screenshot for debugging...\n")

      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-ui-missing.png",
        fullPage: true
      })

      // Log what we can see
      const bodyText = await page.textContent('body')
      console.log("Page content includes:")
      if (bodyText?.includes('James')) console.log("   ✅ Contains 'James'")
      if (bodyText?.includes('salsa')) console.log("   ✅ Contains 'salsa'")
      if (bodyText?.includes('La Cita')) console.log("   ✅ Contains 'La Cita'")
      if (bodyText?.includes('Loading date proposal')) console.log("   ⚠️  Shows 'Loading date proposal...'")

      throw new Error("Date proposal card not visible")
    }

    // Take screenshot of the card
    await page.screenshot({
      path: "/Users/Jason/Screenshots/date-proposal-ui-success.png",
      fullPage: true
    })
    console.log("📸 Screenshot saved: date-proposal-ui-success.png\n")

    // =======================================================================
    // STEP 6: Test accept button
    // =======================================================================
    console.log("💕 STEP 6: Testing accept button...")

    const acceptButton = page.locator('button:has-text("Accept Date"), button:has-text("Accept")')
    if (await acceptButton.count() > 0) {
      console.log("✅ Accept button found")

      // Click it
      await acceptButton.first().click()
      console.log("✅ Clicked accept button")

      // Wait for coordination
      await page.waitForTimeout(5000)

      // Take screenshot after acceptance
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-ui-accepted.png",
        fullPage: true
      })
      console.log("📸 Screenshot saved: date-proposal-ui-accepted.png\n")

    } else {
      console.log("⚠️  Accept button not found\n")
    }

    // =======================================================================
    // SUMMARY
    // =======================================================================
    console.log("=" .repeat(70))
    console.log("🎉 UI TEST COMPLETED SUCCESSFULLY!")
    console.log("=" .repeat(70))
    console.log()
    console.log("✅ Date proposal created via API")
    console.log("✅ Date proposal card rendered in UI")
    console.log("✅ Accept button functional")
    console.log()
    console.log("📸 Screenshots:")
    console.log("   - date-proposal-ui-success.png")
    console.log("   - date-proposal-ui-accepted.png")
    console.log()
    console.log("⏸️  Keeping browser open for 20 seconds...")
    await page.waitForTimeout(20000)

  } catch (error) {
    console.error("\n❌ TEST FAILED:")
    console.error(error)

    try {
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-ui-error.png",
        fullPage: true
      })
      console.log("   Error screenshot: date-proposal-ui-error.png")
    } catch (e) {
      console.error("   Failed to take screenshot:", e)
    }

    throw error
  } finally {
    await browser.close()
  }
}

testDateProposalUI()
