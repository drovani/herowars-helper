// ABOUTME: Tests for EquipmentRepository class with mocked Supabase client
// ABOUTME: Tests CRUD operations, relationships, bulk operations, and data transformation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import log from "loglevel";
import type { EquipmentRecord } from "~/data/equipment.zod";
import type { Database } from "~/types/supabase";
import { createMockSupabaseClient } from "../../__tests__/mocks/supabase";
import { EquipmentRepository } from "../EquipmentRepository";

describe("EquipmentRepository", () => {
  let repository: EquipmentRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let capturedLogs: Array<{level: string, message: string, args: any[]}> = [];
  let originalMethodFactory: any;

  beforeEach(() => {
    // Capture logs to in-memory array instead of console
    capturedLogs = [];
    originalMethodFactory = log.methodFactory;
    log.methodFactory = function(methodName, _logLevel, _loggerName) {
      return function(message, ...args) {
        capturedLogs.push({level: methodName, message, args});
        // Silent - don't output to console
      }
    }
    log.rebuild();

    mockSupabase = createMockSupabaseClient();
    repository = new EquipmentRepository(mockSupabase as any);
  });

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("constructor", () => {
    it("should create repository with correct table name and primary key", () => {
      const repo = new EquipmentRepository();
      expect(repo).toBeInstanceOf(EquipmentRepository);
    });

    it("should create repository with Supabase client", () => {
      const repo = new EquipmentRepository(mockSupabase as any);
      expect(repo).toBeInstanceOf(EquipmentRepository);
    });
  });

  describe("findByQuality", () => {
    it("should find equipment by quality successfully", async () => {
      const mockEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-equipment",
        name: "Test Equipment",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ["1-1", "1-2"],
        crafting_gold_cost: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockEquipment],
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findByQuality("blue");

      expect(result.data).toEqual([mockEquipment]);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith("equipment");
    });

    it("should handle database errors", async () => {
      const mockError = { message: "Database error", code: "DB_ERROR" };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await repository.findByQuality("blue");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.message,
      });
    });
  });

  describe("findByType", () => {
    it("should find equipment by type successfully", async () => {
      const mockEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-fragment",
        name: "Test Fragment",
        quality: "green",
        type: "fragment",
        buy_value_gold: 500,
        buy_value_coin: 0,
        sell_value: 100,
        guild_activity_points: 2,
        hero_level_required: null,
        campaign_sources: ["2-1"],
        crafting_gold_cost: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockEquipment],
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findByType("fragment");

      expect(result.data).toEqual([mockEquipment]);
      expect(result.error).toBeNull();
    });
  });

  describe("findByCampaignSource", () => {
    it("should find equipment by campaign source successfully", async () => {
      const mockEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-equipment",
        name: "Test Equipment",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ["1-1", "1-2"],
        crafting_gold_cost: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockEquipment],
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findByCampaignSource("1-1");

      expect(result.data).toEqual([mockEquipment]);
      expect(result.error).toBeNull();
    });
  });

  describe("findWithStats", () => {
    it("should find equipment with stats successfully", async () => {
      const mockEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-equipment",
        name: "Test Equipment",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ["1-1"],
        crafting_gold_cost: null,
      };

      const mockStats = [
        { equipment_slug: "test-equipment", stat: "strength", value: 100 },
        { equipment_slug: "test-equipment", stat: "agility", value: 50 },
      ];

      // Mock findById
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      });

      // Mock findStatsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockStats,
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findWithStats("test-equipment");

      expect(result.data).toEqual({
        equipment: mockEquipment,
        stats: mockStats,
      });
      expect(result.error).toBeNull();
    });

    it("should handle equipment not found", async () => {
      const mockError = { message: "Not found", code: "PGRST116", details: undefined };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await repository.findWithStats("non-existent");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.details,
      });
    });
  });

  describe("findWithRequiredItems", () => {
    it("should find equipment with required items successfully", async () => {
      const mockEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-equipment",
        name: "Test Equipment",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: null,
        crafting_gold_cost: 500,
      };

      const mockRequiredItems = [
        { base_slug: "test-equipment", required_slug: "component-1", quantity: 2 },
        { base_slug: "test-equipment", required_slug: "component-2", quantity: 1 },
      ];

      // Mock findById
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      });

      // Mock findRequiredItemsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRequiredItems,
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findWithRequiredItems("test-equipment");

      expect(result.data).toEqual({
        equipment: mockEquipment,
        required_items: mockRequiredItems,
      });
      expect(result.error).toBeNull();
    });
  });

  describe("findWithFullDetails", () => {
    it("should find equipment with full details successfully", async () => {
      const mockEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-equipment",
        name: "Test Equipment",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ["1-1"],
        crafting_gold_cost: 500,
      };

      const mockStats = [{ equipment_slug: "test-equipment", stat: "strength", value: 100 }];

      const mockRequiredItems = [{ base_slug: "test-equipment", required_slug: "component-1", quantity: 2 }];

      // Mock findById
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      });

      // Mock findStatsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockStats,
              error: null,
            }),
          }),
        }),
      });

      // Mock findRequiredItemsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRequiredItems,
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findWithFullDetails("test-equipment");

      expect(result.data).toEqual({
        equipment: mockEquipment,
        stats: mockStats,
        required_items: mockRequiredItems,
      });
      expect(result.error).toBeNull();
    });
  });

  describe("bulkCreateStats", () => {
    it("should bulk create equipment stats successfully", async () => {
      const mockStatsData = [
        { equipment_slug: "test-equipment", stat: "strength", value: 100 },
        { equipment_slug: "test-equipment", stat: "agility", value: 50 },
      ];

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockStatsData,
            error: null,
          }),
        }),
      });

      const result = await repository.bulkCreateStats(mockStatsData);

      expect(result.data).toEqual(mockStatsData);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith("equipment_stat");
    });

    it("should handle bulk create stats errors", async () => {
      const mockError = { message: "Bulk insert failed", code: "BULK_ERROR" };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await repository.bulkCreateStats([]);

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.message,
      });
    });
  });

  describe("bulkCreateRequiredItems", () => {
    it("should bulk create required items successfully", async () => {
      const mockRequiredItemsData = [
        { base_slug: "test-equipment", required_slug: "component-1", quantity: 2 },
        { base_slug: "test-equipment", required_slug: "component-2", quantity: 1 },
      ];

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockRequiredItemsData,
            error: null,
          }),
        }),
      });

      const result = await repository.bulkCreateRequiredItems(mockRequiredItemsData);

      expect(result.data).toEqual(mockRequiredItemsData);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith("equipment_required_item");
    });
  });

  describe("findEquipmentThatRequires", () => {
    it("should find equipment that requires a specific fragment successfully", async () => {
      const mockBrothersEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "brothers",
        name: "Brothers",
        quality: "green",
        type: "equipable",
        buy_value_gold: 4500,
        buy_value_coin: 0,
        sell_value: 900,
        guild_activity_points: 10,
        hero_level_required: 35,
        campaign_sources: null,
        crafting_gold_cost: 22500,
      };

      const mockAnotherEquipment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "another-item",
        name: "Another Item",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 2000,
        buy_value_coin: 0,
        sell_value: 400,
        guild_activity_points: 5,
        hero_level_required: 20,
        campaign_sources: null,
        crafting_gold_cost: 10000,
      };

      // Mock the join query response - equipment_required_item with inner join on equipment
      const mockJoinResponse = [
        { base_slug: "brothers", quantity: 5, equipment: mockBrothersEquipment },
        { base_slug: "another-item", quantity: 3, equipment: mockAnotherEquipment },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockJoinResponse,
            error: null,
          }),
        }),
      });

      const result = await repository.findEquipmentThatRequires("brothers-fragment");

      expect(result.data).toEqual([
        { equipment: mockBrothersEquipment, quantity: 5 },
        { equipment: mockAnotherEquipment, quantity: 3 },
      ]);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith("equipment_required_item");
    });

    it("should return empty array when no equipment requires the fragment", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await repository.findEquipmentThatRequires("non-existent-fragment");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should handle database errors", async () => {
      const mockError = { message: "Database error", code: "DB_ERROR" };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await repository.findEquipmentThatRequires("brothers-fragment");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.message,
      });
    });
  });

  describe("Data transformation methods", () => {
    const mockJsonEquipment: EquipmentRecord = {
      slug: "test-equipment",
      name: "Test Equipment",
      quality: "blue",
      type: "equipable",
      buy_value_gold: 1000,
      buy_value_coin: 0,
      sell_value: 200,
      guild_activity_points: 5,
      hero_level_required: 10,
      campaign_sources: ["1-1", "1-2"],
      stats: { strength: 100, agility: 50 },
      crafting: {
        gold_cost: 500,
        required_items: { "component-1": 2, "component-2": 1 },
      },
      updated_on: "2024-01-01T00:00:00Z",
    };

    describe("transformEquipmentFromJSON", () => {
      it("should transform JSON equipment to database format", () => {
        const result = EquipmentRepository.transformEquipmentFromJSON(mockJsonEquipment);

        expect(result).toEqual({
          slug: "test-equipment",
          name: "Test Equipment",
          quality: "blue",
          type: "equipable",
          buy_value_gold: 1000,
          buy_value_coin: 0,
          sell_value: 200,
          guild_activity_points: 5,
          hero_level_required: 10,
          campaign_sources: ["1-1", "1-2"],
          crafting_gold_cost: 500,
        });
      });

      it("should handle missing optional fields", () => {
        const minimalEquipment: EquipmentRecord = {
          slug: "minimal-equipment",
          name: "Minimal Equipment (Fragment)",
          quality: "gray",
          type: "fragment",
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          updated_on: "2024-01-01T00:00:00Z",
        } as EquipmentRecord;

        const result = EquipmentRepository.transformEquipmentFromJSON(minimalEquipment);

        expect(result).toEqual({
          slug: "minimal-equipment",
          name: "Minimal Equipment (Fragment)",
          quality: "gray",
          type: "fragment",
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          hero_level_required: null,
          campaign_sources: null,
          crafting_gold_cost: null,
        });
      });
    });

    describe("transformStatsFromJSON", () => {
      it("should transform JSON stats to database format", () => {
        const result = EquipmentRepository.transformStatsFromJSON(mockJsonEquipment);

        expect(result).toEqual([
          { equipment_slug: "test-equipment", stat: "strength", value: 100 },
          { equipment_slug: "test-equipment", stat: "agility", value: 50 },
        ]);
      });

      it("should handle missing stats", () => {
        const equipmentWithoutStats: EquipmentRecord = {
          slug: "test-fragment",
          name: "Test Fragment (Fragment)",
          quality: "gray",
          type: "fragment",
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          updated_on: "2024-01-01T00:00:00Z",
        } as EquipmentRecord;

        const result = EquipmentRepository.transformStatsFromJSON(equipmentWithoutStats);

        expect(result).toEqual([]);
      });
    });

    describe("transformRequiredItemsFromJSON", () => {
      it("should transform JSON required items to database format", () => {
        const result = EquipmentRepository.transformRequiredItemsFromJSON(mockJsonEquipment);

        expect(result).toEqual([
          { base_slug: "test-equipment", required_slug: "component-1", quantity: 2 },
          { base_slug: "test-equipment", required_slug: "component-2", quantity: 1 },
        ]);
      });

      it("should handle missing crafting info", () => {
        const equipmentWithoutCrafting: EquipmentRecord = {
          slug: "test-fragment",
          name: "Test Fragment (Fragment)",
          quality: "gray",
          type: "fragment",
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          updated_on: "2024-01-01T00:00:00Z",
        } as EquipmentRecord;

        const result = EquipmentRepository.transformRequiredItemsFromJSON(equipmentWithoutCrafting);

        expect(result).toEqual([]);
      });

      it("should correctly transform brothers equipment with fragment requirement", () => {
        const brothersEquipment: EquipmentRecord = {
          slug: "brothers",
          name: "Brothers",
          quality: "green",
          type: "equipable",
          buy_value_gold: 4500,
          buy_value_coin: 0,
          sell_value: 900,
          guild_activity_points: 10,
          hero_level_required: 35,
          stats: { strength: 200, health: 1000 },
          crafting: {
            gold_cost: 22500,
            required_items: {
              "brothers-fragment": 5,
            },
          },
          updated_on: "2024-11-09T01:57:37.950Z",
        };

        const result = EquipmentRepository.transformRequiredItemsFromJSON(brothersEquipment);

        expect(result).toEqual([{ base_slug: "brothers", required_slug: "brothers-fragment", quantity: 5 }]);
      });
    });
  });

  describe("initializeFromJSON", () => {
    it("should initialize all equipment data from JSON successfully", async () => {
      const mockJsonData: EquipmentRecord[] = [
        {
          slug: "test-equipment",
          name: "Test Equipment",
          quality: "blue",
          type: "equipable",
          buy_value_gold: 1000,
          buy_value_coin: 0,
          sell_value: 200,
          guild_activity_points: 5,
          hero_level_required: 10,
          campaign_sources: ["1-1"],
          stats: { strength: 100 },
          crafting: {
            gold_cost: 500,
            required_items: { "component-1": 2 },
          },
          updated_on: "2024-01-01T00:00:00Z",
        },
      ];

      const mockEquipment = [{ slug: "test-equipment", name: "Test Equipment" }];
      const mockStats = [{ equipment_slug: "test-equipment", stat: "strength", value: 100 }];
      const mockRequiredItems = [{ base_slug: "test-equipment", required_slug: "component-1", quantity: 2 }];

      // Mock equipment bulk creation
      vi.spyOn(repository, "bulkCreate").mockResolvedValue({
        data: mockEquipment as any,
        error: null,
      });

      // Mock stats bulk creation
      vi.spyOn(repository, "bulkCreateStats").mockResolvedValue({
        data: mockStats,
        error: null,
      });

      // Mock required items bulk creation
      vi.spyOn(repository, "bulkCreateRequiredItems").mockResolvedValue({
        data: mockRequiredItems,
        error: null,
      });

      const result = await repository.initializeFromJSON(mockJsonData);

      expect(result.data).toEqual({
        equipment: mockEquipment,
        stats: mockStats,
        required_items: mockRequiredItems,
      });
      expect(result.error).toBeNull();
    });

    it("should handle equipment creation failure", async () => {
      const mockError = { message: "Equipment creation failed", code: "CREATE_ERROR" };

      vi.spyOn(repository, "bulkCreate").mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await repository.initializeFromJSON([]);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe("findRawComponentOf", () => {
    const mockEnchantedLuteFragment: Database["public"]["Tables"]["equipment"]["Row"] = {
      slug: "enchanted-lute-fragment",
      name: "Enchanted Lute (Fragment)",
      quality: "blue",
      type: "fragment",
      buy_value_gold: 1000,
      buy_value_coin: 0,
      sell_value: 200,
      guild_activity_points: 5,
      hero_level_required: null,
      campaign_sources: ["3-1"],
      crafting_gold_cost: null,
    };

    const mockEnchantedLute: Database["public"]["Tables"]["equipment"]["Row"] = {
      slug: "enchanted-lute",
      name: "Enchanted Lute",
      quality: "blue",
      type: "equipable",
      buy_value_gold: 5000,
      buy_value_coin: 0,
      sell_value: 1000,
      guild_activity_points: 15,
      hero_level_required: 40,
      campaign_sources: null,
      crafting_gold_cost: 25000,
    };

    const mockSirensSong: Database["public"]["Tables"]["equipment"]["Row"] = {
      slug: "sirens-song",
      name: "Siren's Song",
      quality: "violet",
      type: "equipable",
      buy_value_gold: 10000,
      buy_value_coin: 0,
      sell_value: 2000,
      guild_activity_points: 25,
      hero_level_required: 50,
      campaign_sources: null,
      crafting_gold_cost: 50000,
    };

    const mockAsclepiusStaff: Database["public"]["Tables"]["equipment"]["Row"] = {
      slug: "asclepius-staff",
      name: "Asclepius Staff",
      quality: "orange",
      type: "equipable",
      buy_value_gold: 20000,
      buy_value_coin: 0,
      sell_value: 4000,
      guild_activity_points: 40,
      hero_level_required: 60,
      campaign_sources: null,
      crafting_gold_cost: 100000,
    };

    it("should find final equipment that uses a component recursively", async () => {
      // Test the example: fragment (5x) → lute (1x) → song (2x) → staff
      // Result should be: fragment is raw component of 10x Asclepius Staff

      // Mock findEquipmentThatRequires for enchanted-lute-fragment
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ base_slug: "enchanted-lute", quantity: 5, equipment: mockEnchantedLute }],
            error: null,
          }),
        }),
      });

      // Mock findEquipmentThatRequires for enchanted-lute
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ base_slug: "sirens-song", quantity: 1, equipment: mockSirensSong }],
            error: null,
          }),
        }),
      });

      // Mock findEquipmentThatRequires for sirens-song
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ base_slug: "asclepius-staff", quantity: 2, equipment: mockAsclepiusStaff }],
            error: null,
          }),
        }),
      });

      // Mock findEquipmentThatRequires for asclepius-staff (final product)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await repository.findRawComponentOf("enchanted-lute-fragment");

      expect(result.data).toEqual([
        {
          equipment: mockAsclepiusStaff,
          totalQuantity: 10, // 5 * 1 * 2 = 10
        },
      ]);
      expect(result.error).toBeNull();
    });

    it("should handle multiple paths to same final product", async () => {
      // Test when a component is used in multiple intermediate products
      // that both contribute to the same final product

      const mockComponent: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "shared-component",
        name: "Shared Component",
        quality: "green",
        type: "fragment",
        buy_value_gold: 500,
        buy_value_coin: 0,
        sell_value: 100,
        guild_activity_points: 3,
        hero_level_required: null,
        campaign_sources: ["2-1"],
        crafting_gold_cost: null,
      };

      const mockIntermediate1: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "intermediate-1",
        name: "Intermediate 1",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 2000,
        buy_value_coin: 0,
        sell_value: 400,
        guild_activity_points: 8,
        hero_level_required: 30,
        campaign_sources: null,
        crafting_gold_cost: 10000,
      };

      const mockIntermediate2: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "intermediate-2",
        name: "Intermediate 2",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 2500,
        buy_value_coin: 0,
        sell_value: 500,
        guild_activity_points: 10,
        hero_level_required: 35,
        campaign_sources: null,
        crafting_gold_cost: 12500,
      };

      const mockFinalProduct: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "final-product",
        name: "Final Product",
        quality: "violet",
        type: "equipable",
        buy_value_gold: 8000,
        buy_value_coin: 0,
        sell_value: 1600,
        guild_activity_points: 20,
        hero_level_required: 55,
        campaign_sources: null,
        crafting_gold_cost: 40000,
      };

      // Set up mocks using a different strategy - by call parameters
      mockSupabase.from.mockImplementation((table) => {
        if (table === "equipment_required_item") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((column, value) => {
                if (column === "required_slug") {
                  if (value === "shared-component") {
                    return {
                      data: [
                        { base_slug: "intermediate-1", quantity: 3, equipment: mockIntermediate1 },
                        { base_slug: "intermediate-2", quantity: 2, equipment: mockIntermediate2 },
                      ],
                      error: null,
                    };
                  } else if (value === "intermediate-1") {
                    return {
                      data: [{ base_slug: "final-product", quantity: 1, equipment: mockFinalProduct }],
                      error: null,
                    };
                  } else if (value === "intermediate-2") {
                    return {
                      data: [{ base_slug: "final-product", quantity: 1, equipment: mockFinalProduct }],
                      error: null,
                    };
                  } else if (value === "final-product") {
                    return {
                      data: [],
                      error: null,
                    };
                  }
                }
                return { data: [], error: null };
              }),
            }),
          };
        }
        return mockSupabase.from.mockReturnValue({});
      });

      const result = await repository.findRawComponentOf("shared-component");

      expect(result.data).toEqual([
        {
          equipment: mockFinalProduct,
          totalQuantity: 5, // (3 * 1) + (2 * 1) = 5
        },
      ]);
      expect(result.error).toBeNull();
    });

    it("should prevent circular dependencies", async () => {
      const mockCircularA: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "circular-a",
        name: "Circular A",
        quality: "green",
        type: "fragment",
        buy_value_gold: 100,
        buy_value_coin: 0,
        sell_value: 20,
        guild_activity_points: 1,
        hero_level_required: null,
        campaign_sources: ["1-1"],
        crafting_gold_cost: null,
      };

      const mockCircularB: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "circular-b",
        name: "Circular B",
        quality: "green",
        type: "fragment",
        buy_value_gold: 200,
        buy_value_coin: 0,
        sell_value: 40,
        guild_activity_points: 2,
        hero_level_required: null,
        campaign_sources: ["1-2"],
        crafting_gold_cost: null,
      };

      // Mock circular-a requires circular-b
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ base_slug: "circular-b", quantity: 1, equipment: mockCircularB }],
            error: null,
          }),
        }),
      });

      // Mock circular-b requires circular-a (creating a cycle)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ base_slug: "circular-a", quantity: 1, equipment: mockCircularA }],
            error: null,
          }),
        }),
      });

      const result = await repository.findRawComponentOf("circular-a");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should return empty array for components not used in any recipes", async () => {
      // Mock component that is not used in any recipes
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await repository.findRawComponentOf("unused-fragment");

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      const mockError = { message: "Database connection failed", code: "DB_ERROR" };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await repository.findRawComponentOf("test-fragment");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.message,
      });
    });

    it("should handle mixed final and intermediate products", async () => {
      const mockFragment: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "test-fragment",
        name: "Test Fragment",
        quality: "green",
        type: "fragment",
        buy_value_gold: 100,
        buy_value_coin: 0,
        sell_value: 20,
        guild_activity_points: 1,
        hero_level_required: null,
        campaign_sources: ["1-1"],
        crafting_gold_cost: null,
      };

      const mockIntermediateItem: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "intermediate-item",
        name: "Intermediate Item",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 25,
        campaign_sources: null,
        crafting_gold_cost: 5000,
      };

      const mockFinalItem: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "final-item",
        name: "Final Item",
        quality: "blue",
        type: "equipable",
        buy_value_gold: 2000,
        buy_value_coin: 0,
        sell_value: 400,
        guild_activity_points: 8,
        hero_level_required: 30,
        campaign_sources: null,
        crafting_gold_cost: 10000,
      };

      const mockUltimateItem: Database["public"]["Tables"]["equipment"]["Row"] = {
        slug: "ultimate-item",
        name: "Ultimate Item",
        quality: "violet",
        type: "equipable",
        buy_value_gold: 5000,
        buy_value_coin: 0,
        sell_value: 1000,
        guild_activity_points: 15,
        hero_level_required: 45,
        campaign_sources: null,
        crafting_gold_cost: 25000,
      };

      // Set up mocks using parameter-based strategy
      mockSupabase.from.mockImplementation((table) => {
        if (table === "equipment_required_item") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((column, value) => {
                if (column === "required_slug") {
                  if (value === "test-fragment") {
                    return {
                      data: [
                        { base_slug: "intermediate-item", quantity: 2, equipment: mockIntermediateItem },
                        { base_slug: "final-item", quantity: 1, equipment: mockFinalItem },
                      ],
                      error: null,
                    };
                  } else if (value === "intermediate-item") {
                    return {
                      data: [{ base_slug: "ultimate-item", quantity: 3, equipment: mockUltimateItem }],
                      error: null,
                    };
                  } else if (value === "final-item") {
                    return {
                      data: [],
                      error: null,
                    };
                  } else if (value === "ultimate-item") {
                    return {
                      data: [],
                      error: null,
                    };
                  }
                }
                return { data: [], error: null };
              }),
            }),
          };
        }
        return mockSupabase.from.mockReturnValue({});
      });

      const result = await repository.findRawComponentOf("test-fragment");

      expect(result.data).toEqual(
        expect.arrayContaining([
          {
            equipment: mockFinalItem,
            totalQuantity: 1, // 1x final-item
          },
          {
            equipment: mockUltimateItem,
            totalQuantity: 6, // 2x intermediate-item * 3x ultimate-item = 6x
          },
        ])
      );
      expect(result.error).toBeNull();
    });

    it("should handle unexpected errors", async () => {
      const mockError = new Error("Unexpected error");

      // Mock method to spy on and make it throw
      vi.spyOn(repository, "findEquipmentThatRequires").mockRejectedValue(mockError);

      const result = await repository.findRawComponentOf("test-fragment");

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: "Unexpected error",
        details: mockError,
      });
    });
  });
});
