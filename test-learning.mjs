/**
 * Test script for automatic learning system
 * Tests that the AI extracts and stores insights from conversations
 */

async function testInsightExtraction() {
  console.log("🧪 Testing Automatic Learning System...\n")

  const testCases = [
    {
      name: "Interest in electronic music",
      userMessage: "i love electronic music, especially live shows",
      expectedInsights: {
        interests: ["electronic music", "live music shows"]
      }
    },
    {
      name: "Work stress",
      userMessage: "work has been killing me lately",
      expectedInsights: {
        facts: ["currently experiencing work stress"]
      }
    },
    {
      name: "Dealbreaker - lateness",
      userMessage: "i can't stand people who are always late",
      expectedInsights: {
        dislikes: ["chronic lateness"],
        dealbreakers: ["always being late"]
      }
    },
    {
      name: "Preference for active dates",
      userMessage: "i prefer active dates over sitting at dinner",
      expectedInsights: {
        preferences: ["active dates over dinner dates"]
      }
    }
  ]

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`)
    console.log(`   Input: "${testCase.userMessage}"`)

    try {
      const response = await fetch("http://localhost:3000/api/extract-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: testCase.userMessage,
          aiResponse: ""
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log("   ✅ Extracted insights:")
        if (data.insights.facts?.length > 0) {
          console.log(`      Facts: ${data.insights.facts.join(", ")}`)
        }
        if (data.insights.interests?.length > 0) {
          console.log(`      Interests: ${data.insights.interests.join(", ")}`)
        }
        if (data.insights.preferences?.length > 0) {
          console.log(`      Preferences: ${data.insights.preferences.join(", ")}`)
        }
        if (data.insights.dislikes?.length > 0) {
          console.log(`      Dislikes: ${data.insights.dislikes.join(", ")}`)
        }
        if (data.insights.dealbreakers?.length > 0) {
          console.log(`      Dealbreakers: ${data.insights.dealbreakers.join(", ")}`)
        }
      } else {
        console.log(`   ❌ Failed: ${data.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }

    console.log("")
  }

  console.log("✅ Testing complete!")
}

// Run the test
testInsightExtraction().catch(console.error)
