import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { MATCH_PROFILES, type MatchProfile } from "@/lib/match-profiles"
import { getUserRAG } from "@/lib/user-profile"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      experienceName,
      experienceCategory,
      experienceVenue,
      experienceLocation,
      experienceDescription
    } = body

    if (!experienceName) {
      return NextResponse.json(
        { success: false, error: "Experience name is required" },
        { status: 400 }
      )
    }

    console.log("Finding match for experience:", experienceName)

    // Get user RAG data for personalization
    const userRAG = getUserRAG()
    const userContext = `
User Facts: ${userRAG.facts.join(", ") || "None yet"}
User Preferences: ${userRAG.preferences.join(", ") || "None yet"}
User Interests: ${userRAG.interests.join(", ") || "None yet"}
`.trim()

    // Build prompt for Gemini to analyze and pick the best match
    const matchProfiles = MATCH_PROFILES.map(p => `
ID: ${p.id}
Name: ${p.name}
Age: ${p.age}
Occupation: ${p.occupation}
Interests: ${p.interests.join(", ")}
Personality: ${p.personality.join(", ")}
Looking For: ${p.lookingFor}
Dealbreakers: ${p.dealbreakers.join(", ")}
Conversation Style: ${p.conversationStyle}
`).join("\n---\n")

    const prompt = `You are a professional AI matchmaker coordinating with other AI matchmakers on a dating platform. A user (Alice, 35, Asian woman in LA) wants to find someone to join her for this experience:

**Experience Details:**
- Name: ${experienceName}
- Category: ${experienceCategory}
- Venue: ${experienceVenue}
- Location: ${experienceLocation}
- Description: ${experienceDescription}

**What We Know About Alice:**
${userContext || "Still learning about her through conversations"}

**Available Matches (from other matchmakers on the platform):**
${matchProfiles}

**Your Task:**
1. Analyze which match would be the BEST fit for this specific experience
2. Consider: shared interests, personality compatibility, what they're looking for
3. Return a JSON object with this EXACT format (no markdown, no code blocks):

{
  "matchId": "match_X",
  "matchName": "Name",
  "matchReason": "2-3 sentences explaining why this match is perfect for THIS experience. Be specific about how their interests/personality align with the activity.",
  "coordinationStory": "Write a natural, conversational 2-3 sentence story about how you (Alice's matchmaker) coordinated with this person's matchmaker. Make it feel like two matchmaker friends chatting. Use lowercase, casual tone. Example: 'okay so i was literally just talking to james's matchmaker about how he's obsessed with wine, and when you wanted to find someone for esters, i immediately thought of him. she says he's been wanting to try new wine spots in santa monica!'",
  "suggestedDateTime": "2025-10-29T19:00:00Z"
}

CRITICAL: Return ONLY the raw JSON object. No markdown formatting, no \`\`\`json blocks, just the pure JSON.`

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    console.log("Gemini raw response:", responseText)

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "")
    }

    const matchResult = JSON.parse(cleanedResponse)

    // Validate the response has required fields
    if (!matchResult.matchId || !matchResult.matchName || !matchResult.matchReason || !matchResult.coordinationStory) {
      throw new Error("Invalid response format from AI")
    }

    return NextResponse.json({
      success: true,
      match: matchResult
    })

  } catch (error) {
    console.error("Experience match error:", error)

    // Fallback to a simple match if AI fails
    const fallbackMatch = MATCH_PROFILES[Math.floor(Math.random() * MATCH_PROFILES.length)]

    return NextResponse.json({
      success: true,
      match: {
        matchId: fallbackMatch.id,
        matchName: fallbackMatch.name,
        matchReason: `${fallbackMatch.name} would be a great match for this experience based on their interests in ${fallbackMatch.interests.slice(0, 2).join(" and ")}.`,
        coordinationStory: `i reached out to ${fallbackMatch.name}'s matchmaker about this, and she thinks it could be perfect. he's been looking for something fun to do!`,
        suggestedDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      }
    })
  }
}
