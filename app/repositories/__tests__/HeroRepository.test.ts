// ABOUTME: Comprehensive test suite for HeroRepository class
// ABOUTME: Tests all CRUD operations, relationship queries, and bulk operations with mocked Supabase client

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import log from "loglevel";
import { HeroRepository } from "../HeroRepository";
import { mockSupabaseClient } from "../../__tests__/mocks/supabase";
import type {
  Hero,
  HeroArtifact,
  HeroSkin,
  HeroGlyph,
  HeroEquipmentSlot,
  CompleteHero,
  CreateHeroWithData,
} from "../types";

describe("HeroRepository", () => {
  let repository: HeroRepository;
  let capturedLogs: Array<{ level: string; message: string; args: any[] }> = [];
  let originalMethodFactory: any;

  beforeEach(() => {
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

    // Create repository with mocked supabase client
    repository = new HeroRepository(mockSupabaseClient as any);
  });

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("Basic CRUD Operations", () => {
    it("should create a hero successfully", async () => {
      const heroData = {
        slug: "test-hero",
        name: "Test Hero",
        class: "tank",
        faction: "honor",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["Campaign"],
        order_rank: 1,
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { ...heroData, updated_on: new Date().toISOString() },
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.create(heroData);

      expect(result.error).toBeNull();
      expect(result.data).toMatchObject(heroData);
      expect(result.data?.updated_on).toBeDefined();
    });

    it("should find a hero by slug", async () => {
      const heroData: Hero = {
        slug: "test-hero",
        name: "Test Hero",
        class: "tank",
        faction: "honor",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["Campaign"],
        order_rank: 1,
        updated_on: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: heroData,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findById("test-hero");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(heroData);
    });

    it("should find all heroes", async () => {
      const heroesData: Hero[] = [
        {
          slug: "hero-1",
          name: "Hero One",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
          updated_on: new Date().toISOString(),
        },
        {
          slug: "hero-2",
          name: "Hero Two",
          class: "healer",
          faction: "nature",
          main_stat: "intelligence",
          attack_type: ["magic"],
          stone_source: ["Events"],
          order_rank: 2,
          updated_on: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: heroesData,
              error: null,
            }),
        }),
      });

      const result = await repository.findAll();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(heroesData);
    });

    it("should find all heroes with basic data only", async () => {
      const basicHeroesData = [
        {
          slug: "hero-1",
          name: "Hero One",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          order_rank: 1,
        },
        {
          slug: "hero-2",
          name: "Hero Two",
          class: "healer",
          faction: "nature",
          main_stat: "intelligence",
          order_rank: 2,
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        order: () =>
          Promise.resolve({
            data: basicHeroesData,
            error: null,
          }),
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await repository.findAllBasic();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(basicHeroesData);

      // Verify that only essential fields are queried
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("hero");
      expect(mockSelect).toHaveBeenCalledWith(
        "slug, name, class, faction, main_stat, order_rank"
      );
    });

    it("should find all heroes with basic data and pagination", async () => {
      const basicHeroesData = [
        {
          slug: "hero-1",
          name: "Hero One",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          order_rank: 1,
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: basicHeroesData,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await repository.findAllBasic({ limit: 10, offset: 0 });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data).toEqual(basicHeroesData);

      // Verify pagination was applied
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });

    it("should handle database errors gracefully", async () => {
      const dbError = {
        message: "Database connection failed",
        code: "CONNECTION_ERROR",
        details: "Network timeout",
      };

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: dbError,
              }),
          }),
        }),
      });

      const result = await repository.findById("nonexistent-hero");

      expect(result.data).toBeNull();
      expect(result.error).toMatchObject({
        message: "Database connection failed",
        code: "CONNECTION_ERROR",
        details: "Network timeout",
      });
    });
  });

  describe("Hero-specific Query Methods", () => {
    it("should find heroes by class", async () => {
      const tankHeroes: Hero[] = [
        {
          slug: "tank-1",
          name: "Tank One",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
          updated_on: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: tankHeroes,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findByClass("tank");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(tankHeroes);
    });

    it("should find heroes by faction", async () => {
      const honorHeroes: Hero[] = [
        {
          slug: "honor-1",
          name: "Honor Hero",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
          updated_on: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: honorHeroes,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findByFaction("honor");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(honorHeroes);
    });

    it("should find heroes by main stat", async () => {
      const strengthHeroes: Hero[] = [
        {
          slug: "str-1",
          name: "Strength Hero",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
          updated_on: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: strengthHeroes,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findByMainStat("strength");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(strengthHeroes);
    });

    it("should find heroes by attack type", async () => {
      const physicalHeroes: Hero[] = [
        {
          slug: "phys-1",
          name: "Physical Hero",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
          updated_on: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          contains: () => ({
            order: () =>
              Promise.resolve({
                data: physicalHeroes,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findByAttackType("physical");

      expect(result.error).toBeNull();
      expect(result.data).toEqual(physicalHeroes);
    });
  });

  describe("Relationship Loading", () => {
    it("should load hero with all relationship data", async () => {
      const completeHeroData = {
        slug: "complete-hero",
        name: "Complete Hero",
        class: "tank",
        faction: "honor",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["Campaign"],
        order_rank: 1,
        updated_on: new Date().toISOString(),
        hero_artifact: [
          {
            id: "artifact-1",
            hero_slug: "complete-hero",
            artifact_type: "weapon",
            name: "Test Weapon",
            team_buff: "armor",
            team_buff_secondary: null,
            created_at: new Date().toISOString(),
          },
        ],
        hero_skin: [
          {
            id: "skin-1",
            hero_slug: "complete-hero",
            name: "Default Skin",
            stat_type: "strength",
            stat_value: 100,
            has_plus: false,
            source: null,
            created_at: new Date().toISOString(),
          },
        ],
        hero_glyph: [
          {
            id: "glyph-1",
            hero_slug: "complete-hero",
            position: 1,
            stat_type: "physical_attack",
            stat_value: 50,
            created_at: new Date().toISOString(),
          },
          {
            id: "glyph-5",
            hero_slug: "complete-hero",
            position: 5,
            stat_type: "strength",
            stat_value: 75,
            created_at: new Date().toISOString(),
          },
        ],
        hero_equipment_slot: [
          {
            id: "slot-1",
            hero_slug: "complete-hero",
            quality: "white",
            slot_position: 1,
            equipment_slug: "test-equipment",
            created_at: new Date().toISOString(),
          },
        ],
      };

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: completeHeroData,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findWithAllData("complete-hero");

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();

      const hero = result.data as CompleteHero;
      expect(hero.slug).toBe("complete-hero");
      expect(hero.artifacts).toHaveLength(1);
      expect(hero.skins).toHaveLength(1);
      expect(hero.glyphs).toHaveLength(2);
      expect(hero.equipmentSlots).toHaveLength(1);

      // Check that glyphs are sorted by position
      expect(hero.glyphs[0].position).toBe(1);
      expect(hero.glyphs[1].position).toBe(5);

      // Check that raw relationship data is removed
      expect((hero as any).hero_artifact).toBeUndefined();
      expect((hero as any).hero_skin).toBeUndefined();
      expect((hero as any).hero_glyph).toBeUndefined();
      expect((hero as any).hero_equipment_slot).toBeUndefined();
    });

    it("should load hero with artifacts only", async () => {
      const heroWithArtifacts = {
        slug: "artifact-hero",
        name: "Artifact Hero",
        class: "tank",
        faction: "honor",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["Campaign"],
        order_rank: 1,
        updated_on: new Date().toISOString(),
        hero_artifact: [
          {
            id: "artifact-1",
            hero_slug: "artifact-hero",
            artifact_type: "weapon",
            name: "Test Weapon",
            team_buff: "armor",
            team_buff_secondary: null,
            created_at: new Date().toISOString(),
          },
        ],
      };

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: heroWithArtifacts,
                error: null,
              }),
          }),
        }),
      });

      const result = await repository.findWithArtifacts("artifact-hero");

      expect(result.error).toBeNull();
      expect(result.data?.artifacts).toHaveLength(1);
      expect(result.data?.artifacts[0].artifact_type).toBe("weapon");
      expect((result.data as any).hero_artifact).toBeUndefined();
    });
  });

  describe("Equipment Relationships", () => {
    it("should find heroes using specific equipment", async () => {
      const heroesUsingEquipment = [
        {
          slug: "hero-1",
          name: "Hero One",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
          updated_on: new Date().toISOString(),
          hero_equipment_slot: [{ equipment_slug: "test-equipment" }],
        },
        {
          slug: "hero-2",
          name: "Hero Two",
          class: "healer",
          faction: "nature",
          main_stat: "intelligence",
          attack_type: ["magic"],
          stone_source: ["Events"],
          order_rank: 2,
          updated_on: new Date().toISOString(),
          hero_equipment_slot: [{ equipment_slug: "test-equipment" }],
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: () =>
            Promise.resolve({
              data: heroesUsingEquipment,
              error: null,
            }),
        }),
      });

      const result = await repository.findHeroesUsingEquipment(
        "test-equipment"
      );

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).not.toHaveProperty("hero_equipment_slot");
    });

    it("should get hero equipment by quality", async () => {
      const equipmentSlots: HeroEquipmentSlot[] = [
        {
          id: "slot-1",
          hero_slug: "test-hero",
          quality: "white",
          slot_position: 1,
          equipment_slug: "equipment-1",
          created_at: new Date().toISOString(),
        },
        {
          id: "slot-2",
          hero_slug: "test-hero",
          quality: "white",
          slot_position: 2,
          equipment_slug: "equipment-2",
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: () => ({
          eq: vi.fn().mockReturnValueOnce({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: equipmentSlots,
                  error: null,
                }),
            }),
          }),
        }),
      });

      const result = await repository.getHeroEquipmentByQuality(
        "test-hero",
        "white"
      );

      expect(result.error).toBeNull();
      expect(result.data).toEqual(equipmentSlots);
    });
  });

  describe("Bulk Operations", () => {
    it("should bulk create artifacts", async () => {
      const artifactsData = [
        {
          hero_slug: "test-hero",
          artifact_type: "weapon",
          name: "Test Weapon",
          team_buff: "armor",
        },
        {
          hero_slug: "test-hero",
          artifact_type: "book",
          name: "Test Book",
        },
      ];

      const createdArtifacts = artifactsData.map((artifact, index) => ({
        id: `artifact-${index + 1}`,
        ...artifact,
        team_buff_secondary: null,
        created_at: new Date().toISOString(),
      }));

      mockSupabaseClient.from.mockReturnValue({
        insert: () => ({
          select: () =>
            Promise.resolve({
              data: createdArtifacts,
              error: null,
            }),
        }),
      });

      const result = await repository.bulkCreateArtifacts(artifactsData);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].artifact_type).toBe("weapon");
      expect(result.data?.[1].artifact_type).toBe("book");
    });

    it("should create hero with all related data", async () => {
      const heroWithData: CreateHeroWithData = {
        hero: {
          slug: "complex-hero",
          name: "Complex Hero",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: ["Campaign"],
          order_rank: 1,
        },
        artifacts: [
          {
            hero_slug: "complex-hero",
            artifact_type: "weapon",
            name: "Test Weapon",
            team_buff: "armor",
          },
        ],
        skins: [
          {
            hero_slug: "complex-hero",
            name: "Default Skin",
            stat_type: "strength",
            stat_value: 100,
            has_plus: false,
          },
        ],
        glyphs: [
          {
            hero_slug: "complex-hero",
            position: 1,
            stat_type: "physical_attack",
            stat_value: 50,
          },
        ],
        equipmentSlots: [
          {
            hero_slug: "complex-hero",
            quality: "white",
            slot_position: 1,
            equipment_slug: "test-equipment",
          },
        ],
      };

      // Mock the main hero creation
      const mockCreate = vi.fn().mockResolvedValue({
        data: { ...heroWithData.hero, updated_on: new Date().toISOString() },
        error: null,
      });
      repository.create = mockCreate;

      // Mock the bulk creation methods
      const mockBulkCreateArtifacts = vi.fn().mockResolvedValue({
        data: [
          {
            id: "artifact-1",
            ...heroWithData.artifacts![0],
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      });
      const mockBulkCreateSkins = vi.fn().mockResolvedValue({
        data: [
          {
            id: "skin-1",
            ...heroWithData.skins![0],
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      });
      const mockBulkCreateGlyphs = vi.fn().mockResolvedValue({
        data: [
          {
            id: "glyph-1",
            ...heroWithData.glyphs![0],
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      });
      const mockBulkCreateEquipmentSlots = vi.fn().mockResolvedValue({
        data: [
          {
            id: "slot-1",
            ...heroWithData.equipmentSlots![0],
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      });

      repository.bulkCreateArtifacts = mockBulkCreateArtifacts;
      repository.bulkCreateSkins = mockBulkCreateSkins;
      repository.bulkCreateGlyphs = mockBulkCreateGlyphs;
      repository.bulkCreateEquipmentSlots = mockBulkCreateEquipmentSlots;

      const result = await repository.createWithAllData(heroWithData);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(mockCreate).toHaveBeenCalledWith(heroWithData.hero);
      expect(mockBulkCreateArtifacts).toHaveBeenCalledWith(
        heroWithData.artifacts
      );
      expect(mockBulkCreateSkins).toHaveBeenCalledWith(heroWithData.skins);
      expect(mockBulkCreateGlyphs).toHaveBeenCalledWith(heroWithData.glyphs);
      expect(mockBulkCreateEquipmentSlots).toHaveBeenCalledWith(
        heroWithData.equipmentSlots
      );

      const completeHero = result.data as CompleteHero;
      expect(completeHero.artifacts).toHaveLength(1);
      expect(completeHero.skins).toHaveLength(1);
      expect(completeHero.glyphs).toHaveLength(1);
      expect(completeHero.equipmentSlots).toHaveLength(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle validation errors", async () => {
      const invalidHeroData = {
        slug: "", // Invalid: empty slug
        name: "Test Hero",
        class: "tank",
        faction: "honor",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["Campaign"],
        order_rank: -1, // Invalid: negative order_rank
      };

      const result = await repository.create(invalidHeroData);

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("VALIDATION_ERROR");
      expect(result.error?.message).toBe("Validation failed");
    });

    it("should handle bulk operation errors gracefully", async () => {
      const artifactsData = [
        {
          hero_slug: "test-hero",
          artifact_type: "weapon",
          name: "Test Weapon",
          team_buff: "armor",
        },
      ];

      const dbError = {
        message: "Foreign key constraint violation",
        code: "23503",
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: () => ({
          select: () =>
            Promise.resolve({
              data: null,
              error: dbError,
            }),
        }),
      });

      const result = await repository.bulkCreateArtifacts(artifactsData);

      expect(result.data).toEqual([]);
      expect(result.error?.message).toContain(
        "Bulk artifact creation completed with 1 errors"
      );
      expect(result.error?.code).toBe("BULK_PARTIAL_FAILURE");
    });
  });
});
