// ABOUTME: PlayerHeroRepository manages user hero collections with authentication and event sourcing
// ABOUTME: Provides CRUD operations for player hero progression tracking including stars and equipment levels
import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { BaseRepository } from "./BaseRepository"
import { PlayerEventRepository } from "./PlayerEventRepository"
import type {
  CreatePlayerHeroInput,
  UpdatePlayerHeroInput,
  PlayerHero,
  PlayerHeroWithDetails,
  RepositoryResult
} from "./types"
import type { Json } from "~/types/supabase"

const PlayerHeroSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  hero_slug: z.string(),
  stars: z.number().int().min(1).max(6),
  equipment_level: z.number().int().min(1).max(16),
  created_at: z.string(),
  updated_at: z.string()
})

export class PlayerHeroRepository extends BaseRepository<'player_hero'> {
  private eventRepo: PlayerEventRepository

  constructor(requestOrSupabase: Request | SupabaseClient<any> | null = null) {
    if (requestOrSupabase && typeof requestOrSupabase === 'object' && 'from' in requestOrSupabase) {
      // Custom supabase client provided
      super(requestOrSupabase, PlayerHeroSchema, 'player_hero', PlayerHeroSchema, 'id')
      this.eventRepo = new PlayerEventRepository(requestOrSupabase)
    } else {
      // Request or null provided (standard operation)
      super('player_hero', PlayerHeroSchema, requestOrSupabase as Request | null, 'id')
      this.eventRepo = new PlayerEventRepository(requestOrSupabase)
    }
  }

  /**
   * Finds all heroes in a user's collection
   */
  async findByUserId(userId: string): Promise<RepositoryResult<PlayerHero[]>> {
    return this.findAll({
      where: { user_id: userId },
      orderBy: { column: 'created_at', ascending: false }
    })
  }

  /**
   * Finds heroes in user's collection with hero details
   */
  async findWithHeroDetails(userId: string): Promise<RepositoryResult<PlayerHeroWithDetails[]>> {
    try {
      const query = this.supabase
        .from('player_hero')
        .select(`
          *,
          hero (
            slug,
            name,
            class,
            faction,
            main_stat,
            attack_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        return {
          data: null,
          error: {
            message: `Failed to fetch player heroes with details: ${error.message}`,
            code: error.code,
            details: error
          }
        }
      }

      return {
        data: data as PlayerHeroWithDetails[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Unexpected error fetching player heroes with details: ${error}`,
          details: error
        }
      }
    }
  }

  /**
   * Adds a hero to user's collection with event logging
   */
  async addHeroToCollection(
    userId: string,
    heroInput: CreatePlayerHeroInput
  ): Promise<RepositoryResult<PlayerHero>> {
    try {
      // Create the hero record
      const heroData = {
        user_id: userId,
        ...heroInput
      }

      const result = await this.create(heroData)

      if (result.error || !result.data) {
        return result
      }

      // Log the event
      await this.eventRepo.createEvent(userId, {
        event_type: 'CLAIM_HERO',
        hero_slug: heroInput.hero_slug,
        event_data: {
          initial_stars: heroInput.stars || 1,
          initial_equipment_level: heroInput.equipment_level || 1
        }
      })

      return result
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to add hero to collection: ${error}`,
          details: error
        }
      }
    }
  }

  /**
   * Updates hero progression with event logging
   */
  async updateHeroProgress(
    userId: string,
    heroSlug: string,
    updates: UpdatePlayerHeroInput
  ): Promise<RepositoryResult<PlayerHero>> {
    try {
      // Get current hero data for event logging
      const currentResult = await this.findAll({
        where: { user_id: userId, hero_slug: heroSlug }
      })

      if (currentResult.error || !currentResult.data || currentResult.data.length === 0) {
        return {
          data: null,
          error: {
            message: 'Hero not found in user collection',
            code: 'HERO_NOT_FOUND'
          }
        }
      }

      const currentHero = currentResult.data[0]
      
      // Update the hero record
      const result = await this.update(currentHero.id, updates)

      if (result.error || !result.data) {
        return result
      }

      // Log events for each type of update
      if (updates.stars !== undefined && updates.stars !== currentHero.stars) {
        await this.eventRepo.createEvent(userId, {
          event_type: 'UPDATE_HERO_STARS',
          hero_slug: heroSlug,
          event_data: {
            previous_stars: currentHero.stars,
            new_stars: updates.stars
          }
        })
      }

      if (updates.equipment_level !== undefined && updates.equipment_level !== currentHero.equipment_level) {
        await this.eventRepo.createEvent(userId, {
          event_type: 'UPDATE_HERO_EQUIPMENT',
          hero_slug: heroSlug,
          event_data: {
            previous_equipment_level: currentHero.equipment_level,
            new_equipment_level: updates.equipment_level
          }
        })
      }

      return result
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to update hero progress: ${error}`,
          details: error
        }
      }
    }
  }

  /**
   * Removes hero from user's collection with event logging
   */
  async removeFromCollection(userId: string, heroSlug: string): Promise<RepositoryResult<boolean>> {
    try {
      // Get current hero data for event logging
      const currentResult = await this.findAll({
        where: { user_id: userId, hero_slug: heroSlug }
      })

      if (currentResult.error || !currentResult.data || currentResult.data.length === 0) {
        return {
          data: null,
          error: {
            message: 'Hero not found in user collection',
            code: 'HERO_NOT_FOUND'
          }
        }
      }

      const currentHero = currentResult.data[0]

      // Delete the hero record
      const result = await this.delete(currentHero.id)

      if (result.error) {
        return {
          data: null,
          error: result.error
        }
      }

      // Log the event
      await this.eventRepo.createEvent(userId, {
        event_type: 'UNCLAIM_HERO',
        hero_slug: heroSlug,
        event_data: {
          final_stars: currentHero.stars,
          final_equipment_level: currentHero.equipment_level
        }
      })

      return {
        data: true,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to remove hero from collection: ${error}`,
          details: error
        }
      }
    }
  }

  /**
   * Checks if a hero is in user's collection
   */
  async isHeroInCollection(userId: string, heroSlug: string): Promise<RepositoryResult<boolean>> {
    const result = await this.findAll({
      where: { user_id: userId, hero_slug: heroSlug }
    })

    if (result.error) {
      return {
        data: null,
        error: result.error
      }
    }

    return {
      data: result.data !== null && result.data.length > 0,
      error: null
    }
  }
}