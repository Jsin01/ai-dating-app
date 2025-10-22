import type { DateProposal } from "./types"

// Global store to persist across Next.js API route requests
const globalProposalsMap = new Map<string, DateProposal>()

/**
 * Simple in-memory store for date proposals
 * In production, this would be replaced with a proper database
 */
class DateStore {
  private proposals: Map<string, DateProposal> = globalProposalsMap

  /**
   * Save a date proposal
   */
  save(proposal: DateProposal): void {
    this.proposals.set(proposal.id, proposal)
  }

  /**
   * Get a date proposal by ID
   */
  get(id: string): DateProposal | undefined {
    return this.proposals.get(id)
  }

  /**
   * Get all date proposals
   */
  getAll(): DateProposal[] {
    return Array.from(this.proposals.values())
  }

  /**
   * Get date proposals by match ID
   */
  getByMatch(matchId: string): DateProposal[] {
    return Array.from(this.proposals.values()).filter(
      (p) => p.matchId === matchId
    )
  }

  /**
   * Get date proposals by status
   */
  getByStatus(status: DateProposal["status"]): DateProposal[] {
    return Array.from(this.proposals.values()).filter(
      (p) => p.status === status
    )
  }

  /**
   * Delete a date proposal
   */
  delete(id: string): boolean {
    return this.proposals.delete(id)
  }

  /**
   * Update date proposal status
   */
  updateStatus(id: string, status: DateProposal["status"]): void {
    const proposal = this.proposals.get(id)
    if (proposal) {
      proposal.status = status
      proposal.updatedAt = new Date()
      this.proposals.set(id, proposal)
    }
  }

  /**
   * Update user response
   */
  updateUserResponse(
    id: string,
    response: "accepted" | "declined"
  ): void {
    const proposal = this.proposals.get(id)
    if (proposal) {
      proposal.userResponse = response
      proposal.updatedAt = new Date()

      // Update status based on responses
      if (response === "declined") {
        proposal.status = "declined"
      } else if (response === "accepted" && proposal.matchResponse === "accepted") {
        proposal.status = "both_accepted"
      } else if (response === "accepted") {
        proposal.status = "user_accepted"
      }

      this.proposals.set(id, proposal)
    }
  }

  /**
   * Update match response (for future multi-user support)
   */
  updateMatchResponse(
    id: string,
    response: "accepted" | "declined"
  ): void {
    const proposal = this.proposals.get(id)
    if (proposal) {
      proposal.matchResponse = response
      proposal.updatedAt = new Date()

      // Update status based on responses
      if (response === "declined") {
        proposal.status = "declined"
      } else if (response === "accepted" && proposal.userResponse === "accepted") {
        proposal.status = "both_accepted"
      } else if (response === "accepted") {
        proposal.status = "match_accepted"
      }

      this.proposals.set(id, proposal)
    }
  }

  /**
   * Update calendar event ID
   */
  updateCalendarEventId(id: string, eventId: string): void {
    const proposal = this.proposals.get(id)
    if (proposal) {
      proposal.calendarEventId = eventId
      proposal.updatedAt = new Date()
      this.proposals.set(id, proposal)
    }
  }

  /**
   * Add accommodation to a date proposal
   */
  addAccommodation(
    id: string,
    accommodation: DateProposal["accommodations"][0]
  ): void {
    const proposal = this.proposals.get(id)
    if (proposal) {
      proposal.accommodations.push(accommodation)
      proposal.updatedAt = new Date()
      this.proposals.set(id, proposal)
    }
  }

  /**
   * Update accommodation status
   */
  updateAccommodationStatus(
    proposalId: string,
    accommodationId: string,
    status: "pending" | "booking" | "confirmed" | "failed",
    errorMessage?: string
  ): void {
    const proposal = this.proposals.get(proposalId)
    if (proposal) {
      const accommodation = proposal.accommodations.find(
        (a) => a.id === accommodationId
      )
      if (accommodation) {
        accommodation.status = status
        if (errorMessage) {
          accommodation.errorMessage = errorMessage
        }
        if (status === "confirmed") {
          accommodation.confirmedAt = new Date()
        }
        proposal.updatedAt = new Date()
        this.proposals.set(proposalId, proposal)
      }
    }
  }
}

export const dateStore = new DateStore()
