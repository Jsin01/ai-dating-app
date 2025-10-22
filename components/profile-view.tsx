"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, X, MapPin, Briefcase, GraduationCap, ArrowLeft, Sparkles, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

const interests = ["Travel", "Coffee", "Music", "Reading", "Hiking", "Photography", "Art", "Cooking"]

export function ProfileView() {
  const [isBlurred, setIsBlurred] = useState(true)
  const router = useRouter()

  const handleLike = () => {
    setIsBlurred(false)
    setTimeout(() => {
      router.push("/matches")
    }, 1500)
  }

  const handleGlimpse = () => {
    router.push("/glimpse/1")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{"Back"}</span>
          </button>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--blush)] to-[var(--cream)] shadow-2xl">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${isBlurred ? "backdrop-blur-3xl" : "backdrop-blur-none"}`}
          >
            <div className="text-center space-y-6 p-8">
              <div className="w-48 h-48 rounded-full bg-white/60 backdrop-blur-md mx-auto shadow-2xl" />
              {isBlurred && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm">
                    <Lock className="w-7 h-7 text-[var(--rose)]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-white">{"Profile unlocks with mutual interest"}</p>
                    <p className="text-sm text-white/90 max-w-xs mx-auto leading-relaxed">
                      {"Like this profile to reveal full photos and start a conversation"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-6 right-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-xl border border-white/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--rose)] animate-pulse" />
                <span className="text-sm font-bold text-[var(--rose)]">{"94% Match"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">{"Alex, 28"}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{"2.3 miles away"}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">{"Product Designer"}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm font-medium">{"Stanford"}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{"About"}</h2>
            <p className="text-foreground/80 leading-relaxed text-pretty text-lg">
              {
                "Passionate about creating meaningful experiences through design. Love exploring new coffee shops, hiking on weekends, and having deep conversations about life, art, and everything in between. Looking for someone who values authenticity and isn't afraid to be vulnerable."
              }
            </p>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{"Interests"}</h2>
            <div className="flex flex-wrap gap-2.5">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="px-5 py-2.5 text-sm rounded-full bg-[var(--blush)]/20 text-foreground border border-[var(--blush)]/30 font-medium"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--blush)]/20 to-[var(--cream)]/20 border-2 border-[var(--blush)]/30 space-y-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-rose-blush flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">{"Why You Match"}</h3>
            </div>
            <div className="space-y-3 text-foreground/80">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  {"Both value emotional intelligence and vulnerability in relationships"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2 flex-shrink-0" />
                <p className="leading-relaxed">
                  {"Similar communication styles: thoughtful, expressive, and authentic"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--rose)] mt-2 flex-shrink-0" />
                <p className="leading-relaxed">{"Aligned on relationship pace, commitment level, and life goals"}</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-card border-2 border-border space-y-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--rose)]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--rose)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{"See a Glimpse"}</h3>
                <p className="text-sm text-muted-foreground">{"AI-generated preview of your connection"}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 rounded-2xl border-2 text-base font-semibold bg-transparent"
              onClick={handleGlimpse}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {"Watch Glimpse"}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 sticky bottom-6 pt-4 pb-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 h-16 rounded-2xl border-2 bg-background hover:bg-muted"
            onClick={() => router.back()}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="flex-[2] h-16 rounded-2xl gradient-rose-blush text-white shadow-xl text-lg font-semibold"
            onClick={handleLike}
          >
            <Heart className="w-6 h-6 mr-2" />
            {"Like Alex"}
          </Button>
        </div>
      </div>
    </div>
  )
}
