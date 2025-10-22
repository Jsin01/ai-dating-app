import type { Glimpse, GlimpseGenerationRequest } from "./types"

// Veo 3.1 API Integration
// Note: This is a placeholder implementation. In production, you would:
// 1. Set up actual Google Gemini API credentials
// 2. Make real API calls to generate videos with Veo 3.1
// 3. Handle video storage (e.g., upload to S3, Cloudinary, etc.)
// 4. Install @google/genai package: npm install @google/genai

export class VeoAPIService {
  private apiKey: string | undefined

  constructor() {
    // In production, use environment variable
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  }

  /**
   * Generate a glimpse video using Veo 3.1
   */
  async generateGlimpse(request: GlimpseGenerationRequest): Promise<Glimpse & { errorType?: string, userMessage?: string }> {
    try {
      // Call the API route to generate the video
      const response = await fetch("/api/generate-glimpse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Create a failed glimpse with error details
        const glimpseId = this.generateId()
        const veoPrompt = this.buildVeoPrompt(request)

        return {
          id: glimpseId,
          title: this.generateTitle(request.scenario),
          description: this.generateDescription(request),
          prompt: veoPrompt,
          videoUrl: "",
          thumbnailUrl: "",
          status: "failed" as const,
          createdAt: new Date(),
          matchName: request.matchName,
          scenario: request.scenario,
          errorType: errorData.error || "unknown",
          userMessage: errorData.userMessage,
        }
      }

      const data = await response.json()
      return data.glimpse
    } catch (error) {
      console.error("Error generating glimpse:", error)

      // Fallback to mock glimpse if API fails completely
      const glimpseId = this.generateId()
      const veoPrompt = this.buildVeoPrompt(request)

      return {
        id: glimpseId,
        title: this.generateTitle(request.scenario),
        description: this.generateDescription(request),
        prompt: veoPrompt,
        videoUrl: "",
        thumbnailUrl: "",
        status: "failed" as const,
        createdAt: new Date(),
        matchName: request.matchName,
        scenario: request.scenario,
        errorType: "network_error",
        userMessage: "hmm having trouble reaching our servers... mind trying again in a bit?",
      }
    }
  }

  /**
   * Build a detailed Veo 3.1 prompt from the scenario
   * Veo 3.1 supports audio cues, dialogue, and cinematic descriptions
   */
  private buildVeoPrompt(request: GlimpseGenerationRequest): string {
    const { scenario, userContext, matchName, userInterests } = request

    // Create a cinematic, first-person perspective prompt with audio cues
    let prompt = `Cinematic first-person POV video with natively generated audio: `

    // Map common scenarios to detailed Veo 3.1 prompts (with audio cues)
    const scenarioPrompts: Record<string, string> = {
      "comedy club": `Inside a dimly lit comedy club with warm spotlight on stage. Camera slowly pans to show people laughing, sharing joy. Warm, intimate lighting. Close-up of genuine smiles and connection. Professional cinematography, shallow depth of field. Audio: distant laughter from the crowd, comedian's muffled voice in the background, clinking glasses, ambient chatter.`,
      "coffee shop": `Cozy artisan coffee shop with natural morning light streaming through large windows. Two people sitting across from each other, genuine laughter, steam rising from coffee cups. Warm tones, bokeh background, intimate atmosphere. Audio: soft background music, espresso machine hissing, gentle murmur of conversation, cups clinking.`,
      "art gallery": `Modern art gallery with high ceilings and contemporary artwork. Two people walking side by side, pointing at paintings, engaged conversation. Sophisticated lighting, architectural beauty, cultural atmosphere. Audio: hushed voices echoing softly, footsteps on polished floors, quiet ambient music.`,
      "hiking": `Scenic mountain trail with golden hour lighting. First-person view of hiking with someone, reaching a viewpoint, sharing the moment. Natural beauty, adventure, genuine connection. Cinematic landscape shots. Audio: birds chirping, wind rustling through trees, footsteps on gravel path, breeze whistling.`,
      "cooking together": `Bright, modern kitchen. Hands working together preparing food, laughter, playful flour fight. Warm domestic atmosphere, close-up shots, genuine joy and teamwork. Audio: sizzling pan, chopping on cutting board, genuine laughter, playful banter.`,
      "live music": `Intimate music venue, live band performing. Two people swaying to music, making eye contact, genuine connection. Atmospheric lighting, vibrant energy, shared experience. Audio: live band playing soulful music, bass thumping, crowd swaying, ambient venue noise.`,
      "beach sunset": `Golden beach at sunset, walking along shoreline. Waves gently lapping, warm orange and pink sky. Romantic atmosphere, peaceful moment, genuine connection. Audio: gentle waves crashing, seagulls calling, soft breeze, footsteps on wet sand.`,
      "bookstore": `Charming independent bookstore with floor-to-ceiling shelves. Browsing books together, sharing recommendations, quiet conversation. Cozy intellectual atmosphere, warm lighting. Audio: pages rustling, soft whispers, creaking wooden floors, distant classical music.`,
    }

    // Find matching scenario or use generic prompt
    const scenarioKey = Object.keys(scenarioPrompts).find((key) =>
      scenario.toLowerCase().includes(key)
    )

    if (scenarioKey) {
      prompt += scenarioPrompts[scenarioKey]
    } else {
      // Generic fallback
      prompt += `${scenario}. Two people genuinely connecting and enjoying each other's company. Warm, cinematic lighting. Professional cinematography capturing authentic moments of joy and connection.`
    }

    // Add context if available
    if (userInterests && userInterests.length > 0) {
      prompt += ` Atmosphere reflects interests in ${userInterests.join(", ")}.`
    }

    return prompt
  }

  /**
   * Generate a title for the glimpse
   */
  private generateTitle(scenario: string): string {
    const titles: Record<string, string> = {
      "comedy club": "Laughter at the Comedy Club",
      "coffee shop": "Coffee & Conversation",
      "art gallery": "An Artistic Connection",
      "hiking": "Adventure Awaits",
      "cooking together": "Cooking Up Chemistry",
      "live music": "Lost in the Music",
      "beach sunset": "Sunset Stroll",
      "bookstore": "Between the Pages",
    }

    const key = Object.keys(titles).find((key) =>
      scenario.toLowerCase().includes(key)
    )

    return key ? titles[key] : `A Glimpse: ${scenario}`
  }

  /**
   * Generate a description for the glimpse
   */
  private generateDescription(request: GlimpseGenerationRequest): string {
    const { scenario, matchName } = request
    const name = matchName || "someone special"

    return `AI-generated preview of a potential date with ${name} ${scenario}. Experience what this moment could feel like.`
  }

  /**
   * Get mock video URL (placeholder)
   */
  private getMockVideoUrl(scenario: string): string {
    // In production, this would return the actual Sora-generated video URL
    // For now, return a placeholder video or null
    return ""
  }

  /**
   * Get mock thumbnail URL (placeholder)
   */
  private getMockThumbnailUrl(scenario: string): string {
    // In production, extract thumbnail from video or use custom thumbnail
    return ""
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `glimpse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if Veo API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Export singleton instance
export const veoAPI = new VeoAPIService()

// Backward compatibility export
export const soraAPI = veoAPI
