import type { Glimpse } from "./types"

/**
 * Simple in-memory store for glimpses
 * In production, this would be replaced with a proper database
 */
class GlimpseStore {
  private glimpses: Map<string, Glimpse> = new Map()

  /**
   * Save a glimpse
   */
  save(glimpse: Glimpse): void {
    this.glimpses.set(glimpse.id, glimpse)
  }

  /**
   * Get a glimpse by ID
   */
  get(id: string): Glimpse | undefined {
    return this.glimpses.get(id)
  }

  /**
   * Get all glimpses
   */
  getAll(): Glimpse[] {
    return Array.from(this.glimpses.values())
  }

  /**
   * Delete a glimpse
   */
  delete(id: string): boolean {
    return this.glimpses.delete(id)
  }

  /**
   * Update glimpse status
   */
  updateStatus(id: string, status: Glimpse["status"]): void {
    const glimpse = this.glimpses.get(id)
    if (glimpse) {
      glimpse.status = status
      this.glimpses.set(id, glimpse)
    }
  }
}

export const glimpseStore = new GlimpseStore()
