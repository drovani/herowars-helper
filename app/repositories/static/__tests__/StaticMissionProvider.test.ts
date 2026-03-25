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
