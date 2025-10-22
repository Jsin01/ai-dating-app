import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import type { Message } from "@/lib/types"

const client = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: Message[] }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No conversation history available yet. Chat with me more so I can learn about you!",
      })
    }

    // Filter to only user messages for profile extraction
    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n")

    if (!userMessages.trim()) {
      return NextResponse.json({
        success: false,
        error: "No user messages found",
      })
    }

    console.log("Generating profile from conversation history...")

    // Use Gemini to analyze conversation and extract profile information
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are analyzing a user's conversation history from a dating app chat to automatically generate their profile information.

The user has been chatting with an AI matchmaker. Based on their messages, extract information to create a compelling dating profile.

USER'S MESSAGES:
${userMessages}

Generate the following profile fields in JSON format:

{
  "description": "A 2-3 sentence vivid description of how the user should appear in their AI-generated profile video. Focus on visual details: setting, appearance, style, activity. Example: 'walking through Downtown LA at sunset, smiling confidently, wearing casual but stylish clothes, carrying a coffee cup'",
  "interests": "Comma-separated list of interests mentioned or implied. Keep it concise. Example: 'hiking, coffee, live music, photography'",
  "vibe": "2-4 words describing their personality/energy. Example: 'adventurous, warm, creative'"
}

IMPORTANT RULES:
1. For "description": Focus on VISUAL, CINEMATIC elements suitable for a video generation prompt
2. For "interests": Extract actual hobbies/activities mentioned, not abstract concepts
3. For "vibe": Capture personality traits in adjectives
4. If information is not clearly available, make educated inferences based on conversation tone and context
5. Keep it authentic to what they've expressed
6. Return ONLY the JSON object, no additional text

Generate the profile:`,
            },
          ],
        },
      ],
    })

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!responseText) {
      throw new Error("No response from Gemini")
    }

    console.log("Gemini response:", responseText)

    // Parse JSON from response (handle code blocks if present)
    let profileData
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : responseText

      profileData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError)
      throw new Error("Failed to parse profile data from AI response")
    }

    // Validate the response has required fields
    if (!profileData.description || !profileData.interests || !profileData.vibe) {
      throw new Error("Incomplete profile data generated")
    }

    return NextResponse.json({
      success: true,
      profile: {
        description: profileData.description,
        interests: profileData.interests,
        vibe: profileData.vibe,
      },
    })
  } catch (error) {
    console.error("Error generating profile description:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate profile description",
      },
      { status: 500 }
    )
  }
}
