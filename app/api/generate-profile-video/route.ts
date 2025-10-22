import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const client = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userDescription, interests, vibe, name, age } = await request.json()

    if (!userDescription) {
      return NextResponse.json(
        { success: false, error: "User description is required" },
        { status: 400 }
      )
    }

    // Construct cinematic Veo prompt for profile video
    const veoPrompt = `Cinematic profile video: ${userDescription}.
${interests ? `Interests: ${interests}. ` : ''}
${vibe ? `Vibe: ${vibe}. ` : ''}
Shot in golden hour lighting, shallow depth of field, 24mm lens.
The person is ${name || 'a young professional'}, ${age || '28'} years old,
looking confident and authentic. Warm, inviting atmosphere.
Professional dating profile aesthetic. 5 seconds, 16:9 ratio.`

    console.log("Generating profile video with prompt:", veoPrompt)

    // Generate video with Veo 3.1
    const result = await client.models.generateContent({
      model: "veo-3.1-generate-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: veoPrompt }]
        }
      ]
    })

    console.log("Veo result:", JSON.stringify(result, null, 2))

    // Extract video URL from response
    const videoUrl = result.candidates?.[0]?.content?.parts?.[0]?.fileData?.fileUri

    if (!videoUrl) {
      throw new Error("No video URL in response")
    }

    return NextResponse.json({
      success: true,
      videoUrl,
      prompt: veoPrompt
    })

  } catch (error) {
    console.error("Profile video generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate profile video"
      },
      { status: 500 }
    )
  }
}
