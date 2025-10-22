"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Heart, Sparkles, Users } from "lucide-react"

interface ExperienceMatchCardProps {
  experienceName: string
  experienceVenue?: string
  experienceLocation?: string
  matchName: string
  matchReason: string
  suggestedDateTime: string
  onPlanDate?: () => void
}

export function ExperienceMatchCard({
  experienceName,
  experienceVenue,
  experienceLocation,
  matchName,
  matchReason,
  suggestedDateTime,
  onPlanDate
}: ExperienceMatchCardProps) {
  const [isPlanning, setIsPlanning] = useState(false)

  const handlePlanDate = () => {
    setIsPlanning(true)
    if (onPlanDate) {
      onPlanDate()
    }
  }

  const formatDate = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    })
  }

  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--rose)] bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-[var(--rose)]/10 via-[var(--peach)]/10 to-[var(--rose)]/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--rose)]" />
            <span className="font-semibold text-sm text-[var(--rose)]">
              Experience Match Found
            </span>
          </div>
          <Sparkles className="h-5 w-5 text-[var(--rose)] fill-[var(--rose)]" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Experience Info */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {experienceName}
          </h3>
          {experienceVenue && (
            <p className="text-sm text-muted-foreground">
              {experienceVenue}
            </p>
          )}
        </div>

        {/* Match Info */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-[var(--rose)]/5 to-[var(--peach)]/5 border border-[var(--rose)]/20">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-[var(--rose)] fill-[var(--rose)]" />
            <span className="font-semibold text-sm text-foreground">
              Perfect match: {matchName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {matchReason}
          </p>
        </div>

        {/* Suggested Date/Time/Location */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <Calendar className="h-4.5 w-4.5 text-[var(--rose)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {formatDate(suggestedDateTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-4.5 w-4.5 text-[var(--rose)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {formatTime(suggestedDateTime)}
              </p>
            </div>
          </div>

          {experienceLocation && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4.5 w-4.5 text-[var(--rose)] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {experienceLocation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3">
          <button
            onClick={handlePlanDate}
            disabled={isPlanning}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--rose)] to-[var(--peach)] text-white font-semibold text-sm transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="h-4 w-4" />
            Plan This Date
          </button>
        </div>

        {/* Info Note */}
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Your matchmaker coordinated with {matchName}'s matchmaker to find this perfect match!
          </p>
        </div>
      </div>
    </div>
  )
}
