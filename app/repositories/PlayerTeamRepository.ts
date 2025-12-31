// ABOUTME: Repository for managing player team data and hero assignments
// ABOUTME: Handles CRUD operations, team validation, slug generation, and automatic naming for user team management

import type { SupabaseClient } from "@supabase/supabase-js";
import log from "loglevel";
import { z } from "zod";
import { generateSlug } from "~/lib/utils";
import { BaseRepository } from "./BaseRepository";
import { PlayerEventRepository } from "./PlayerEventRepository";
import type {
  AddHeroToTeamInput,
  CreatePlayerTeamInput,
  PlayerTeam,
  PlayerTeamHero,
  RepositoryResult,
  TeamWithHeroes,
  UpdatePlayerTeamInput,
} from "./types";

// Schema for input validation (create/update operations)
const PlayerTeamInputSchema = z.object({
  user_id: z.uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// Schema for complete database records
const PlayerTeamSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export class PlayerTeamRepository extends BaseRepository<"player_team"> {
  constructor(requestOrSupabase: Request | SupabaseClient<any> | null = null) {
    if (
      requestOrSupabase &&
      typeof requestOrSupabase === "object" &&
      "from" in requestOrSupabase
    ) {
      // Custom supabase client provided
      super(
        requestOrSupabase,
        PlayerTeamInputSchema,
        "player_team",
        PlayerTeamSchema,
        "id"
      );
    } else {
      // Request or null provided (standard operation)
      super(
        "player_team",
        PlayerTeamInputSchema,
        requestOrSupabase as Request | null,
        "id"
      );
    }
  }

  /**
   * Find all teams for a specific user with hero details
   */
  async findByUserId(
    userId: string
  ): Promise<RepositoryResult<TeamWithHeroes[]>> {
    try {
      const { data, error } = await this.supabase
        .from("player_team")
        .select(
          `
          *,
          player_team_hero (
            *,
            hero (*)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        log.error("Failed to fetch user teams:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      // Transform data to match TeamWithHeroes interface
      const teams: TeamWithHeroes[] = (data || []).map((team) => ({
        ...team,
        heroes: (team.player_team_hero || [])
          .map((teamHero: any) => ({
            ...teamHero,
            hero: teamHero.hero,
          }))
          .sort((a: any, b: any) => b.hero.order_rank - a.hero.order_rank), // Sort by order_rank descending
      }));

      return { data: teams, error: null };
    } catch (err) {
      log.error("Error fetching user teams:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Create a new team with auto-generated name and slug if not provided
   */
  async createTeam(
    userId: string,
    teamData: CreatePlayerTeamInput
  ): Promise<RepositoryResult<PlayerTeam>> {
    try {
      let teamName = teamData.name;

      // Generate default name if not provided
      if (!teamName || teamName.trim() === "") {
        const nextNumber = await this.getNextTeamNumber(userId);
        teamName = `Team ${nextNumber}`;
      }

      // Generate slug from team name
      let slug = generateSlug(teamName);

      // Validate slug uniqueness
      const slugValidation = await this.validateSlugUniqueness(userId, slug);
      if (!slugValidation.isValid) {
        return {
          data: null,
          error: { message: slugValidation.error || "Slug already exists" },
        };
      }

      const { data, error } = await this.supabase
        .from("player_team")
        .insert({
          user_id: userId,
          name: teamName,
          slug,
          description: teamData.description || null,
        })
        .select()
        .single();

      if (error) {
        log.error("Failed to create team:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data, error: null };
    } catch (err) {
      log.error("Error creating team:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Update team details with slug regeneration and event logging
   */
  async updateTeam(
    teamId: string,
    userId: string,
    updates: UpdatePlayerTeamInput
  ): Promise<RepositoryResult<PlayerTeam>> {
    try {
      // Get current team to check for name changes
      const { data: currentTeam, error: fetchError } = await this.supabase
        .from("player_team")
        .select("*")
        .eq("id", teamId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !currentTeam) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      let finalUpdates = { ...updates };

      // If name is being updated, regenerate slug and validate
      if (updates.name && updates.name !== currentTeam.name) {
        const newSlug = generateSlug(updates.name);

        // Validate slug uniqueness (excluding current team)
        const slugValidation = await this.validateSlugUniqueness(
          userId,
          newSlug,
          teamId
        );
        if (!slugValidation.isValid) {
          return {
            data: null,
            error: {
              message:
                slugValidation.error ||
                "A team with that name already exists. Please choose a different name.",
            },
          };
        }

        finalUpdates = { ...finalUpdates, slug: newSlug };

        // Log the team name change event
        const eventRepo = new PlayerEventRepository(this.supabase);
        await eventRepo.createEvent(userId, {
          event_type: "UPDATE_TEAM_NAME",
          event_data: {
            team_id: teamId,
            old_name: currentTeam.name,
            new_name: updates.name,
            old_slug: currentTeam.slug,
            new_slug: newSlug,
          },
        });
      }

      const { data, error } = await this.supabase
        .from("player_team")
        .update(finalUpdates)
        .eq("id", teamId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        log.error("Failed to update team:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      log.info(`Updated team ${teamId}`);
      return { data, error: null };
    } catch (err) {
      log.error("Error updating team:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Delete a team and all its hero assignments
   */
  async deleteTeam(
    teamId: string,
    userId: string
  ): Promise<RepositoryResult<boolean>> {
    try {
      // Verify user owns the team
      const { data: team, error: teamError } = await this.supabase
        .from("player_team")
        .select("id")
        .eq("id", teamId)
        .eq("user_id", userId)
        .single();

      if (teamError || !team) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      // Delete the team (cascade will handle team heroes)
      const { error } = await this.supabase
        .from("player_team")
        .delete()
        .eq("id", teamId)
        .eq("user_id", userId);

      if (error) {
        log.error("Failed to delete team:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      log.info(`Deleted team ${teamId}`);
      return { data: true, error: null };
    } catch (err) {
      log.error("Error deleting team:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Add a hero to a team with validation
   */
  async addHeroToTeam(
    teamId: string,
    userId: string,
    heroData: AddHeroToTeamInput
  ): Promise<RepositoryResult<PlayerTeamHero>> {
    try {
      // First verify the team belongs to the user and get current hero count
      const { data: teamInfo, error: teamError } = await this.supabase
        .from("player_team")
        .select(
          `
          id,
          player_team_hero (id)
        `
        )
        .eq("id", teamId)
        .eq("user_id", userId)
        .single();

      if (teamError || !teamInfo) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      // Check if team already has 5 heroes
      const currentHeroCount = teamInfo.player_team_hero?.length || 0;
      if (currentHeroCount >= 5) {
        return {
          data: null,
          error: { message: "Team already has maximum of 5 heroes" },
        };
      }

      // Check if hero is already in the team
      const { data: existingHero, error: checkError } = await this.supabase
        .from("player_team_hero")
        .select("id")
        .eq("team_id", teamId)
        .eq("hero_slug", heroData.hero_slug)
        .single();

      if (existingHero) {
        return {
          data: null,
          error: { message: "Hero is already in this team" },
        };
      }

      // Add hero to team
      const { data, error } = await this.supabase
        .from("player_team_hero")
        .insert({
          team_id: teamId,
          hero_slug: heroData.hero_slug,
        })
        .select()
        .single();

      if (error) {
        log.error("Failed to add hero to team:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data, error: null };
    } catch (err) {
      log.error("Error adding hero to team:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Remove a hero from a team
   */
  async removeHeroFromTeam(
    teamId: string,
    userId: string,
    heroSlug: string
  ): Promise<RepositoryResult<boolean>> {
    try {
      // Verify team belongs to user
      const { data: team, error: teamError } = await this.supabase
        .from("player_team")
        .select("id")
        .eq("id", teamId)
        .eq("user_id", userId)
        .single();

      if (teamError || !team) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      // Remove hero from team
      const { error } = await this.supabase
        .from("player_team_hero")
        .delete()
        .eq("team_id", teamId)
        .eq("hero_slug", heroSlug);

      if (error) {
        log.error("Failed to remove hero from team:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      log.info(`Removed hero ${heroSlug} from team ${teamId}`);
      return { data: true, error: null };
    } catch (err) {
      log.error("Error removing hero from team:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Get the next available team number for auto-naming
   */
  private async getNextTeamNumber(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from("player_team")
        .select("name")
        .eq("user_id", userId)
        .like("name", "Team %");

      if (error) {
        log.warn(
          "Failed to get existing team names, defaulting to Team 1:",
          error
        );
        return 1;
      }

      const teamNumbers = (data || [])
        .map((team) => {
          const match = team.name.match(/^Team (\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => num > 0);

      return teamNumbers.length > 0 ? Math.max(...teamNumbers) + 1 : 1;
    } catch (err) {
      log.warn("Error determining next team number, defaulting to 1:", err);
      return 1;
    }
  }

  /**
   * Get team with heroes by team ID (with user verification)
   */
  async findTeamWithHeroes(
    teamId: string,
    userId: string
  ): Promise<RepositoryResult<TeamWithHeroes>> {
    try {
      const { data, error } = await this.supabase
        .from("player_team")
        .select(
          `
          *,
          player_team_hero (
            *,
            hero (*)
          )
        `
        )
        .eq("id", teamId)
        .eq("user_id", userId)
        .single();

      if (error) {
        log.error("Failed to fetch team with heroes:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      // Transform data to match TeamWithHeroes interface
      const team: TeamWithHeroes = {
        ...data,
        heroes: (data.player_team_hero || [])
          .map((teamHero: any) => ({
            ...teamHero,
            hero: teamHero.hero,
          }))
          .sort((a: any, b: any) => b.hero.order_rank - a.hero.order_rank), // Sort by order_rank descending
      };

      return { data: team, error: null };
    } catch (err) {
      log.error("Error fetching team with heroes:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Find team by slug with user verification
   */
  async findTeamBySlug(
    slug: string,
    userId: string
  ): Promise<RepositoryResult<TeamWithHeroes>> {
    try {
      const { data, error } = await this.supabase
        .from("player_team")
        .select(
          `
          *,
          player_team_hero (
            *,
            hero (*)
          )
        `
        )
        .eq("slug", slug)
        .eq("user_id", userId)
        .single();

      if (error) {
        log.error("Failed to fetch team by slug:", error);
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      if (!data) {
        return {
          data: null,
          error: { message: "Team not found or access denied" },
        };
      }

      // Transform data to match TeamWithHeroes interface
      const team: TeamWithHeroes = {
        ...data,
        heroes: (data.player_team_hero || [])
          .map((teamHero: any) => ({
            ...teamHero,
            hero: teamHero.hero,
          }))
          .sort((a: any, b: any) => b.hero.order_rank - a.hero.order_rank),
      };

      return { data: team, error: null };
    } catch (err) {
      log.error("Error fetching team by slug:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }

  /**
   * Validate slug uniqueness for a user
   */
  private async validateSlugUniqueness(
    userId: string,
    slug: string,
    excludeTeamId?: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      let query = this.supabase
        .from("player_team")
        .select("id")
        .eq("user_id", userId)
        .eq("slug", slug);

      if (excludeTeamId) {
        query = query.neq("id", excludeTeamId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" which is what we want
        log.error("Error validating slug uniqueness:", error);
        return { isValid: false, error: "Failed to validate slug uniqueness" };
      }

      // If data exists, slug is not unique
      if (data) {
        return {
          isValid: false,
          error:
            "A team with that name already exists. Please choose a different name.",
        };
      }

      return { isValid: true };
    } catch (err) {
      log.error("Exception validating slug uniqueness:", err);
      return { isValid: false, error: "Failed to validate slug uniqueness" };
    }
  }

  /**
   * Find team by old slug from event log (for 301 redirects)
   */
  async findTeamByOldSlug(
    oldSlug: string,
    userId: string
  ): Promise<RepositoryResult<PlayerTeam | null>> {
    try {
      // Query event log for UPDATE_TEAM_NAME events with the old slug
      const eventRepo = new PlayerEventRepository(this.supabase);
      const eventsResult = await eventRepo.findEventsByType(
        userId,
        "UPDATE_TEAM_NAME"
      );

      if (eventsResult.error || !eventsResult.data) {
        return { data: null, error: null }; // No event history found
      }

      // Find the most recent event with this old slug
      for (const event of eventsResult.data) {
        const eventData = event.event_data as any;
        if (eventData.old_slug === oldSlug) {
          // Found a match, get the current team by team_id
          const { data: team, error } = await this.supabase
            .from("player_team")
            .select("*")
            .eq("id", eventData.team_id)
            .eq("user_id", userId)
            .single();

          if (error || !team) {
            continue; // Try next event
          }

          return { data: team, error: null };
        }
      }

      return { data: null, error: null }; // No matching old slug found
    } catch (err) {
      log.error("Error finding team by old slug:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      };
    }
  }
}
