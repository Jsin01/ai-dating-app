"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check, Loader2, ShieldCheck, Sparkles, Video, Play, RefreshCw } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

type VerificationStep = "idle" | "creating" | "verifying" | "verified" | "error"
type VideoGenStep = "idle" | "generating" | "generated" | "error"

interface VerifiedData {
  name: string | null
  firstName: string | null
  lastName: string | null
  age: string | null
  dateOfBirth: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
}

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
)

export function ProfileSettings() {
  // Identity verification state
  const [verificationStep, setVerificationStep] = useState<VerificationStep>("idle")
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null)
  const [verificationSessionId, setVerificationSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // AI Profile Video state
  const [videoGenStep, setVideoGenStep] = useState<VideoGenStep>("idle")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [userDescription, setUserDescription] = useState("")
  const [interests, setInterests] = useState("")
  const [vibe, setVibe] = useState("")
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)
  const [profileGenerated, setProfileGenerated] = useState(false)

  // Auto-generate profile from conversation history
  useEffect(() => {
    const generateProfileFromConversations = async () => {
      // Check if we already have saved profile data
      const savedProfile = localStorage.getItem("auto_generated_profile")
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          setUserDescription(profile.description || "")
          setInterests(profile.interests || "")
          setVibe(profile.vibe || "")
          setProfileGenerated(true)
          return
        } catch (e) {
          console.error("Failed to load saved profile", e)
        }
      }

      // Get conversation history from localStorage
      const messagesStr = localStorage.getItem("echoMessages")
      if (!messagesStr) {
        console.log("No conversation history found yet")
        return
      }

      try {
        const messages = JSON.parse(messagesStr)
        if (!messages || messages.length === 0) {
          return
        }

        setIsGeneratingProfile(true)

        const response = await fetch("/api/generate-profile-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        })

        const data = await response.json()

        if (data.success && data.profile) {
          setUserDescription(data.profile.description)
          setInterests(data.profile.interests)
          setVibe(data.profile.vibe)
          setProfileGenerated(true)

          // Save to localStorage
          localStorage.setItem("auto_generated_profile", JSON.stringify(data.profile))
        }
      } catch (error) {
        console.error("Failed to auto-generate profile:", error)
      } finally {
        setIsGeneratingProfile(false)
      }
    }

    generateProfileFromConversations()
  }, [])

  // Load saved video from localStorage
  useEffect(() => {
    const savedVideo = localStorage.getItem("profile_video_url")
    if (savedVideo) {
      setVideoUrl(savedVideo)
      setVideoGenStep("generated")
    }
  }, [])

  // Check for verification completion on mount (when redirected back)
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const params = new URLSearchParams(window.location.search)
      const verification = params.get("verification")
      const sessionId = localStorage.getItem("stripe_verification_session_id")

      if (verification === "complete" && sessionId) {
        setVerificationStep("verifying")

        try {
          const response = await fetch("/api/identity/get-verification-result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })

          const data = await response.json()

          if (data.success && data.verifiedData) {
            setVerifiedData(data.verifiedData)
            setVerificationSessionId(sessionId)
            setVerificationStep("verified")
            localStorage.removeItem("stripe_verification_session_id")
            window.history.replaceState({}, "", "/")
          } else {
            throw new Error(data.error || "Verification failed")
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to verify identity")
          setVerificationStep("error")
          localStorage.removeItem("stripe_verification_session_id")
        }
      }
    }

    checkVerificationStatus()
  }, [])

  const handleStartVerification = async () => {
    setVerificationStep("creating")
    setError(null)

    try {
      const response = await fetch("/api/identity/create-verification-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!data.success || !data.clientSecret) {
        throw new Error(data.error || "Failed to create verification session")
      }

      localStorage.setItem("stripe_verification_session_id", data.sessionId)

      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error: stripeError } = await stripe.verifyIdentity(data.clientSecret)

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start verification")
      setVerificationStep("error")
      localStorage.removeItem("stripe_verification_session_id")
    }
  }

  const handleGenerateVideo = async () => {
    if (!userDescription.trim()) {
      setVideoError("Please describe yourself first")
      return
    }

    setVideoGenStep("generating")
    setVideoError(null)

    try {
      const response = await fetch("/api/generate-profile-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userDescription: userDescription.trim(),
          interests: interests.trim(),
          vibe: vibe.trim(),
          name: verifiedData?.firstName || "Alice",
          age: verifiedData?.age || "28"
        }),
      })

      const data = await response.json()

      if (!data.success || !data.videoUrl) {
        throw new Error(data.error || "Failed to generate video")
      }

      setVideoUrl(data.videoUrl)
      setVideoGenStep("generated")
      localStorage.setItem("profile_video_url", data.videoUrl)
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Failed to generate video")
      setVideoGenStep("error")
    }
  }

  const handleRegenerateVideo = () => {
    setVideoGenStep("idle")
    setVideoUrl(null)
    localStorage.removeItem("profile_video_url")
  }

  const handleRegenerateProfile = async () => {
    const messagesStr = localStorage.getItem("echoMessages")
    if (!messagesStr) {
      setVideoError("No conversation history available. Chat with me more first!")
      return
    }

    try {
      const messages = JSON.parse(messagesStr)
      setIsGeneratingProfile(true)
      setVideoError(null)

      const response = await fetch("/api/generate-profile-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })

      const data = await response.json()

      if (data.success && data.profile) {
        setUserDescription(data.profile.description)
        setInterests(data.profile.interests)
        setVibe(data.profile.vibe)
        setProfileGenerated(true)
        localStorage.setItem("auto_generated_profile", JSON.stringify(data.profile))
      } else {
        setVideoError(data.error || "Failed to regenerate profile")
      }
    } catch (error) {
      setVideoError("Failed to regenerate profile. Please try again.")
    } finally {
      setIsGeneratingProfile(false)
    }
  }

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-6 py-8 space-y-10">

        {/* AI PROFILE VIDEO SECTION */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--rose)]" />
              <h2 className="text-2xl font-bold">AI Profile Video</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Let AI create your cinematic intro - no camera needed
            </p>
          </div>

          {videoGenStep === "generated" && videoUrl ? (
            // Generated Video Display
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={handleRegenerateVideo}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Video
              </Button>
            </div>
          ) : videoGenStep === "generating" ? (
            // Generating State
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--blush)] to-[var(--rose)] shadow-2xl flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto" strokeWidth={2} />
                <div className="space-y-2">
                  <p className="text-white font-bold text-xl">Creating your video...</p>
                  <p className="text-white/80 text-sm">This takes about 30 seconds</p>
                </div>
              </div>
            </div>
          ) : isGeneratingProfile ? (
            // Generating Profile State
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--blush)]/20 to-[var(--rose)]/20 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <Loader2 className="w-16 h-16 text-[var(--rose)] animate-spin mx-auto" strokeWidth={2} />
                <div className="space-y-2">
                  <p className="font-bold text-xl">Learning about you...</p>
                  <p className="text-muted-foreground text-sm">Analyzing your conversations to create your profile</p>
                </div>
              </div>
            </div>
          ) : (
            // Profile Display/Input Form
            <div className="space-y-4">
              {profileGenerated && (
                <div className="p-4 rounded-xl bg-[var(--rose)]/10 border border-[var(--rose)]/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--rose)] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Auto-generated from your conversations. The more we chat, the better I understand you!
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 p-6 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Describe yourself {!profileGenerated && "*"}
                  </label>
                  <Textarea
                    placeholder={profileGenerated ? "" : "Chat with me first, and I'll generate this automatically!"}
                    className="h-24 rounded-xl resize-none"
                    value={userDescription}
                    onChange={(e) => setUserDescription(e.target.value)}
                    disabled={!profileGenerated}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interests</label>
                  <Input
                    placeholder={profileGenerated ? "" : "Auto-generated from our chats"}
                    className="h-12 rounded-xl"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    disabled={!profileGenerated}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vibe</label>
                  <Input
                    placeholder={profileGenerated ? "" : "Auto-generated from our chats"}
                    className="h-12 rounded-xl"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    disabled={!profileGenerated}
                  />
                </div>

                {videoError && (
                  <p className="text-sm text-destructive">{videoError}</p>
                )}

                {profileGenerated ? (
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg"
                      onClick={handleGenerateVideo}
                      disabled={!userDescription.trim()}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Video
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                      onClick={handleRegenerateProfile}
                      disabled={isGeneratingProfile}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Profile from Conversations
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Start chatting with me in the Echo tab, and I'll automatically generate your profile based on our conversations!
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Powered by Google Veo 3.1 • Your video is created with AI, not recorded
                </p>
              </div>
            </div>
          )}
        </div>

        {/* IDENTITY VERIFICATION SECTION */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--rose)]" />
              <h2 className="text-2xl font-bold">Identity Verification</h2>
            </div>
            <p className="text-muted-foreground text-sm">Verify your identity for trust & safety</p>
          </div>

          <div className="relative aspect-[3/4] max-w-sm rounded-3xl bg-gradient-to-br from-[var(--blush)] to-[var(--cream)] p-1 overflow-hidden shadow-2xl">
            <div className="w-full h-full rounded-3xl bg-card flex flex-col items-center justify-center space-y-8 p-8">

              {/* Idle State */}
              {verificationStep === "idle" && (
                <>
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-20 h-20 text-muted-foreground/70" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="font-semibold text-xl">Verify with ID</p>
                    <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                      Scan your driver&apos;s license or passport to verify your identity
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                      <span>Powered by Stripe Identity</span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg"
                    onClick={handleStartVerification}
                  >
                    Start Verification
                  </Button>
                </>
              )}

              {/* Creating Session */}
              {verificationStep === "creating" && (
                <div className="flex flex-col items-center justify-center space-y-8">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--blush)] to-[var(--rose)] flex items-center justify-center shadow-2xl">
                    <Loader2 className="w-20 h-20 text-white animate-spin" strokeWidth={2.5} />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="font-bold text-xl">Preparing verification...</p>
                  </div>
                </div>
              )}

              {/* Verifying */}
              {verificationStep === "verifying" && (
                <div className="flex flex-col items-center justify-center space-y-8">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--blush)] to-[var(--rose)] flex items-center justify-center shadow-2xl">
                    <Loader2 className="w-20 h-20 text-white animate-spin" strokeWidth={2.5} />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="font-bold text-xl">Processing verification...</p>
                  </div>
                </div>
              )}

              {/* Verified */}
              {verificationStep === "verified" && (
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-40 h-40 rounded-full gradient-rose-blush flex items-center justify-center shadow-2xl">
                    <Check className="w-20 h-20 text-white" strokeWidth={3} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-2xl">Verified!</p>
                    <p className="text-sm text-muted-foreground">
                      Your identity has been confirmed
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {verificationStep === "error" && (
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-center space-y-3">
                    <p className="font-bold text-xl text-destructive">Verification Failed</p>
                    <p className="text-sm text-muted-foreground px-4">
                      {error || "Something went wrong"}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 rounded-2xl"
                    onClick={() => {
                      setVerificationStep("idle")
                      setError(null)
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BASIC INFORMATION SECTION */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Basic Information</h2>
            <p className="text-muted-foreground text-sm">
              {verificationStep === "verified"
                ? "Auto-filled from your verified ID"
                : "Complete verification to auto-fill"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Name
                {verificationStep === "verified" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--rose)]/10 text-[var(--rose)] text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </label>
              <Input
                placeholder="Your name"
                className="h-12 rounded-xl"
                value={verifiedData?.name || ""}
                disabled={verificationStep === "verified"}
                readOnly={verificationStep === "verified"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Age
                {verificationStep === "verified" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--rose)]/10 text-[var(--rose)] text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </label>
              <Input
                type="number"
                placeholder="Your age"
                className="h-12 rounded-xl"
                value={verifiedData?.age || ""}
                disabled={verificationStep === "verified"}
                readOnly={verificationStep === "verified"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Location
                {verificationStep === "verified" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--rose)]/10 text-[var(--rose)] text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </label>
              <Input
                placeholder="City, State"
                className="h-12 rounded-xl"
                value={verifiedData && verifiedData.city && verifiedData.state ? `${verifiedData.city}, ${verifiedData.state}` : ""}
                disabled={verificationStep === "verified"}
                readOnly={verificationStep === "verified"}
              />
            </div>
          </div>

          {verificationStep !== "verified" && (
            <Button size="lg" className="w-full h-14 rounded-2xl gradient-rose-blush text-white shadow-lg">
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
