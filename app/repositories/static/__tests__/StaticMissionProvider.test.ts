// ABOUTME: Tests for StaticMissionProvider — verifies mission/chapter data served from JSON files.
// ABOUTME: Covers findAll and findAllChapters methods.

import { describe, expect, it } from "vitest";

import { StaticMissionProvider } from "../StaticMissionProvider";

describe("StaticMissionProvider", () => {
  const provider = new StaticMissionProvider();

  describe("findAll", () => {
    it("returns a list of missions without errors", async () => {
      const result = await provider.findAll();
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns missions with required DB row fields", async () => {
      const result = await provider.findAll();
      const missions = result.data!;
      expect(missions.length).toBeGreaterThan(0);
      const first = missions[0];
      expect(first).toHaveProperty("slug");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("chapter_id");
      expect(first).toHaveProperty("level");
      expect(first).toHaveProperty("energy_cost");
      expect(first).toHaveProperty("hero_slug");
    });

    it("derives chapter_id from slug format 'chapter-level'", async () => {
      const result = await provider.findAll();
      const mission = result.data!.find((m) => m.slug === "1-1");
      expect(mission).toBeDefined();
      expect(mission!.chapter_id).toBe(1);
      expect(mission!.level).toBe(1);
    });

    it("derives chapter_id and level correctly for two-digit chapter", async () => {
      const result = await provider.findAll();
      const mission = result.data!.find((m) => m.slug === "10-1");
      expect(mission).toBeDefined();
      expect(mission!.chapter_id).toBe(10);
      expect(mission!.level).toBe(1);
    });

    it("returns missions sorted by chapter_id then level", async () => {
      const result = await provider.findAll();
      const missions = result.data!;
      for (let i = 1; i < missions.length; i++) {
        const prev = missions[i - 1];
        const curr = missions[i];
        if (prev.chapter_id === curr.chapter_id) {
          expect(curr.level).toBeGreaterThanOrEqual(prev.level ?? 0);
        } else {
          expect(curr.chapter_id).toBeGreaterThanOrEqual(prev.chapter_id);
        }
      }
    });

    it("accepts orderBy options matching live repository behavior", async () => {
      const result = await provider.findAll({
        orderBy: [
          { column: "chapter_id", ascending: true },
          { column: "level", ascending: true },
        ],
      });
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
    });
  });

  describe("findById", () => {
    it("returns a Mission row for a known slug", async () => {
      const result = await provider.findById("1-1");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.slug).toBe("1-1");
      expect(result.data!.chapter_id).toBe(1);
      expect(result.data!.level).toBe(1);
    });

    it("returns NOT_FOUND error for unknown slug", async () => {
      const result = await provider.findById("99-99");
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe("NOT_FOUND");
    });
  });

  describe("findChapterById", () => {
    it("returns chapter 1 with the correct title", async () => {
      const result = await provider.findChapterById(1);
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.id).toBe(1);
      expect(result.data!.title).toBe("Ruled by Fire");
    });

    it("returns NOT_FOUND error for unknown chapter id", async () => {
      const result = await provider.findChapterById(9999);
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe("NOT_FOUND");
    });
  });

  describe("findByHeroSlug", () => {
    it("returns missions for a hero that appears as a boss", async () => {
      // Find a hero slug that exists in mission data by looking at findAll results
      const allResult = await provider.findAll();
      const missionWithHero = allResult.data!.find((m) => m.hero_slug !== null);
      if (!missionWithHero || !missionWithHero.hero_slug) return; // skip if none

      const result = await provider.findByHeroSlug(missionWithHero.hero_slug);
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.length).toBeGreaterThan(0);
      expect(
        result.data!.every((m) => m.hero_slug === missionWithHero.hero_slug),
      ).toBe(true);
    });

    it("returns empty array for a hero slug that is not a boss in any mission", async () => {
      const result = await provider.findByHeroSlug("no-such-hero-xyz");
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe("findByCampaignSource", () => {
    it("returns missions for equipment that has campaign sources", async () => {
      // apprentices-mantle has campaign_sources: ["1-3", "2-4", ...]
      const result = await provider.findByCampaignSource("apprentices-mantle");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.length).toBeGreaterThan(0);
      // All returned missions should be from the campaign_sources list
      const slugs = result.data!.map((m) => m.slug);
      expect(slugs).toContain("1-3");
    });

    it("returns empty array for equipment with no campaign sources", async () => {
      const result = await provider.findByCampaignSource(
        "no-such-equipment-xyz",
      );
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe("findAllChapters", () => {
    it("returns a list of chapters without errors", async () => {
      const result = await provider.findAllChapters();
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns chapters with id and title fields", async () => {
      const result = await provider.findAllChapters();
      const chapters = result.data!;
      expect(chapters.length).toBeGreaterThan(0);
      expect(chapters[0]).toHaveProperty("id");
      expect(chapters[0]).toHaveProperty("title");
    });

    it("returns chapters sorted by id ascending", async () => {
      const result = await provider.findAllChapters();
      const chapters = result.data!;
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i].id).toBeGreaterThan(chapters[i - 1].id);
      }
    });

    it("returns chapter 1 as 'Ruled by Fire'", async () => {
      const result = await provider.findAllChapters();
      const chapter1 = result.data!.find((c) => c.id === 1);
      expect(chapter1).toBeDefined();
      expect(chapter1!.title).toBe("Ruled by Fire");
    });
  });
});
