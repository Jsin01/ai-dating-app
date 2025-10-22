"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Heart, X, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import type { DateProposal } from "@/lib/types"
import { openInCalendar } from "@/lib/calendar-integration"

interface DateProposalCardProps {
  proposal: DateProposal
  onRespond: (proposalId: string, action: "accept" | "decline") => Promise<void>
}

export function DateProposalCard({ proposal, onRespond }: DateProposalCardProps) {
  const [isResponding, setIsResponding] = useState(false)
  const [localStatus, setLocalStatus] = useState(proposal.status)

  const handleRespond = async (action: "accept" | "decline") => {
    setIsResponding(true)
    try {
      await onRespond(proposal.id, action)
      if (action === "accept") {
        setLocalStatus("user_accepted")
      } else {
        setLocalStatus("declined")
      }
    } catch (error) {
      console.error("Error responding to proposal:", error)
    } finally {
      setIsResponding(false)
    }
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    })
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  const getStatusColor = () => {
    switch (localStatus) {
      case "proposed":
        return "border-[var(--rose)]"
      case "user_accepted":
      case "both_accepted":
        return "border-green-500"
      case "coordinating":
        return "border-yellow-500"
      case "confirmed":
        return "border-green-600"
      case "declined":
        return "border-gray-500"
      default:
        return "border-[var(--rose)]"
    }
  }

  const getStatusText = () => {
    switch (localStatus) {
      case "proposed":
        return "Date Proposal"
      case "user_accepted":
        return "You accepted! Coordinating details..."
      case "both_accepted":
        return "Both accepted! Coordinating..."
      case "coordinating":
        return "Booking reservations..."
      case "confirmed":
        return "All set! Date confirmed"
      case "declined":
        return "Declined"
      default:
        return "Date Proposal"
    }
  }

  const showActionButtons = localStatus === "proposed" && !isResponding
  const showCoordinating = localStatus === "coordinating" || localStatus === "both_accepted"
  const showConfirmed = localStatus === "confirmed"

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${getStatusColor()} bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}>
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-[var(--rose)]/10 via-[var(--peach)]/10 to-[var(--rose)]/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[var(--rose)] fill-[var(--rose)]" />
            <span className="font-semibold text-sm text-[var(--rose)]">
              {getStatusText()}
            </span>
          </div>
          {showConfirmed && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {showCoordinating && (
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Match Info */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Date with {proposal.matchName}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {proposal.description}
          </p>
        </div>

        {/* Date Details */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <Calendar className="h-4.5 w-4.5 text-[var(--rose)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {formatDate(proposal.dateTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-4.5 w-4.5 text-[var(--rose)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {formatTime(proposal.dateTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-4.5 w-4.5 text-[var(--rose)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {proposal.venue || proposal.location}
              </p>
              {proposal.venue && (
                <p className="text-xs text-muted-foreground">
                  {proposal.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Accommodations */}
        {proposal.accommodations.length > 0 && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Details
            </p>
            {proposal.accommodations.map((acc) => (
              <div key={acc.id} className="flex items-center gap-2 text-sm">
                {acc.type === "restaurant" && acc.status === "confirmed" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🍽️</span>
                    <span className="text-foreground">
                      {acc.details.restaurantName}
                    </span>
                    {acc.details.confirmationNumber && (
                      <span className="text-xs text-muted-foreground">
                        (Conf: {acc.details.confirmationNumber})
                      </span>
                    )}
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-auto" />
                  </div>
                )}
                {acc.type === "tickets" && acc.status === "confirmed" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🎫</span>
                    <span className="text-foreground">
                      {acc.details.eventName}
                    </span>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-auto" />
                  </div>
                )}
                {acc.type === "transportation" && acc.status === "confirmed" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🚗</span>
                    <span className="text-foreground">
                      {acc.details.rideType || "Ride"} pickup at{" "}
                      {acc.details.pickupTime && formatTime(new Date(acc.details.pickupTime))}
                    </span>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-auto" />
                  </div>
                )}
                {acc.status === "booking" && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />
                    <span className="text-muted-foreground">
                      Booking {acc.type}...
                    </span>
                  </div>
                )}
                {acc.status === "failed" && (
                  <div className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-red-500 text-xs">
                      {acc.errorMessage || `Failed to book ${acc.type}`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="pt-3 flex gap-3">
            <button
              onClick={() => handleRespond("accept")}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--rose)] to-[var(--peach)] text-white font-semibold text-sm transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="h-4 w-4" />
              Accept Date
            </button>
            <button
              onClick={() => handleRespond("decline")}
              disabled={isResponding}
              className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-medium text-sm transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Not this time
            </button>
          </div>
        )}

        {/* Calendar Button */}
        {showConfirmed && (
          <button
            onClick={() => openInCalendar(proposal)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <Calendar className="h-4 w-4" />
            Add to Calendar
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </button>
        )}

        {/* Coordinating Message */}
        {showCoordinating && (
          <div className="pt-3 text-center">
            <p className="text-sm text-muted-foreground">
              Hold tight! We're coordinating all the details for your date...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
