// ABOUTME: Integration tests for hero editing covering hero updates and related data management
// ABOUTME: Tests artifact, skin, glyph, and equipment updates with proper data separation

import { describe, it, expect } from "vitest";
import { HeroMutationSchema } from "~/data/hero.zod";

describe("Hero Edit Integration - Data Validation", () => {
  describe("HeroMutationSchema validation", () => {
    it("should validate hero with all related data", () => {
      const heroData = {
        slug: "oya",
        artifacts: {
          weapon: {
            name: "Ancestor's Sword",
            team_buff: "crit hit chance",
          },
          book: "Warrior's Code",
          ring: null,
        },
        skins: [
          { name: "Default Skin", stat: "strength", has_plus: false },
          { name: "Mythical", stat: "physical attack", has_plus: false },
        ],
        items: {
          white: [
            "wooden-shield",
            "travellers-shoes",
            "orcish-knuckles",
            "travellers-shoes",
            "sledgehammer",
            "lucky-dice",
          ],
        },
        glyphs: [
          "physical attack",
          "health",
          "crit hit chance",
          "magic defense",
          "strength",
        ],
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.artifacts).toBeDefined();
        expect(result.data.skins).toHaveLength(2);
        expect(result.data.glyphs).toHaveLength(5);
        expect(result.data.items?.white).toHaveLength(6);
      }
    });


    it("should reject invalid hero slug type", () => {
      const heroData = {
        slug: 123,
        artifacts: {
          weapon: { name: "Sword", team_buff: "armor" },
          book: "Wisdom Tome",
          ring: null,
        },
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(false);
    });

    it("should reject equipment list with wrong length", () => {
      const heroData = {
        slug: "oya",
        items: {
          white: ["wooden-shield", "item2", "item3"],
        },
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(false);
    });

    it("should reject glyphs with wrong length", () => {
      const heroData = {
        slug: "oya",
        glyphs: ["physical attack", "health"],
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid stat in glyphs", () => {
      const heroData = {
        slug: "oya",
        glyphs: [
          "physical attack",
          "health",
          "invalid-stat",
          "magic defense",
          "strength",
        ],
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid team buff in weapon", () => {
      const heroData = {
        slug: "oya",
        artifacts: {
          weapon: {
            name: "Sword",
            team_buff: "invalid-buff",
          },
          book: "Wisdom Tome",
          ring: null,
        },
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(false);
    });

    it("should reject invalid skin stat", () => {
      const heroData = {
        slug: "oya",
        skins: [{ name: "Default Skin", stat: "invalid-stat", has_plus: false }],
      };

      const result = HeroMutationSchema.safeParse(heroData);

      expect(result.success).toBe(false);
    });
  });
});
