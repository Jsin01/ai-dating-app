"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

export function MatchReveal() {
  const [revealed, setRevealed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (revealed) {
      const detailsTimer = setTimeout(() => setShowDetails(true), 500)
      return () => clearTimeout(detailsTimer)
    }
  }, [revealed])

  const handleViewProfile = () => {
    router.push("/profile/1")
  }

  const handleViewGlimpse = () => {
    router.push("/glimpse/1")
  }

  return (
    <div className="min-h-screen gradient-rose-cream flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {!revealed ? (
          <div className="text-center space-y-10 animate-in fade-in duration-500">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl animate-pulse">
              <Sparkles className="w-14 h-14 text-[var(--rose)]" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white text-balance">{"Finding your match..."}</h1>
              <p className="text-lg text-white/80">{"Analyzing compatibility across 50+ dimensions"}</p>
            </div>
            <div className="max-w-xs mx-auto">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-[loading_2s_ease-in-out]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl animate-in zoom-in duration-500">
                <Heart className="w-10 h-10 text-[var(--rose)]" fill="var(--rose)" />
              </div>
              <div className="space-y-3">
                <h1 className="text-5xl font-bold text-white text-balance">{"Meet Alex"}</h1>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-white font-semibold">{"94% Match"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Profile Preview */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--blush)] to-[var(--cream)]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-40 h-40 rounded-full bg-white/60 backdrop-blur-md mx-auto shadow-xl" />
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-white">{"Alex, 28"}</p>
                      <div className="flex items-center justify-center gap-2 text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{"2.3 miles away"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {showDetails && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Quick Info */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{"Product Designer"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span>{"NYU"}</span>
                    </div>
                  </div>

                  {/* Compatibility Reasons */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{"Why you match"}</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-2xl bg-[var(--cream)]/30">
                        <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2 flex-shrink-0" />
                        <p className="text-foreground/80 leading-relaxed">
                          {"Both value deep, meaningful conversations over small talk"}
                        </p>
                      </div>
                      <div className="flex gap-4 p-4 rounded-2xl bg-[var(--cream)]/30">
                        <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2 flex-shrink-0" />
                        <p className="text-foreground/80 leading-relaxed">
                          {"Share a passion for travel and exploring new cultures"}
                        </p>
                      </div>
                      <div className="flex gap-4 p-4 rounded-2xl bg-[var(--cream)]/30">
                        <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2 flex-shrink-0" />
                        <p className="text-foreground/80 leading-relaxed">
                          {"Similar life goals and relationship expectations"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg rounded-2xl gradient-rose-blush text-white shadow-lg"
                      onClick={handleViewProfile}
                    >
                      {"View Full Profile"}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 text-lg rounded-2xl border-2 bg-transparent"
                      onClick={handleViewGlimpse}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {"See a Glimpse"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
