// ABOUTME: Test suite for hero data migration utilities
// ABOUTME: Tests transformation of JSON hero data to database format

import { describe, it, expect } from "vitest";
import {
  transformHeroData,
  createHeroWithDataFromJson,
  validateMigrationResult,
  createProgressCallback,
} from "../hero-data-migration";
import type { HeroRecord } from "~/data/hero.zod";

describe("hero-data-migration", () => {
  const sampleJsonHero: HeroRecord = {
    slug: "test-hero",
    name: "Test Hero",
    class: "tank",
    faction: "honor",
    main_stat: "strength",
    attack_type: ["physical"],
    stone_source: ["Campaign"],
    order_rank: 1,
    updated_on: "2025-01-01T00:00:00.000Z",
    artifacts: {
      weapon: {
        name: "Test Weapon",
        team_buff: "armor",
        team_buff_secondary: "magic defense",
      },
      book: "Tome of Arcane Knowledge",
      ring: null,
    },
    skins: [
      {
        name: "Default Skin",
        stat: "strength",
        has_plus: false,
      },
      {
        name: "Special Skin",
        stat: "health",
        has_plus: true,
        source: "Event",
      },
    ],
    glyphs: [
      "physical attack",
      "armor",
      "health",
      "magic defense",
      "strength", // 5th glyph always matches main_stat
    ],
    items: {
      white: [
        "wooden-shield",
        "steel-pauldron",
        "apprentices-mantle",
        "oil-lamp",
        "travellers-staff",
        "lucky-dice",
      ],
      green: [
        "apprentices-mantle",
        "lucky-dice",
        "travellers-staff",
        "censer",
        "lost-ring",
        "elven-bow",
      ],
    },
  };

  describe("transformHeroData", () => {
    it("should transform a complete hero data structure", () => {
      const result = transformHeroData([sampleJsonHero]);

      expect(result.errors).toHaveLength(0);
      expect(result.heroes).toHaveLength(1);
      expect(result.artifacts).toHaveLength(2); // weapon + book
      expect(result.skins).toHaveLength(2);
      expect(result.glyphs).toHaveLength(5);
      expect(result.equipmentSlots).toHaveLength(12); // 6 white + 6 green

      // Check main hero data
      const hero = result.heroes[0];
      expect(hero.slug).toBe("test-hero");
      expect(hero.name).toBe("Test Hero");
      expect(hero.class).toBe("tank");
      expect(hero.faction).toBe("honor");
      expect(hero.main_stat).toBe("strength");
      expect(hero.attack_type).toEqual(["physical"]);
      expect(hero.stone_source).toEqual(["Campaign"]);
      expect(hero.order_rank).toBe(1);
    });

    it("should transform artifacts correctly", () => {
      const result = transformHeroData([sampleJsonHero]);

      const artifacts = result.artifacts;
      expect(artifacts).toHaveLength(2);

      const weapon = artifacts.find((a) => a.artifact_type === "weapon");
      expect(weapon).toBeDefined();
      expect(weapon?.hero_slug).toBe("test-hero");
      expect(weapon?.name).toBe("Test Weapon");
      expect(weapon?.team_buff).toBe("armor");
      expect(weapon?.team_buff_secondary).toBe("magic defense");

      const book = artifacts.find((a) => a.artifact_type === "book");
      expect(book).toBeDefined();
      expect(book?.hero_slug).toBe("test-hero");
      expect(book?.name).toBe("Tome of Arcane Knowledge");
      expect(book?.team_buff).toBeNull();
      expect(book?.team_buff_secondary).toBeNull();
    });

    it("should transform skins correctly", () => {
      const result = transformHeroData([sampleJsonHero]);

      const skins = result.skins;
      expect(skins).toHaveLength(2);

      const defaultSkin = skins.find((s) => s.name === "Default Skin");
      expect(defaultSkin).toBeDefined();
      expect(defaultSkin?.hero_slug).toBe("test-hero");
      expect(defaultSkin?.stat_type).toBe("strength");
      expect(defaultSkin?.has_plus).toBe(false);
      expect(defaultSkin?.source).toBeNull();

      const specialSkin = skins.find((s) => s.name === "Special Skin");
      expect(specialSkin).toBeDefined();
      expect(specialSkin?.hero_slug).toBe("test-hero");
      expect(specialSkin?.stat_type).toBe("health");
      expect(specialSkin?.has_plus).toBe(true);
      expect(specialSkin?.source).toBe("Event");
    });

    it("should transform glyphs correctly", () => {
      const result = transformHeroData([sampleJsonHero]);

      const glyphs = result.glyphs;
      expect(glyphs).toHaveLength(5);

      glyphs.forEach((glyph, index) => {
        expect(glyph.hero_slug).toBe("test-hero");
        expect(glyph.position).toBe(index + 1);
        expect(glyph.stat_value).toBe(0); // Default value
      });

      expect(glyphs[0].stat_type).toBe("physical attack");
      expect(glyphs[1].stat_type).toBe("armor");
      expect(glyphs[2].stat_type).toBe("health");
      expect(glyphs[3].stat_type).toBe("magic defense");
      expect(glyphs[4].stat_type).toBe("strength");
    });

    it("should transform equipment slots correctly", () => {
      const result = transformHeroData([sampleJsonHero]);

      const equipmentSlots = result.equipmentSlots;
      expect(equipmentSlots).toHaveLength(12);

      // Check white quality equipment
      const whiteSlots = equipmentSlots.filter((es) => es.quality === "white");
      expect(whiteSlots).toHaveLength(6);
      whiteSlots.forEach((slot, index) => {
        expect(slot.hero_slug).toBe("test-hero");
        expect(slot.slot_position).toBe(index + 1);
      });

      expect(whiteSlots[0].equipment_slug).toBe("wooden-shield");
      expect(whiteSlots[1].equipment_slug).toBe("steel-pauldron");
      expect(whiteSlots[5].equipment_slug).toBe("lucky-dice");

      // Check green quality equipment
      const greenSlots = equipmentSlots.filter((es) => es.quality === "green");
      expect(greenSlots).toHaveLength(6);
    });

    it("should handle heroes with missing optional data", () => {
      const minimalHero: HeroRecord = {
        slug: "minimal-hero",
        name: "Minimal Hero",
        class: "tank",
        faction: "honor",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["Campaign"],
        order_rank: 1,
        updated_on: "2025-01-01T00:00:00.000Z",
      };

      const result = transformHeroData([minimalHero]);

      expect(result.errors).toHaveLength(0);
      expect(result.heroes).toHaveLength(1);
      expect(result.artifacts).toHaveLength(0);
      expect(result.skins).toHaveLength(0);
      expect(result.glyphs).toHaveLength(0);
      expect(result.equipmentSlots).toHaveLength(0);
    });

    it("should handle heroes with partial glyphs array", () => {
      const heroWithPartialGlyphs: HeroRecord = {
        ...sampleJsonHero,
        glyphs: [
          "physical attack",
          null,
          "health",
          undefined,
          "strength",
        ] as any,
      };

      const result = transformHeroData([heroWithPartialGlyphs]);

      expect(result.errors).toHaveLength(0);
      expect(result.glyphs).toHaveLength(3); // Only non-null/undefined glyphs

      const glyphs = result.glyphs;
      expect(glyphs[0].position).toBe(1);
      expect(glyphs[0].stat_type).toBe("physical attack");
      expect(glyphs[1].position).toBe(3);
      expect(glyphs[1].stat_type).toBe("health");
      expect(glyphs[2].position).toBe(5);
      expect(glyphs[2].stat_type).toBe("strength");
    });

    it("should handle multiple heroes", () => {
      const hero2: HeroRecord = {
        ...sampleJsonHero,
        slug: "hero-2",
        name: "Hero Two",
        order_rank: 2,
      };

      const result = transformHeroData([sampleJsonHero, hero2]);

      expect(result.errors).toHaveLength(0);
      expect(result.heroes).toHaveLength(2);
      expect(result.artifacts).toHaveLength(4); // 2 heroes * 2 artifacts each
      expect(result.skins).toHaveLength(4); // 2 heroes * 2 skins each
      expect(result.glyphs).toHaveLength(10); // 2 heroes * 5 glyphs each
      expect(result.equipmentSlots).toHaveLength(24); // 2 heroes * 12 slots each
    });

    it("should skip invalid data when skipInvalidData is true", () => {
      const invalidHero = {
        ...sampleJsonHero,
        slug: "", // Invalid empty slug
      } as HeroRecord;

      const result = transformHeroData([sampleJsonHero, invalidHero], {
        skipInvalidData: true,
      });

      expect(result.heroes).toHaveLength(1); // Only valid hero processed
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Error processing hero");
    });

    it("should throw error when skipInvalidData is false", () => {
      const invalidHero = {
        ...sampleJsonHero,
        slug: "", // Invalid empty slug
      } as HeroRecord;

      expect(() => {
        transformHeroData([invalidHero], { skipInvalidData: false });
      }).toThrow();
    });
  });

  describe("createHeroWithDataFromJson", () => {
    it("should create a complete hero data structure", () => {
      const result = createHeroWithDataFromJson(sampleJsonHero);

      expect(result.hero.slug).toBe("test-hero");
      expect(result.artifacts).toHaveLength(2);
      expect(result.skins).toHaveLength(2);
      expect(result.glyphs).toHaveLength(5);
      expect(result.equipmentSlots).toHaveLength(12);

      // All related data should reference the same hero
      result.artifacts?.forEach((artifact) => {
        expect(artifact.hero_slug).toBe("test-hero");
      });
      result.skins?.forEach((skin) => {
        expect(skin.hero_slug).toBe("test-hero");
      });
      result.glyphs?.forEach((glyph) => {
        expect(glyph.hero_slug).toBe("test-hero");
      });
      result.equipmentSlots?.forEach((slot) => {
        expect(slot.hero_slug).toBe("test-hero");
      });
    });

    it("should throw error for invalid hero data", () => {
      const invalidHero = {
        ...sampleJsonHero,
        slug: "", // Invalid empty slug
      } as HeroRecord;

      expect(() => {
        createHeroWithDataFromJson(invalidHero);
      }).toThrow("Failed to transform hero");
    });
  });

  describe("validateMigrationResult", () => {
    it("should return no errors for valid migration result", () => {
      const result = transformHeroData([sampleJsonHero]);
      const validationErrors = validateMigrationResult(result);

      expect(validationErrors).toHaveLength(0);
    });

    it("should detect duplicate hero slugs", () => {
      const hero1 = { ...sampleJsonHero, slug: "duplicate" };
      const hero2 = {
        ...sampleJsonHero,
        slug: "duplicate",
        name: "Different Name",
      };

      const result = transformHeroData([hero1, hero2]);
      const validationErrors = validateMigrationResult(result);

      expect(validationErrors).toContain(
        "Duplicate hero slugs found: duplicate"
      );
    });

    it("should detect orphaned artifacts", () => {
      const result = transformHeroData([sampleJsonHero]);
      // Manually add orphaned artifact
      result.artifacts.push({
        hero_slug: "nonexistent-hero",
        artifact_type: "weapon",
        name: "Orphaned Weapon",
        team_buff: "armor",
        team_buff_secondary: null,
      });

      const validationErrors = validateMigrationResult(result);

      expect(validationErrors).toContain(
        "Found 1 artifacts with missing hero references"
      );
    });

    it("should detect invalid glyph positions", () => {
      const result = transformHeroData([sampleJsonHero]);
      // Manually add invalid glyph position
      result.glyphs.push({
        hero_slug: "test-hero",
        position: 0, // Invalid position (should be 1-5)
        stat_type: "invalid",
        stat_value: 0,
      });

      const validationErrors = validateMigrationResult(result);

      expect(validationErrors).toContain(
        "Found 1 glyphs with invalid positions (must be 1-5)"
      );
    });

    it("should detect invalid equipment slot positions", () => {
      const result = transformHeroData([sampleJsonHero]);
      // Manually add invalid slot position
      result.equipmentSlots.push({
        hero_slug: "test-hero",
        quality: "white",
        slot_position: 7, // Invalid position (should be 1-6)
        equipment_slug: "invalid-equipment",
      });

      const validationErrors = validateMigrationResult(result);

      expect(validationErrors).toContain(
        "Found 1 equipment slots with invalid positions (must be 1-6)"
      );
    });
  });

  describe("createProgressCallback", () => {
    it("should create a progress callback function", () => {
      const callback = createProgressCallback("Test Operation", false);

      expect(typeof callback).toBe("function");

      // Should not throw when called
      expect(() => {
        callback(5, 10);
      }).not.toThrow();
    });
  });
});
