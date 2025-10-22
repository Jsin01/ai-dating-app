import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const client = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userMessage, aiResponse } = await request.json()

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: "User message is required" },
        { status: 400 }
      )
    }

    // Use Gemini to extract structured insights from the conversation
    const extractionPrompt = `You are analyzing a conversation between Alice (user) and an AI matchmaker. Extract key insights about Alice from this exchange.

Conversation:
User: ${userMessage}
AI: ${aiResponse || "(no response yet)"}

Extract the following in JSON format:
{
  "facts": ["factual statements about Alice - her job, lifestyle, current situation"],
  "interests": ["hobbies, activities, or topics she enjoys"],
  "preferences": ["things she values or prefers in general or in a partner"],
  "dislikes": ["things she dislikes or wants to avoid"],
  "dealbreakers": ["absolute no-gos in dating/relationships"]
}

Rules:
- Only extract explicit information, don't infer
- Keep items concise (5-10 words max each)
- If nothing fits a category, use empty array
- Be specific and concrete
- Don't repeat information that's already obvious

Examples:
User: "i love electronic music, especially live shows"
Output: {"facts":[], "interests":["electronic music", "live music shows"], "preferences":[], "dislikes":[], "dealbreakers":[]}

User: "work has been killing me lately"
Output: {"facts":["currently experiencing work stress"], "interests":[], "preferences":[], "dislikes":[], "dealbreakers":[]}

User: "i can't stand people who are late all the time"
Output: {"facts":[], "interests":[], "preferences":[], "dislikes":["chronic lateness"], "dealbreakers":["always being late"]}

Now extract from the conversation above. Return ONLY valid JSON, no other text.`

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: [
        {
          role: "user",
          parts: [{ text: extractionPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent structured output
      }
    })

    const response = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}"

    // Parse the JSON response
    let insights
    try {
      // Clean response (remove markdown code blocks if present)
      const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      insights = JSON.parse(cleaned)
    } catch (parseError) {
      console.error("Failed to parse insights JSON:", response)
      // Return empty insights if parsing fails
      insights = { facts: [], interests: [], preferences: [], dislikes: [], dealbreakers: [] }
    }

    return NextResponse.json({
      success: true,
      insights
    })

  } catch (error) {
    console.error("Extract insights error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract insights"
      },
      { status: 500 }
    )
  }
}
