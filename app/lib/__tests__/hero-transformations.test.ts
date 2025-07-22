// ABOUTME: Comprehensive tests for hero transformation functions
// ABOUTME: Tests pure transformation functions that convert database hero data to JSON format

import { describe, it, expect } from "vitest";
import {
  transformCompleteHeroToRecord,
  transformBasicHeroToRecord,
  transformArtifacts,
  transformSkins,
  transformGlyphs,
  transformEquipmentSlots,
  sortHeroRecords,
  createHeroesJsonString,
  validateHeroClass,
  validateHeroFaction,
  validateMainStat,
  validateAttackTypes,
  validateTeamBuff,
  validateBookName,
  validateSkinStat,
  validateGlyphStat,
} from "../hero-transformations";
import type { CompleteHero } from "~/repositories/types";
import type { HeroRecord } from "~/data/hero.zod";

describe("Hero Transformations", () => {
  describe("transformCompleteHeroToRecord", () => {
    it("should transform a complete hero with all relationships to HeroRecord format", () => {
      const completeHero: CompleteHero = {
        slug: "astaroth",
        name: "Astaroth",
        class: "tank",
        faction: "chaos",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["arena", "guild"],
        order_rank: 1,
        updated_on: "2023-01-01T00:00:00.000Z",
        artifacts: [
          {
            id: "art1",
            hero_slug: "astaroth",
            artifact_type: "weapon",
            name: "Executioner's Sword",
            team_buff: "armor",
            team_buff_secondary: null,
            created_at: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "art2",
            hero_slug: "astaroth",
            artifact_type: "book",
            name: "Defender's Covenant",
            team_buff: null,
            team_buff_secondary: null,
            created_at: "2023-01-01T00:00:00.000Z",
          },
        ],
        skins: [
          {
            id: "skin1",
            hero_slug: "astaroth",
            name: "Default",
            stat_type: "strength",
            stat_value: 100,
            has_plus: false,
            source: null,
            created_at: "2023-01-01T00:00:00.000Z",
          },
        ],
        glyphs: [
          {
            id: "glyph1",
            hero_slug: "astaroth",
            position: 1,
            stat_type: "strength",
            stat_value: 50,
            created_at: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "glyph2",
            hero_slug: "astaroth",
            position: 3,
            stat_type: "armor",
            stat_value: 30,
            created_at: "2023-01-01T00:00:00.000Z",
          },
        ],
        equipmentSlots: [
          {
            id: "slot1",
            hero_slug: "astaroth",
            quality: "white",
            slot_position: 1,
            equipment_slug: "leather-armor",
            created_at: "2023-01-01T00:00:00.000Z",
          },
          {
            id: "slot2",
            hero_slug: "astaroth",
            quality: "white",
            slot_position: 2,
            equipment_slug: "iron-sword",
            created_at: "2023-01-01T00:00:00.000Z",
          },
        ],
      };

      const result = transformCompleteHeroToRecord(completeHero);

      expect(result).toEqual({
        slug: "astaroth",
        name: "Astaroth",
        class: "tank",
        faction: "chaos",
        main_stat: "strength",
        attack_type: ["physical"],
        stone_source: ["arena", "guild"],
        order_rank: 1,
        updated_on: "2023-01-01T00:00:00.000Z",
        artifacts: {
          weapon: {
            name: "Executioner's Sword",
            team_buff: "armor",
          },
          book: "Defender's Covenant",
        },
        skins: [
          {
            name: "Default",
            stat: "strength",
            has_plus: false,
            source: undefined,
          },
        ],
        glyphs: ["strength", null, "armor", null, null],
        items: {
          white: ["leather-armor", "iron-sword"],
        },
      });
    });

    it("should handle hero with minimal data", () => {
      const completeHero: CompleteHero = {
        slug: "test-hero",
        name: "Test Hero",
        class: "mage",
        faction: "nature",
        main_stat: "intelligence",
        attack_type: ["magic"],
        stone_source: [],
        order_rank: 5,
        updated_on: "2023-01-01T00:00:00.000Z",
        artifacts: [],
        skins: [],
        glyphs: [],
        equipmentSlots: [],
      };

      const result = transformCompleteHeroToRecord(completeHero);

      expect(result).toEqual({
        slug: "test-hero",
        name: "Test Hero",
        class: "mage",
        faction: "nature",
        main_stat: "intelligence",
        attack_type: ["magic"],
        stone_source: [],
        order_rank: 5,
        updated_on: "2023-01-01T00:00:00.000Z",
      });
    });
  });

  describe("transformBasicHeroToRecord", () => {
    it("should transform basic hero data to HeroRecord format", () => {
      const hero = {
        slug: "basic-hero",
        name: "Basic Hero",
        class: "warrior",
        faction: "honor",
        main_stat: "agility",
        attack_type: ["physical"],
        stone_source: ["campaign"],
        order_rank: 10,
        updated_on: "2023-01-01T00:00:00.000Z",
      };

      const result = transformBasicHeroToRecord(hero);

      expect(result).toEqual({
        slug: "basic-hero",
        name: "Basic Hero",
        class: "warrior",
        faction: "honor",
        main_stat: "agility",
        attack_type: ["physical"],
        stone_source: ["campaign"],
        order_rank: 10,
        updated_on: "2023-01-01T00:00:00.000Z",
      });
    });

    it("should provide defaults for missing data", () => {
      const hero = {
        slug: "minimal-hero",
        name: "Minimal Hero",
        class: "invalid-class",
        faction: "invalid-faction",
        main_stat: "invalid-stat",
        attack_type: ["invalid-type"],
      };

      const result = transformBasicHeroToRecord(hero);

      expect(result).toEqual({
        slug: "minimal-hero",
        name: "Minimal Hero",
        class: "tank", // Default fallback
        faction: "honor", // Default fallback
        main_stat: "strength", // Default fallback
        attack_type: ["physical"], // Default fallback
        stone_source: [],
        order_rank: 0,
        updated_on: expect.any(String),
      });
    });
  });

  describe("transformArtifacts", () => {
    it("should transform weapon artifact correctly", () => {
      const artifacts: CompleteHero["artifacts"] = [
        {
          id: "artifact-1",
          hero_slug: "test",
          artifact_type: "weapon",
          name: "Test Weapon",
          team_buff: "armor",
          team_buff_secondary: "physical attack",
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformArtifacts(artifacts);

      expect(result).toEqual({
        weapon: {
          name: "Test Weapon",
          team_buff: "armor",
          team_buff_secondary: "physical attack",
        },
      });
    });

    it("should transform book artifact correctly", () => {
      const artifacts: CompleteHero["artifacts"] = [
        {
          id: "artifact-2",
          hero_slug: "test",
          artifact_type: "book",
          name: "Tome of Arcane Knowledge",
          team_buff: null,
          team_buff_secondary: null,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformArtifacts(artifacts);

      expect(result).toEqual({
        book: "Tome of Arcane Knowledge",
      });
    });

    it("should handle ring artifact", () => {
      const artifacts: CompleteHero["artifacts"] = [
        {
          id: "artifact-3",
          hero_slug: "test",
          artifact_type: "ring",
          name: null,
          team_buff: null,
          team_buff_secondary: null,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformArtifacts(artifacts);

      expect(result).toEqual({
        ring: null,
      });
    });

    it("should return undefined for empty artifacts", () => {
      expect(transformArtifacts([])).toBeUndefined();
      expect(transformArtifacts(undefined)).toBeUndefined();
    });
  });

  describe("transformSkins", () => {
    it("should transform skins correctly", () => {
      const skins: CompleteHero["skins"] = [
        {
          id: "skin-1",
          hero_slug: "test",
          name: "Default",
          stat_type: "strength",
          stat_value: 100,
          has_plus: true,
          source: "event",
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "skin-2",
          hero_slug: "test",
          name: "Special",
          stat_type: "magic attack",
          stat_value: 50,
          has_plus: false,
          source: null,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformSkins(skins);

      expect(result).toEqual([
        {
          name: "Default",
          stat: "strength",
          has_plus: true,
          source: "event",
        },
        {
          name: "Special",
          stat: "magic attack",
          has_plus: false,
          source: undefined,
        },
      ]);
    });

    it("should return empty array for empty skins and undefined for null", () => {
      expect(transformSkins([])).toEqual([]);
      expect(transformSkins(undefined)).toBeUndefined();
    });
  });

  describe("transformGlyphs", () => {
    it("should transform glyphs to 5-element array", () => {
      const glyphs: CompleteHero["glyphs"] = [
        {
          id: "glyph-1",
          hero_slug: "test",
          position: 1,
          stat_type: "strength",
          stat_value: 50,
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "glyph-2",
          hero_slug: "test",
          position: 3,
          stat_type: "armor",
          stat_value: 30,
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "glyph-3",
          hero_slug: "test",
          position: 5,
          stat_type: "health",
          stat_value: 100,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformGlyphs(glyphs);

      expect(result).toEqual(["strength", null, "armor", null, "health"]);
    });

    it("should handle out-of-range positions", () => {
      const glyphs: CompleteHero["glyphs"] = [
        {
          id: "glyph-4",
          hero_slug: "test",
          position: 0, // Invalid
          stat_type: "strength",
          stat_value: 50,
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "glyph-5",
          hero_slug: "test",
          position: 6, // Invalid
          stat_type: "armor",
          stat_value: 30,
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "glyph-6",
          hero_slug: "test",
          position: 2, // Valid
          stat_type: "health",
          stat_value: 100,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformGlyphs(glyphs);

      expect(result).toEqual([null, "health", null, null, null]);
    });

    it("should return 5-element array for empty glyphs and undefined for null", () => {
      expect(transformGlyphs([])).toEqual([null, null, null, null, null]);
      expect(transformGlyphs(undefined)).toBeUndefined();
    });
  });

  describe("transformEquipmentSlots", () => {
    it("should group equipment by quality and sort by position", () => {
      const equipmentSlots: CompleteHero["equipmentSlots"] = [
        {
          id: "slot-1",
          hero_slug: "test",
          quality: "white",
          slot_position: 2,
          equipment_slug: "item-2",
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "slot-2",
          hero_slug: "test",
          quality: "white",
          slot_position: 1,
          equipment_slug: "item-1",
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "slot-3",
          hero_slug: "test",
          quality: "green",
          slot_position: 1,
          equipment_slug: "green-item",
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformEquipmentSlots(equipmentSlots);

      expect(result).toEqual({
        white: ["item-1", "item-2"],
        green: ["green-item"],
      });
    });

    it("should filter out null equipment slugs", () => {
      const equipmentSlots: CompleteHero["equipmentSlots"] = [
        {
          id: "slot-4",
          hero_slug: "test",
          quality: "white",
          slot_position: 1,
          equipment_slug: "valid-item",
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "slot-5",
          hero_slug: "test",
          quality: "white",
          slot_position: 2,
          equipment_slug: null,
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = transformEquipmentSlots(equipmentSlots);

      expect(result).toEqual({
        white: ["valid-item"],
      });
    });

    it("should return undefined for empty equipment slots", () => {
      expect(transformEquipmentSlots([])).toBeUndefined();
      expect(transformEquipmentSlots(undefined)).toBeUndefined();
    });
  });

  describe("sortHeroRecords", () => {
    it("should sort heroes by name", () => {
      const heroes: HeroRecord[] = [
        {
          slug: "z",
          name: "Zeta",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: [],
          order_rank: 1,
          updated_on: "2023-01-01T00:00:00.000Z",
        },
        {
          slug: "a",
          name: "Alpha",
          class: "mage",
          faction: "nature",
          main_stat: "intelligence",
          attack_type: ["magic"],
          stone_source: [],
          order_rank: 2,
          updated_on: "2023-01-01T00:00:00.000Z",
        },
        {
          slug: "b",
          name: "Beta",
          class: "warrior",
          faction: "chaos",
          main_stat: "agility",
          attack_type: ["physical"],
          stone_source: [],
          order_rank: 3,
          updated_on: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = sortHeroRecords(heroes);

      expect(result.map((h) => h.name)).toEqual(["Alpha", "Beta", "Zeta"]);
    });
  });

  describe("createHeroesJsonString", () => {
    it("should create JSON string with empty arrays removed", () => {
      const heroes: HeroRecord[] = [
        {
          slug: "test",
          name: "Test",
          class: "tank",
          faction: "honor",
          main_stat: "strength",
          attack_type: ["physical"],
          stone_source: [], // Should be removed
          order_rank: 1,
          updated_on: "2023-01-01T00:00:00.000Z",
        },
      ];

      const result = createHeroesJsonString(heroes);
      const parsed = JSON.parse(result);

      expect(parsed[0]).not.toHaveProperty("stone_source");
      expect(parsed[0]).toHaveProperty("slug", "test");
      expect(parsed[0]).toHaveProperty("name", "Test");
    });
  });

  describe("Validation functions", () => {
    describe("validateHeroClass", () => {
      it("should validate hero class correctly", () => {
        expect(validateHeroClass("tank")).toBe("tank");
        expect(validateHeroClass("mage")).toBe("mage");
        expect(validateHeroClass("invalid")).toBe("tank"); // Default fallback
      });
    });

    describe("validateHeroFaction", () => {
      it("should validate hero faction correctly", () => {
        expect(validateHeroFaction("honor")).toBe("honor");
        expect(validateHeroFaction("chaos")).toBe("chaos");
        expect(validateHeroFaction("invalid")).toBe("honor"); // Default fallback
      });
    });

    describe("validateMainStat", () => {
      it("should validate main stat correctly", () => {
        expect(validateMainStat("strength")).toBe("strength");
        expect(validateMainStat("intelligence")).toBe("intelligence");
        expect(validateMainStat("invalid")).toBe("strength"); // Default fallback
      });
    });

    describe("validateAttackTypes", () => {
      it("should validate attack types correctly", () => {
        expect(validateAttackTypes(["physical"])).toEqual(["physical"]);
        expect(validateAttackTypes(["magic", "pure"])).toEqual([
          "magic",
          "pure",
        ]);
        expect(validateAttackTypes(["invalid"])).toEqual(["physical"]); // Default fallback
        expect(validateAttackTypes([])).toEqual(["physical"]); // Default fallback
      });
    });

    describe("validateTeamBuff", () => {
      it("should validate team buff correctly", () => {
        expect(validateTeamBuff("armor")).toBe("armor");
        expect(validateTeamBuff("physical attack")).toBe("physical attack");
        expect(validateTeamBuff("invalid")).toBe("armor"); // Default fallback
      });
    });

    describe("validateBookName", () => {
      it("should validate book name correctly", () => {
        expect(validateBookName("Tome of Arcane Knowledge")).toBe(
          "Tome of Arcane Knowledge"
        );
        expect(validateBookName("Defender's Covenant")).toBe(
          "Defender's Covenant"
        );
        expect(validateBookName("invalid")).toBe("Tome of Arcane Knowledge"); // Default fallback
      });
    });

    describe("validateSkinStat", () => {
      it("should validate skin stat correctly", () => {
        expect(validateSkinStat("strength")).toBe("strength");
        expect(validateSkinStat("magic attack")).toBe("magic attack");
        expect(validateSkinStat("invalid")).toBe("strength"); // Default fallback
      });
    });

    describe("validateGlyphStat", () => {
      it("should validate glyph stat correctly", () => {
        expect(validateGlyphStat("strength")).toBe("strength");
        expect(validateGlyphStat("armor")).toBe("armor");
        expect(validateGlyphStat("invalid")).toBe("strength"); // Default fallback
      });
    });
  });
});
