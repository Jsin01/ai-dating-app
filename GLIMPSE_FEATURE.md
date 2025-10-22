# Glimpse Feature Documentation

## Overview

The **Glimpse** feature is an innovative AI-powered video preview system that creates cinematic visualizations of potential date scenarios. When users discuss date ideas in the chat (like going to a comedy club, coffee shop, etc.), the AI automatically generates a "glimpse" - a short AI-generated video preview with natively generated audio using Google's Veo 3.1 model.

## How It Works

1. **Scenario Detection**: The AI chat monitors conversation for date-related keywords (comedy, coffee, hiking, etc.)
2. **Context Analysis**: When a scenario is detected, the system gathers context from recent messages
3. **Veo Prompt Generation**: A detailed cinematic prompt with audio cues is constructed based on the scenario
4. **Video Generation**: The prompt is sent to Veo 3.1 API to generate a short video with synchronized audio
5. **Glimpse Display**: A beautiful card appears in the chat with a link to view the generated video

## Supported Scenarios

The system currently detects and generates glimpses for:

- **Comedy Club**: Stand-up comedy, laughing together
- **Coffee Shop**: Cozy café conversations
- **Art Gallery**: Museum and art exhibition visits
- **Hiking**: Mountain trails and outdoor adventures
- **Cooking Together**: Kitchen collaboration and fun
- **Live Music**: Concerts and live performances
- **Beach Sunset**: Romantic seaside moments
- **Bookstore**: Literary browsing and discussions
- **Wine Tasting**: Vineyard experiences
- **Dancing**: Club or dance floor moments

## User Experience Flow

```
1. User chats with AI about date preferences
   ↓
2. User mentions "I love comedy shows" or "coffee is my thing"
   ↓
3. AI responds: "Let me create a Glimpse for you..."
   ↓
4. Loading indicator appears (2-3 seconds)
   ↓
5. Beautiful glimpse card appears in chat
   ↓
6. User clicks to view full-screen cinematic preview
   ↓
7. Video with audio plays (or shows Veo prompt if not configured)
```

## Technical Implementation

### File Structure

```
lib/
  ├── types.ts                 # TypeScript types for Glimpse and Message
  ├── sora-api.ts              # Veo 3.1 API integration service
  └── glimpse-store.ts         # In-memory glimpse storage

components/
  ├── ai-chat-interface.tsx    # Chat with glimpse detection
  └── glimpse-viewer.tsx       # Full-screen video player

app/
  └── glimpse/[id]/page.tsx    # Dynamic glimpse route
```

### Key Components

**VeoAPIService** (`lib/sora-api.ts`)
- Handles communication with Google Gemini Veo 3.1 API
- Constructs detailed cinematic prompts with audio cues
- Maps scenarios to visual and audio descriptions
- Returns Glimpse objects with video URLs

**GlimpseStore** (`lib/glimpse-store.ts`)
- Simple in-memory storage for glimpses
- Production: Replace with database (MongoDB, PostgreSQL, etc.)

**AIChatInterface** (`components/ai-chat-interface.tsx`)
- Detects date scenarios in real-time
- Triggers glimpse generation
- Displays glimpse cards inline
- Awards bonus XP for glimpses

**GlimpseViewer** (`components/glimpse-viewer.tsx`)
- Full-screen cinematic video player
- Shows title, description, and AI prompt
- Plays Veo-generated videos with audio
- Displays placeholder when video pending

## Production Setup

### 1. Get Google Gemini API Access

```bash
# Sign up for Google AI Studio
# Get your API key from https://aistudio.google.com/apikey
```

### 2. Install Required Dependencies

```bash
npm install @google/genai
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Update Veo API Integration

In `lib/sora-api.ts`, uncomment the actual API call:

```typescript
// Uncomment this section and remove the mock delay
import { genai } from '@google/genai';
const client = new genai.Client({ apiKey: this.apiKey });

const operation = await client.models.generate_videos({
  model: 'veo-3.1-generate-preview',
  prompt: veoPrompt,
  config: {
    duration_seconds: 8,
    aspect_ratio: '16:9',
    resolution: '720p',
    person_generation: 'allow_all'
  }
});

// Poll the operation status until the video is ready
while (!operation.done) {
  await this.delay(10000);
  operation = await client.operations.get(operation);
}

// Download the generated video
const generatedVideo = operation.response.generated_videos[0];
await client.files.download({ file: generatedVideo.video });
generatedVideo.video.save(`${glimpseId}.mp4`);
```

### 5. Set Up Video Storage

Videos should be stored in cloud storage:

**Option A: AWS S3**
```bash
npm install @aws-sdk/client-s3
```

**Option B: Cloudinary**
```bash
npm install cloudinary
```

**Option C: Vercel Blob Storage**
```bash
npm install @vercel/blob
```

### 6. Replace In-Memory Store with Database

Update `lib/glimpse-store.ts` to use your database:

**MongoDB Example:**
```typescript
import { MongoClient } from 'mongodb'

class GlimpseStore {
  async save(glimpse: Glimpse) {
    await db.collection('glimpses').insertOne(glimpse)
  }

  async get(id: string) {
    return await db.collection('glimpses').findOne({ id })
  }
}
```

## Testing the Feature

### Quick Test Flow

1. Start the app: `npm run dev`
2. Navigate to the chat (Echo tab)
3. Type: "I love going to comedy shows!"
4. Watch for the glimpse generation
5. Click the glimpse card to view full screen
6. See the Sora prompt and placeholder

### Example Test Messages

```
"I'd love to go to a coffee shop for a first date"
"Comedy clubs are my favorite - I love laughing!"
"How about hiking together? I love nature"
"I enjoy cooking together in the kitchen"
```

## Customization

### Add New Scenarios

Edit the `detectDateScenario` function in `components/ai-chat-interface.tsx`:

```typescript
const scenarios = [
  { keywords: ["yoga", "meditation", "zen"], scenario: "at a yoga class" },
  { keywords: ["escape room", "puzzle"], scenario: "solving an escape room" },
  // Add more...
]
```

Then update the prompt templates in `lib/sora-api.ts`:

```typescript
const scenarioPrompts: Record<string, string> = {
  "yoga class": `Peaceful yoga studio with natural light... Audio: gentle breathing, soft ambient music, rustling mats.`,
  "escape room": `Exciting escape room challenge... Audio: ticking clock, clicking locks, excited whispers.`,
  // Add corresponding prompts with audio cues...
}
```

### Customize Veo Prompts

Edit `buildVeoPrompt` in `lib/sora-api.ts` to fine-tune the cinematic style and audio:

```typescript
// Add more detail, change lighting, adjust mood, and include audio cues
prompt += `Shot on 35mm film, golden hour lighting, intimate close-ups. Audio: soft dialogue, ambient sounds, natural environment.`
```

## Performance Considerations

- **Caching**: Implement caching for generated videos
- **Async Generation**: Generate videos in background jobs
- **Rate Limiting**: Limit glimpse generation to prevent API costs
- **Video Compression**: Compress videos before storage
- **CDN**: Use CDN for video delivery (Cloudflare, CloudFront)

## Future Enhancements

- [ ] Allow users to regenerate glimpses
- [ ] Add glimpse history/gallery
- [ ] Share glimpses with matches
- [ ] Customize video length and style
- [ ] Add music/soundtrack options
- [ ] Generate multiple angle variations
- [ ] A/B test different prompts
- [ ] Add glimpse reactions/likes

## Troubleshooting

**Glimpse not generating?**
- Check console for errors
- Verify scenario keywords are matching
- Ensure at least 2 messages exchanged

**Video not playing?**
- Check if `videoUrl` is populated
- Verify Veo API is configured
- Check browser video codec support
- Ensure audio is enabled in browser

**Performance slow?**
- Enable caching in production
- Use CDN for video delivery
- Implement lazy loading

## Cost Estimation

Veo 3.1 API pricing:
- Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)
- Videos can be 4, 6, or 8 seconds (720p or 1080p)
- Recommend: Limit to 3 glimpses per user per day
- Cache and reuse glimpses for similar scenarios
- Videos are stored on the server for 2 days, download within this period

## Support

For questions or issues:
- Check the [Google Veo 3.1 documentation](https://ai.google.dev/gemini-api/docs/video-generation)
- Review `lib/sora-api.ts` for implementation details
- Test with console.log debugging in development

---

**Built with ❤️ using Next.js, React, and Google Veo 3.1**
