// ABOUTME: PlayerEventRepository provides event sourcing capabilities for player actions
// ABOUTME: Tracks all player hero collection changes for audit trails and analytics
import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { BaseRepository } from "./BaseRepository"
import type {
  CreatePlayerEventInput,
  PlayerEvent,
  RepositoryResult
} from "./types"
import type { Json } from "~/types/supabase"

const PlayerEventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  event_type: z.enum(['CLAIM_HERO', 'UNCLAIM_HERO', 'UPDATE_HERO_STARS', 'UPDATE_HERO_EQUIPMENT']),
  hero_slug: z.string(),
  event_data: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  created_by: z.string().uuid()
})

export class PlayerEventRepository extends BaseRepository<'player_event'> {
  constructor(requestOrSupabase: Request | SupabaseClient<any> | null = null) {
    if (requestOrSupabase && typeof requestOrSupabase === 'object' && 'from' in requestOrSupabase) {
      // Custom supabase client provided
      super(requestOrSupabase, PlayerEventSchema, 'player_event', PlayerEventSchema, 'id')
    } else {
      // Request or null provided (standard operation)
      super('player_event', PlayerEventSchema, requestOrSupabase as Request | null, 'id')
    }
  }

  /**
   * Creates a new player event record
   */
  async createEvent(
    userId: string,
    eventInput: CreatePlayerEventInput
  ): Promise<RepositoryResult<PlayerEvent>> {
    const eventData = {
      user_id: userId,
      created_by: userId,
      event_type: eventInput.event_type,
      hero_slug: eventInput.hero_slug,
      event_data: eventInput.event_data || {}
    }

    return this.create(eventData)
  }

  /**
   * Finds all events for a specific user
   */
  async findEventsByUser(userId: string): Promise<RepositoryResult<PlayerEvent[]>> {
    return this.findAll({
      where: { user_id: userId },
      orderBy: { column: 'created_at', ascending: false }
    })
  }

  /**
   * Finds events for a specific hero belonging to a user
   */
  async findEventsByHero(userId: string, heroSlug: string): Promise<RepositoryResult<PlayerEvent[]>> {
    return this.findAll({
      where: { 
        user_id: userId,
        hero_slug: heroSlug
      },
      orderBy: { column: 'created_at', ascending: false }
    })
  }

  /**
   * Finds events by type for a specific user
   */
  async findEventsByType(
    userId: string, 
    eventType: 'CLAIM_HERO' | 'UNCLAIM_HERO' | 'UPDATE_HERO_STARS' | 'UPDATE_HERO_EQUIPMENT'
  ): Promise<RepositoryResult<PlayerEvent[]>> {
    return this.findAll({
      where: { 
        user_id: userId,
        event_type: eventType
      },
      orderBy: { column: 'created_at', ascending: false }
    })
  }

  /**
   * Finds recent events for a user with pagination
   */
  async findRecentEvents(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<RepositoryResult<PlayerEvent[]>> {
    return this.findAll({
      where: { user_id: userId },
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset
    })
  }
}