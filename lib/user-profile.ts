// User profile store with RAG (Retrieval Augmented Generation) capabilities

export interface UserProfile {
  name: string
  age: number
  ethnicity: string
  appearance: string
  location: string
  occupation?: string
  interests: string[]
  dealbreakers: string[]
  preferences: {
    ageRange?: { min: number; max: number }
    qualities: string[]
    dateIdeas: string[]
  }
  conversationHistory: {
    facts: string[] // Things learned about the user
    preferences: string[] // Stated preferences
    dislikes: string[] // Things they don't like
  }
}

// Alice's profile
export const ALICE_PROFILE: UserProfile = {
  name: "Alice",
  age: 35,
  ethnicity: "Asian",
  appearance: "35-year-old Asian woman with shoulder-length dark hair, warm smile, casual-elegant style",
  location: "Los Angeles, CA",
  occupation: undefined, // To be learned
  interests: [],  // To be learned from conversation
  dealbreakers: [], // To be learned from conversation
  preferences: {
    qualities: [], // To be learned
    dateIdeas: [], // To be learned
  },
  conversationHistory: {
    facts: [],
    preferences: [],
    dislikes: [],
  }
}

// Simple RAG system - stores and retrieves user information
class UserProfileRAG {
  private profile: UserProfile

  constructor(initialProfile: UserProfile) {
    this.profile = { ...initialProfile }
    this.loadFromStorage()
  }

  // Add a fact learned about the user
  addFact(fact: string) {
    if (!this.profile.conversationHistory.facts.includes(fact)) {
      this.profile.conversationHistory.facts.push(fact)
      this.saveToStorage()
    }
  }

  // Add a preference
  addPreference(preference: string) {
    if (!this.profile.conversationHistory.preferences.includes(preference)) {
      this.profile.conversationHistory.preferences.push(preference)
      this.saveToStorage()
    }
  }

  // Add a dislike
  addDislike(dislike: string) {
    if (!this.profile.conversationHistory.dislikes.includes(dislike)) {
      this.profile.conversationHistory.dislikes.push(dislike)
      this.saveToStorage()
    }
  }

  // Add an interest
  addInterest(interest: string) {
    if (!this.profile.interests.includes(interest)) {
      this.profile.interests.push(interest)
      this.saveToStorage()
    }
  }

  // Add a dealbreaker
  addDealbreaker(dealbreaker: string) {
    if (!this.profile.dealbreakers.includes(dealbreaker)) {
      this.profile.dealbreakers.push(dealbreaker)
      this.saveToStorage()
    }
  }

  // Get profile summary for AI context
  getContextSummary(): string {
    const parts: string[] = []

    parts.push(`User: ${this.profile.name}, ${this.profile.age} years old, ${this.profile.ethnicity}, lives in ${this.profile.location}`)

    if (this.profile.occupation) {
      parts.push(`Occupation: ${this.profile.occupation}`)
    }

    if (this.profile.interests.length > 0) {
      parts.push(`Interests: ${this.profile.interests.join(", ")}`)
    }

    if (this.profile.dealbreakers.length > 0) {
      parts.push(`Dealbreakers: ${this.profile.dealbreakers.join(", ")}`)
    }

    if (this.profile.conversationHistory.facts.length > 0) {
      parts.push(`Facts: ${this.profile.conversationHistory.facts.join("; ")}`)
    }

    if (this.profile.conversationHistory.preferences.length > 0) {
      parts.push(`Preferences: ${this.profile.conversationHistory.preferences.join("; ")}`)
    }

    if (this.profile.conversationHistory.dislikes.length > 0) {
      parts.push(`Dislikes: ${this.profile.conversationHistory.dislikes.join("; ")}`)
    }

    return parts.join("\n")
  }

  // Get full profile
  getProfile(): UserProfile {
    return { ...this.profile }
  }

  // Update occupation
  setOccupation(occupation: string) {
    this.profile.occupation = occupation
    this.saveToStorage()
  }

  // Save to localStorage
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aliceProfile', JSON.stringify(this.profile))
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aliceProfile')
      if (saved) {
        try {
          this.profile = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to load profile from storage', e)
        }
      }
    }
  }

  // Clear all learned information
  reset() {
    this.profile = { ...ALICE_PROFILE }
    this.saveToStorage()
  }
}

// Singleton instance
let ragInstance: UserProfileRAG | null = null

export function getUserRAG(): UserProfileRAG {
  if (!ragInstance) {
    ragInstance = new UserProfileRAG(ALICE_PROFILE)
  }
  return ragInstance
}
