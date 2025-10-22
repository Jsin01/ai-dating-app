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

    // Parse different error types for user-friendly messages
    let userMessage = "Something went wrong while creating your video"
    let errorType = "general"

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase()

      // Veo API not available or model not found
      if (errorStr.includes("not found") || errorStr.includes("404")) {
        userMessage = "Video generation is temporarily unavailable. This feature is still in preview and may have limited access."
        errorType = "unavailable"
      }
      // Quota/rate limit errors
      else if (errorStr.includes("quota") || errorStr.includes("rate limit") || errorStr.includes("429")) {
        userMessage = "We've hit our video generation limit for today. Try again tomorrow!"
        errorType = "quota"
      }
      // API key issues
      else if (errorStr.includes("api key") || errorStr.includes("unauthorized") || errorStr.includes("401")) {
        userMessage = "There's a configuration issue. Please contact support."
        errorType = "auth"
      }
      // Content policy violations
      else if (errorStr.includes("policy") || errorStr.includes("safety")) {
        userMessage = "Your description couldn't be processed. Try describing yourself differently!"
        errorType = "policy"
      }
      // Timeout errors
      else if (errorStr.includes("timeout") || errorStr.includes("timed out")) {
        userMessage = "Video generation took too long. Please try again with a simpler description."
        errorType = "timeout"
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        errorType
      },
      { status: 500 }
    )
  }
}
