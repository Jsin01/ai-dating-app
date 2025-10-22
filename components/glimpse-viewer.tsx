"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Play, X, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Glimpse } from "@/lib/types"

interface GlimpseViewerProps {
  glimpseId?: string
  glimpse?: Glimpse
}

export function GlimpseViewer({ glimpseId, glimpse: initialGlimpse }: GlimpseViewerProps) {
  const [glimpse, setGlimpse] = useState<Glimpse | null>(initialGlimpse || null)
  const [showInfo, setShowInfo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const router = useRouter()

  // Determine if this is a video or just an image
  const isVideo = Boolean(glimpse?.videoUrl)

  useEffect(() => {
    // If glimpseId is provided but no glimpse, fetch from localStorage
    if (glimpseId && !initialGlimpse) {
      try {
        const saved = localStorage.getItem("glimpses")
        if (saved) {
          const glimpses = JSON.parse(saved) as Glimpse[]
          const fetchedGlimpse = glimpses.find((g) => g.id === glimpseId)
          if (fetchedGlimpse) {
            setGlimpse({
              ...fetchedGlimpse,
              createdAt: new Date(fetchedGlimpse.createdAt),
            })
          }
        }
      } catch (error) {
        console.error("Error loading glimpse from localStorage:", error)
      }
    }
  }, [glimpseId, initialGlimpse])

  // Update isPlaying when glimpse loads - images show immediately, videos need play button
  useEffect(() => {
    if (glimpse) {
      setIsPlaying(!Boolean(glimpse.videoUrl)) // If no video (image only), show immediately
    }
  }, [glimpse])

  const handlePlay = () => {
    setIsPlaying(true)
    setShowInfo(false)
  }

  const handleClose = () => {
    router.back()
  }

  if (!glimpse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p>Glimpse not found</p>
          <Button variant="ghost" onClick={handleClose} className="mt-4 text-white">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 z-20 text-white hover:bg-white/10 rounded-full w-12 h-12"
        onClick={handleClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Media Container */}
      <div className="relative w-full max-w-4xl aspect-video bg-gradient-to-br from-[var(--rose)] to-[var(--blush)] rounded-3xl overflow-hidden shadow-2xl mx-6">
        {isVideo && !isPlaying ? (
          // Preview State - Only for videos
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlay}>
            <div className="text-center space-y-8 p-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white text-balance">{glimpse.title}</h2>
                <p className="text-lg text-white/90 text-pretty max-w-md mx-auto leading-relaxed">
                  {glimpse.description}
                </p>
              </div>
              <Button
                size="lg"
                className="bg-white text-[var(--rose)] hover:bg-white/90 h-16 px-10 text-lg rounded-2xl shadow-xl"
                onClick={handlePlay}
              >
                <Play className="w-6 h-6 mr-2" fill="currentColor" />
                Watch Glimpse
              </Button>
            </div>
          </div>
        ) : (
          // Display State - Videos (playing) or Images (always shown)
          <>
            {isVideo ? (
              // Video player
              <video
                src={glimpse.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                onEnded={() => setIsPlaying(false)}
              />
            ) : glimpse.thumbnailUrl ? (
              // Image display - show directly with title/description overlay
              <>
                <img
                  src={glimpse.thumbnailUrl}
                  alt={glimpse.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay with title and description */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{glimpse.title}</h2>
                  <p className="text-lg text-white/90 leading-relaxed">{glimpse.description}</p>
                </div>
              </>
            ) : (
              // No media available
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center space-y-4 p-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-white text-lg font-semibold">Media Not Available</p>
                  <p className="text-sm text-white/70 max-w-md mx-auto">
                    {glimpse.status === "failed"
                      ? "Sorry, there was an issue generating this glimpse. Please try creating a new one."
                      : "This glimpse is still being processed. Please check back soon."}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/30"
                    onClick={handleClose}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Overlay */}
        {showInfo && (
          <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold">{"What is a Glimpse?"}</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {
                    "Using AI, we create a cinematic visualization of what a date with this match could feel like. It's not real footage—it's a creative preview based on your shared interests and compatibility."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
