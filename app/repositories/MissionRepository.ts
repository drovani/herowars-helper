import { z } from "zod"
import type { Database } from "~/types/supabase"
import { BaseRepository } from "./BaseRepository"
import type { RepositoryResult } from "./types"

// Zod schema for mission validation
const missionSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  chapter_id: z.number().int().positive(),
  hero_slug: z.string().nullable().optional(),
  energy_cost: z.number().int().positive().nullable().optional(),
  level: z.number().int().positive().nullable().optional(),
})

// Zod schema for chapter validation
const chapterSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
})

// Type definitions for repository operations
export type Mission = Database["public"]["Tables"]["mission"]["Row"]
export type MissionInsert = Database["public"]["Tables"]["mission"]["Insert"]
export type MissionUpdate = Database["public"]["Tables"]["mission"]["Update"]

export type Chapter = Database["public"]["Tables"]["chapter"]["Row"]
export type ChapterInsert = Database["public"]["Tables"]["chapter"]["Insert"]
export type ChapterUpdate = Database["public"]["Tables"]["chapter"]["Update"]

// Extended types for relationship loading
export type MissionWithChapter = Mission & { chapter: Chapter }
export type ChapterWithMissions = Chapter & { missions: Mission[] }

// Bulk import types
export type MissionImportData = MissionInsert
export type ChapterImportData = ChapterInsert

export class MissionRepository extends BaseRepository<"mission"> {
  constructor(request: Request | null = null) {
    super("mission", missionSchema, request, "slug")
  }

  protected getTableRelationships(): Record<string, boolean> {
    return {
      chapter: true, // mission belongs to chapter
    }
  }

  // Mission-specific query methods
  async findByChapter(chapterId: number): Promise<RepositoryResult<Mission[]>> {
    return this.findAll({
      where: { chapter_id: chapterId },
      orderBy: { column: "slug", ascending: true },
    })
  }

  async findByHeroSlug(heroSlug: string): Promise<RepositoryResult<Mission[]>> {
    return this.findAll({
      where: { hero_slug: heroSlug },
      orderBy: { column: "slug", ascending: true },
    })
  }

  async findWithChapter(slug: string): Promise<RepositoryResult<MissionWithChapter>> {
    return this.findById(slug, {
      include: { chapter: true },
    }) as Promise<RepositoryResult<MissionWithChapter>>
  }

  async findByCampaignSource(equipmentSlug: string): Promise<RepositoryResult<Mission[]>> {
    try {
      // Query missions that are referenced in equipment campaign_sources
      const { data, error } = await this.supabase
        .from("equipment")
        .select("campaign_sources")
        .eq("slug", equipmentSlug)
        .single()

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        }
      }

      if (!data?.campaign_sources || data.campaign_sources.length === 0) {
        return {
          data: [],
          error: null,
        }
      }

      // Find missions with slugs that match campaign sources
      const { data: missions, error: missionError } = await this.supabase
        .from("mission")
        .select()
        .in("slug", data.campaign_sources)
        .order("slug", { ascending: true })

      if (missionError) {
        return {
          data: null,
          error: {
            message: missionError.message,
            code: missionError.code,
            details: missionError.details,
          },
        }
      }

      const missionsResult = {
        data: missions as Mission[],
        error: null,
      }

      return missionsResult
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  // Chapter operations
  async findAllChapters(): Promise<RepositoryResult<Chapter[]>> {
    try {
      const chapterColumns: (keyof Chapter)[] = ["id", "title"]
      const { data, error } = await this.supabase
        .from("chapter")
        .select()
        .order("id", { ascending: true })

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        }
      }

      return {
        data: data as Chapter[],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async findChapterById(id: number): Promise<RepositoryResult<Chapter>> {
    try {
      const { data, error } = await this.supabase
        .from("chapter")
        .select()
        .eq("id", id)
        .single()

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        }
      }

      return {
        data: data as Chapter,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async findChapterWithMissions(id: number): Promise<RepositoryResult<ChapterWithMissions>> {
    try {
      const { data, error } = await this.supabase
        .from("chapter")
        .select(`
          *,
          missions:mission(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        }
      }

      return {
        data: data as ChapterWithMissions,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  // Bulk operations for admin data loading
  async bulkCreateChapters(
    chapterData: ChapterImportData[], 
    options: { skipExisting?: boolean } = {}
  ): Promise<RepositoryResult<Chapter[]>> {
    try {
      const results: Chapter[] = []
      const skipped: Chapter[] = []
      const errors: any[] = []

      for (const data of chapterData) {
        const validation = chapterSchema.safeParse(data)
        if (!validation.success) {
          errors.push({
            data,
            error: {
              message: "Validation failed",
              code: "VALIDATION_ERROR",
              details: validation.error.errors,
            },
          })
          continue
        }

        // Check if skipExisting and record exists
        if (options.skipExisting) {
          const existing = await this.findChapterById(data.id)
          if (existing.data) {
            skipped.push(existing.data)
            continue
          }
        }

        const { data: created, error } = await this.supabase
          .from("chapter")
          .insert(data)
          .select()
          .single()

        if (error) {
          errors.push({
            data,
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
            },
          })
        } else {
          results.push(created as Chapter)
        }
      }

      // Determine result based on what happened
      if (errors.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk create chapters completed with ${errors.length} errors, ${skipped.length} skipped`,
            code: "BULK_PARTIAL_FAILURE",
            details: { errors, skipped },
          },
        }
      }

      if (skipped.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk create chapters completed: ${results.length} created, ${skipped.length} skipped`,
            code: "BULK_PARTIAL_SUCCESS", 
            details: { skipped },
          },
        }
      }

      return {
        data: results,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async bulkCreateMissions(
    missionData: MissionImportData[], 
    options: { skipExisting?: boolean } = {}
  ): Promise<RepositoryResult<Mission[]>> {
    return this.bulkCreate(missionData, { skipExisting: options.skipExisting })
  }

  // Domain-based purge operations for admin setup
  async purgeMissionDomain(): Promise<RepositoryResult<{ missions: number; chapters: number }>> {
    try {
      // Delete missions first (foreign key constraint)
      const { count: missionCount, error: missionError } = await this.supabase
        .from("mission")
        .delete({ count: "exact" })
        .neq("slug", "")  // Delete all missions (using neq with empty string to match all)

      if (missionError) {
        return {
          data: null,
          error: {
            message: `Failed to purge missions: ${missionError.message}`,
            code: missionError.code,
            details: missionError.details,
          },
        }
      }

      // Delete chapters second
      const { count: chapterCount, error: chapterError } = await this.supabase
        .from("chapter")
        .delete({ count: "exact" })
        .neq("id", 0)  // Delete all chapters (using neq with 0 to match all)

      if (chapterError) {
        return {
          data: null,
          error: {
            message: `Failed to purge chapters: ${chapterError.message}`,
            code: chapterError.code,
            details: chapterError.details,
          },
        }
      }

      // Return the count of deleted records
      const purgeResults = {
        missions: missionCount || 0,
        chapters: chapterCount || 0,
      }

      return {
        data: purgeResults,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred during purge",
          details: error,
        },
      }
    }
  }
}