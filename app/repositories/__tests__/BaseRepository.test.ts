import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { z } from "zod";
import log from "loglevel";
import { BaseRepository } from "../BaseRepository";
import type { CreateInput, UpdateInput } from "../types";
import {
  server,
  resetStores,
  setEquipmentStore,
} from "~/__tests__/mocks/msw/server";
import {
  createMockEquipment,
  createMockEquipmentList,
} from "~/__tests__/mocks/msw/factories";
import { http, HttpResponse } from "msw";

const mockEquipmentSchema = z.object({
  name: z.string(),
  slug: z.string(),
  quality: z.enum(["gray", "green", "blue", "violet", "orange"]),
  type: z.enum(["equipable", "fragment", "recipe"]),
  sell_value: z.number(),
  guild_activity_points: z.number(),
  buy_value_coin: z.number().nullable().optional(),
  buy_value_gold: z.number().nullable().optional(),
  campaign_sources: z.array(z.string()).nullable().optional(),
  crafting_gold_cost: z.number().nullable().optional(),
  hero_level_required: z.number().nullable().optional(),
});

class TestEquipmentRepository extends BaseRepository<"equipment"> {
  constructor(request: Request | null = null) {
    super("equipment", mockEquipmentSchema, request, "slug");
  }
}

describe("BaseRepository", () => {
  let repository: TestEquipmentRepository;
  let capturedLogs: Array<{ level: string; message: string; args: any[] }> = [];
  let originalMethodFactory: any;

  beforeEach(() => {
    // Reset MSW store for clean tests
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

    repository = new TestEquipmentRepository();
  });

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("findAll", () => {
    it("should find all records successfully", async () => {
      const mockData = createMockEquipmentList(2, {
        quality: "green",
        type: "equipable",
      });
      setEquipmentStore(mockData);

      const result = await repository.findAll();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      // Override handler to return error
      server.use(
        http.get("*/rest/v1/equipment", () => {
          return HttpResponse.json(
            {
              code: "CONNECTION_ERROR",
              message: "Database connection failed",
              details: "Connection timeout",
            },
            { status: 500 }
          );
        })
      );

      const result = await repository.findAll();

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Database connection failed",
        code: "CONNECTION_ERROR",
        details: "Connection timeout",
      });
    });

    it("should apply where conditions", async () => {
      const mockData = createMockEquipmentList(1, {
        quality: "green",
        slug: "green-equipment",
      });
      setEquipmentStore(mockData);

      // Add handler to validate the filter query param
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const qualityFilter = url.searchParams.get("quality");
          expect(qualityFilter).toBe("eq.green");

          return HttpResponse.json(mockData);
        })
      );

      const result = await repository.findAll({ where: { quality: "green" } });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it("should apply ordering", async () => {
      const mockData = createMockEquipmentList(2);
      setEquipmentStore(mockData);

      // Add handler to validate the order query param
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const orderParam = url.searchParams.get("order");
          expect(orderParam).toBe("name.asc");

          return HttpResponse.json(mockData);
        })
      );

      const result = await repository.findAll({
        orderBy: { column: "name", ascending: true },
      });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it("should apply multiple ordering criteria", async () => {
      const mockData = createMockEquipmentList(2);
      setEquipmentStore(mockData);

      // Add handler to validate multiple order params
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const orderParams = url.searchParams.getAll("order");
          // Supabase combines multiple orders into a single comma-separated parameter
          expect(orderParams).toContain("quality.asc,name.desc");

          return HttpResponse.json(mockData);
        })
      );

      const result = await repository.findAll({
        orderBy: [
          { column: "quality", ascending: true },
          { column: "name", ascending: false },
        ],
      });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it("should apply limit", async () => {
      const mockData = createMockEquipmentList(1);
      setEquipmentStore(mockData);

      // Add handler to validate the limit query param
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const limitParam = url.searchParams.get("limit");
          expect(limitParam).toBe("10");

          return HttpResponse.json(mockData);
        })
      );

      const result = await repository.findAll({ limit: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find record by id successfully", async () => {
      const mockData = createMockEquipment({
        slug: "test-equipment",
        name: "Test Equipment",
      });

      // Handler will return single record when slug filter is applied
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("eq.test-equipment");

          // Check for single object request
          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          return HttpResponse.json(mockData);
        })
      );

      const result = await repository.findById("test-equipment");

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it("should handle not found errors", async () => {
      server.use(
        http.get("*/rest/v1/equipment", () => {
          return HttpResponse.json(
            {
              code: "PGRST116",
              message: "Record not found",
              details: "No rows found",
            },
            { status: 404 }
          );
        })
      );

      const result = await repository.findById("nonexistent");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Record not found",
        code: "PGRST116",
        details: "No rows found",
      });
    });
  });

  describe("create", () => {
    it("should create record successfully", async () => {
      const inputData: CreateInput<"equipment"> = {
        name: "New Equipment",
        slug: "new-equipment",
        quality: "green",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      };

      const mockCreatedData = createMockEquipment(inputData);

      server.use(
        http.post("*/rest/v1/equipment", async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(inputData);

          const acceptHeader = request.headers.get("Accept");
          expect(acceptHeader).toContain("application/vnd.pgrst.object+json");

          return HttpResponse.json(mockCreatedData, { status: 201 });
        })
      );

      const result = await repository.create(inputData);

      expect(result.data).toEqual(mockCreatedData);
      expect(result.error).toBeNull();
    });

    it("should handle validation errors", async () => {
      const invalidData = {
        name: "Invalid Equipment",
        slug: "invalid-equipment",
        quality: "invalid-quality",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      } as unknown as CreateInput<"equipment">;

      const result = await repository.create(invalidData);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Validation failed");
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("should handle database insert errors", async () => {
      const inputData: CreateInput<"equipment"> = {
        name: "New Equipment",
        slug: "new-equipment",
        quality: "green",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      };

      server.use(
        http.post("*/rest/v1/equipment", () => {
          return HttpResponse.json(
            {
              code: "23505",
              message: "Unique constraint violation",
              details: "Key (slug)=(new-equipment) already exists",
            },
            { status: 409 }
          );
        })
      );

      const result = await repository.create(inputData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Unique constraint violation",
        code: "CONSTRAINT_VIOLATION",
        details: "Unique constraint violation",
      });
    });
  });

  describe("create with skipExisting", () => {
    it("should skip existing record when skipExisting is true", async () => {
      const inputData: CreateInput<"equipment"> = {
        name: "Existing Equipment",
        slug: "existing-equipment",
        quality: "green",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      };

      const existingData = createMockEquipment(inputData);

      // Mock findById to return existing record
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");

          if (slugFilter === "eq.existing-equipment") {
            return HttpResponse.json(existingData);
          }

          return HttpResponse.json([]);
        })
      );

      const result = await repository.create(inputData, { skipExisting: true });

      expect(result.data).toEqual(existingData);
      expect(result.error).toBeNull();
      expect(result.skipped).toBe(true);
    });

    it("should create new record when skipExisting is true but record does not exist", async () => {
      const inputData: CreateInput<"equipment"> = {
        name: "New Equipment",
        slug: "new-equipment",
        quality: "green",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      };

      const createdData = createMockEquipment(inputData);

      // Mock findById to return no record, then successful create
      server.use(
        http.get("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");

          if (slugFilter === "eq.new-equipment") {
            return HttpResponse.json(
              { code: "PGRST116", message: "Not found" },
              { status: 404 }
            );
          }

          return HttpResponse.json([]);
        }),
        http.post("*/rest/v1/equipment", () => {
          return HttpResponse.json(createdData, { status: 201 });
        })
      );

      const result = await repository.create(inputData, { skipExisting: true });

      expect(result.data).toEqual(createdData);
      expect(result.error).toBeNull();
      expect(result.skipped).toBe(false);
    });
  });

  describe("update", () => {
    it("should update record successfully", async () => {
      const updateData: UpdateInput<"equipment"> = {
        name: "Updated Equipment",
        sell_value: 150,
      };

      const mockUpdatedData = createMockEquipment({
        slug: "test-equipment",
        name: "Updated Equipment",
        sell_value: 150,
      });

      server.use(
        http.patch("*/rest/v1/equipment", async ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("eq.test-equipment");

          const body = await request.json();
          expect(body).toEqual(updateData);

          return HttpResponse.json(mockUpdatedData);
        })
      );

      const result = await repository.update("test-equipment", updateData);

      expect(result.data).toEqual(mockUpdatedData);
      expect(result.error).toBeNull();
    });

    it("should handle validation errors for updates", async () => {
      const invalidUpdateData = {
        quality: "invalid-quality",
      } as unknown as UpdateInput<"equipment">;

      const result = await repository.update(
        "test-equipment",
        invalidUpdateData
      );

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Validation failed");
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("delete", () => {
    it("should delete record successfully", async () => {
      server.use(
        http.delete("*/rest/v1/equipment", ({ request }) => {
          const url = new URL(request.url);
          const slugFilter = url.searchParams.get("slug");
          expect(slugFilter).toBe("eq.test-equipment");

          return HttpResponse.json(null, { status: 204 });
        })
      );

      const result = await repository.delete("test-equipment");

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should handle delete errors", async () => {
      server.use(
        http.delete("*/rest/v1/equipment", () => {
          return HttpResponse.json(
            {
              code: "PGRST116",
              message: "Record not found",
              details: "No rows found",
            },
            { status: 404 }
          );
        })
      );

      const result = await repository.delete("nonexistent");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Not found",
        code: "NOT_FOUND",
        details: "Record not found",
      });
    });
  });

  describe("bulkCreate", () => {
    it("should handle bulk create successfully", async () => {
      const inputData: CreateInput<"equipment">[] = [
        {
          name: "Equipment 1",
          slug: "equipment-1",
          quality: "green",
          type: "equipable",
          sell_value: 100,
          guild_activity_points: 5,
        },
      ];

      const mockCreatedData = createMockEquipment(inputData[0]);

      server.use(
        http.post("*/rest/v1/equipment", () => {
          return HttpResponse.json(mockCreatedData, { status: 201 });
        })
      );

      const result = await repository.bulkCreate(inputData);

      expect(result.data).toEqual([mockCreatedData]);
      expect(result.error).toBeNull();
    });

    it("should call onProgress callback during bulk operations", async () => {
      const inputData: CreateInput<"equipment">[] = [
        {
          name: "Equipment 1",
          slug: "equipment-1",
          quality: "green",
          type: "equipable",
          sell_value: 100,
          guild_activity_points: 5,
        },
      ];

      const mockCreatedData = createMockEquipment(inputData[0]);

      server.use(
        http.post("*/rest/v1/equipment", () => {
          return HttpResponse.json(mockCreatedData, { status: 201 });
        })
      );

      const progressCallback = vi.fn();
      const result = await repository.bulkCreate(inputData, {
        onProgress: progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledWith(1, 1);
      expect(result.data).toEqual([mockCreatedData]);
      expect(result.error).toBeNull();
    });
  });

  describe("upsert", () => {
    it("should upsert record successfully", async () => {
      const inputData: CreateInput<"equipment"> = {
        name: "Test Equipment",
        slug: "test-equipment",
        quality: "green",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      };

      const mockUpsertedData = createMockEquipment(inputData);

      server.use(
        http.post("*/rest/v1/equipment", async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(inputData);

          return HttpResponse.json(mockUpsertedData, { status: 201 });
        })
      );

      const result = await repository.upsert(inputData);

      expect(result.data).toEqual(mockUpsertedData);
      expect(result.error).toBeNull();
    });

    it("should handle upsert validation errors", async () => {
      const invalidData = {
        name: "Test Equipment",
        slug: "test-equipment",
        quality: "invalid-quality",
        type: "equipable",
        sell_value: 100,
        guild_activity_points: 5,
      } as unknown as CreateInput<"equipment">;

      const result = await repository.upsert(invalidData);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Validation failed");
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("protected methods", () => {
    it("should build basic select clause", () => {
      expect((repository as any).buildSelectClause()).toBe("*");
    });

    it("should build select clause with includes", () => {
      // Override getTableRelationships for this test
      (repository as any).getTableRelationships = vi.fn().mockReturnValue({
        equipment_stats: true,
        required_items: true,
      });

      const include = {
        equipment_stats: true,
        required_items: true,
      };
      const result = (repository as any).buildSelectClause(include);
      expect(result).toContain("equipment_stats(*)");
      expect(result).toContain("required_items(*)");
    });
  });

  describe("log capturing", () => {
    it("should capture error logs instead of outputting to console", async () => {
      // Simulate a database error that would trigger log.error
      server.use(
        http.get("*/rest/v1/equipment", () => {
          return HttpResponse.json(
            {
              code: "CONNECTION_ERROR",
              message: "Database connection failed",
              details: "Connection timeout",
            },
            { status: 500 }
          );
        })
      );

      await repository.findAll();

      // Verify that the error was captured in our log array
      expect(capturedLogs).toHaveLength(1);
      expect(capturedLogs[0].level).toBe("error");
      expect(capturedLogs[0].message).toContain("Error finding all equipment");
    });
  });
});
