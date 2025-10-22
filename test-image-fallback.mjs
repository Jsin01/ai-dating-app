/**
 * Test script for image generation fallback
 * Tests that Imagen 3 works when Veo fails
 */

async function testImageGeneration() {
  console.log("🧪 Testing Image Generation Fallback...\n")

  const testRequest = {
    scenario: "coffee shop date",
    userContext: "Alice loves coffee and good conversation",
    matchName: "Marcus",
    matchAppearance: "a 37-year-old Black man with short fade haircut, warm smile, athletic build, casual-professional style",
    userInterests: ["coffee", "deep conversations", "photography"]
  }

  console.log("📝 Test scenario:", testRequest.scenario)
  console.log("👤 Match:", testRequest.matchName)
  console.log("\n⏳ Calling API...\n")

  try {
    const response = await fetch("http://localhost:3000/api/generate-glimpse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testRequest)
    })

    const data = await response.json()

    if (data.success) {
      console.log("✅ Glimpse generated successfully!")
      console.log("\n📊 Result:")
      console.log("  ID:", data.glimpse.id)
      console.log("  Title:", data.glimpse.title)
      console.log("  Description:", data.glimpse.description)
      console.log("  Video URL:", data.glimpse.videoUrl || "N/A (Image fallback used)")
      console.log("  Thumbnail URL:", data.glimpse.thumbnailUrl)
      console.log("  Status:", data.glimpse.status)

      if (!data.glimpse.videoUrl && data.glimpse.thumbnailUrl) {
        console.log("\n🖼️  IMAGE FALLBACK SUCCESSFUL!")
        console.log("  Image saved to:", data.glimpse.thumbnailUrl)
      } else if (data.glimpse.videoUrl) {
        console.log("\n🎥 VIDEO GENERATION SUCCESSFUL!")
        console.log("  Video saved to:", data.glimpse.videoUrl)
      }
    } else {
      console.log("❌ Failed:", data.error)
      console.log("Message:", data.message)
      if (data.userMessage) {
        console.log("User message:", data.userMessage)
      }
    }
  } catch (error) {
    console.log("❌ Error:", error.message)
  }

  console.log("\n✅ Test complete!")
}

// Run the test
testImageGeneration().catch(console.error)
