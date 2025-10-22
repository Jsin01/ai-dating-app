"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Send, Mic, Star, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { soraAPI } from "@/lib/sora-api"
import { glimpseStore } from "@/lib/glimpse-store"
import type { Message, Glimpse, DateProposal } from "@/lib/types"
import { getUserRAG } from "@/lib/user-profile"
import { getRandomMatch } from "@/lib/match-profiles"
import ReactMarkdown from "react-markdown"
import { DateProposalCard } from "@/components/date-proposal-card"
import { ExperienceMatchCard } from "@/components/experience-match-card"
import { coordinateDate } from "@/lib/accommodation-coordination"

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [userXp, setUserXp] = useState(285)
  const [showXpGain, setShowXpGain] = useState(false)
  const [glimpses, setGlimpses] = useState<Glimpse[]>([])
  const [isGeneratingGlimpse, setIsGeneratingGlimpse] = useState(false)
  const [glimpseProgress, setGlimpseProgress] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)
  const [playingGlimpseId, setPlayingGlimpseId] = useState<string | null>(null)
  const [dateProposals, setDateProposals] = useState<DateProposal[]>([])
  const [experienceMatch, setExperienceMatch] = useState<{
    experienceName: string
    experienceVenue?: string
    experienceLocation?: string
    matchName: string
    matchReason: string
    suggestedDateTime: string
    messageIndex: number
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true)

    // Load messages
    const savedMessages = localStorage.getItem("echoMessages")
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || new Date()),
        })))
      } catch {
        // Keep default messages
      }
    } else {
      // Generate initial greeting from Gemini
      const generateInitialGreeting = async () => {
        try {
          setIsTyping(true)
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [],
              userContext: "",
              messageCount: 0,
            }),
          })

          const data = await response.json()
          if (data.success) {
            setMessages([{
              role: "ai" as const,
              content: data.message,
              timestamp: new Date(),
            }])
          }
        } catch (error) {
          console.error("Failed to generate greeting:", error)
          // Fallback greeting
          setMessages([{
            role: "ai" as const,
            content: "hey alice! ready to find some amazing connections?",
            timestamp: new Date(),
          }])
        } finally {
          setIsTyping(false)
        }
      }

      generateInitialGreeting()
    }

    // Load XP
    const savedXp = localStorage.getItem("userXp")
    if (savedXp) {
      setUserXp(parseInt(savedXp))
    }

    // Load glimpses
    const savedGlimpses = localStorage.getItem("glimpses")
    if (savedGlimpses) {
      try {
        const parsed = JSON.parse(savedGlimpses)
        setGlimpses(parsed.map((g: Glimpse) => ({
          ...g,
          createdAt: new Date(g.createdAt),
        })))
      } catch {
        // Keep empty array
      }
    }

    // Load date proposals from API
    const loadDateProposals = async () => {
      try {
        const response = await fetch('/api/dates/propose')
        const data = await response.json()
        if (data.success) {
          setDateProposals(data.proposals.map((p: DateProposal) => ({
            ...p,
            dateTime: new Date(p.dateTime),
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          })))
        }
      } catch (error) {
        console.error('Failed to load date proposals:', error)
      }
    }
    loadDateProposals()

    // Check for pending experience match request
    const checkExperienceMatchRequest = async () => {
      const pendingRequest = localStorage.getItem('pending_experience_match_request')
      if (pendingRequest) {
        try {
          const experienceData = JSON.parse(pendingRequest)
          console.log('Found pending experience match request:', experienceData)

          // Clear the flag immediately to prevent duplicate processing
          localStorage.removeItem('pending_experience_match_request')

          // Get user context for matchmaking
          const userRAG = getUserRAG()
          const userContext = userRAG.getContextSummary()

          // Show AI typing indicator
          setIsTyping(true)

          // Message 1: Initial excitement and starting coordination
          await new Promise(resolve => setTimeout(resolve, 1200))
          setMessages(prev => [...prev, {
            role: "ai" as const,
            content: `ooh love that you want to do ${experienceData.experienceName}! give me a sec, let me reach out to the other matchmakers on the platform...`,
            timestamp: new Date(),
          }])

          // Message 2: Starting to ask around (simulate coordination beginning)
          await new Promise(resolve => setTimeout(resolve, 2500))
          setMessages(prev => [...prev, {
            role: "ai" as const,
            content: `okay so i'm chatting with a few matchmakers right now... asking about their clients and who might vibe with this`,
            timestamp: new Date(),
          }])

          // Start API call in background while showing progress messages
          const matchPromise = fetch('/api/experience-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(experienceData)
          })

          // Message 3: Getting responses back
          await new Promise(resolve => setTimeout(resolve, 3000))
          setMessages(prev => [...prev, {
            role: "ai" as const,
            content: `hearing back from some of them... they're telling me about their people and what they're into`,
            timestamp: new Date(),
          }])

          // Message 4: Narrowing down options
          await new Promise(resolve => setTimeout(resolve, 2500))
          setMessages(prev => [...prev, {
            role: "ai" as const,
            content: `okay getting some good options here... let me ask a few more questions about compatibility`,
            timestamp: new Date(),
          }])

          // Wait for API to complete
          const response = await matchPromise
          const data = await response.json()

          if (data.success && data.match) {
            // Message 5: Found someone! Share the coordination story
            await new Promise(resolve => setTimeout(resolve, 2000))
            setMessages(prev => [...prev, {
              role: "ai" as const,
              content: data.match.coordinationStory,
              timestamp: new Date(),
            }])

            // Message 6: Final recommendation with reasoning
            await new Promise(resolve => setTimeout(resolve, 1800))
            let finalMessageIndex = 0
            setMessages(prev => {
              finalMessageIndex = prev.length
              return [...prev, {
                role: "ai" as const,
                content: `so after chatting with everyone, i think ${data.match.matchName} would be perfect! ${data.match.matchReason}`,
                timestamp: new Date(),
              }]
            })

            // Store experience match data for card rendering
            setExperienceMatch({
              experienceName: experienceData.experienceName,
              experienceVenue: experienceData.experienceVenue,
              experienceLocation: experienceData.experienceLocation,
              matchName: data.match.matchName,
              matchReason: data.match.matchReason,
              suggestedDateTime: data.match.suggestedDateTime,
              messageIndex: finalMessageIndex
            })

            console.log('Experience match found:', data.match)
          } else {
            // Fallback if API fails
            await new Promise(resolve => setTimeout(resolve, 2000))
            setMessages(prev => [...prev, {
              role: "ai" as const,
              content: "hmm i talked to everyone but nobody feels like the right fit for this one... maybe try a different experience? or we can chat more so i understand what you're looking for better",
              timestamp: new Date(),
            }])
          }

          setIsTyping(false)
        } catch (error) {
          console.error('Failed to process experience match request:', error)
          setIsTyping(false)
        }
      }
    }
    checkExperienceMatchRequest()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
    // Save messages to localStorage (only after hydration)
    if (isHydrated) {
      localStorage.setItem("echoMessages", JSON.stringify(messages))
    }
  }, [messages, isHydrated])

  useEffect(() => {
    // Save XP to localStorage (only after hydration)
    if (isHydrated) {
      localStorage.setItem("userXp", userXp.toString())
    }
  }, [userXp, isHydrated])

  useEffect(() => {
    // Save glimpses to localStorage (only after hydration)
    if (isHydrated) {
      localStorage.setItem("glimpses", JSON.stringify(glimpses))
    }
  }, [glimpses, isHydrated])

  const gainXp = (amount: number) => {
    setUserXp((prev) => prev + amount)
    setShowXpGain(true)
    setTimeout(() => setShowXpGain(false), 2000)
  }

  /**
   * Detect if the conversation mentions a date activity or place
   * Extracts the actual activity from user's message
   */
  const detectDateScenario = (content: string): string | null => {
    const lowerContent = content.toLowerCase()

    // Check for explicit visualization/glimpse requests - strong triggers
    const visualizeTriggers = [
      "visualize", "show me", "picture", "imagine", "create", "glimpse",
      "vision", "show what", "see how", "see what", "look like", "pulling up"
    ]

    for (const trigger of visualizeTriggers) {
      if (lowerContent.includes(trigger)) {
        // User is explicitly asking to visualize something
        // Look through recent messages for the activity being discussed
        for (let i = messages.length - 1; i >= Math.max(0, messages.length - 5); i--) {
          const msg = messages[i]
          if (msg.content && msg.content !== content) {
            const scenarioInPrevious = detectScenarioInText(msg.content)
            if (scenarioInPrevious) return scenarioInPrevious
          }
        }
        // If no recent activity found, extract from current message
        const extracted = content.replace(/can you|help me|visualize|show me|picture|imagine|create|glimpse|vision|show what|see how|see what|look like|pulling up|vibes for|that/gi, '').trim()
        if (extracted.length > 3) return extracted
        return "river tubing date"  // fallback for this conversation
      }
    }

    return detectScenarioInText(content)
  }

  // Separate function for scenario detection in text
  const detectScenarioInText = (content: string): string | null => {
    const lowerContent = content.toLowerCase()

    // Common activity patterns - try these first for better extraction
    const activityPatterns = [
      // "I like/love/enjoy X" patterns
      /i (?:like|love|enjoy|prefer) (.*?)(?:\.|,|!|\?|$)/i,
      // "X sounds fun" patterns
      /(.*?) sounds? (?:fun|nice|good|great|amazing|perfect)/i,
      // "What about X" patterns
      /what about (.*?)(?:\?|\.|,|!|$)/i,
      // "Maybe X" or "maybe we could X"
      /maybe (?:we could |go (?:to )?|try )?(.*?)(?:\?|\.|,|!|$)/i,
      // "X would be fun/good"
      /(.*?) (?:would|could) be (?:fun|nice|good|great|perfect)/i,
      // "How about X" patterns
      /how about (.*?)(?:\?|\.|,|!|$)/i,
      // "going to X"
      /going (?:to |for )?(.*?)(?:\?|\.|,|!|$)/i,
      // "on a date" patterns
      /(?:on a|for a|going on a) date (?:at|in|to) (?:a|the) (.*?)(?:\.|,|!|\?|$)/i,
      // Direct location mentions - "at a pub", "in a bar", "to a restaurant"
      /(?:at|in|to) (?:a|the) (pub|bar|restaurant|cafe|coffee shop|beach|park|museum|gallery|concert|show|club|lounge|brewery|winery|rooftop)(?:\.|,|!|\?|$)/i,
    ]

    for (const pattern of activityPatterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        const activity = match[1].trim()
        if (activity.length > 2 && activity.length < 100) {
          return activity
        }
      }
    }

    // Expanded activity keywords - be very inclusive
    const activityKeywords = [
      "club", "coffee", "cafe", "restaurant", "bar", "pub", "museum", "gallery",
      "park", "beach", "hike", "hiking", "trail", "concert", "show", "movie", "theater", "cinema",
      "bookstore", "library", "wine", "brewery", "cooking", "baking", "dinner", "lunch", "brunch",
      "yoga", "gym", "sport", "game", "knitting", "pottery", "art", "class", "workshop",
      "market", "festival", "fair", "exhibition", "skating", "bowling", "arcade",
      "picnic", "walk", "stroll", "dance", "dancing", "karaoke", "trivia",
      "garden", "aquarium", "zoo", "shopping", "mall", "vintage", "thrift",
      "tubing", "river", "float", "floating", "kayak", "kayaking", "paddle", "paddling",
      "canoe", "rafting", "boat", "boating", "sail", "sailing", "surf", "surfing",
      "swim", "swimming", "lake", "reservoir", "rapids", "water"
    ]

    for (const keyword of activityKeywords) {
      if (lowerContent.includes(keyword)) {
        // Extract surrounding context
        const words = content.split(/\s+/)
        const index = words.findIndex(w => w.toLowerCase().includes(keyword))
        if (index !== -1) {
          // Get 1 word before and 2 words after for context
          const start = Math.max(0, index - 1)
          const end = Math.min(words.length, index + 3)
          const scenario = words.slice(start, end).join(' ')
            .replace(/[?.!,;]/g, '')
            .trim()
          if (scenario.length > 2) {
            return scenario
          }
        }
      }
    }

    return null
  }

  /**
   * Generate a natural build-up message using Gemini
   * Varies the approach to avoid repetition
   */
  const generateBuildUpMessage = async (
    selectedMatch: any,
    scenario: string,
    messageNumber: number,
    userContext: string,
    totalMessages: number
  ): Promise<string> => {
    try {
      // Create varied prompts based on position and total count
      // This ensures messages flow differently each time
      const promptSets = {
        2: [
          // Just 2 messages - quick and punchy
          `You're Alice's AI matchmaker. Alice mentioned "${scenario}" and you immediately think of ${selectedMatch.name}. Write a SHORT (6-10 words), casual, lowercase message. Vary your approach - sometimes excited, sometimes thoughtful, sometimes casual. NEVER mention "glimpse". Examples: "omg ${selectedMatch.name} would be SO perfect for this", "wait... i'm seeing you and ${selectedMatch.name} here", "okay hear me out... ${selectedMatch.name}"`,
          `You're showing Alice something. Write a VERY SHORT (3-6 words), casual, lowercase message. Vary the tone - sometimes building suspense, sometimes eager. Examples: "let me show you this", "okay wait...", "hold on pulling this up", "one sec..."`
        ],
        3: [
          // 3 messages - medium buildup
          `You're Alice's matchmaker friend. She said "${scenario}" and you think of ${selectedMatch.name}. Write a SHORT (5-9 words), casual, lowercase message. Mix it up - don't always start the same way. Examples: "ooh i can totally see you and ${selectedMatch.name}", "${selectedMatch.name} just popped into my head for this", "wait ${selectedMatch.name} would love this with you"`,
          `Share why ${selectedMatch.name} (${selectedMatch.age}, ${selectedMatch.occupation.toLowerCase()}) fits. Write a SHORT (8-12 words), casual, lowercase message. Vary your focus - sometimes occupation, sometimes interests, sometimes vibe. Examples: "he's into ${selectedMatch.interests[0]} too... this is perfect", "${selectedMatch.name} is ${selectedMatch.age}, super ${selectedMatch.interests[0]}", "btw he's a ${selectedMatch.occupation.toLowerCase()}... you'd vibe"`,
          `You're showing her something. Write a SHORT (4-7 words), casual, lowercase message. Mix between excited/mysterious/casual. Examples: "okay look at this...", "hold up need to show you", "wait one sec...", "let me pull this up"`
        ],
        4: [
          // 4 messages - full buildup
          `You're Alice's AI matchmaker. She mentioned "${scenario}". You're thinking of ${selectedMatch.name}. Write a SHORT (5-8 words), casual, lowercase message. Vary the energy level. Examples: "ooh wait i'm thinking ${selectedMatch.name}...", "okay so ${selectedMatch.name} for sure", "hmm ${selectedMatch.name} and you doing this?"`,
          `Share a detail about ${selectedMatch.name}. He's ${selectedMatch.age}, ${selectedMatch.occupation.toLowerCase()}. Write a SHORT (7-11 words), casual, lowercase message. Mix what you focus on. Examples: "${selectedMatch.name} is ${selectedMatch.age}, total ${selectedMatch.occupation.toLowerCase()} vibes", "he's super into ${selectedMatch.interests[0]} btw", "okay so ${selectedMatch.name} loves ${selectedMatch.interests[0]}"`,
          `Building anticipation. Write a SHORT (5-8 words), casual, lowercase message. Vary between showing/imagining/creating. Examples: "let me show you what i'm seeing", "okay imagine this scenario...", "wait picture this", "hold on one sec"`,
          `Final message before showing. Write a VERY SHORT (2-4 words), casual, lowercase message. Mix the vibe. Examples: "almost ready...", "okay here...", "one sec...", "wait..."`
        ]
      }

      const prompts = promptSets[totalMessages as 2 | 3 | 4] || promptSets[3]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompts[messageNumber],
            },
          ],
          userContext,
          messageCount: messages.length,
        }),
      })

      const data = await response.json()
      if (data.success) {
        return data.message
      }

      // Fallback if API fails
      const fallbacks = [
        `okay so i'm thinking ${selectedMatch.name} for this...`,
        `${selectedMatch.name} is ${selectedMatch.age}, ${selectedMatch.occupation.toLowerCase()}`,
        `he's into ${selectedMatch.interests.slice(0, 3).join(", ")}`,
        `let me create this...`,
      ]
      return fallbacks[messageNumber]
    } catch (error) {
      console.error("Error generating build-up message:", error)
      const fallbacks = [
        `okay so i'm thinking ${selectedMatch.name} for this...`,
        `${selectedMatch.name} is ${selectedMatch.age}, ${selectedMatch.occupation.toLowerCase()}`,
        `he's into ${selectedMatch.interests.slice(0, 3).join(", ")}`,
        `creating your glimpse...`,
      ]
      return fallbacks[messageNumber]
    }
  }

  /**
   * Generate a glimpse for the detected scenario
   */
  const generateGlimpse = async (scenario: string) => {
    setIsGeneratingGlimpse(true)
    setGlimpseProgress("Preparing your glimpse...")

    try {
      // Select a random match from profiles
      const selectedMatch = getRandomMatch()

      // Gather context from recent messages
      const recentMessages = messages.slice(-5)
      const userContext = recentMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(". ")

      // Get user interests from RAG
      const userRAG = getUserRAG()
      const userInterests = userRAG.getProfile().interests

      // START VIDEO GENERATION IMMEDIATELY (don't wait)
      const glimpsePromise = soraAPI.generateGlimpse({
        scenario,
        userContext,
        matchName: selectedMatch.name,
        matchAppearance: selectedMatch.appearance,
        userInterests,
      })

      // While video generates, show build-up messages to keep user engaged
      // Vary the number of messages (2-4) and timing to avoid repetition
      const numMessages = 2 + Math.floor(Math.random() * 3) // Random: 2, 3, or 4 messages
      const timings = [
        [1200, 2000], // 2 messages: longer pauses
        [900, 1600, 1400], // 3 messages: medium pacing
        [800, 1300, 1200, 1000], // 4 messages: faster pacing
      ][numMessages - 2]

      for (let i = 0; i < numMessages; i++) {
        await new Promise((resolve) => setTimeout(resolve, timings[i]))

        const buildUpMessage = await generateBuildUpMessage(
          selectedMatch,
          scenario,
          i,
          userContext,
          numMessages
        )

        setMessages((prev) => [
          ...prev,
          {
            role: "ai" as const,
            content: buildUpMessage,
            timestamp: new Date(),
          },
        ])
      }

      setGlimpseProgress("Generating your video with AI...")

      // Wait for video generation to complete (should be done or nearly done by now)
      const glimpse = await glimpsePromise

      if (glimpse.status === "failed") {
        // Show user-friendly error message from AI
        if (glimpse.userMessage) {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai" as const,
              content: glimpse.userMessage,
              timestamp: new Date(),
            },
          ])
        }

        setIsGeneratingGlimpse(false)
        setGlimpseProgress("")
        return
      }

      setGlimpseProgress("✨ Your glimpse is ready!")

      // Small delay to show the success message
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to store
      glimpseStore.save(glimpse)

      // Add to local state (which will save to localStorage via useEffect)
      setGlimpses((prev) => [...prev, glimpse])

      // Update the last AI message with glimpse reference
      setMessages((prev) => {
        const updated = [...prev]
        const lastAiMessageIndex = updated.findLastIndex((m) => m.role === "ai")
        if (lastAiMessageIndex !== -1) {
          updated[lastAiMessageIndex].glimpseId = glimpse.id
        }
        return updated
      })

      gainXp(25) // Bonus XP for glimpse generation
    } catch (error) {
      console.error("Failed to generate glimpse:", error)

      // Show friendly error message
      setMessages((prev) => [
        ...prev,
        {
          role: "ai" as const,
          content: "oops, something went wrong trying to create that glimpse 😅 wanna try describing what you'd like to do differently?",
          timestamp: new Date(),
        },
      ])

      setIsGeneratingGlimpse(false)
      setGlimpseProgress("")
      return
    }

    setIsGeneratingGlimpse(false)
    setGlimpseProgress("")
  }

  /**
   * Extract insights from conversation and update RAG system
   * Runs in background without blocking the conversation
   */
  const extractAndStoreInsights = async (userMessage: string, aiResponse: string) => {
    try {
      const response = await fetch("/api/extract-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          aiResponse,
        }),
      })

      const data = await response.json()

      if (data.success && data.insights) {
        const userRAG = getUserRAG()

        // Store extracted insights
        data.insights.facts?.forEach((fact: string) => {
          if (fact.trim()) userRAG.addFact(fact)
        })

        data.insights.interests?.forEach((interest: string) => {
          if (interest.trim()) userRAG.addInterest(interest)
        })

        data.insights.preferences?.forEach((pref: string) => {
          if (pref.trim()) userRAG.addPreference(pref)
        })

        data.insights.dislikes?.forEach((dislike: string) => {
          if (dislike.trim()) userRAG.addDislike(dislike)
        })

        data.insights.dealbreakers?.forEach((dealbreaker: string) => {
          if (dealbreaker.trim()) userRAG.addDealbreaker(dealbreaker)
        })

        console.log("Learned about Alice:", data.insights)
      }
    } catch (error) {
      // Fail silently - insight extraction is not critical to user experience
      console.error("Failed to extract insights (non-critical):", error)
    }
  }

  // Auto-update user profile based on conversation history
  const updateProfileFromConversations = async (currentMessages: Message[]) => {
    try {
      const response = await fetch("/api/generate-profile-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      })

      const data = await response.json()

      if (data.success && data.profile) {
        // Save updated profile to localStorage
        localStorage.setItem("auto_generated_profile", JSON.stringify(data.profile))
        console.log("Profile auto-updated from conversations")
      }
    } catch (error) {
      // Fail silently - profile updates are not critical to user experience
      console.error("Failed to auto-update profile (non-critical):", error)
    }
  }

  const handleDateResponse = async (proposalId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch('/api/dates/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateProposalId: proposalId,
          action,
          userId: 'alice'
        })
      })

      const data = await response.json()
      if (data.success) {
        // Update local state with new proposal status
        setDateProposals(prev =>
          prev.map(p => p.id === proposalId ? {
            ...data.proposal,
            dateTime: new Date(data.proposal.dateTime),
            createdAt: new Date(data.proposal.createdAt),
            updatedAt: new Date(data.proposal.updatedAt),
          } : p)
        )

        // If both parties accepted, trigger accommodation coordination
        if (data.proposal.status === 'both_accepted') {
          console.log('Both parties accepted! Coordinating accommodations...')
          await coordinateDate(proposalId)

          // Refresh proposal to get updated accommodations
          const updated = await fetch(`/api/dates/propose?id=${proposalId}`)
          const updatedData = await updated.json()
          if (updatedData.success) {
            setDateProposals(prev =>
              prev.map(p => p.id === proposalId ? {
                ...updatedData.proposal,
                dateTime: new Date(updatedData.proposal.dateTime),
                createdAt: new Date(updatedData.proposal.createdAt),
                updatedAt: new Date(updatedData.proposal.updatedAt),
              } : p)
            )
          }
        }
      }
    } catch (error) {
      console.error('Failed to respond to date proposal:', error)
    }
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { role: "user" as const, content: input, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput("")
    setIsTyping(true)

    gainXp(5)

    // Detect if user mentioned a date scenario
    const detectedScenario = detectDateScenario(userInput)
    console.log('Detected scenario:', detectedScenario, 'from input:', userInput)

    // Call Gemini API for intelligent conversation
    const getAIResponse = async () => {
      try {
        const userRAG = getUserRAG()
        const userContext = userRAG.getContextSummary()

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            userContext,
            messageCount: messages.length + 1,
          }),
        })

        const data = await response.json()

        if (data.success) {
          const aiMessage = {
            role: "ai" as const,
            content: data.message,
            timestamp: new Date(),
            dateProposalId: data.dateProposalId,
          }
          setMessages((prev) => [...prev, aiMessage])
          setIsTyping(false)

          // If AI created a date proposal, load it into state
          if (data.dateProposalId) {
            console.log('AI created date proposal:', data.dateProposalId)
            const proposalResponse = await fetch(`/api/dates/propose?id=${data.dateProposalId}`)
            const proposalData = await proposalResponse.json()
            if (proposalData.success) {
              setDateProposals(prev => [...prev, {
                ...proposalData.proposal,
                dateTime: new Date(proposalData.proposal.dateTime),
                createdAt: new Date(proposalData.proposal.createdAt),
                updatedAt: new Date(proposalData.proposal.updatedAt),
              }])
            }
          }

          // Check if AI is PROMISING to create a glimpse
          const aiPromisesGlimpse = /(?:pulling up|creating|working on|getting|trying to create|visualiz|show you|picture this|imagine|scene|vibes for)/i.test(data.message)

          // Generate glimpse if:
          // CASE 1: User mentioned scenario AND we have enough context
          // OR
          // CASE 2: AI is promising to create/show something
          let scenarioToGenerate = null

          if (aiPromisesGlimpse && messages.length >= 10) {
            // AI promised a glimpse - extract scenario from AI's message or recent conversation
            scenarioToGenerate = detectDateScenario(data.message)
            if (!scenarioToGenerate) {
              // Look back in recent messages for the scenario
              for (let i = messages.length - 1; i >= Math.max(0, messages.length - 5); i--) {
                const msg = messages[i]
                const foundScenario = detectDateScenario(msg.content)
                if (foundScenario) {
                  scenarioToGenerate = foundScenario
                  break
                }
              }
            }
            console.log('AI promised glimpse, extracted scenario:', scenarioToGenerate)
          } else if (detectedScenario && messages.length >= 10 && Math.random() < 0.6) {
            // User mentioned scenario - 60% chance to create glimpse
            scenarioToGenerate = detectedScenario
            console.log('User mentioned scenario:', scenarioToGenerate)
          }

          if (scenarioToGenerate) {
            setTimeout(() => {
              generateGlimpse(scenarioToGenerate)
            }, 1000)
          }

          // Extract insights every 3rd message to reduce API overhead
          // Still learning, but less frequently
          if (messages.length % 3 === 0) {
            extractAndStoreInsights(userInput, data.message)
          }

          // Auto-update profile every 5 messages to keep it current
          // This runs in background and doesn't interrupt user experience
          if (messages.length % 5 === 0 && messages.length >= 5) {
            updateProfileFromConversations([...messages, aiMessage])
          }
        } else {
          throw new Error(data.error || "Failed to get AI response")
        }
      } catch (error) {
        console.error("Error getting AI response:", error)

        // Check if it's a quota error
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isQuotaError = errorMessage.toLowerCase().includes('quota') ||
                            errorMessage.toLowerCase().includes('429') ||
                            errorMessage.toLowerCase().includes('resource_exhausted')

        // Fallback to helpful error message
        const aiMessage = {
          role: "ai" as const,
          content: isQuotaError
            ? "hey alice, we hit our api limit for today 😅 can you try again tomorrow?"
            : "hmm something went wrong on my end... mind trying that again?",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }
    }

    getAIResponse()
  }

  const handleViewMatches = () => {
    router.push("/match-reveal")
  }

  return (
    <div className="h-full gradient-mesh-romance flex flex-col overflow-hidden">
      {/* Compact Floating Header */}
      <div className="safe-top sticky top-0 z-10">
        <div className="mx-3 mt-3 mb-2 floating rounded-[28px] transition-smooth">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full gradient-rose-blush flex items-center justify-center shadow-md">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="leading-tight">
                  <h2 className="font-semibold text-base">Glimpse</h2>
                  <p className="text-[10px] text-muted-foreground">AI Matchmaker</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-subtle elevation-1">
                <Star className="w-3.5 h-3.5 text-[var(--rose)] fill-current" />
                <span className="font-bold text-sm">{userXp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showXpGain && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
          <div className="px-6 py-3 rounded-full gradient-rose-blush text-white font-bold shadow-2xl flex items-center gap-2">
            <Star className="w-5 h-5" />
            <span>+5 XP</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {messages.map((message, index) => {
            // Find glimpse associated with this message
            const associatedGlimpse = message.glimpseId
              ? glimpses.find(g => g.id === message.glimpseId)
              : null

            return (
              <div key={index}>
                {/* Render the message */}
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                >
                  <div className="flex gap-2 max-w-[82%]">
                    {message.role === "ai" && (
                      <div className="w-7 h-7 rounded-full gradient-rose-blush flex items-center justify-center flex-shrink-0 elevation-2 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`
                        rounded-[20px] px-4 py-3 text-pretty leading-relaxed text-[15px] transition-smooth
                        ${
                          message.role === "user"
                            ? "gradient-rose-blush text-white ml-auto elevation-2"
                            : "glass-card elevation-1"
                        }
                      `}
                    >
                      {message.role === "ai" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <span>{children}</span>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>

                {/* Render date proposal right after the message that triggered it */}
                {message.dateProposalId && (
                  <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4">
                    <div className="max-w-[92%] w-full">
                      {(() => {
                        const proposal = dateProposals.find(p => p.id === message.dateProposalId)
                        if (!proposal) {
                          return (
                            <div className="rounded-2xl border-2 bg-card p-4 text-center text-muted-foreground">
                              Loading date proposal...
                            </div>
                          )
                        }
                        return (
                          <DateProposalCard
                            proposal={proposal}
                            onRespond={handleDateResponse}
                          />
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Render experience match card right after the message that triggered it */}
                {experienceMatch && experienceMatch.messageIndex === index && (
                  <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4">
                    <div className="max-w-[92%] w-full">
                      <ExperienceMatchCard
                        experienceName={experienceMatch.experienceName}
                        experienceVenue={experienceMatch.experienceVenue}
                        experienceLocation={experienceMatch.experienceLocation}
                        matchName={experienceMatch.matchName}
                        matchReason={experienceMatch.matchReason}
                        suggestedDateTime={experienceMatch.suggestedDateTime}
                        onPlanDate={() => {
                          console.log('Plan date clicked for experience match')
                          // TODO: Integrate with date coordination system
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Render glimpse right after the message that triggered it */}
                {associatedGlimpse && (
                  <div className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4">
                    <div className="max-w-[92%] w-full rounded-[24px] overflow-hidden elevation-3">
                      {associatedGlimpse.videoUrl ? (
                        // VIDEO GLIMPSE - with play button
                        <>
                          {playingGlimpseId === associatedGlimpse.id ? (
                            // Video player inline
                            <div className="relative aspect-video bg-black">
                              <video
                                src={associatedGlimpse.videoUrl}
                                className="w-full h-full"
                                controls
                                autoPlay
                                playsInline
                                onEnded={() => setPlayingGlimpseId(null)}
                              />
                            </div>
                          ) : (
                            // Video thumbnail preview
                            <>
                              <div
                                className="relative aspect-video bg-black cursor-pointer group"
                                onClick={() => setPlayingGlimpseId(associatedGlimpse.id)}
                              >
                                <div className="absolute inset-0 gradient-rose-blush" />
                                <video
                                  key={associatedGlimpse.videoUrl}
                                  src={`${associatedGlimpse.videoUrl}#t=0.1`}
                                  className="w-full h-full object-cover relative z-10"
                                  playsInline
                                  muted
                                  preload="auto"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-20" />
                                <div className="absolute inset-0 flex items-center justify-center z-30">
                                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm shadow-2xl group-hover:scale-110 transition-transform">
                                    <Play className="w-10 h-10 text-[var(--rose)] ml-1" fill="currentColor" />
                                  </div>
                                </div>
                              </div>
                              <div className="glass-strong p-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex-shrink-0">
                                    <Sparkles className="w-4.5 h-4.5 text-[var(--rose)]" />
                                  </div>
                                  <h3 className="font-semibold text-[15px]">{associatedGlimpse.title}</h3>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      ) : associatedGlimpse.thumbnailUrl ? (
                        // IMAGE GLIMPSE - show directly, no play button
                        <>
                          <div className="relative aspect-video bg-black">
                            <img
                              src={associatedGlimpse.thumbnailUrl}
                              alt={associatedGlimpse.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="glass-strong p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-shrink-0">
                                <Sparkles className="w-4.5 h-4.5 text-[var(--rose)]" />
                              </div>
                              <h3 className="font-semibold text-[15px]">{associatedGlimpse.title}</h3>
                            </div>
                          </div>
                        </>
                      ) : (
                        // NO MEDIA - error state
                        <div className="relative aspect-video bg-gradient-rose-blush flex items-center justify-center">
                          <div className="text-center text-white">
                            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Media not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-2 max-w-[82%]">
                <div className="w-7 h-7 rounded-full gradient-rose-blush flex items-center justify-center flex-shrink-0 elevation-2 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="rounded-[20px] px-4 py-3 glass-card elevation-1">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Glimpse generation indicator - simple typing dots */}
          {isGeneratingGlimpse && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-2 max-w-[82%]">
                <div className="w-7 h-7 rounded-full gradient-rose-blush flex items-center justify-center flex-shrink-0 elevation-2 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="rounded-[20px] px-4 py-3 glass-card elevation-1">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orphaned glimpses (not associated with any message) - should rarely happen */}
          {glimpses.filter(g => !messages.some(m => m.glimpseId === g.id)).map((glimpse) => (
            <div key={glimpse.id} className="flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="max-w-[92%] w-full rounded-[24px] overflow-hidden elevation-3">
                {glimpse.videoUrl ? (
                  // VIDEO GLIMPSE - with play button
                  <>
                    {playingGlimpseId === glimpse.id ? (
                      // Video player inline
                      <div className="relative aspect-video bg-black">
                        <video
                          src={glimpse.videoUrl}
                          className="w-full h-full"
                          controls
                          autoPlay
                          playsInline
                          onEnded={() => setPlayingGlimpseId(null)}
                        />
                      </div>
                    ) : (
                      // Video thumbnail preview
                      <>
                        <div
                          className="relative aspect-video bg-black cursor-pointer group"
                          onClick={() => setPlayingGlimpseId(glimpse.id)}
                        >
                          <div className="absolute inset-0 gradient-rose-blush" />
                          <video
                            key={glimpse.videoUrl}
                            src={`${glimpse.videoUrl}#t=0.1`}
                            className="w-full h-full object-cover relative z-10"
                            playsInline
                            muted
                            preload="auto"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-20" />
                          <div className="absolute inset-0 flex items-center justify-center z-30">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm shadow-2xl group-hover:scale-110 transition-transform">
                              <Play className="w-10 h-10 text-[var(--rose)] ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="glass-strong p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-shrink-0">
                              <Sparkles className="w-4.5 h-4.5 text-[var(--rose)]" />
                            </div>
                            <h3 className="font-semibold text-[15px]">{glimpse.title}</h3>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : glimpse.thumbnailUrl ? (
                  // IMAGE GLIMPSE - show directly, no play button
                  <>
                    <div className="relative aspect-video bg-black">
                      <img
                        src={glimpse.thumbnailUrl}
                        alt={glimpse.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="glass-strong p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-shrink-0">
                          <Sparkles className="w-4.5 h-4.5 text-[var(--rose)]" />
                        </div>
                        <h3 className="font-semibold text-[15px]">{glimpse.title}</h3>
                      </div>
                    </div>
                  </>
                ) : (
                  // NO MEDIA - error state
                  <div className="relative aspect-video bg-gradient-rose-blush flex items-center justify-center">
                    <div className="text-center text-white">
                      <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Media not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="safe-bottom pb-3">
        <div className="mx-3 mb-2">
          <div className="floating rounded-[28px] transition-smooth">
            <div className="px-4 py-3">
              <div className="flex gap-2 items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Message..."
                  className="flex-1 h-11 rounded-full text-[15px] px-5 border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-[var(--rose)] transition-swift"
                  disabled={isTyping}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-11 w-11 rounded-full p-0 hover:bg-muted/50 transition-swift"
                  disabled={isTyping}
                >
                  <Mic className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  className="h-11 w-11 rounded-full gradient-rose-blush text-white p-0 elevation-2 hover:scale-105 transition-bounce"
                  disabled={isTyping || !input.trim()}
                >
                  <Send className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
