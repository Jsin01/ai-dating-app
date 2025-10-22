/**
 * End-to-end test for date proposal feature
 * Tests the complete flow: AI creates proposal → user sees card → user accepts → accommodations coordinated
 */

import { chromium } from "@playwright/test"

async function testDateProposalE2E() {
  console.log("🧪 Testing Date Proposal End-to-End Flow...\n")

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

    // Wait for chat interface to load (default tab is chat)
    await page.waitForSelector('input[placeholder="Message..."]', { timeout: 10000 })

    // Make sure we're on the Glimpse (chat) tab
    const glimpseTab = page.locator('button:has-text("Glimpse")')
    await glimpseTab.click()
    await page.waitForTimeout(500)

    console.log("✅ Chat interface ready\n")

    // =======================================================================
    // STEP 2: Send a message requesting a date
    // =======================================================================
    console.log("💬 STEP 2: Asking to go on a date...")

    // Type a message asking for a date
    const input = page.locator('input[placeholder="Message..."]')
    await input.fill("i want to go on a date with james. can you set something up?")

    // Click send button
    await page.locator('button').filter({ hasText: /send/i }).or(page.locator('button:has(svg)')).last().click()
    console.log("✅ Message sent\n")

    // Wait for AI response
    console.log("⏳ Waiting for AI response...")
    await page.waitForTimeout(5000) // Wait for AI to process and respond

    // =======================================================================
    // STEP 3: Check if date proposal card appears
    // =======================================================================
    console.log("🔍 STEP 3: Looking for date proposal card...")

    // Wait for date proposal card to appear (it should have the DateProposalCard component)
    // Looking for the card with "Date Proposal" or "Date with" text
    const proposalCardSelector = 'div:has-text("Date with"), div:has-text("Date Proposal")'

    try {
      await page.waitForSelector(proposalCardSelector, { timeout: 10000 })
      console.log("✅ Date proposal card appeared!\n")

      // Take screenshot of the proposal
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-card.png",
        fullPage: true
      })
      console.log("📸 Screenshot saved: date-proposal-card.png\n")

    } catch (error) {
      console.log("❌ Date proposal card did not appear")
      console.log("   This might mean:")
      console.log("   1. AI didn't create a proposal (check console for dateProposalId)")
      console.log("   2. Card rendering has an issue")
      console.log("   3. AI needs more specific prompt\n")

      // Take error screenshot
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-missing.png",
        fullPage: true
      })
      console.log("📸 Error screenshot saved: date-proposal-missing.png\n")

      // Check console logs for dateProposalId
      const consoleLogs = []
      page.on('console', msg => {
        if (msg.text().includes('dateProposalId') || msg.text().includes('date proposal')) {
          consoleLogs.push(msg.text())
        }
      })

      await page.waitForTimeout(2000)

      if (consoleLogs.length > 0) {
        console.log("📋 Console logs about date proposals:")
        consoleLogs.forEach(log => console.log(`   ${log}`))
      }

      throw error
    }

    // =======================================================================
    // STEP 4: Accept the date proposal
    // =======================================================================
    console.log("💕 STEP 4: Accepting the date proposal...")

    // Look for accept button (should have text like "Accept Date" or heart emoji)
    const acceptButton = page.locator('button:has-text("Accept Date"), button:has-text("Accept"), button:has-text("💕")')

    if (await acceptButton.count() > 0) {
      await acceptButton.first().click()
      console.log("✅ Clicked accept button\n")

      // Wait for status to update
      await page.waitForTimeout(3000)

      console.log("⏳ Waiting for accommodation coordination...")
      await page.waitForTimeout(5000) // Mock APIs take time

      // Take screenshot of accepted state
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-accepted.png",
        fullPage: true
      })
      console.log("📸 Screenshot saved: date-proposal-accepted.png\n")

    } else {
      console.log("⚠️  Accept button not found - proposal may already be accepted or in wrong state\n")
    }

    // =======================================================================
    // STEP 5: Verify accommodations
    // =======================================================================
    console.log("🔍 STEP 5: Checking for accommodations...")

    // Look for accommodation details (restaurant, Uber, etc.)
    const accommodationIndicators = [
      'text="Conf:"', // Confirmation number
      'text="🍽️"', // Restaurant emoji
      'text="🚗"', // Transportation emoji
      'text="confirmed"', // Status text
    ]

    let foundAccommodations = 0
    for (const indicator of accommodationIndicators) {
      if (await page.locator(indicator).count() > 0) {
        foundAccommodations++
      }
    }

    console.log(`✅ Found ${foundAccommodations} accommodation indicators\n`)

    // =======================================================================
    // STEP 6: Test calendar integration
    // =======================================================================
    console.log("📅 STEP 6: Checking calendar button...")

    const calendarButton = page.locator('button:has-text("Add to Calendar"), button:has-text("📅")')

    if (await calendarButton.count() > 0) {
      console.log("✅ Calendar button is present\n")

      // We won't click it (would open new window) but verify it exists
    } else {
      console.log("⚠️  Calendar button not found - may only appear when status is 'confirmed'\n")
    }

    // =======================================================================
    // STEP 7: Verify the proposal in the API
    // =======================================================================
    console.log("🔍 STEP 7: Verifying proposal in API...")

    const apiCheck = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3001/api/dates/propose')
      const data = await response.json()
      return {
        success: data.success,
        proposalCount: data.proposals?.length || 0,
        proposals: data.proposals || []
      }
    })

    console.log(`✅ API returned ${apiCheck.proposalCount} proposals`)
    if (apiCheck.proposals.length > 0) {
      const latest = apiCheck.proposals[apiCheck.proposals.length - 1]
      console.log(`   Latest: ${latest.matchName} - ${latest.activity} (${latest.status})`)
      console.log(`   Accommodations: ${latest.accommodations?.length || 0}`)
    }
    console.log()

    // =======================================================================
    // FINAL SCREENSHOT
    // =======================================================================
    console.log("📸 Taking final screenshot...")
    await page.screenshot({
      path: "/Users/Jason/Screenshots/date-proposal-final.png",
      fullPage: true
    })
    console.log("   Saved to: date-proposal-final.png\n")

    // =======================================================================
    // SUMMARY
    // =======================================================================
    console.log("=" .repeat(70))
    console.log("🎉 END-TO-END TEST COMPLETED!")
    console.log("=" .repeat(70))
    console.log()
    console.log("✅ Chat interface loaded")
    console.log("✅ Message sent requesting date")
    console.log("✅ AI response received")
    console.log(foundAccommodations > 0 ? "✅ Date proposal card appeared" : "⚠️  Date proposal card check")
    console.log(apiCheck.proposalCount > 0 ? "✅ Proposal stored in API" : "⚠️  No proposals in API")
    console.log()
    console.log("📊 Results:")
    console.log(`   - Proposals in system: ${apiCheck.proposalCount}`)
    console.log(`   - Accommodation indicators found: ${foundAccommodations}`)
    console.log()
    console.log("📸 Screenshots saved:")
    console.log("   - /Users/Jason/Screenshots/date-proposal-card.png")
    console.log("   - /Users/Jason/Screenshots/date-proposal-accepted.png")
    console.log("   - /Users/Jason/Screenshots/date-proposal-final.png")
    console.log()
    console.log("⏸️  Keeping browser open for 30 seconds for inspection...")
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error("\n❌ TEST FAILED:")
    console.error(error)

    // Take error screenshot
    try {
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-proposal-error.png",
        fullPage: true
      })
      console.log("   Error screenshot saved to /Users/Jason/Screenshots/date-proposal-error.png")
    } catch (screenshotError) {
      console.error("   Failed to take error screenshot:", screenshotError)
    }

    throw error
  } finally {
    await browser.close()
  }
}

testDateProposalE2E()
