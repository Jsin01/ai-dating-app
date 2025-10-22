// Types for the AI Dating App

export type Message = {
  role: "user" | "ai"
  content: string
  timestamp?: Date
  glimpseId?: string // Reference to generated glimpse
  dateProposalId?: string // Reference to date proposal
}

export type Glimpse = {
  id: string
  title: string
  description: string
  prompt: string // The prompt sent to Veo 3.1
  videoUrl?: string // URL to the generated video
  thumbnailUrl?: string
  status: "pending" | "generating" | "ready" | "failed"
  createdAt: Date
  matchName?: string
  scenario: string // e.g., "comedy club date", "coffee shop meetup"
}

export type GlimpseGenerationRequest = {
  scenario: string
  userContext: string
  matchName?: string
  matchAppearance?: string // Veo 3.1 description of the match's appearance
  userInterests?: string[]
}

// Date Coordination Types

export type DateProposal = {
  id: string
  matchId: string // Which match is this date with
  matchName: string
  proposedBy: "matchmaker" // Who initiated the proposal
  dateTime: Date // When the date is scheduled
  activity: string // e.g., "dinner", "coffee", "concert", "movie"
  venue?: string // Specific venue name (e.g., "Blue Bottle Coffee")
  location: string // Address or area
  description: string // Natural language description of the date
  status: DateProposalStatus
  userResponse?: "accepted" | "declined" | "pending"
  matchResponse?: "accepted" | "declined" | "pending" // For future multi-user support
  accommodations: DateAccommodation[]
  createdAt: Date
  updatedAt: Date
  glimpseId?: string // Link to the glimpse that inspired this date
  calendarEventId?: string // ID from calendar service (Google Calendar, etc.)
}

export type DateProposalStatus =
  | "proposed" // Just created, waiting for responses
  | "user_accepted" // User accepted, waiting for match
  | "match_accepted" // Match accepted, waiting for user
  | "both_accepted" // Both accepted, coordinating accommodations
  | "coordinating" // Booking reservations, rides, etc.
  | "confirmed" // Everything booked and confirmed
  | "declined" // One or both declined
  | "completed" // Date has happened
  | "cancelled" // Cancelled after confirmation

export type DateAccommodation = {
  id: string
  type: "restaurant" | "tickets" | "transportation" | "activity" | "other"
  provider: string // e.g., "OpenTable", "Uber", "Eventbrite"
  status: "pending" | "booking" | "confirmed" | "failed"
  details: {
    // Restaurant
    restaurantName?: string
    cuisineType?: string
    reservationTime?: Date
    partySize?: number
    confirmationNumber?: string

    // Tickets (concert, movie, event)
    eventName?: string
    eventType?: "concert" | "movie" | "show" | "sports"
    ticketCount?: number
    seatInfo?: string
    ticketUrl?: string

    // Transportation
    pickupLocation?: string
    dropoffLocation?: string
    pickupTime?: Date
    rideType?: "uberx" | "uberxl" | "comfort" | "black"
    estimatedCost?: number
    rideId?: string

    // Generic
    description?: string
    cost?: number
    bookingUrl?: string
  }
  createdAt: Date
  confirmedAt?: Date
  errorMessage?: string
}

export type DateCoordinationRequest = {
  dateProposalId: string
  userId: string
  action: "accept" | "decline"
}

export type CalendarEvent = {
  id: string
  dateProposalId: string
  provider: "google" | "outlook" | "apple" | "other"
  eventId: string // ID from the calendar service
  summary: string
  description: string
  startTime: Date
  endTime: Date
  location: string
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
}

// Experience-Based Matchmaking Types

export type ExperienceMatchRequest = {
  id: string
  userId: string // In MVP, always "alice"
  experienceId: string
  experienceName: string
  experienceCategory: string
  experiencePrice: number
  experienceDescription: string
  requestedAt: Date
  status: "searching" | "match_found" | "no_match" | "expired"
}

export type ExperienceMatchResult = {
  requestId: string
  matchId: string // Which match profile
  matchName: string
  matchReason: string // Why this match is perfect for this experience
  coordinationStory: string // Story of how the AI matchmakers coordinated
  suggestedDateTime: Date
  status: "proposed" | "accepted" | "declined"
  createdAt: Date
}
