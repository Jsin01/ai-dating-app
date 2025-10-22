import type { DateProposal } from "./types"

/**
 * Calendar integration utilities
 * Supports Google Calendar, Apple Calendar (iCal), and Outlook
 */

interface CalendarEvent {
  title: string
  description: string
  location: string
  startTime: Date
  endTime: Date
}

/**
 * Generate a Google Calendar URL
 * Opens in user's Google Calendar (web or app)
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const { title, description, location, startTime, endTime } = event

  // Format dates to Google Calendar format: YYYYMMDDTHHmmssZ
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: location,
    dates: `${formatDate(startTime)}/${formatDate(endTime)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate an iCal/Apple Calendar (.ics) file content
 * Can be downloaded and opened in Apple Calendar, Outlook, etc.
 */
export function generateICalContent(event: CalendarEvent): string {
  const { title, description, location, startTime, endTime } = event

  // Format dates to iCal format: YYYYMMDDTHHmmssZ
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  }

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Glimpse Dating App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@glimpse-dating.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`

  return icsContent
}

/**
 * Generate an Outlook Calendar URL
 * Opens in user's Outlook Calendar (web)
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const { title, description, location, startTime, endTime } = event

  // Outlook uses ISO 8601 format
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    body: description,
    location: location,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Generate an Apple Calendar URL (webcal protocol)
 * Works on iOS/macOS devices
 */
export function generateAppleCalendarUrl(icsContent: string): string {
  // Create a data URL with the iCal content
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  return URL.createObjectURL(blob)
}

/**
 * Convert a DateProposal to a CalendarEvent
 */
export function dateProposalToCalendarEvent(proposal: DateProposal): CalendarEvent {
  // Calculate end time (default to 2 hours after start)
  const endTime = new Date(proposal.dateTime)
  endTime.setHours(endTime.getHours() + 2)

  // Build description with accommodation details
  let description = proposal.description + "\n\n"

  if (proposal.accommodations.length > 0) {
    description += "📅 Details:\n"
    proposal.accommodations.forEach((acc) => {
      if (acc.type === "restaurant" && acc.details.restaurantName) {
        description += `\n🍽️ Dinner at ${acc.details.restaurantName}`
        if (acc.details.confirmationNumber) {
          description += ` (Confirmation: ${acc.details.confirmationNumber})`
        }
      } else if (acc.type === "tickets" && acc.details.eventName) {
        description += `\n🎫 ${acc.details.eventName}`
        if (acc.details.seatInfo) {
          description += ` - ${acc.details.seatInfo}`
        }
      } else if (acc.type === "transportation") {
        description += `\n🚗 ${acc.details.rideType || "Ride"} pickup`
        if (acc.details.pickupTime) {
          description += ` at ${new Date(acc.details.pickupTime).toLocaleTimeString()}`
        }
      }
    })
  }

  description += `\n\nWith ${proposal.matchName} 💕\n\nCoordinated by Glimpse Dating App`

  return {
    title: `Date with ${proposal.matchName}: ${proposal.activity}`,
    description,
    location: proposal.venue ? `${proposal.venue}, ${proposal.location}` : proposal.location,
    startTime: new Date(proposal.dateTime),
    endTime
  }
}

/**
 * Add a date proposal to the user's calendar
 * Returns URLs/content for different calendar types
 */
export function addToCalendar(proposal: DateProposal): {
  googleUrl: string
  outlookUrl: string
  icsContent: string
  icsDownloadUrl: string
} {
  const event = dateProposalToCalendarEvent(proposal)

  const icsContent = generateICalContent(event)

  return {
    googleUrl: generateGoogleCalendarUrl(event),
    outlookUrl: generateOutlookCalendarUrl(event),
    icsContent,
    icsDownloadUrl: `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`
  }
}

/**
 * Detect user's preferred calendar system based on device
 */
export function detectPreferredCalendar(): "google" | "apple" | "outlook" | "unknown" {
  if (typeof window === "undefined") return "unknown"

  const userAgent = window.navigator.userAgent.toLowerCase()

  // iOS/macOS devices
  if (/iphone|ipad|ipod|macintosh/.test(userAgent)) {
    return "apple"
  }

  // Android devices (likely Google Calendar)
  if (/android/.test(userAgent)) {
    return "google"
  }

  // Windows devices (likely Outlook)
  if (/windows/.test(userAgent)) {
    return "outlook"
  }

  return "google" // Default to Google Calendar
}

/**
 * Get the appropriate calendar URL based on user's device
 */
export function getCalendarUrl(proposal: DateProposal): string {
  const preferred = detectPreferredCalendar()
  const { googleUrl, outlookUrl, icsDownloadUrl } = addToCalendar(proposal)

  switch (preferred) {
    case "apple":
      return icsDownloadUrl // Download .ics file for Apple Calendar
    case "outlook":
      return outlookUrl
    case "google":
    default:
      return googleUrl
  }
}

/**
 * Open calendar in a new window/tab
 */
export function openInCalendar(proposal: DateProposal): void {
  const url = getCalendarUrl(proposal)
  window.open(url, "_blank")
}

/**
 * Download .ics file for offline calendar import
 */
export function downloadIcsFile(proposal: DateProposal, filename?: string): void {
  const { icsContent } = addToCalendar(proposal)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename || `date-${proposal.matchName}-${proposal.dateTime}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
