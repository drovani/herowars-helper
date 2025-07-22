import log from "loglevel";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockChapter,
  createMockChapterList,
  createMockEquipment,
  createMockMission,
} from "~/__tests__/mocks/msw/factories";
import { resetStores, server, setChapterStore, setEquipmentStore, setMissionStore } from "~/__tests__/mocks/msw/server";
import { MissionRepository } from "../MissionRepository";

describe("MissionRepository", () => {
  let repository: MissionRepository;
  let capturedLogs: Array<{ level: string; message: string; args: any[] }> = [];
  let originalMethodFactory: any;

  beforeEach(() => {
    // Reset MSW stores for clean tests
    resetStores();

    // Capture logs to in-memory array instead of console
    capturedLogs = [];
    originalMethodFactory = log.methodFactory;
    log.methodFactory = function (methodName, _logLevel, _loggerName) {
      return function (message, ...args) {
        capturedLogs.push({ level: methodName, message, args });
        // Silent - don't output to console
      };
    };
    log.rebuild();

    repository = new MissionRepository();
  });

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("constructor", () => {
    it("should initialize with correct table name and schema", () => {
      expect((repository as any).tableName).toBe("mission");
      expect((repository as any).primaryKeyColumn).toBe("slug");
      expect((repository as any).schema).toBeDefined();
    });

    it("should define chapter relationship", () => {
      const relationships = (repository as any).getTableRelationships();
      expect(relationships).toEqual({
        chapter: true,
      });
    });
  });

  describe("findByChapter", () => {
    it("should find missions by chapter ID with proper sorting", async () => {
      const mockMissions = [
        createMockMission({
          slug: "1-1",
          name: "Mission 1",
          chapter_id: 1,
          hero_slug: "astaroth",
          energy_cost: 6,
          level: 1,
        }),
        createMockMission({
          slug: "1-2",
          name: "Mission 2",
          chapter_id: 1,
          hero_slug: "galahad",
          energy_cost: 6,
          level: 2,
        }),
      ];
      setMissionStore(mockMissions);

      // Add handler to validate the query parameters
      server.use(
        http.get("*/rest/v1/mission", ({ request }) => {
          const url = new URL(request.url);
          const chapterFilter = url.searchParams.get("chapter_id");
          expect(chapterFilter).toBe("eq.1");

          const orderParams = url.searchParams.getAll("order");
          // Supabase combines multiple orders into a single comma-separated parameter
          expect(orderParams).toContain("chapter_id.asc,level.asc");

          return HttpResponse.json(mockMissions);
        })
      );

      const result = await repository.findByChapter(1);

      expect(result.data).toEqual(mockMissions);
      expect(result.error).toBeNull();
    });

    it("should handle errors when finding missions by chapter", async () => {
      server.use(
        http.get("*/rest/v1/mission", () => {
          return HttpResponse.json(
            {
              message: "Database error",
              code: "DB_ERROR",
              details: "Connection failed",
            },
            { status: 500 }
          );
        })
      );

      const result = await repository.findByChapter(1);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Database error",
        code: "DB_ERROR",
        details: "Connection failed",
      });
    });
  });

  describe("findByHeroSlug", () => {
    it("should find missions by hero slug with proper sorting", async () => {
      const mockMissions = [
        createMockMission({
          slug: "1-1",
          name: "Mission 1",
          chapter_id: 1,
          hero_slug: "astaroth",
          energy_cost: 6,
          level: 1,
        }),
        createMockMission({
          slug: "3-5",
          name: "Mission 3-5",
          chapter_id: 3,
          hero_slug: "astaroth",
          energy_cost: 8,
          level: 25,
        }),
      ];
      setMissionStore(mockMissions);

      // Add handler to validate the query parameters
      server.use(
        http.get("*/rest/v1/mission", ({ request }) => {
          const url = new URL(request.url);
          const heroFilter = url.searchParams.get("hero_slug");
          expect(heroFilter).toBe("eq.astaroth");

          const orderParams = url.searchParams.getAll("order");
          // Supabase combines multiple orders into a single comma-separated parameter
          expect(orderParams).toContain("chapter_id.asc,level.asc");

          return HttpResponse.json(mockMissions);
        })
      );

      const result = await repository.findByHeroSlug("astaroth");

      expect(result.data).toEqual(mockMissions);
      expect(result.error).toBeNull();
    });
  });

  describe("findWithChapter", () => {
    it("should find mission with chapter relationship", async () => {
      const mockChapter = createMockChapter({ id: 1, title: "Chapter 1" });
      const mockMission = createMockMission({
        slug: "1-1",
        name: "Mission 1",
        chapter_id: 1,
        hero_slug: "astaroth",
        energy_cost: 6,
        level: 1,
      });

      setChapterStore([mockChapter]);

      server.use(
        http.get("*/rest/v1/mission", ({ request }) => {
          const url = new URL(request.url);
          const select = url.searchParams.get("select");
          const slugFilter = url.searchParams.get("slug");

          expect(select).toContain("chapter(*)");
          expect(slugFilter).toBe("eq.1-1");

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          // Return mission with chapter relationship
          const missionWithChapter = { ...mockMission, chapter: mockChapter };
          return HttpResponse.json(missionWithChapter);
        })
      );

      const result = await repository.findWithChapter("1-1");

      expect(result.data).toEqual({ ...mockMission, chapter: mockChapter });
      expect(result.error).toBeNull();
    });
  });

  describe("findByCampaignSource", () => {
    it("should find missions by equipment campaign source", async () => {
      const mockEquipment = createMockEquipment({
        slug: "sword-of-justice",
        campaign_sources: ["1-1", "1-2", "2-3"],
      });

      const mockMissions = [
        createMockMission({
          slug: "1-1",
          name: "Mission 1",
          chapter_id: 1,
          hero_slug: "astaroth",
          energy_cost: 6,
          level: 1,
        }),
        createMockMission({
          slug: "1-2",
          name: "Mission 2",
          chapter_id: 1,
          hero_slug: "galahad",
          energy_cost: 6,
          level: 2,
        }),
        createMockMission({
          slug: "2-3",
          name: "Mission 3",
          chapter_id: 2,
          hero_slug: "keira",
          energy_cost: 7,
          level: 15,
        }),
      ];

      setEquipmentStore([mockEquipment]);
      setMissionStore(mockMissions);

      let equipmentCalled = false;
      let missionCalled = false;

      server.use(
        // Equipment query first
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("eq.sword-of-justice");

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          equipmentCalled = true;
          return HttpResponse.json(mockEquipment);
        }),
        // Mission query with IN filter
        http.get("*/rest/v1/mission", ({ request }) => {
          // Skip the equipment call
          if (!equipmentCalled) return;

          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("in.(1-1,1-2,2-3)");

          const orderParams = url.searchParams.getAll("order");
          // Supabase combines multiple orders into a single comma-separated parameter
          expect(orderParams).toContain("chapter_id.asc,level.asc");

          missionCalled = true;
          return HttpResponse.json(mockMissions);
        })
      );

      const result = await repository.findByCampaignSource("sword-of-justice");

      expect(result.data).toEqual(mockMissions);
      expect(result.error).toBeNull();
      expect(equipmentCalled).toBe(true);
      expect(missionCalled).toBe(true);
    });

    it("should return empty array when equipment has no campaign sources", async () => {
      const mockEquipment = createMockEquipment({
        slug: "crafted-item",
        campaign_sources: null,
      });

      setEquipmentStore([mockEquipment]);

      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("eq.crafted-item");

          return HttpResponse.json(mockEquipment);
        })
      );

      const result = await repository.findByCampaignSource("crafted-item");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should handle errors when equipment is not found", async () => {
      server.use(
        http.get("*/rest/v1/equipment", () => {
          return HttpResponse.json(
            {
              message: "Equipment not found",
              code: "PGRST116",
              details: "No rows returned",
            },
            { status: 404 }
          );
        })
      );

      const result = await repository.findByCampaignSource("non-existent-equipment");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Equipment not found",
        code: "PGRST116",
        details: "No rows returned",
      });
    });
  });

  describe("findAllChapters", () => {
    it("should find all chapters", async () => {
      const mockChapters = createMockChapterList(3);
      setChapterStore(mockChapters);

      server.use(
        http.get("*/rest/v1/chapter", ({ request }) => {
          const url = new URL(request.url);
          const order = url.searchParams.get("order");
          expect(order).toBe("id.asc");

          return HttpResponse.json(mockChapters);
        })
      );

      const result = await repository.findAllChapters();

      expect(result.data).toEqual(mockChapters);
      expect(result.error).toBeNull();
    });

    it("should handle errors when finding chapters", async () => {
      server.use(
        http.get("*/rest/v1/chapter", () => {
          return HttpResponse.json(
            {
              message: "Database error",
              code: "DB_ERROR",
              details: "Connection failed",
            },
            { status: 500 }
          );
        })
      );

      const result = await repository.findAllChapters();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Database error",
        code: "DB_ERROR",
        details: "Connection failed",
      });
    });
  });

  describe("findChapterById", () => {
    it("should find chapter by ID", async () => {
      const mockChapter = createMockChapter({ id: 1, title: "Chapter 1" });
      setChapterStore([mockChapter]);

      server.use(
        http.get("*/rest/v1/chapter", ({ request }) => {
          const url = new URL(request.url);
          const idFilter = url.searchParams.get("id");
          expect(idFilter).toBe("eq.1");

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          return HttpResponse.json(mockChapter);
        })
      );

      const result = await repository.findChapterById(1);

      expect(result.data).toEqual(mockChapter);
      expect(result.error).toBeNull();
    });
  });

  describe("findChapterWithMissions", () => {
    it("should find chapter with missions", async () => {
      const mockChapter = createMockChapter({ id: 1, title: "Chapter 1" });
      const mockMissions = [
        createMockMission({
          slug: "1-1",
          name: "Mission 1",
          chapter_id: 1,
          hero_slug: "astaroth",
          energy_cost: 6,
          level: 1,
        }),
        createMockMission({
          slug: "1-2",
          name: "Mission 2",
          chapter_id: 1,
          hero_slug: "galahad",
          energy_cost: 6,
          level: 2,
        }),
      ];

      setChapterStore([mockChapter]);
      setMissionStore(mockMissions);

      server.use(
        http.get("*/rest/v1/chapter", ({ request }) => {
          const url = new URL(request.url);
          const select = url.searchParams.get("select");
          const idFilter = url.searchParams.get("id");
          const order = url.searchParams.get("order");

          expect(select).toContain("mission(*)");
          expect(idFilter).toBe("eq.1");
          expect(order).toBe("missions.level.asc");

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          // Return chapter with missions relationship
          const chapterWithMissions = { ...mockChapter, missions: mockMissions };
          return HttpResponse.json(chapterWithMissions);
        })
      );

      const result = await repository.findChapterWithMissions(1);

      expect(result.data).toEqual({ ...mockChapter, missions: mockMissions });
      expect(result.error).toBeNull();
    });
  });

  describe("bulkCreateChapters", () => {
    it("should create multiple chapters successfully", async () => {
      const inputChapters = [
        { id: 1, title: "Chapter 1" },
        { id: 2, title: "Chapter 2" },
      ];

      const mockCreatedChapters = inputChapters.map((c) => createMockChapter(c));

      let callCount = 0;
      server.use(
        http.post("*/rest/v1/chapter", async ({ request }) => {
          const body = (await request.json()) as any;
          const expectedChapter = inputChapters[callCount];
          expect(body).toEqual(expectedChapter);

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          const responseChapter = mockCreatedChapters[callCount];
          callCount++;
          return HttpResponse.json(responseChapter, { status: 201 });
        })
      );

      const result = await repository.bulkCreateChapters(inputChapters);

      expect(result.data).toEqual(mockCreatedChapters);
      expect(result.error).toBeNull();
    });

    it("should handle validation errors in bulk create", async () => {
      const inputChapters = [
        { id: 1, title: "Chapter 1" },
        { id: -1, title: "" }, // Invalid data
      ];

      let callCount = 0;
      server.use(
        http.post("*/rest/v1/chapter", async ({ request }) => {
          const body = (await request.json()) as any;
          const expectedChapter = inputChapters[callCount];
          expect(body).toEqual(expectedChapter);

          callCount++;

          if (callCount === 1) {
            // First chapter succeeds
            return HttpResponse.json(createMockChapter(expectedChapter), { status: 201 });
          } else {
            // Second chapter fails validation (handled by repository validation)
            return HttpResponse.json({ message: "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
          }
        })
      );

      const result = await repository.bulkCreateChapters(inputChapters);

      expect(result.data).toHaveLength(1); // Only valid chapter created
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("BULK_PARTIAL_FAILURE");
    });
  });

  describe("bulkCreateMissions", () => {
    it("should create multiple missions successfully", async () => {
      const inputMissions = [
        {
          slug: "1-1",
          name: "Mission 1",
          chapter_id: 1,
          hero_slug: "astaroth",
          energy_cost: 6,
          level: 1,
        },
        {
          slug: "1-2",
          name: "Mission 2",
          chapter_id: 1,
          hero_slug: "galahad",
          energy_cost: 6,
          level: 2,
        },
      ];

      const mockCreatedMissions = inputMissions.map((m) => createMockMission(m));

      server.use(
        http.post("*/rest/v1/mission", async ({ request }) => {
          const body = (await request.json()) as any;
          // Just validate that the body is one of the expected missions
          expect(inputMissions).toContainEqual(body);

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          // Return the created mission based on the request body
          const responseMission = createMockMission(body);
          return HttpResponse.json(responseMission, { status: 201 });
        })
      );

      const result = await repository.bulkCreateMissions(inputMissions);

      expect(result.data).toEqual(mockCreatedMissions);
      expect(result.error).toBeNull();
    });
  });

  describe("purgeMissionDomain", () => {
    it("should purge both missions and chapters successfully", async () => {
      let missionDeleteCalled = false;
      let chapterDeleteCalled = false;

      server.use(
        // Mission delete
        http.delete("*/rest/v1/mission", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("gte.");

          missionDeleteCalled = true;
          return HttpResponse.json(null, {
            status: 204,
            headers: { "Content-Range": "*/5" },
          });
        }),
        // Chapter delete
        http.delete("*/rest/v1/chapter", ({ request }) => {
          const url = new URL(request.url);
          const idFilter = url.searchParams.get("id");
          expect(idFilter).toBe("gte.0");

          chapterDeleteCalled = true;
          return HttpResponse.json(null, {
            status: 204,
            headers: { "Content-Range": "*/3" },
          });
        })
      );

      const result = await repository.purgeMissionDomain();

      expect(result.data).toEqual({
        missions: 5,
        chapters: 3,
      });
      expect(result.error).toBeNull();
      expect(missionDeleteCalled).toBe(true);
      expect(chapterDeleteCalled).toBe(true);
    });

    it("should handle mission delete errors", async () => {
      server.use(
        http.delete("*/rest/v1/mission", () => {
          return HttpResponse.json(
            {
              message: "Mission delete failed",
              code: "DELETE_ERROR",
              details: "Database constraint violation",
            },
            { status: 500 }
          );
        })
      );

      const result = await repository.purgeMissionDomain();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Failed to purge missions: Mission delete failed",
        code: "DELETE_ERROR",
        details: "Database constraint violation",
      });
    });

    it("should handle chapter delete errors", async () => {
      let missionDeleteCalled = false;

      server.use(
        // Successful mission delete
        http.delete("*/rest/v1/mission", () => {
          missionDeleteCalled = true;
          return HttpResponse.json(null, {
            status: 204,
            headers: { "Content-Range": "*/5" },
          });
        }),
        // Failed chapter delete
        http.delete("*/rest/v1/chapter", () => {
          return HttpResponse.json(
            {
              message: "Chapter delete failed",
              code: "DELETE_ERROR",
              details: "Database constraint violation",
            },
            { status: 500 }
          );
        })
      );

      const result = await repository.purgeMissionDomain();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Failed to purge chapters: Chapter delete failed",
        code: "DELETE_ERROR",
        details: "Database constraint violation",
      });
      expect(missionDeleteCalled).toBe(true);
    });

    it("should handle unexpected errors during purge", async () => {
      // Force an unexpected error by having the handler throw
      server.use(
        http.delete("*/rest/v1/mission", () => {
          throw new Error("Unexpected database error");
        })
      );

      const result = await repository.purgeMissionDomain();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Failed to purge missions: Unexpected database error");
    });

    it("should handle empty delete results", async () => {
      server.use(
        http.delete("*/rest/v1/mission", () => {
          return HttpResponse.json(null, {
            status: 204,
            headers: { "Content-Range": "*/0" },
          });
        }),
        http.delete("*/rest/v1/chapter", () => {
          return HttpResponse.json(null, {
            status: 204,
            headers: { "Content-Range": "*/0" },
          });
        })
      );

      const result = await repository.purgeMissionDomain();

      expect(result.data).toEqual({
        missions: 0,
        chapters: 0,
      });
      expect(result.error).toBeNull();
    });
  });

  describe("bulkCreateChapters with skipExisting", () => {
    it("should skip existing chapters and create new ones", async () => {
      const inputChapters = [
        { id: 1, title: "Existing Chapter" },
        { id: 2, title: "New Chapter" },
      ];

      const existingChapter = createMockChapter({ id: 1, title: "Existing Chapter" });
      const newChapter = createMockChapter({ id: 2, title: "New Chapter" });

      let findCallCount = 0;
      server.use(
        // Mock findChapterById calls
        http.get("*/rest/v1/chapter", ({ request }) => {
          const url = new URL(request.url);
          const idFilter = url.searchParams.get("id");
          const acceptHeader = request.headers.get("Accept");

          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          findCallCount++;

          if (idFilter === "eq.1") {
            // First chapter exists
            return HttpResponse.json(existingChapter);
          } else if (idFilter === "eq.2") {
            // Second chapter doesn't exist
            return HttpResponse.json({ message: "Not found", code: "PGRST116" }, { status: 404 });
          }

          return HttpResponse.json(null, { status: 404 });
        }),
        // Mock insert for new chapter
        http.post("*/rest/v1/chapter", async ({ request }) => {
          const body = (await request.json()) as any;
          expect(body).toEqual({ id: 2, title: "New Chapter" });

          return HttpResponse.json(newChapter, { status: 201 });
        })
      );

      const result = await repository.bulkCreateChapters(inputChapters, {
        skipExisting: true,
      });

      expect(result.data).toEqual([newChapter]);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("BULK_PARTIAL_SUCCESS");
      expect((result.error?.details as any)?.skipped).toEqual([existingChapter]);
      expect(findCallCount).toBe(2);
    });
  });

  describe("bulkCreateMissions with skipExisting", () => {
    it("should pass skipExisting option to base bulkCreate", async () => {
      const inputMissions = [
        {
          slug: "1-1",
          name: "Mission 1",
          chapter_id: 1,
          hero_slug: "astaroth",
          energy_cost: 6,
          level: 1,
        },
      ];

      const bulkCreateSpy = vi.spyOn(repository, "bulkCreate");
      bulkCreateSpy.mockResolvedValueOnce({
        data: inputMissions.map((m) => createMockMission(m)),
        error: null,
      });

      await repository.bulkCreateMissions(inputMissions, {
        skipExisting: true,
      });

      expect(bulkCreateSpy).toHaveBeenCalledWith(inputMissions, {
        skipExisting: true,
      });
    });
  });
});
