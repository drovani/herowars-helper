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
  async bulkCreateChapters(chapterData: ChapterImportData[]): Promise<RepositoryResult<Chapter[]>> {
    try {
      const results: Chapter[] = []
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

      if (errors.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk create chapters completed with ${errors.length} errors`,
            code: "BULK_PARTIAL_FAILURE",
            details: errors,
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

  async bulkCreateMissions(missionData: MissionImportData[]): Promise<RepositoryResult<Mission[]>> {
    return this.bulkCreate(missionData)
  }
}