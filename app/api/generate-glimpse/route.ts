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

// Initialize xAI client for image fallback
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
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

      // Fallback to xAI Grok for image generation
      const imagePrompt = await buildImagePrompt(body)
      generatedPrompt = imagePrompt
      console.log("Generating image with xAI Grok...")
      console.log("Image prompt:", imagePrompt)

      const response = await xai.images.generate({
        model: "grok-2-image-1212",
        prompt: imagePrompt,
        n: 1,
      })

      console.log("xAI Grok response received")

      const imageUrl = response.data[0]?.url
      if (!imageUrl) {
        throw new Error("No image URL in xAI response")
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

    // Generate AI description and title using Gemini
    const [description, title] = await Promise.all([
      generateDescription({ scenario, matchName, userContext, userInterests }),
      generateTitle(scenario, matchName)
    ])

    // Create the glimpse object
    glimpse = {
      id: glimpseId,
      title,
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
  // VERY DETAILED description to ensure consistency across all glimpses
  const userDescription = `Alice, a 35-year-old East Asian woman with these specific physical features: straight shoulder-length dark brown hair (reaches mid-shoulder blade) with subtle face-framing layers, almond-shaped dark brown eyes with double eyelids, defined cheekbones with soft oval face shape, warm genuine smile showing white teeth, light-medium warm-toned skin (MAC NC25-30 range), 5'5" (165cm) tall, 125-130 lbs (57-59kg), athletic-slender build with toned arms and legs, small-medium frame. She's wearing casual-chic LA style: fitted dark blue jeans (skinny or slim-fit), a cream or white long-sleeve cotton top (slightly fitted), minimal gold jewelry (small 15mm hoop earrings, delicate gold chain necklace), natural makeup with subtle brown eyeliner and nude-pink lipstick. Her expression is confident, warm, and genuinely happy with relaxed posture`

  // Match description - use provided appearance or fallback
  const matchDescription = matchAppearance || `a friendly man in his early 30s with casual style`

  // Use Gemini to generate a photorealistic image prompt
  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: [{
        role: 'user',
        parts: [{
          text: `You are an expert at writing optimized image prompts for xAI Grok's Aurora model (grok-2-image-1212).

CRITICAL KNOWLEDGE ABOUT GROK:
- Grok EXCELS at photorealistic images and following detailed prompts
- Grok responds VERY WELL to atmospheric details (lighting, mood, weather, time of day)
- Grok loves cinematic/photographic language: "bokeh", "wide-angle", "golden hour", "soft morning light"
- Optimal prompt length: 600-700 characters with clear focus
- Grok's chat model will revise your prompt for clarity before image generation

Create an xAI Grok image prompt for this dating scenario:

SCENARIO: ${scenario}
ALICE (THE USER - MUST LOOK EXACTLY THE SAME IN EVERY GLIMPSE): ${userDescription}
MATCH: ${matchDescription}
${userInterests && userInterests.length > 0 ? `INTERESTS: ${userInterests.join(", ")}` : ""}

**CRITICAL REQUIREMENTS**:
0. MOST IMPORTANT: Include ALL of Alice's specific physical features (hair style/color, eye shape, facial features, height, build, outfit details) EXACTLY as described. This ensures she looks the same across all glimpses.
1. The image MUST show them doing the EXACT activity: ${scenario}
2. Include specific props/equipment that prove it's this activity
3. Front-load the most important details (subject and location first)
4. Emphasize atmospheric details (lighting, mood, weather)
5. Use photographic/cinematic terminology
6. Aim for 600-700 characters total

STRUCTURE (in this order):

**SUBJECT & LOCATION** (most important - say this first):
"Photorealistic candid photograph: [exact venue/location for ${scenario}]. 35-year-old Asian woman with shoulder-length dark hair and warm smile, alongside [match description]."

**ACTION & PROPS** (prove it's this activity):
Be specific about what they're doing and what's visible:
- Bowling → "both holding colorful bowling balls, standing at polished lane with pins visible, wearing bowling shoes"
- Coffee → "sitting at small wooden table, steaming coffee cups in hands, espresso machine visible in background"
- Tubing → "sitting in bright inner tubes on river water, wearing life vests, paddles in hands, water splashing"
- Hiking → "walking mountain trail, wearing backpacks, hiking boots visible, trail markers in background"

**ATMOSPHERE & LIGHTING** (Grok's strength - be detailed):
- Time of day: "soft morning light" / "golden hour sunset" / "bright midday sun"
- Weather/mood: "warm autumn day" / "crisp winter air" / "gentle breeze" / "misty morning"
- Emotional energy: "joyful laughter" / "peaceful contentment" / "playful energy"

**PHOTOGRAPHIC STYLE** (cinematic language):
"Wide-angle shot, shallow depth of field, natural bokeh, slight motion blur from movement, unposed candid moment, real skin texture, documentary photography style"

**QUALITY** (end strong):
"Photorealistic, natural film grain, authentic happy moment"

EXAMPLES (600-700 chars each):

Bowling: "Photorealistic candid photograph: bustling bowling alley interior. Alice, 35-year-old East Asian woman with straight shoulder-length dark brown hair (reaches mid-shoulder blade) with subtle face-framing layers, almond-shaped dark brown eyes with double eyelids, defined cheekbones with soft oval face shape, warm genuine smile showing white teeth, light-medium warm-toned skin (MAC NC25-30 range), 5'5" (165cm) tall, 125-130 lbs, athletic-slender build with toned arms and legs, wearing fitted dark blue jeans and cream long-sleeve top with small 15mm gold hoop earrings, alongside friendly man in his early 30s. Both holding colorful bowling balls, standing at polished wooden lane with pins visible down the lane, wearing bowling shoes. Bright overhead bowling alley lighting with colorful neon accents, late evening atmosphere. Genuine laughter mid-game, making eye contact, other bowlers and glowing scoreboards visible in background. Wide-angle shot, shallow depth of field, natural bokeh, slight motion blur, real skin texture, unposed joyful moment, documentary photography style. Photorealistic, natural film grain."

Coffee: "Photorealistic candid photograph: cozy artisan coffee shop interior with large windows. Alice, 35-year-old East Asian woman with straight shoulder-length dark brown hair with subtle layers, almond-shaped dark brown eyes, defined cheekbones, warm genuine smile, medium skin tone, athletic-slender build wearing fitted dark jeans and white long-sleeve top with delicate gold necklace, natural makeup, alongside friendly man in his early 30s, sitting across from each other at small wooden table. Both holding steaming ceramic coffee cups, espresso machine and menu board visible in background. Soft morning light streaming through windows, warm golden tones, peaceful Saturday morning atmosphere. Genuine laughter mid-conversation, making eye contact, other customers reading books visible behind them. Wide-angle shot, shallow depth of field, natural bokeh on background, real skin texture, unposed intimate moment, documentary photography style. Photorealistic, natural film grain."

River tubing: "Photorealistic candid photograph: calm river surrounded by trees. Alice, 35-year-old East Asian woman with straight shoulder-length dark brown hair, almond-shaped dark brown eyes, defined cheekbones, warm smile, medium skin tone, athletic-slender build wearing fitted jeans and cream top under orange life vest, alongside friendly man in his early 30s, sitting in bright colored inner tubes floating on clear river water. Both wearing orange life vests, holding wooden paddles, water splashing and creating ripples around tubes. Golden hour sunlight reflecting off water surface, warm summer afternoon, gentle breeze. Trees along riverbank visible, genuine laughter and joy, making eye contact, water droplets suspended in air catching sunlight. Wide-angle shot, shallow depth of field, slight motion blur from water movement, real skin texture, candid adventure moment, documentary photography style. Photorealistic, natural film grain."

Write ONLY the optimized Grok prompt for "${scenario}" (aim for 600-700 characters):`
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

  // Fallback if Gemini fails - optimized for xAI Grok
  return `Photorealistic candid photograph: ${scenario} date setting. Alice, a 35-year-old East Asian woman with straight shoulder-length dark brown hair (reaches mid-shoulder blade) with subtle face-framing layers, almond-shaped dark brown eyes with double eyelids, defined cheekbones with soft oval face shape, warm genuine smile showing white teeth, light-medium warm-toned skin (MAC NC25-30 range), 5'5" (165cm) tall, 125-130 lbs (57-59kg), athletic-slender build with toned arms and legs, small-medium frame, wearing fitted dark blue jeans and cream long-sleeve cotton top with small gold hoop earrings (15mm) and delicate gold chain necklace, natural makeup, alongside ${matchDescription}. Both actively enjoying ${scenario}, genuine laughter and connection, making eye contact. Bright natural lighting, warm atmosphere, joyful energy. Wide-angle shot, shallow depth of field, natural bokeh, slight motion blur from movement, real skin texture, unposed candid moment, documentary photography style. Photorealistic, natural film grain, authentic happy moment.`
}

function buildVeoPrompt(request: GlimpseGenerationRequest): string {
  const { scenario, userInterests, matchAppearance } = request

  // User persona - Alice, 35-year-old Asian woman from Los Angeles
  // VERY DETAILED description to ensure consistency across all glimpses
  const userDescription = `Alice, a 35-year-old East Asian woman with these specific physical features: straight shoulder-length dark brown hair (reaches mid-shoulder blade) with subtle face-framing layers, almond-shaped dark brown eyes with double eyelids, defined cheekbones with soft oval face shape, warm genuine smile showing white teeth, light-medium warm-toned skin (MAC NC25-30 range), 5'5" (165cm) tall, 125-130 lbs (57-59kg), athletic-slender build with toned arms and legs, small-medium frame, wearing casual-chic LA style (fitted dark blue jeans, cream or white long-sleeve cotton top, minimal gold jewelry - small 15mm hoop earrings and delicate gold chain necklace), natural makeup with subtle brown eyeliner and nude-pink lipstick, confident and genuinely happy expression with relaxed posture`

  // Match description - use provided appearance or fallback
  const matchDescription = matchAppearance || `a friendly man in his early 30s with casual style`

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

async function generateTitle(scenario: string, matchName?: string): Promise<string> {
  try {
    // Use Gemini to generate a catchy, contextual title
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-09-2025",
      contents: [{
        role: 'user',
        parts: [{
          text: `Generate a short, catchy title for a dating glimpse (AI-generated preview of a date).

Scenario: ${scenario}
${matchName ? `Match: ${matchName}` : ''}

Requirements:
- Keep it VERY SHORT: 2-4 words max
- Make it exciting and fun (this is a dating app!)
- Capture the vibe/energy of the activity
- Use casual, modern language
- No emojis

Examples of good titles:
- "Comedy Night Vibes"
- "Coffee & Good Conversation"
- "Trail Adventure Together"
- "River Tubing Adventure"
- "Live Music Night"
- "Sunset Beach Walk"
- "Bowling Date Energy"

Write ONLY the title (no quotes, no explanation):`
        }]
      }]
    })

    const generatedTitle = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (generatedTitle) {
      return generatedTitle.replace(/['"]/g, '') // Remove any quotes
    }
  } catch (error) {
    console.error("Error generating title with Gemini:", error)
  }

  // Fallback: Simple title case of scenario
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
