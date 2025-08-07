// ABOUTME: PlayerHeroRepository manages user hero collections with authentication and event sourcing
// ABOUTME: Provides CRUD operations for player hero progression tracking including stars and equipment levels
import type { SupabaseClient } from "@supabase/supabase-js";
import log from "loglevel";
import { z } from "zod";
import { BaseRepository } from "./BaseRepository";
import { HeroRepository } from "./HeroRepository";
import { PlayerEventRepository } from "./PlayerEventRepository";
import type {
  BulkAddResult,
  CreatePlayerHeroInput,
  PlayerHero,
  PlayerHeroWithDetails,
  RepositoryResult,
  UpdatePlayerHeroInput,
} from "./types";

// Schema for input validation (create/update operations)
const PlayerHeroInputSchema = z.object({
  user_id: z.uuid(),
  hero_slug: z.string(),
  stars: z.number().int().min(1).max(6).optional().default(1),
  equipment_level: z.number().int().min(1).max(16).optional().default(1),
  level: z.number().int().min(1).max(120).optional().default(1),
  talisman_level: z.number().int().min(0).max(50).optional().default(0),
});

// Schema for complete database records
const PlayerHeroSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  hero_slug: z.string(),
  stars: z.number().int().min(1).max(6),
  equipment_level: z.number().int().min(1).max(16),
  level: z.number().int().min(1).max(120),
  talisman_level: z.number().int().min(0).max(50),
  created_at: z.string(),
  updated_at: z.string(),
});

export class PlayerHeroRepository extends BaseRepository<"player_hero"> {
  private eventRepo: PlayerEventRepository;
  private requestOrSupabase: Request | SupabaseClient<any> | null;

  constructor(requestOrSupabase: Request | SupabaseClient<any> | null = null) {
    if (
      requestOrSupabase &&
      typeof requestOrSupabase === "object" &&
      "from" in requestOrSupabase
    ) {
      // Custom supabase client provided
      super(
        requestOrSupabase,
        PlayerHeroInputSchema,
        "player_hero",
        PlayerHeroSchema,
        "id"
      );
      this.eventRepo = new PlayerEventRepository(requestOrSupabase);
    } else {
      // Request or null provided (standard operation)
      super(
        "player_hero",
        PlayerHeroInputSchema,
        requestOrSupabase as Request | null,
        "id"
      );
      this.eventRepo = new PlayerEventRepository(requestOrSupabase);
    }
    
    this.requestOrSupabase = requestOrSupabase;
  }

  /**
   * Finds all heroes in a user's collection
   */
  async findByUserId(userId: string): Promise<RepositoryResult<PlayerHero[]>> {
    return this.findAll({
      where: { user_id: userId },
      orderBy: { column: "created_at", ascending: false },
    });
  }

  /**
   * Finds heroes in user's collection with hero details
   */
  async findWithHeroDetails(
    userId: string
  ): Promise<RepositoryResult<PlayerHeroWithDetails[]>> {
    try {
      const query = this.supabase
        .from("player_hero")
        .select(
          `
          *,
          hero (
            slug,
            name,
            class,
            faction,
            main_stat,
            attack_type
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        return {
          data: null,
          error: {
            message: `Failed to fetch player heroes with details: ${error.message}`,
            code: error.code,
            details: error,
          },
        };
      }

      return {
        data: data as PlayerHeroWithDetails[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Unexpected error fetching player heroes with details: ${error}`,
          details: error,
        },
      };
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
        ...heroInput,
      };

      const result = await this.create(heroData);

      if (result.error || !result.data) {
        return result;
      }

      // Log the event
      const eventResult = await this.eventRepo.createEvent(userId, {
        event_type: "CLAIM_HERO",
        hero_slug: heroInput.hero_slug,
        event_data: {
          initial_stars: heroInput.stars || 1,
          initial_equipment_level: heroInput.equipment_level || 1,
          initial_level: heroInput.level || 1,
          initial_talisman_level: heroInput.talisman_level || 0,
        },
      });

      // Log event creation failure but don't fail the main operation
      if (eventResult.error) {
        log.warn("Failed to create CLAIM_HERO event:", eventResult.error);
      }

      return result;
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to add hero to collection: ${error}`,
          details: error,
        },
      };
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
        where: { user_id: userId, hero_slug: heroSlug },
      });

      if (
        currentResult.error ||
        !currentResult.data ||
        currentResult.data.length === 0
      ) {
        return {
          data: null,
          error: {
            message: "Hero not found in user collection",
            code: "HERO_NOT_FOUND",
          },
        };
      }

      const currentHero = currentResult.data[0];

      // Update the hero record
      const result = await this.update(currentHero.id, updates);

      if (result.error || !result.data) {
        return result;
      }

      // Log events for each type of update
      if (updates.stars !== undefined && updates.stars !== currentHero.stars) {
        const eventResult = await this.eventRepo.createEvent(userId, {
          event_type: "UPDATE_HERO_STARS",
          hero_slug: heroSlug,
          event_data: {
            previous_stars: currentHero.stars,
            new_stars: updates.stars,
          },
        });

        if (eventResult.error) {
          log.warn(
            "Failed to create UPDATE_HERO_STARS event:",
            eventResult.error
          );
        }
      }

      if (
        updates.equipment_level !== undefined &&
        updates.equipment_level !== currentHero.equipment_level
      ) {
        const eventResult = await this.eventRepo.createEvent(userId, {
          event_type: "UPDATE_HERO_EQUIPMENT",
          hero_slug: heroSlug,
          event_data: {
            previous_equipment_level: currentHero.equipment_level,
            new_equipment_level: updates.equipment_level,
          },
        });

        if (eventResult.error) {
          log.warn(
            "Failed to create UPDATE_HERO_EQUIPMENT event:",
            eventResult.error
          );
        }
      }

      if (updates.level !== undefined && updates.level !== currentHero.level) {
        const eventResult = await this.eventRepo.createEvent(userId, {
          event_type: "UPDATE_HERO_LEVEL",
          hero_slug: heroSlug,
          event_data: {
            previous_level: currentHero.level,
            new_level: updates.level,
          },
        });

        if (eventResult.error) {
          log.warn(
            "Failed to create UPDATE_HERO_LEVEL event:",
            eventResult.error
          );
        }
      }

      if (
        updates.talisman_level !== undefined &&
        updates.talisman_level !== currentHero.talisman_level
      ) {
        const eventResult = await this.eventRepo.createEvent(userId, {
          event_type: "UPDATE_HERO_TALISMAN",
          hero_slug: heroSlug,
          event_data: {
            previous_talisman_level: currentHero.talisman_level,
            new_talisman_level: updates.talisman_level,
          },
        });

        if (eventResult.error) {
          log.warn(
            "Failed to create UPDATE_HERO_TALISMAN event:",
            eventResult.error
          );
        }
      }

      return result;
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to update hero progress: ${error}`,
          details: error,
        },
      };
    }
  }

  /**
   * Removes hero from user's collection with event logging
   */
  async removeFromCollection(
    userId: string,
    heroSlug: string
  ): Promise<RepositoryResult<boolean>> {
    try {
      // Get current hero data for event logging
      const currentResult = await this.findAll({
        where: { user_id: userId, hero_slug: heroSlug },
      });

      if (
        currentResult.error ||
        !currentResult.data ||
        currentResult.data.length === 0
      ) {
        return {
          data: null,
          error: {
            message: "Hero not found in user collection",
            code: "HERO_NOT_FOUND",
          },
        };
      }

      const currentHero = currentResult.data[0];

      // Delete the hero record
      const result = await this.delete(currentHero.id);

      if (result.error) {
        return {
          data: null,
          error: result.error,
        };
      }

      // Log the event
      const eventResult = await this.eventRepo.createEvent(userId, {
        event_type: "UNCLAIM_HERO",
        hero_slug: heroSlug,
        event_data: {
          final_stars: currentHero.stars,
          final_equipment_level: currentHero.equipment_level,
          final_level: currentHero.level,
          final_talisman_level: currentHero.talisman_level,
        },
      });

      if (eventResult.error) {
        log.warn("Failed to create UNCLAIM_HERO event:", eventResult.error);
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to remove hero from collection: ${error}`,
          details: error,
        },
      };
    }
  }

  /**
   * Checks if a hero is in user's collection
   */
  async isHeroInCollection(
    userId: string,
    heroSlug: string
  ): Promise<RepositoryResult<boolean>> {
    const result = await this.findAll({
      where: { user_id: userId, hero_slug: heroSlug },
    });

    if (result.error) {
      return {
        data: null,
        error: result.error,
      };
    }

    return {
      data: result.data !== null && result.data.length > 0,
      error: null,
    };
  }

  /**
   * Adds all available heroes to user's collection that aren't already included
   * Creates heroes with default values (1 star, level 1 equipment) and logs events
   * @param userId The user ID to add heroes for
   * @param options Configuration options for the bulk operation
   * @param options.batchSize Number of heroes to process per batch (default: 50)
   * @param options.parallelism Number of parallel operations per batch (default: 5)
   * @returns Summary of the bulk addition operation including counts and any errors
   */
  async addAllHeroesToCollection(
    userId: string, 
    options: { 
      batchSize?: number; 
      parallelism?: number 
    } = {}
  ): Promise<RepositoryResult<BulkAddResult>> {
    try {
      log.info(`Starting bulk hero addition for user ${userId}`);

      // Initialize repositories
      const heroRepo = new HeroRepository(this.requestOrSupabase);

      // Get all available heroes
      const allHeroesResult = await heroRepo.findAllBasic();
      if (allHeroesResult.error || !allHeroesResult.data) {
        return {
          data: null,
          error: {
            message: `Failed to fetch available heroes: ${allHeroesResult.error?.message || "Unknown error"}`,
            code: "FETCH_HEROES_FAILED",
            details: allHeroesResult.error,
          },
        };
      }

      const allHeroes = allHeroesResult.data;
      log.info(`Found ${allHeroes.length} available heroes`);

      // Get existing heroes in user's collection
      const existingResult = await this.findByUserId(userId);
      if (existingResult.error) {
        return {
          data: null,
          error: {
            message: `Failed to fetch existing hero collection: ${existingResult.error.message}`,
            code: "FETCH_EXISTING_FAILED",
            details: existingResult.error,
          },
        };
      }

      const existingHeroSlugs = new Set(
        (existingResult.data || []).map((ph) => ph.hero_slug)
      );
      log.info(`User already has ${existingHeroSlugs.size} heroes in collection`);

      // Filter heroes to add (only those not in collection)
      const heroesToAdd = allHeroes.filter(
        (hero) => !existingHeroSlugs.has(hero.slug)
      );
      
      if (heroesToAdd.length === 0) {
        log.info("All heroes are already in user's collection");
        return {
          data: {
            totalHeroes: allHeroes.length,
            addedCount: 0,
            skippedCount: allHeroes.length,
            errorCount: 0,
            addedHeroes: [],
            skippedHeroes: allHeroes.map((h) => h.slug),
            errors: [],
          },
          error: null,
        };
      }

      log.info(`Adding ${heroesToAdd.length} new heroes to collection`);

      // Initialize result tracking
      const result: BulkAddResult = {
        totalHeroes: allHeroes.length,
        addedCount: 0,
        skippedCount: existingHeroSlugs.size,
        errorCount: 0,
        addedHeroes: [],
        skippedHeroes: Array.from(existingHeroSlugs),
        errors: [],
      };

      // Configure batch processing options
      const { batchSize = 50, parallelism = 5 } = options;
      log.info(`Processing with batch size ${batchSize} and parallelism ${parallelism}`);

      // Helper function to process a single hero
      const processHero = async (hero: { slug: string }) => {
        try {
          const addResult = await this.addHeroToCollection(userId, {
            hero_slug: hero.slug,
            stars: 1,
            equipment_level: 1,
          });

          if (addResult.error) {
            log.warn(`Failed to add hero ${hero.slug}:`, addResult.error.message);
            return {
              type: 'error' as const,
              heroSlug: hero.slug,
              message: addResult.error.message,
              code: addResult.error.code,
            };
          } else {
            log.debug(`Successfully added hero ${hero.slug}`);
            return {
              type: 'success' as const,
              heroSlug: hero.slug,
            };
          }
        } catch (error) {
          log.error(`Unexpected error adding hero ${hero.slug}:`, error);
          return {
            type: 'error' as const,
            heroSlug: hero.slug,
            message: error instanceof Error ? error.message : "Unknown error",
          };
        }
      };

      // Process heroes in batches with parallel execution within batches
      for (let i = 0; i < heroesToAdd.length; i += batchSize) {
        const batch = heroesToAdd.slice(i, i + batchSize);
        
        // Split batch into parallel chunks
        const chunks = [];
        for (let j = 0; j < batch.length; j += parallelism) {
          chunks.push(batch.slice(j, j + parallelism));
        }
        
        // Process chunks within the batch
        for (const chunk of chunks) {
          const chunkResults = await Promise.allSettled(
            chunk.map(processHero)
          );
          
          // Aggregate results from parallel processing with better error handling
          for (const settledResult of chunkResults) {
            if (settledResult.status === 'fulfilled') {
              const chunkResult = settledResult.value;
              if (chunkResult.type === 'error') {
                result.errorCount++;
                result.errors.push({
                  heroSlug: chunkResult.heroSlug,
                  message: chunkResult.message,
                  code: chunkResult.code,
                });
              } else {
                result.addedCount++;
                result.addedHeroes.push(chunkResult.heroSlug);
              }
            } else {
              // Handle Promise.allSettled rejection (should be rare with our error handling)
              result.errorCount++;
              result.errors.push({
                heroSlug: "unknown",
                message: `Promise rejection: ${settledResult.reason}`,
                code: "PROMISE_REJECTION",
              });
            }
          }
        }

        // Log progress for large operations
        if (heroesToAdd.length > 20) {
          const completed = Math.min(i + batchSize, heroesToAdd.length);
          log.info(`Processed ${completed}/${heroesToAdd.length} heroes (${Math.round((completed / heroesToAdd.length) * 100)}%)`);
        }
      }

      log.info(
        `Bulk hero addition completed: ${result.addedCount} added, ${result.skippedCount} skipped, ${result.errorCount} errors`
      );

      // Enhanced error categorization logic with better edge case handling
      if (result.addedCount === 0 && result.errorCount === 0) {
        // Edge case: All heroes were already in collection (should have been caught earlier)
        return {
          data: result,
          error: null, // This is actually a success case, not an error
        };
      } else if (result.addedCount === 0 && result.errorCount > 0) {
        // Complete failure: No heroes added, only errors
        return {
          data: result,
          error: {
            message: `Bulk hero addition failed: ${result.errorCount} errors occurred, no heroes were added`,
            code: "BULK_ADD_FAILED",
            details: { result },
          },
        };
      } else if (result.errorCount > 0 && result.addedCount > 0) {
        // Partial success: Some heroes added, some errors
        const successRate = Math.round((result.addedCount / (result.addedCount + result.errorCount)) * 100);
        return {
          data: result,
          error: {
            message: `Bulk hero addition partially successful: ${result.addedCount} heroes added, ${result.errorCount} errors (${successRate}% success rate)`,
            code: "BULK_ADD_PARTIAL",
            details: { result },
          },
        };
      }

      return {
        data: result,
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error in bulk hero addition:", error);
      return {
        data: null,
        error: {
          message: `Failed to add all heroes to collection: ${error instanceof Error ? error.message : "Unknown error"}`,
          code: "BULK_ADD_ERROR",
          details: error,
        },
      };
    }
  }
}
