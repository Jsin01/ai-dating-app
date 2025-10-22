# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Glimpse" - an AI-powered dating app that uses **friend-of-friend introductions** via conversational AI (Google Gemini) and AI-generated video "glimpses" (Google Veo 3.1). The user (Alice, 35, Asian woman in LA) chats with an AI matchmaker that learns her preferences and creates cinematic video previews of potential dates.

**Key Concept**: "Glimpses" are AI-generated cinematic video previews with natively generated audio showing what a potential date scenario could look like with a match, powered by Google's Veo 3.1 API.

**CRITICAL DESIGN PRINCIPLES**:
1. All conversation must be **natural language driven via Gemini AI**
2. The AI matchmaker treats glimpses as an internal visualization tool (NOT a promoted feature)
3. **MESSAGE LENGTH**: Responses MUST be 15-25 words max (like texting a friend)
4. **GLIMPSE FREQUENCY**: Rare and special - only 1 in 10-15 messages, only after 15+ total messages
5. **CONVERSATION FIRST**: Primary role is deep conversation to understand the user, NOT pushing matches/glimpses
6. **DON'T INTERROGATE**: Mix reactions (40%), relating (30%), and questions (30%) - not every message needs a question

## Development Commands

**Package Manager**: This project uses **Bun** (not npm). Always use Bun for maximum performance.

```bash
# Development (runs on port 3001 by default)
bun run dev
PORT=3001 bun run dev  # Explicit port

# Production build
bun run build
bun start

# Linting
bun run lint

# Install dependencies
bun install

# Add new package
bun add <package>

# Testing
node test-veo.mjs    # Test Veo 3.1 → xAI Grok fallback
node test-xai.mjs    # Test xAI Grok image generation directly
node test-image-fallback.mjs  # Test glimpse image fallback system
node test-chat-improvements.mjs  # Test chat UX with automated conversation
node test-date-coordination-simple.mjs  # Test date proposal APIs
node test-date-proposal-ui.mjs          # Test date proposal UI rendering
node screenshot-glimpse.mjs     # Screenshot glimpse UI
node screenshot-image-glimpse.mjs  # Screenshot image glimpse
node screenshot-profile.mjs     # Screenshot profile page
npx playwright screenshot --device="iPhone 14 Pro" http://localhost:3001 <output.png>  # Mobile screenshot
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16.0.0 (App Router with Turbopack)
- **Runtime**: Bun 1.3.0 (development runtime - much faster than Node.js)
- **UI**: React 19, Tailwind CSS v4 (with oklch color system)
- **Components**: Radix UI primitives with shadcn/ui patterns
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS v4 with custom CSS variables, tw-animate-css
- **AI Integration**:
  - Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite-preview-09-2025`) (conversational AI)
  - Google Veo 3.1 (`veo-3.1-generate-preview`) for video generation (primary)
  - xAI Grok (`grok-2-image-1212`) for static image fallback when video fails
  - API Keys: `NEXT_PUBLIC_GEMINI_API_KEY` (Gemini), `XAI_API_KEY` (xAI)
- **Identity Verification**: Stripe Identity for ID scanning and verification
- **State**: localStorage + in-memory stores (production would use database)
- **Mobile-First**: Entire app constrained to max-width 430px (iPhone size) with black background for clear iPhone outline

### Project Structure

```
/app                    # Next.js App Router pages
  /[route]             # Individual route pages (onboarding, profile, matches, etc.)
  layout.tsx           # Root layout with Vercel Analytics
  globals.css          # Tailwind imports and CSS custom properties

/components            # React components
  /ui                  # Reusable UI primitives (68+ components)
  ai-chat-interface.tsx      # Main AI chat with glimpse generation
  glimpse-viewer.tsx         # Video glimpse player/viewer
  matches-view.tsx           # Match browsing interface
  profile-settings.tsx       # User profile management
  rewards-marketplace.tsx    # XP/rewards system
  onboarding-flow.tsx        # Multi-step onboarding
  [other features].tsx

/lib                   # Utilities and services
  sora-api.ts         # Veo 3.1 API client (video generation with audio)
  match-profiles.ts   # 5 hardcoded match profiles (Marcus, David, James, Ryan, Alex)
  user-profile.ts     # User RAG system for learning about Alice
  glimpse-store.ts    # In-memory glimpse storage
  date-store.ts       # In-memory date proposal storage
  calendar-integration.ts        # Real calendar URL/ICS generation
  accommodation-coordination.ts  # Mock booking coordination
  types.ts            # TypeScript type definitions (Message, Glimpse, DateProposal, etc.)
  utils.ts            # Utility functions

/app/api              # API routes
  /chat              # Gemini conversational AI endpoint
  /generate-glimpse  # Veo 3.1 video generation endpoint (match glimpses)
  /generate-profile-video  # Veo 3.1 profile video generation
  /identity          # Stripe Identity verification endpoints
  /dates             # Date coordination endpoints
    /propose         # Create and retrieve date proposals
    /respond         # Accept/decline date proposals
```

### Core Architecture Patterns

#### 0. Three-Layer AI System (CRITICAL)

The app uses a sophisticated three-layer AI architecture where ALL conversation is dynamically generated:

**Layer 1: Conversational AI** (`/app/api/chat/route.ts`)
- **Model**: Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite-preview-09-2025`)
- **Purpose**: Natural matchmaker personality that learns about Alice
- **System Prompt**: Defines personality (warm, enthusiastic friend), tone (lowercase, casual), and behaviors
- **Context**: User RAG data + match profiles summary + message count
- **CRITICAL CONSTRAINTS**:
  - **MESSAGE LENGTH**: Maximum 1-2 sentences, 15-25 words (see lines 44-50)
  - **DON'T INTERROGATE**: Mix reactions/empathy (40%), relating (30%), questions (30%)
  - **NOT EVERY MESSAGE NEEDS A QUESTION** - real friends react, empathize, and relate
  - **If over 25 words, CUT IT DOWN** - ruthless brevity required
- **Key Behaviors**:
  - PRIMARY ROLE: Deep conversation to understand Alice (lines 59-64)
  - Sometimes react with empathy or relate - don't always ask
  - Response types: "omg love that", "same honestly", "what's making it rough?"
  - Only after 15+ messages should matches even be considered
  - Glimpses are RARE (1 in 10-15 messages) - NOT the main focus
  - VARIATION IS CRITICAL - changes phrasing, energy, focus to avoid repetition

**Layer 2: Build-up Message Generation** (`components/ai-chat-interface.tsx:generateBuildUpMessage`)
- **Purpose**: Keep user engaged while video generates (prevents waiting in silence)
- **Pattern**: Video generation starts FIRST, then 2-4 messages show while processing
- **Variation Strategy**:
  - Random message count (2, 3, or 4)
  - Varied timing (800-2000ms between messages)
  - Different prompt sets for each count
  - Each prompt instructs Gemini to vary: energy level, focus, sentence structure
- **Examples**:
  - 2 messages: "omg Marcus would be perfect" → "let me show you"
  - 4 messages: thinking → sharing detail → building anticipation → final reveal

**Layer 3: Visual Generation** (`/app/api/generate-glimpse/route.ts`)
- **Primary**: Veo 3.1 (`veo-3.1-generate-preview`) for video
- **Fallback**: xAI Grok (`grok-2-image-1212`) for static images when video fails
- **Purpose**: Generate cinematic date previews (video preferred, image fallback)
- **Flow**:
  1. Build detailed Veo prompt (scene description + audio cues)
  2. Try Veo 3.1: Call `generateVideos()` API
  3. If Veo succeeds: Poll operation, download video, save to `public/glimpses/`
  4. If Veo fails: Fall back to xAI Grok image generation
  5. Build Grok-optimized prompt (600-700 chars, photorealistic, atmospheric)
  6. Generate static image via xAI API
  7. Download and save image to `public/glimpses/`
  8. Gemini generates dynamic title and description for the glimpse

**User Profile RAG System** (`lib/user-profile.ts`)
- Simple RAG that learns about Alice through conversation
- Stores: facts, preferences, dislikes, interests, dealbreakers
- Provides context summary to Gemini for personalized responses
- Persists to localStorage via `getUserRAG()` singleton

**Match Profiles** (`lib/match-profiles.ts`)
- 5 hardcoded profiles with detailed personalities
- Each includes `appearance` field for Veo prompts
- Profiles define: interests, occupation, conversationStyle, dealbreakers
- Used in both Gemini context and glimpse generation

#### 1. Glimpse Generation and Playback Flow

**CRITICAL TRIGGERING LOGIC** (components/ai-chat-interface.tsx:451-470):

Glimpse generation requires ALL conditions to be true:
```typescript
detectedScenario &&                    // Activity/place mentioned
messages.length >= 15 &&               // At least 15 messages exchanged
Math.random() < 0.25 &&                // 25% random chance (keeps it rare)
(AI response mentions match name)      // Match explicitly mentioned
```

**Why this matters**:
- **15+ messages**: Ensures sufficient context about user
- **25% chance**: Makes glimpses feel special, not exhausting
- **Match name detection**: AI must genuinely think there's compatibility

**If glimpses are too frequent**: Adjust these gates (lines 453-454), NOT the system prompt.

**Flow**:
- User chats with AI about preferences/scenarios
- System detects keywords (coffee shop, hiking, art gallery, etc.)
- Generates detailed Veo 3.1 prompt from scenario + user context (includes audio cues)
- Creates cinematic first-person POV video preview with natively generated audio
- Videos play **inline within the chat interface** (iMessage-style UX pattern)
- Stores glimpse with metadata (scenario, match info, XP rewards)

**Key files**: `lib/sora-api.ts`, `components/ai-chat-interface.tsx`, `app/api/generate-glimpse/route.ts`

**Critical UX Pattern**: Videos display as interactive cards in the chat with:
- Video thumbnail using actual first frame (`preload="metadata"`)
- Play button overlay that expands to inline video player
- `playsInline` attribute for native iPhone experience (prevents fullscreen takeover)
- Auto-return to thumbnail state when video ends

#### 1a. Date Coordination System (CRITICAL - NEW FEATURE)

**Purpose**: Automates the entire date planning process - from AI proposal creation to restaurant reservations, transportation, and calendar integration.

**Architecture**: End-to-end system with AI detection → API creation → UI rendering → accommodation coordination → calendar integration.

**User Flow**:
1. User chats with AI (requires 25+ messages first)
2. User says: "I want to go on a date with James. Can you set something up?"
3. AI generates response with `[CREATE_DATE]` block (app/api/chat/route.ts:234-280)
4. System parses format, creates proposal via `/api/dates/propose`
5. Chat interface renders `<DateProposalCard>` inline with message
6. User sees beautiful card with date details + "Accept Date" button
7. User accepts → `coordinateDate()` triggers mock accommodations
8. Card updates: "You accepted! Coordinating details..."
9. When confirmed → "Add to Calendar" button appears
10. Calendar integration opens Google/Outlook/Apple calendar

**[CREATE_DATE] Format Example**:
```
[CREATE_DATE]
matchId: match_3
matchName: James
activity: salsa dancing
venue: La Cita Bar
location: 336 S Hill St, Los Angeles, CA 90013
dateTime: 2025-10-29T20:00:00Z
description: A fun salsa dancing night at La Cita Bar!
[/CREATE_DATE]
```

**Key Components**:
- `lib/date-store.ts`: Global singleton for persistence (`globalProposalsMap` pattern)
- `lib/calendar-integration.ts`: **Real** calendar URLs/ICS (NOT mocked)
- `lib/accommodation-coordination.ts`: Mock bookings (OpenTable, Uber, Eventbrite structure)
- `components/date-proposal-card.tsx`: UI card with accept/decline buttons
- `app/api/dates/propose/route.ts`: POST to create, GET to retrieve
- `app/api/dates/respond/route.ts`: POST to accept/decline
- `components/ai-chat-interface.tsx`: Integration layer (lines 107-124, 507-554, 599-612, 753-775)

**CRITICAL State Persistence**:
```typescript
// lib/date-store.ts:4
const globalProposalsMap = new Map<string, DateProposal>()
class DateStore {
  private proposals: Map<string, DateProposal> = globalProposalsMap  // References global
}
```
Without global map, proposals are lost between Next.js API requests.

**Status Flow**:
- `proposed` → Accept/decline buttons
- `user_accepted` → Match auto-accepts (MVP behavior)
- `both_accepted` → Triggers `coordinateDate()`
- `coordinating` → Booking accommodations
- `confirmed` → Shows calendar button + details
- `declined` → Shows declined state

**Testing**:
```bash
node test-date-coordination-simple.mjs  # Test APIs (7 tests: create, retrieve, accept, decline, filters)
node test-date-proposal-ui.mjs          # Test UI rendering with Playwright
```

**Production Requirements**:
- Replace mocks with real APIs (OpenTable/Resy, Uber, Eventbrite/Ticketmaster)
- Add database for DateStore
- Multi-user support (currently simulates match accepting)
- Payment integration for costs
- Email/SMS notifications

**Full Documentation**: See `DATE_INTEGRATION_COMPLETE.md` for complete implementation guide.

#### 2. State Management
Currently uses in-memory storage via singleton classes:
- `GlimpseStore` (lib/glimpse-store.ts): Manages generated glimpses
- Component-level state for UI interactions
- **Production TODO**: Replace with database (PostgreSQL or MongoDB suggested in .env.example)

#### 3. Routing Strategy
- App Router with file-based routing
- Main app is single-page with tab navigation (home page.tsx)
- Separate routes for: onboarding, profile/:id, glimpse/:id, personality-setup, match-reveal
- Dynamic routes use `[id]` pattern

#### 4. Mobile-First Viewport Architecture (CRITICAL)

**Location**: `app/page.tsx:14-16`

The entire app is constrained within a mobile container with black background for clear iPhone outline:
```tsx
<div className="min-h-screen bg-black flex justify-center">
  {/* Mobile Container - constrained to iPhone width */}
  <div className="w-full max-w-[430px] flex flex-col relative">
    {/* All content */}
  </div>
</div>
```

**Why this is critical**:
- **Black background**: Creates clear iPhone outline, helps focus on mobile experience
- Prevents horizontal message stretching on wider screens
- Ensures consistent mobile UX regardless of device
- Messages wrap properly within iPhone-sized viewport (390-430px)
- On desktop: app centers with iPhone dimensions against black background
- On mobile: fills full width up to 430px max

**When adding new pages**: ALWAYS maintain this mobile container structure with black background.

#### 5. Styling System
- Uses Tailwind CSS v4 with oklch color space for perceptually uniform colors
- Custom CSS properties for theming (--rose, --blush, --cream, --warm-neutral)
- Dark mode support with `.dark` class variants
- Component styles use class-variance-authority (cva) pattern
- iPhone-optimized: Safe area insets, custom radius scaling for small screens

## Configuration Notes

### TypeScript
- Path alias: `@/*` maps to root directory
- Strict mode enabled
- Build errors currently ignored in production (`ignoreBuildErrors: true` in next.config.mjs)

### Environment Variables
Required for full functionality:
```bash
# Google Gemini (for Veo 3.1 video generation and AI chat)
NEXT_PUBLIC_GEMINI_API_KEY=your-key-here

# xAI Grok (for image fallback when video generation fails)
XAI_API_KEY=your-key-here

# Stripe Identity (for profile verification)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Get Gemini API key from: https://aistudio.google.com/apikey
Get xAI API key from: https://x.ai/api
Get Stripe keys from: https://dashboard.stripe.com/test/apikeys

Optional (for production):
- AWS S3 credentials (video storage)
- Cloudinary credentials (video hosting alternative)
- Database URL (PostgreSQL or MongoDB)

### Important Implementation Details

1. **Veo 3.1 API Integration**:
   - **Server-side route**: `/app/api/generate-glimpse/route.ts` handles all video generation
   - Uses Google's `@google/genai` SDK (`npm install @google/genai`)
   - buildVeoPrompt() creates cinematic prompts with audio cues from scenarios
   - Supports 8 predefined scenarios with detailed prompt templates including audio descriptions
   - Veo 3.1 natively generates synchronized audio (dialogue, sound effects, ambient noise)
   - Video specs: 720p resolution, 8 seconds duration, 16:9 aspect ratio, `personGeneration: "allow_all"`
   - Uses polling-based operation checking (10s intervals) until video generation completes
   - **Critical**: Downloads video using authenticated fetch with `X-Goog-Api-Key` header (not SDK's download method)
   - Saves video to `public/glimpses/{glimpseId}.mp4` for serving

2. **iPhone-Native Video Playback** (components/ai-chat-interface.tsx):
   - **Inline playback**: Videos play within chat messages, never navigate to separate page
   - **State management**: `playingGlimpseId` tracks which glimpse is currently playing
   - **Video thumbnails**: Use actual video first frame via paused `<video>` with `preload="metadata"`
   - **Essential attributes**:
     ```tsx
     <video
       src={glimpse.videoUrl}
       playsInline        // CRITICAL for iPhone - prevents fullscreen takeover
       autoPlay
       controls
       onEnded={() => setPlayingGlimpseId(null)}  // Return to thumbnail
     />
     ```
   - **Thumbnail pattern**:
     ```tsx
     <video
       src={glimpse.videoUrl}
       playsInline
       muted
       preload="metadata"  // Loads first frame without full video download
       className="w-full h-full object-cover"
     />
     ```
   - Play button overlay with hover effects for visual feedback
   - Toggle between thumbnail and player states on click

3. **AI Profile Video Generation** (`app/api/generate-profile-video/route.ts`):
   - **Purpose**: Generate cinematic profile intro videos using Veo 3.1
   - **Model**: `veo-3.1-generate-preview`
   - **User flow**:
     1. User describes themselves in text (e.g., "walking through Downtown LA at sunset")
     2. Optional: Add interests and vibe
     3. API constructs cinematic prompt with golden hour lighting, 24mm lens, etc.
     4. Veo generates 5-second 16:9 profile video
     5. Video persists in localStorage for regeneration capability
   - **UI**: `components/profile-settings.tsx` - form → generating state → video player
   - **Why it's modern**: No camera needed - AI creates professional intro from text description

4. **Stripe Identity Verification** (`app/api/identity/*`):
   - **Purpose**: Verify user identity for trust & safety
   - **Flow**:
     1. User clicks "Start Verification" in Profile tab
     2. Creates Stripe Identity VerificationSession (allows driver's license + passport)
     3. Redirects to Stripe's hosted verification page
     4. User scans ID + takes selfie for liveness check
     5. Redirects back to app with session ID
     6. Retrieves verified data (name, DOB, age, address, city, state)
     7. Auto-fills profile fields with "Verified" badges
   - **Components**: `components/profile-settings.tsx`
   - **Critical**: Maintains identity verification separate from AI features for safety

5. **Images Unoptimized**: Next.js image optimization is disabled (`unoptimized: true`)

6. **Component Library**: Uses extensive Radix UI primitives - when modifying UI components, reference Radix documentation for proper prop usage

7. **XP/Gamification**: User earns XP through conversations and interactions, tracked in component state (not persisted)

6. **Data Persistence Pattern**:
   - Client-side: localStorage for messages, glimpses, and XP data
   - **Hydration safety**: Components use `useEffect` to load from localStorage after mount
   - Pattern to avoid SSR/client mismatch:
     ```tsx
     const [data, setData] = useState<Type[]>([])

     useEffect(() => {
       const saved = localStorage.getItem('key')
       if (saved) setData(JSON.parse(saved))
     }, [])
     ```
   - Server-side: In-memory stores (GlimpseStore) - **production requires database**

## Development Guidelines

### When Adding Features
- Use client components (`"use client"`) for interactive UI
- Follow existing patterns in /components for new UI elements
- Add new glimpse scenarios in `lib/sora-api.ts` scenarioPrompts map (with audio cues)
- Store shared types in `lib/types.ts`
- When writing Veo prompts, include audio descriptions (dialogue, SFX, ambient noise)

### Working with Glimpses
- **Generation**: Client calls `/api/generate-glimpse` POST endpoint
- **Storage**: Server saves videos to `public/glimpses/`, returns glimpse object to client
- **Client storage**: Saved to localStorage for persistence across sessions
- **Playback**: Inline within chat messages using state-based toggle pattern
- Status flow: pending → generating → ready/failed
- Videos include natively generated audio synchronized with visual content

### iPhone/Mobile UX Requirements
- **Always use `playsInline`** on `<video>` elements to prevent fullscreen takeover
- **Video thumbnails**: Use paused `<video>` with `preload="metadata"` to show actual first frame
- **Inline playback**: Videos should play within the current view, not navigate away
- **Touch targets**: Ensure buttons/clickable areas are at least 44x44px for tap accuracy
- **Visual feedback**: Add hover/active states even for touch devices (shows during tap)

### UI Consistency
- Use components from /components/ui (Button, Input, Card, etc.)
- Follow oklch color variable naming (--rose, --primary, etc.)
- Match existing animation patterns (scale-110 for active states, etc.)
- Maintain bottom tab navigation pattern for main app sections
- **Video cards**: Use consistent pattern of thumbnail → overlay → inline player

## Common Issues and Solutions

### Veo 3.1 Video Download Failing
**Symptom**: Video generation completes but download fails with 403/401 error
**Solution**: Use authenticated fetch with `X-Goog-Api-Key` header instead of SDK's download method:
```typescript
const videoResponse = await fetch(videoUri, {
  headers: { 'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' }
})
```

### Videos Not Playing Inline on iPhone
**Symptom**: Videos open in fullscreen player instead of playing inline
**Solution**: Add `playsInline` attribute to `<video>` element:
```tsx
<video src={url} playsInline controls autoPlay />
```

### Hydration Mismatch with localStorage
**Symptom**: React hydration errors when using localStorage data
**Solution**: Only load from localStorage in `useEffect`, never during initial render:
```tsx
const [data, setData] = useState<Type[]>([])
useEffect(() => {
  const saved = localStorage.getItem('key')
  if (saved) setData(JSON.parse(saved))
}, [])
```

### Video Thumbnails Not Showing
**Symptom**: Only gradient background shows instead of video preview
**Solution**: Use paused `<video>` element with `preload="metadata"`:
```tsx
<video
  src={videoUrl}
  className="w-full h-full object-cover"
  playsInline
  muted
  preload="metadata"
/>
```

## Critical Behavioral Rules

When working on this codebase, ALWAYS follow these principles:

### 1. Natural Language Driven
- **NEVER hardcode conversation text** except as fallbacks
- All AI responses must be generated by Gemini dynamically
- System prompts guide behavior, not template strings
- If you see hardcoded messages, they should be replaced with Gemini calls

### 2. Glimpse Subtlety
- Glimpses are the AI's **internal visualization tool**, NOT a promoted feature
- **NEVER use**: "let's glimpse it", "want to create a glimpse?", "glimpse generation"
- **ALWAYS use**: "let me show you something", "i can picture this", "wait one sec..."
- Think: friend showing you a photo they're imagining, not announcing a feature

### 3. Friend-of-Friend Introductions
- This is NOT a profile browsing app
- **NEVER use**: "wanna see his profile?", "check them out", "view matches"
- **ALWAYS use**: share stories, personal details, what "his matchmaker told me"
- Example: "okay so i know this guy Marcus... his matchmaker told me the cutest thing about him"

### 4. Variation Strategy
- **Count**: Vary 2-4 messages during glimpse generation
- **Timing**: Use different delays (800-2000ms)
- **Content**: Change energy level, focus, sentence structure
- **Phrasing**: Never start messages the same way twice
- **Pattern Breaking**: If it feels repetitive, it IS repetitive - add more variation

### 5. Parallel Processing Pattern
```typescript
// CORRECT: Start video immediately, messages fill time
const glimpsePromise = soraAPI.generateGlimpse({...})
// Show 2-4 messages while video processes
for (let i = 0; i < numMessages; i++) { ... }
const glimpse = await glimpsePromise

// WRONG: Sequential (messages delay video)
await showMessage1()
await showMessage2()
const glimpse = await generateVideo() // User waited for nothing
```

### 6. Error Handling Tone
- Technical errors become friendly AI messages
- Quota errors: "hey alice... so i tried to create that glimpse but we hit our video generation limit for today 😅"
- Generation failures: "hmm something went wrong... want to try describing what you're looking for differently?"
- NEVER expose: API errors, stack traces, technical jargon

### 7. Conversation Design (Updated Pattern)

**First 15+ messages**: Deep learning phase
- PRIMARY ROLE: Genuinely get to know Alice, but DON'T interrogate
- **Mix response types**: 40% empathy/reactions, 30% relating, 30% questions
- **React/empathize**: "omg love that energy", "ugh that's the worst", "totally get that"
- **Relate**: "same honestly", "i love that vibe", "that's so important"
- **Sometimes ask**: "what's making it rough?", "how'd that go?"
- Learn through natural conversation, not interrogation
- Real friends don't ask questions every single time
- Keep responses SHORT (15-25 words)

**After 15+ messages**: Can consider introducing matches
- Only if truly relevant based on what you've learned
- Share stories and details naturally
- "btw, i know this guy james who might vibe with that. wanna hear about him?" (16 words)
- Focus on compatibility based on conversation

**Glimpse Triggers**: Rare and special
- Even after 15+ messages, only 1 in 10-15 messages get glimpses
- Client-side: 25% random chance + match name detection
- Don't create glimpses just because activity mentioned
- First priority: conversation about what she shared

### 8. Tone & Voice
- **Lowercase everything** (except proper nouns)
- **Contractions**: "you're", "i'm", "can't", "don't"
- **Casual phrases**: "omg", "ooh", "wait", "btw", "honestly", "okay so"
- **No emojis** in AI messages (unless user explicitly requests)
- **CRITICAL: Concise**: 15-25 words MAXIMUM (texting a friend, not writing essays)
- **Warm**: Genuinely excited about helping Alice find connections

## When Modifying AI Behavior

1. **Update system prompts** in `/app/api/chat/route.ts`
2. **Test word count** - responses should be 15-25 words (see examples at lines 111-132)
3. **Test variation** - run the same scenario 3-5 times, responses should differ
4. **Check response mix** - should see reactions/empathy (40%), relating (30%), questions (30%)
5. **Avoid interrogation** - not every message should ask a question
6. **Check tone** - does it sound like a friend texting, not a formal assistant?
7. **Verify subtlety** - glimpses feel natural, not like using a "feature"?
8. **Confirm no hardcoding** - all text generated by Gemini, not template strings?

### Common Issues After Recent Updates

**Issue: AI feels like interrogation**
- **Symptom**: Every message asks a question, feels like being pounded for information
- **Fix**: Update system prompt to emphasize response variety (app/api/chat/route.ts:52-57, 70-76)
- **Key sections**:
  - "CRITICAL: DON'T INTERROGATE" - Mix reactions (40%), relating (30%), questions (30%)
  - "Vary your responses" with specific examples
  - Updated examples showing reactions without questions (lines 111-132)
- **Test**: Should see variety like "omg love that", "same honestly", "what's making it rough?"

**Issue: AI messages too long**
- **Symptom**: Responses feel like essays, not chat messages
- **Fix**: Update system prompt examples with actual word counts (app/api/chat/route.ts:111-132)
- **Add more reminders**: "KEY RULE: If your response is over 25 words, CUT IT DOWN"
- **Test**: Run `node test-chat-improvements.mjs` - should show 10-25 word responses

**Issue: Too many glimpses showing**
- **Symptom**: Glimpses every few messages, feels exhausting
- **Fix**: Adjust client-side gates in components/ai-chat-interface.tsx:451-470
  - Increase message threshold (currently 15)
  - Decrease random chance (currently 0.25)
- **DON'T**: Modify system prompt for frequency control (use client-side gates)

**Issue: Horizontal message stretching on wide screens**
- **Symptom**: Messages unfold horizontally instead of wrapping
- **Fix**: Ensure mobile container in app/page.tsx:14-16 is present
- **Test**: `npx playwright screenshot --device="iPhone 14 Pro" http://localhost:3001 output.png`

**Issue: Next.js cache showing stale code**
- **Symptom**: Changes not reflecting, old errors persisting
- **Fix**: `rm -rf .next && npm run dev`

**Issue: "oops, lost my train of thought" error**
- **Symptom**: User sees error fallback message repeatedly
- **Root cause**: API receiving malformed/empty request bodies
- **Fix**: Added request body parsing with try-catch (app/api/chat/route.ts:11-24)
- **Better error messages**: Detects quota errors vs general errors (components/ai-chat-interface.tsx:474-492)
