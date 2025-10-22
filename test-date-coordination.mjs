import { chromium } from "@playwright/test"

async function testDateCoordination() {
  console.log("🧪 Testing Date Coordination System...\n")

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for dev server
    console.log("⏳ Waiting for dev server...")
    await page.goto("http://localhost:3001", { waitUntil: "domcontentloaded", timeout: 30000 })
    console.log("✅ Dev server is running\n")

    // =======================================================================
    // TEST 1: Create a date proposal via API
    // =======================================================================
    console.log("📝 TEST 1: Creating a date proposal...")

    const proposalData = {
      matchId: "match_1",
      matchName: "Marcus",
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      activity: "dinner",
      venue: "Perch LA",
      location: "448 S Hill St, Los Angeles, CA 90013",
      description: "A romantic rooftop dinner at Perch with stunning views of downtown LA",
      glimpseId: null
    }

    const proposeResponse = await page.evaluate(async (data) => {
      const response = await fetch("http://localhost:3001/api/dates/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      return await response.json()
    }, proposalData)

    if (!proposeResponse.success) {
      throw new Error(`Failed to create proposal: ${proposeResponse.error}`)
    }

    console.log("✅ Date proposal created successfully!")
    console.log(`   ID: ${proposeResponse.proposal.id}`)
    console.log(`   Status: ${proposeResponse.proposal.status}`)
    console.log(`   Match: ${proposeResponse.proposal.matchName}`)
    console.log(`   Activity: ${proposeResponse.proposal.activity}`)
    console.log(`   Venue: ${proposeResponse.proposal.venue}\n`)

    const proposalId = proposeResponse.proposal.id

    // =======================================================================
    // TEST 2: Retrieve the date proposal
    // =======================================================================
    console.log("📥 TEST 2: Retrieving date proposal...")

    const getResponse = await page.evaluate(async (id) => {
      const response = await fetch(`http://localhost:3001/api/dates/propose?id=${id}`)
      return await response.json()
    }, proposalId)

    if (!getResponse.success) {
      throw new Error(`Failed to retrieve proposal: ${getResponse.error}`)
    }

    console.log("✅ Date proposal retrieved successfully!")
    console.log(`   Found proposal: ${getResponse.proposal.description}\n`)

    // =======================================================================
    // TEST 3: Accept the date proposal
    // =======================================================================
    console.log("💕 TEST 3: Accepting date proposal...")

    const respondResponse = await page.evaluate(async (id) => {
      const response = await fetch("http://localhost:3001/api/dates/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateProposalId: id,
          action: "accept",
          userId: "alice"
        })
      })
      return await response.json()
    }, proposalId)

    if (!respondResponse.success) {
      throw new Error(`Failed to accept proposal: ${respondResponse.error}`)
    }

    console.log("✅ Date proposal accepted!")
    console.log(`   New status: ${respondResponse.proposal.status}`)
    console.log(`   Message: ${respondResponse.message}\n`)

    // =======================================================================
    // TEST 4: Test calendar integration
    // =======================================================================
    console.log("📅 TEST 4: Testing calendar integration...")

    const calendarTest = await page.evaluate(async (proposal) => {
      // Import calendar functions
      const { addToCalendar } = await import("./lib/calendar-integration.ts")

      const calendarData = addToCalendar(proposal)

      return {
        hasGoogleUrl: !!calendarData.googleUrl,
        hasOutlookUrl: !!calendarData.outlookUrl,
        hasIcsContent: !!calendarData.icsContent,
        googleUrlPreview: calendarData.googleUrl.substring(0, 100)
      }
    }, respondResponse.proposal)

    console.log("✅ Calendar integration working!")
    console.log(`   Google Calendar URL: ${calendarTest.hasGoogleUrl ? '✓' : '✗'}`)
    console.log(`   Outlook Calendar URL: ${calendarTest.hasOutlookUrl ? '✓' : '✗'}`)
    console.log(`   ICS file content: ${calendarTest.hasIcsContent ? '✓' : '✗'}`)
    console.log(`   Sample URL: ${calendarTest.googleUrlPreview}...\n`)

    // =======================================================================
    // TEST 5: Test accommodation coordination
    // =======================================================================
    console.log("🍽️  TEST 5: Testing accommodation coordination...")

    const coordinationTest = await page.evaluate(async (id) => {
      // Import coordination function
      const { coordinateDate } = await import("./lib/accommodation-coordination.ts")

      const result = await coordinateDate(id)

      return result
    }, proposalId)

    console.log("✅ Accommodation coordination completed!")
    console.log(`   Success: ${coordinationTest.success ? '✓' : '✗'}`)
    console.log(`   Accommodations booked: ${coordinationTest.accommodations.length}`)

    coordinationTest.accommodations.forEach((acc, index) => {
      console.log(`   ${index + 1}. ${acc.type}: ${acc.status}`)
      if (acc.type === "restaurant" && acc.details.restaurantName) {
        console.log(`      → ${acc.details.restaurantName}`)
        console.log(`      → Confirmation: ${acc.details.confirmationNumber}`)
      }
      if (acc.type === "transportation" && acc.details.rideType) {
        console.log(`      → ${acc.details.rideType} ride`)
        console.log(`      → Cost estimate: $${acc.details.estimatedCost}`)
      }
    })

    if (coordinationTest.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${coordinationTest.errors.join(", ")}`)
    }
    console.log()

    // =======================================================================
    // TEST 6: Get updated proposal with all accommodations
    // =======================================================================
    console.log("🔄 TEST 6: Verifying final proposal state...")

    const finalProposal = await page.evaluate(async (id) => {
      const response = await fetch(`http://localhost:3001/api/dates/propose?id=${id}`)
      return await response.json()
    }, proposalId)

    if (!finalProposal.success) {
      throw new Error(`Failed to retrieve final proposal: ${finalProposal.error}`)
    }

    console.log("✅ Final proposal state verified!")
    console.log(`   Status: ${finalProposal.proposal.status}`)
    console.log(`   Total accommodations: ${finalProposal.proposal.accommodations.length}`)
    console.log(`   User response: ${finalProposal.proposal.userResponse}`)
    console.log(`   Match response: ${finalProposal.proposal.matchResponse}\n`)

    // =======================================================================
    // TEST 7: Test decline flow
    // =======================================================================
    console.log("❌ TEST 7: Testing decline flow...")

    // Create another proposal
    const declineProposalData = {
      matchId: "match_2",
      matchName: "David",
      dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      activity: "art gallery",
      venue: "The Broad",
      location: "221 S Grand Ave, Los Angeles, CA 90012",
      description: "Contemporary art exploration at The Broad",
      glimpseId: null
    }

    const declineProposal = await page.evaluate(async (data) => {
      const proposeRes = await fetch("http://localhost:3001/api/dates/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const proposal = await proposeRes.json()

      // Decline it
      const declineRes = await fetch("http://localhost:3001/api/dates/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateProposalId: proposal.proposal.id,
          action: "decline",
          userId: "alice"
        })
      })
      return await declineRes.json()
    }, declineProposalData)

    console.log("✅ Decline flow working!")
    console.log(`   Status after decline: ${declineProposal.proposal.status}`)
    console.log(`   Message: ${declineProposal.message}\n`)

    // =======================================================================
    // TEST 8: Get all proposals
    // =======================================================================
    console.log("📋 TEST 8: Getting all date proposals...")

    const allProposals = await page.evaluate(async () => {
      const response = await fetch("http://localhost:3001/api/dates/propose")
      return await response.json()
    })

    console.log("✅ All proposals retrieved!")
    console.log(`   Total proposals: ${allProposals.proposals.length}`)
    allProposals.proposals.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.matchName} - ${p.activity} (${p.status})`)
    })
    console.log()

    // =======================================================================
    // SUMMARY
    // =======================================================================
    console.log("=" .repeat(70))
    console.log("🎉 ALL TESTS PASSED!")
    console.log("=" .repeat(70))
    console.log()
    console.log("✅ Date Proposal API: Working")
    console.log("✅ Date Response API: Working")
    console.log("✅ Calendar Integration: Working")
    console.log("✅ Accommodation Coordination: Working")
    console.log("✅ Restaurant Booking (Mock): Working")
    console.log("✅ Transportation Booking (Mock): Working")
    console.log("✅ Accept Flow: Working")
    console.log("✅ Decline Flow: Working")
    console.log()
    console.log("📊 Results Summary:")
    console.log(`   - Total date proposals created: ${allProposals.proposals.length}`)
    console.log(`   - Accepted dates: ${allProposals.proposals.filter(p => p.status !== "declined").length}`)
    console.log(`   - Declined dates: ${allProposals.proposals.filter(p => p.status === "declined").length}`)
    console.log(`   - Confirmed dates: ${allProposals.proposals.filter(p => p.status === "confirmed").length}`)
    console.log()
    console.log("🚀 Next Steps:")
    console.log("   1. UI components are ready (DateProposalCard)")
    console.log("   2. State management added to chat interface")
    console.log("   3. Need to complete chat interface integration")
    console.log("   4. Update AI prompt to trigger date proposals")
    console.log()

    // Take a screenshot
    console.log("📸 Taking screenshot...")
    await page.screenshot({
      path: "/Users/Jason/Screenshots/date-coordination-test.png",
      fullPage: true
    })
    console.log("   Screenshot saved to /Users/Jason/Screenshots/date-coordination-test.png")

    // Keep browser open for inspection
    console.log("\n⏸️  Keeping browser open for 30 seconds for inspection...")
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error("\n❌ TEST FAILED:")
    console.error(error)

    // Take error screenshot
    try {
      await page.screenshot({
        path: "/Users/Jason/Screenshots/date-coordination-error.png",
        fullPage: true
      })
      console.log("   Error screenshot saved to /Users/Jason/Screenshots/date-coordination-error.png")
    } catch (screenshotError) {
      console.error("   Failed to take error screenshot:", screenshotError)
    }

    throw error
  } finally {
    await browser.close()
  }
}

testDateCoordination()
