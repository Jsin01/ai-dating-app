import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import OpenAI from "openai"
import { writeFile } from "fs/promises"
import { join } from "path"
import type { GlimpseGenerationRequest, Glimpse } from "@/lib/types"
import { getMatchByName } from "@/lib/match-profiles"

// Initialize the Gemini client for video and description
const client = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
})

// Initialize OpenAI client for image fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body: GlimpseGenerationRequest = await request.json()
    const { scenario, userContext, matchName, userInterests } = body

    // Generate unique ID for this glimpse
    const glimpseId = `glimpse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    let glimpse: Glimpse
    let mediaUrl: string
    let isVideo = true
    let generatedPrompt: string

    // Try video generation first with Veo 3.1
    try {
      // Build the Veo prompt
      const veoPrompt = buildVeoPrompt(body)
      generatedPrompt = veoPrompt

      console.log("Generating glimpse with Veo 3.1...")
      console.log("Prompt:", veoPrompt)

      // Call Veo 3.1 API to generate video
      let operation = await client.models.generateVideos({
        model: "veo-3.1-generate-preview",
        prompt: veoPrompt,
        config: {
          durationSeconds: 8,
          aspectRatio: "16:9",
          resolution: "720p",
          personGeneration: "allow_all",
        },
      })

      console.log("Video generation started, polling for completion...")

      // Poll the operation status until the video is ready
      while (!operation.done) {
        await delay(10000) // Wait 10 seconds
        operation = await client.operations.getVideosOperation({ operation })
        console.log("Polling... done:", operation.done)
      }

      console.log("Video generation complete!")

      // Download the generated video
      const generatedVideo = operation.response?.generatedVideos?.[0]
      if (!generatedVideo?.video?.uri) {
        console.error("No video in response:", operation.response)
        throw new Error("No video generated")
      }

      const videoUri = generatedVideo.video.uri
      console.log("Generated video URI:", videoUri)
      console.log("Downloading video file with authenticated fetch...")

      // Download the video with API key authentication
      const videoResponse = await fetch(videoUri, {
        headers: {
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
        },
      })

      if (!videoResponse.ok) {
        console.error("Failed to download video:", videoResponse.status, videoResponse.statusText)
        throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`)
      }

      const videoArrayBuffer = await videoResponse.arrayBuffer()
      console.log("Video downloaded, size:", videoArrayBuffer.byteLength, "bytes")

      // Save video to public/glimpses directory
      const filename = `${glimpseId}.mp4`
      const filepath = join(process.cwd(), "public", "glimpses", filename)

      const buffer = Buffer.from(videoArrayBuffer)
      await writeFile(filepath, buffer)

      console.log(`Video saved to: ${filepath}`)
      mediaUrl = `/glimpses/${filename}`

    } catch (videoError) {
      console.log("Video generation failed, falling back to image generation...")
      console.error("Video error:", videoError)

      // Fallback to DALL-E 3 for image generation
      const imagePrompt = await buildImagePrompt(body)
      generatedPrompt = imagePrompt
      console.log("Generating image with DALL-E 3...")
      console.log("Image prompt:", imagePrompt)

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1792x1024", // 16:9 aspect ratio
        quality: "hd",
      })

      console.log("DALL-E 3 response received")

      const imageUrl = response.data[0]?.url
      if (!imageUrl) {
        throw new Error("No image URL in DALL-E response")
      }

      console.log("Image URL:", imageUrl)

      // Download the image
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`)
      }

      const imageArrayBuffer = await imageResponse.arrayBuffer()
      const imageBuffer = Buffer.from(imageArrayBuffer)
      console.log("Image downloaded, size:", imageBuffer.byteLength, "bytes")

      // Save image to public/glimpses directory
      const filename = `${glimpseId}.jpg`
      const filepath = join(process.cwd(), "public", "glimpses", filename)
      await writeFile(filepath, imageBuffer)

      console.log(`Image saved to: ${filepath}`)
      mediaUrl = `/glimpses/${filename}`
      isVideo = false
    }

    // Generate AI description using Gemini
    const description = await generateDescription({ scenario, matchName, userContext, userInterests })

    // Create the glimpse object
    glimpse = {
      id: glimpseId,
      title: generateTitle(scenario),
      description,
      prompt: generatedPrompt,
      videoUrl: isVideo ? mediaUrl : undefined,
      thumbnailUrl: mediaUrl,
      status: "ready",
      createdAt: new Date(),
      matchName,
      scenario,
    }

    return NextResponse.json({ success: true, glimpse })
  } catch (error) {
    console.error("Error generating glimpse:", error)

    // Check if it's a quota error
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")

    if (isQuotaError) {
      return NextResponse.json(
        {
          success: false,
          error: "quota_exceeded",
          message: "Video generation is temporarily unavailable due to high demand. Your glimpse request has been saved!",
          userMessage: "hey alice... so i tried to create that glimpse but we hit our video generation limit for today 😅 don't worry though - i saved your request and we'll make it as soon as we can! in the meantime, want to keep chatting about what you're looking for?",
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "generation_failed",
        message: error instanceof Error ? error.message : "Failed to generate glimpse",
        userMessage: "hmm something went wrong creating that glimpse... want to try describing what you're looking for in a different way?",
      },
      { status: 500 }
    )
  }
}

async function buildImagePrompt(request: GlimpseGenerationRequest): Promise<string> {
  const { scenario, userInterests, matchAppearance, matchName } = request

  // User persona - Alice, 35-year-old Asian woman from Los Angeles
  const userDescription = `a 35-year-old Asian woman with shoulder-length dark hair, warm smile, casual-elegant style`

  // Match description - use provided appearance or fallback
  const matchDescription = matchAppearance || `a man`

  // Use Gemini to generate a photorealistic image prompt
  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: [{
        role: 'user',
        parts: [{
          text: `You are an expert at writing optimized DALL-E 3 prompts for photorealistic candid photographs.

Create a DALL-E 3 prompt for this dating scenario:

SCENARIO: ${scenario}
ALICE: ${userDescription}
MATCH: ${matchDescription}
${userInterests && userInterests.length > 0 ? `INTERESTS: ${userInterests.join(", ")}` : ""}

STRUCTURE YOUR PROMPT IN THIS EXACT ORDER:

1. **START WITH KEY SUBJECT** (front-load most important):
   "Candid iPhone photograph: 35-year-old Asian woman with shoulder-length dark hair, warm smile, and [match description] ${scenario}"

2. **LIGHTING & ATMOSPHERE** (critical for quality):
   - ALWAYS include: "bright natural daylight" OR "warm golden hour light" OR "well-lit interior"
   - Add mood: "joyful atmosphere, genuine happiness"

3. **SPECIFIC DETAILS** (comma-separated):
   - Exact activity/pose: "mid-laugh", "making eye contact", "reaching for [object]"
   - Location specifics: venue type, environmental details
   - Background: "bustling background with other people"

4. **PHOTOGRAPHIC STYLE** (establish realism):
   "Shallow depth of field, natural bokeh, slight motion blur, real skin texture, unposed candid moment, documentary photography style"

5. **QUALITY DESCRIPTORS** (end strong):
   "Photorealistic, natural grain, authentic moment, 16:9 aspect ratio"

CRITICAL RULES:
- Use ONLY positive descriptions (what you want, never "NOT this")
- Front-load Alice's description (35-year-old Asian woman with shoulder-length dark hair)
- Specify "bright" or "well-lit" EARLY in the prompt
- Use photography terminology: candid, bokeh, shallow DOF, golden hour
- Keep total prompt under 300 characters if possible
- Comma-separate distinct elements

EXAMPLE GOOD PROMPT:
"Candid iPhone photograph: 35-year-old Asian woman with shoulder-length dark hair and friendly 32-year-old man playing darts in cozy pub, bright warm lighting, genuine laughter mid-game, making eye contact, busy background with other patrons, shallow depth of field with natural bokeh, slight motion blur from movement, real skin texture, unposed joyful moment, documentary photography style, photorealistic, natural grain, 16:9"

Write ONLY the optimized prompt:`
        }]
      }]
    })

    const generatedPrompt = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (generatedPrompt) {
      return generatedPrompt
    }
  } catch (error) {
    console.error("Error generating image prompt with Gemini:", error)
  }

  // Fallback if Gemini fails - optimized for DALL-E 3
  return `Candid iPhone photograph: 35-year-old Asian woman with shoulder-length dark hair, warm smile, and ${matchDescription} ${scenario}, bright natural daylight, joyful atmosphere, genuine laughter mid-moment, making eye contact, bustling background with other people, shallow depth of field with natural bokeh, slight motion blur from movement, real skin texture, unposed candid moment, documentary photography style, photorealistic, natural grain, authentic happy moment, 16:9 aspect ratio`
}

function buildVeoPrompt(request: GlimpseGenerationRequest): string {
  const { scenario, userInterests, matchAppearance } = request

  // User persona - Alice, 35-year-old Asian woman from Los Angeles
  const userDescription = `a 35-year-old Asian woman with shoulder-length dark hair, warm smile, casual-elegant style`

  // Match description - use provided appearance or fallback
  const matchDescription = matchAppearance || `a man`

  let prompt = `Cinematic first-person POV video with natively generated audio: `

  const scenarioPrompts: Record<string, string> = {
    "comedy club": `Inside a dimly lit comedy club with warm spotlight on stage. ${userDescription} sitting with ${matchDescription} at a small table, both laughing and sharing joy at the comedy show. Warm, intimate lighting. Close-up of genuine smiles and connection between them. Professional cinematography, shallow depth of field. Audio: distant laughter from the crowd, comedian's muffled voice in the background, clinking glasses, ambient chatter.`,
    "coffee shop": `Cozy artisan coffee shop with natural morning light streaming through large windows. ${userDescription} sitting across from ${matchDescription} at a small table, genuine laughter, steam rising from coffee cups. Warm tones, bokeh background, intimate atmosphere. Natural chemistry between them. Audio: soft background music, espresso machine hissing, gentle murmur of conversation, cups clinking.`,
    "art gallery": `Modern art gallery with high ceilings and contemporary artwork. ${userDescription} walking side by side with ${matchDescription}, both pointing at paintings, engaged in conversation. Sophisticated lighting, architectural beauty, cultural atmosphere. Genuine interest in each other's perspectives. Audio: hushed voices echoing softly, footsteps on polished floors, quiet ambient music.`,
    hiking: `Scenic mountain trail with golden hour lighting. ${userDescription} hiking with ${matchDescription}, both reaching a viewpoint together, sharing the breathtaking moment. Natural beauty, adventure, genuine connection. Cinematic landscape shots. Audio: birds chirping, wind rustling through trees, footsteps on gravel path, breeze whistling.`,
    "cooking together": `Bright, modern kitchen. ${userDescription} working with ${matchDescription} to prepare food, laughter, playful flour fight. Warm domestic atmosphere, close-up shots of hands working together, genuine joy and teamwork. Audio: sizzling pan, chopping on cutting board, genuine laughter, playful banter.`,
    "live music": `Intimate music venue, live band performing. ${userDescription} swaying to music with ${matchDescription}, making eye contact, genuine connection. Atmospheric lighting, vibrant energy, shared experience. Chemistry between them. Audio: live band playing soulful music, bass thumping, crowd swaying, ambient venue noise.`,
    "beach sunset": `Golden beach at sunset. ${userDescription} walking along the shoreline with ${matchDescription}. Waves gently lapping, warm orange and pink sky. Romantic atmosphere, peaceful moment, genuine connection. Audio: gentle waves crashing, seagulls calling, soft breeze, footsteps on wet sand.`,
    bookstore: `Charming independent bookstore with floor-to-ceiling shelves. ${userDescription} browsing books with ${matchDescription}, sharing recommendations, quiet conversation. Cozy intellectual atmosphere, warm lighting. Natural rapport between them. Audio: pages rustling, soft whispers, creaking wooden floors, distant classical music.`,
  }

  // Check if scenario matches a predefined template for better quality
  const scenarioKey = Object.keys(scenarioPrompts).find((key) => scenario.toLowerCase().includes(key))

  if (scenarioKey) {
    // Use predefined high-quality prompt
    prompt += scenarioPrompts[scenarioKey]
  } else {
    // Dynamically generate prompt for ANY user-specified scenario
    // This allows complete flexibility for activities like "knitting club", "pottery class", etc.
    prompt += `${userDescription} and ${matchDescription} ${scenario}, genuinely connecting and enjoying each other's company. Warm, cinematic lighting showing authentic moments of joy and connection. Professional cinematography with natural, candid interactions. Audio: ambient environmental sounds, natural conversation, atmospheric background noise appropriate for the setting.`
  }

  if (userInterests && userInterests.length > 0) {
    prompt += ` Atmosphere reflects interests in ${userInterests.join(", ")}.`
  }

  return prompt
}

function generateTitle(scenario: string): string {
  const titles: Record<string, string> = {
    "comedy club": "Comedy Night Vibes",
    "coffee shop": "Coffee & Good Conversation",
    "art gallery": "Gallery Date Energy",
    hiking: "Trail Adventure Together",
    "cooking together": "Cooking Date Vibes",
    "live music": "Live Music Night",
    "beach sunset": "Sunset Beach Walk",
    bookstore: "Bookstore Browsing",
  }

  const key = Object.keys(titles).find((key) => scenario.toLowerCase().includes(key))

  if (key) {
    return titles[key]
  }

  // Dynamic title generation for any scenario
  // Capitalize first letter of each word
  const titleCase = scenario
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return titleCase
}

async function generateDescription(request: GlimpseGenerationRequest): Promise<string> {
  const { scenario, matchName } = request
  const name = matchName || "someone special"

  // Get match details if available
  const match = matchName ? getMatchByName(matchName) : null
  const matchDetails = match
    ? `${match.name} is ${match.age}, a ${match.occupation.toLowerCase()}. He's into ${match.interests.slice(0, 3).join(", ")}. ${match.bio}`
    : ""

  try {
    // Use Gemini to generate an exciting, personalized description
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: [{
        role: 'user',
        parts: [{
          text: `You are Alice's best friend and AI matchmaker. You're SO excited to show her this glimpse of a potential date.

Scenario: Alice and ${name} ${scenario}
${matchDetails}

Write a SHORT (1-2 sentences max), super enthusiastic description that would make Alice excited about this potential date.

Important guidelines:
- Write in lowercase, very casual like texting a friend
- Use phrases like "omg", "wait", "okay so", "this could be", etc.
- Focus on the FEELING and chemistry, not just describing what's happening
- Make it personal and exciting
- No emojis
- Keep it natural and conversational

Example good descriptions:
- "okay so picture this... you two vibing at this spot, and I'm getting MAJOR chemistry here 👀"
- "wait i need you to see this because the energy between you two? absolutely perfect"
- "omg alice this is giving me all the feels... i think this could really be something special"

Now write the description:`
        }]
      }]
    })

    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (generatedText) {
      return generatedText.trim()
    }
  } catch (error) {
    console.error("Error generating description with Gemini:", error)
  }

  // Fallback if Gemini fails
  const fallbacks = [
    `picture this... you and ${name} ${scenario}. the vibe is absolutely right here`,
    `okay so i'm seeing you two ${scenario} and honestly? this could be really special`,
    `wait you need to see this... ${name} and you ${scenario}. i'm getting all the right feels`,
    `this energy between you two ${scenario}... alice i think this could work`,
  ]

  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
