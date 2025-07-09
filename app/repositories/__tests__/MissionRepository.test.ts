import { describe, it, expect, beforeEach, vi } from "vitest"
import { MissionRepository } from "../MissionRepository"

// Mock the supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  gte: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
}

vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    supabase: mockSupabaseClient,
  })),
}))

describe("MissionRepository", () => {
  let repository: MissionRepository
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new MissionRepository()
    mockSupabase = (repository as any).supabase
  })

  describe("constructor", () => {
    it("should initialize with correct table name and schema", () => {
      expect((repository as any).tableName).toBe("mission")
      expect((repository as any).primaryKeyColumn).toBe("slug")
      expect((repository as any).schema).toBeDefined()
    })

    it("should define chapter relationship", () => {
      const relationships = (repository as any).getTableRelationships()
      expect(relationships).toEqual({
        chapter: true,
      })
    })
  })

  describe("findByChapter", () => {
    it("should find missions by chapter ID with proper sorting", async () => {
      const mockMissions = [
        { slug: "1-1", name: "Mission 1", chapter_id: 1, hero_slug: "astaroth", energy_cost: 6, level: 1 },
        { slug: "1-2", name: "Mission 2", chapter_id: 1, hero_slug: "galahad", energy_cost: 6, level: 2 },
      ]

      // Mock the chain for multiple order calls - first order returns this, second resolves
      mockSupabase.order.mockReturnValueOnce(mockSupabase)
      mockSupabase.order.mockResolvedValueOnce({
        data: mockMissions,
        error: null,
      })

      const result = await repository.findByChapter(1)

      expect(result.data).toEqual(mockMissions)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith("mission")
      expect(mockSupabase.select).toHaveBeenCalledWith("*")
      expect(mockSupabase.eq).toHaveBeenCalledWith("chapter_id", 1)
    })

    it("should handle errors when finding missions by chapter", async () => {
      const mockError = {
        message: "Database error",
        code: "DB_ERROR",
        details: "Connection failed",
      }

      // Mock the chain for multiple order calls with error on final call
      mockSupabase.order.mockReturnValueOnce(mockSupabase)
      mockSupabase.order.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await repository.findByChapter(1)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe("findByHeroSlug", () => {
    it("should find missions by hero slug with proper sorting", async () => {
      const mockMissions = [
        { slug: "1-1", name: "Mission 1", chapter_id: 1, hero_slug: "astaroth", energy_cost: 6, level: 1 },
        { slug: "3-5", name: "Mission 3-5", chapter_id: 3, hero_slug: "astaroth", energy_cost: 8, level: 25 },
      ]

      // Mock the chain for multiple order calls - first order returns this, second resolves
      mockSupabase.order.mockReturnValueOnce(mockSupabase)
      mockSupabase.order.mockResolvedValueOnce({
        data: mockMissions,
        error: null,
      })

      const result = await repository.findByHeroSlug("astaroth")

      expect(result.data).toEqual(mockMissions)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith("mission")
      expect(mockSupabase.select).toHaveBeenCalledWith("*")
      expect(mockSupabase.eq).toHaveBeenCalledWith("hero_slug", "astaroth")
    })
  })

  describe("findWithChapter", () => {
    it("should find mission with chapter relationship", async () => {
      const mockMissionWithChapter = {
        slug: "1-1",
        name: "Mission 1",
        chapter_id: 1,
        hero_slug: "astaroth",
        energy_cost: 6,
        level: 1,
        chapter: {
          id: 1,
          title: "Chapter 1",
        },
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockMissionWithChapter,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findWithChapter("1-1")

      expect(result.data).toEqual(mockMissionWithChapter)
      expect(result.error).toBeNull()
    })
  })

  describe("findByCampaignSource", () => {
    it("should find missions by equipment campaign source", async () => {
      const mockEquipment = {
        slug: "sword-of-justice",
        campaign_sources: ["1-1", "1-2", "2-3"],
      }

      const mockMissions = [
        { slug: "1-1", name: "Mission 1", chapter_id: 1, hero_slug: "astaroth", energy_cost: 6, level: 1 },
        { slug: "1-2", name: "Mission 2", chapter_id: 1, hero_slug: "galahad", energy_cost: 6, level: 2 },
        { slug: "2-3", name: "Mission 3", chapter_id: 2, hero_slug: "keira", energy_cost: 7, level: 15 },
      ]

      // Mock the equipment query first
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      })

      // Then mock the mission query with multiple order calls
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockMissions,
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await repository.findByCampaignSource("sword-of-justice")

      expect(result.data).toEqual(mockMissions)
      expect(result.error).toBeNull()
    })

    it("should return empty array when equipment has no campaign sources", async () => {
      const mockEquipment = {
        slug: "crafted-item",
        campaign_sources: null,
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findByCampaignSource("crafted-item")

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })

    it("should handle errors when equipment is not found", async () => {
      const mockError = {
        message: "Equipment not found",
        code: "PGRST116",
        details: "No rows returned",
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      })

      const result = await repository.findByCampaignSource("non-existent-equipment")

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe("findAllChapters", () => {
    it("should find all chapters", async () => {
      const mockChapters = [
        { id: 1, title: "Chapter 1" },
        { id: 2, title: "Chapter 2" },
        { id: 3, title: "Chapter 3" },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockChapters,
            error: null,
          }),
        }),
      })

      const result = await repository.findAllChapters()

      expect(result.data).toEqual(mockChapters)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith("chapter")
    })

    it("should handle errors when finding chapters", async () => {
      const mockError = {
        message: "Database error",
        code: "DB_ERROR",
        details: "Connection failed",
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      })

      const result = await repository.findAllChapters()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe("findChapterById", () => {
    it("should find chapter by ID", async () => {
      const mockChapter = { id: 1, title: "Chapter 1" }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockChapter,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findChapterById(1)

      expect(result.data).toEqual(mockChapter)
      expect(result.error).toBeNull()
    })
  })

  describe("findChapterWithMissions", () => {
    it("should find chapter with missions", async () => {
      const mockChapterWithMissions = {
        id: 1,
        title: "Chapter 1",
        missions: [
          { slug: "1-1", name: "Mission 1", chapter_id: 1, hero_slug: "astaroth", energy_cost: 6, level: 1 },
          { slug: "1-2", name: "Mission 2", chapter_id: 1, hero_slug: "galahad", energy_cost: 6, level: 2 },
        ],
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockChapterWithMissions,
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await repository.findChapterWithMissions(1)

      expect(result.data).toEqual(mockChapterWithMissions)
      expect(result.error).toBeNull()
    })
  })

  describe("bulkCreateChapters", () => {
    it("should create multiple chapters successfully", async () => {
      const inputChapters = [
        { id: 1, title: "Chapter 1" },
        { id: 2, title: "Chapter 2" },
      ]

      const mockCreatedChapters = [
        { id: 1, title: "Chapter 1" },
        { id: 2, title: "Chapter 2" },
      ]

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn()
              .mockResolvedValueOnce({
                data: mockCreatedChapters[0],
                error: null,
              })
              .mockResolvedValueOnce({
                data: mockCreatedChapters[1],
                error: null,
              }),
          }),
        }),
      })

      const result = await repository.bulkCreateChapters(inputChapters)

      expect(result.data).toEqual(mockCreatedChapters)
      expect(result.error).toBeNull()
    })

    it("should handle validation errors in bulk create", async () => {
      const inputChapters = [
        { id: 1, title: "Chapter 1" },
        { id: -1, title: "" }, // Invalid data
      ]

      // Mock successful creation for the first item
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1, title: "Chapter 1" },
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.bulkCreateChapters(inputChapters)

      expect(result.data).toHaveLength(1) // Only valid chapter created
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe("BULK_PARTIAL_FAILURE")
    })
  })

  describe("bulkCreateMissions", () => {
    it("should create multiple missions successfully", async () => {
      const inputMissions = [
        { slug: "1-1", name: "Mission 1", chapter_id: 1, hero_slug: "astaroth", energy_cost: 6, level: 1 },
        { slug: "1-2", name: "Mission 2", chapter_id: 1, hero_slug: "galahad", energy_cost: 6, level: 2 },
      ]

      const mockCreatedMissions = [
        { slug: "1-1", name: "Mission 1", chapter_id: 1, hero_slug: "astaroth", energy_cost: 6, level: 1 },
        { slug: "1-2", name: "Mission 2", chapter_id: 1, hero_slug: "galahad", energy_cost: 6, level: 2 },
      ]

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn()
              .mockResolvedValueOnce({
                data: mockCreatedMissions[0],
                error: null,
              })
              .mockResolvedValueOnce({
                data: mockCreatedMissions[1],
                error: null,
              }),
          }),
        }),
      })

      const result = await repository.bulkCreateMissions(inputMissions)

      expect(result.data).toEqual(mockCreatedMissions)
      expect(result.error).toBeNull()
    })
  })

  describe("purgeMissionDomain", () => {
    it("should purge both missions and chapters successfully", async () => {
      // Mock mission delete with count
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        }),
      })

      // Mock chapter delete with count
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            count: 3,
            error: null,
          }),
        }),
      })

      const result = await repository.purgeMissionDomain()

      expect(result.data).toEqual({
        missions: 5,
        chapters: 3,
      })
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith("mission")
      expect(mockSupabase.from).toHaveBeenCalledWith("chapter")
    })

    it("should handle mission delete errors", async () => {
      const mockError = {
        message: "Mission delete failed",
        code: "DELETE_ERROR",
        details: "Database constraint violation",
      }

      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      })

      const result = await repository.purgeMissionDomain()

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: "Failed to purge missions: Mission delete failed",
        code: "DELETE_ERROR",
        details: "Database constraint violation",
      })
    })

    it("should handle chapter delete errors", async () => {
      const mockMissionDeleteResult = Array(5).fill({ slug: "mission-1" })
      const mockChapterError = {
        message: "Chapter delete failed",
        code: "DELETE_ERROR",
        details: "Database constraint violation",
      }

      // Mock successful mission delete
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: mockMissionDeleteResult,
            error: null,
          }),
        }),
      })

      // Mock failed chapter delete
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: null,
            error: mockChapterError,
          }),
        }),
      })

      const result = await repository.purgeMissionDomain()

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: "Failed to purge chapters: Chapter delete failed",
        code: "DELETE_ERROR",
        details: "Database constraint violation",
      })
    })

    it("should handle unexpected errors during purge", async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error("Unexpected database error")
      })

      const result = await repository.purgeMissionDomain()

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe("Unexpected database error")
    })

    it("should handle empty delete results", async () => {
      // Mock empty delete results with count 0
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        }),
      })

      const result = await repository.purgeMissionDomain()

      expect(result.data).toEqual({
        missions: 0,
        chapters: 0,
      })
      expect(result.error).toBeNull()
    })
  })

  describe('bulkCreateChapters with skipExisting', () => {
    it('should skip existing chapters and create new ones', async () => {
      const inputChapters = [
        { id: 1, title: 'Existing Chapter' },
        { id: 2, title: 'New Chapter' },
      ]

      const existingChapter = { id: 1, title: 'Existing Chapter' }
      const newChapter = { id: 2, title: 'New Chapter' }

      // Mock findChapterById for first chapter (exists)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: existingChapter,
              error: null,
            }),
          }),
        }),
      })

      // Mock findChapterById for second chapter (doesn't exist)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found', code: 'PGRST116' },
            }),
          }),
        }),
      })

      // Mock insert for new chapter
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: newChapter,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.bulkCreateChapters(inputChapters, { skipExisting: true })

      expect(result.data).toEqual([newChapter])
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('BULK_PARTIAL_SUCCESS')
      expect((result.error?.details as any)?.skipped).toEqual([existingChapter])
    })
  })

  describe('bulkCreateMissions with skipExisting', () => {
    it('should pass skipExisting option to base bulkCreate', async () => {
      const inputMissions = [
        { slug: '1-1', name: 'Mission 1', chapter_id: 1, hero_slug: 'astaroth', energy_cost: 6, level: 1 },
      ]

      const bulkCreateSpy = vi.spyOn(repository, 'bulkCreate')
      bulkCreateSpy.mockResolvedValueOnce({
        data: inputMissions,
        error: null,
      })

      await repository.bulkCreateMissions(inputMissions, { skipExisting: true })

      expect(bulkCreateSpy).toHaveBeenCalledWith(inputMissions, { skipExisting: true })
    })
  })
})