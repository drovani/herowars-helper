// ABOUTME: Tests for StaticHeroProvider — verifies hero data served from JSON files.
// ABOUTME: Covers findAll, findWithAllData, and findAllWithRelationships methods.

import { describe, expect, it } from "vitest";

import { StaticHeroProvider } from "../StaticHeroProvider";

describe("StaticHeroProvider", () => {
  let provider: StaticHeroProvider;

  provider = new StaticHeroProvider();

  describe("findAll", () => {
    it("returns a list of heroes without errors", async () => {
      const result = await provider.findAll();
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns heroes with required fields", async () => {
      const result = await provider.findAll();
      const heroes = result.data!;
      expect(heroes.length).toBeGreaterThan(0);
      const first = heroes[0];
      expect(first).toHaveProperty("slug");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("class");
      expect(first).toHaveProperty("faction");
      expect(first).toHaveProperty("main_stat");
      expect(first).toHaveProperty("order_rank");
    });

    it("returns heroes sorted by order_rank", async () => {
      const result = await provider.findAll();
      const heroes = result.data!;
      for (let i = 1; i < heroes.length; i++) {
        expect(heroes[i].order_rank).toBeGreaterThanOrEqual(
          heroes[i - 1].order_rank,
        );
      }
    });
  });

  describe("findWithAllData", () => {
    it("returns a CompleteHero for a known slug", async () => {
      const result = await provider.findWithAllData("aidan");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      const hero = result.data!;
      expect(hero.slug).toBe("aidan");
      expect(hero).toHaveProperty("artifacts");
      expect(hero).toHaveProperty("skins");
      expect(hero).toHaveProperty("glyphs");
      expect(hero).toHaveProperty("equipmentSlots");
    });

    it("returns arrays for relationship fields", async () => {
      const result = await provider.findWithAllData("aidan");
      const hero = result.data!;
      expect(Array.isArray(hero.artifacts)).toBe(true);
      expect(Array.isArray(hero.skins)).toBe(true);
      expect(Array.isArray(hero.glyphs)).toBe(true);
      expect(Array.isArray(hero.equipmentSlots)).toBe(true);
    });

    it("returns an error for an unknown slug", async () => {
      const result = await provider.findWithAllData("unknown-hero-slug");
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe("NOT_FOUND");
    });

    it("returns skins with required fields when hero has skins", async () => {
      const result = await provider.findWithAllData("aidan");
      const hero = result.data!;
      expect(hero.skins.length).toBeGreaterThan(0);
      const skin = hero.skins[0];
      expect(skin).toHaveProperty("hero_slug");
      expect(skin).toHaveProperty("name");
      expect(skin).toHaveProperty("stat_type");
    });

    it("returns glyphs sorted by position", async () => {
      const result = await provider.findWithAllData("aidan");
      const hero = result.data!;
      expect(hero.glyphs.length).toBeGreaterThan(0);
      for (let i = 1; i < hero.glyphs.length; i++) {
        expect(hero.glyphs[i].position).toBeGreaterThan(
          hero.glyphs[i - 1].position,
        );
      }
    });
  });

  describe("findAllWithRelationships", () => {
    it("returns all heroes with relationship data", async () => {
      const result = await provider.findAllWithRelationships();
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns heroes that have the relationship arrays", async () => {
      const result = await provider.findAllWithRelationships();
      const heroes = result.data!;
      expect(heroes.length).toBeGreaterThan(0);
      const hero = heroes[0];
      expect(Array.isArray(hero.artifacts)).toBe(true);
      expect(Array.isArray(hero.skins)).toBe(true);
      expect(Array.isArray(hero.glyphs)).toBe(true);
      expect(Array.isArray(hero.equipmentSlots)).toBe(true);
    });

    it("returns same count as findAll", async () => {
      const allResult = await provider.findAll();
      const withRelResult = await provider.findAllWithRelationships();
      expect(withRelResult.data!.length).toBe(allResult.data!.length);
    });
  });
});
