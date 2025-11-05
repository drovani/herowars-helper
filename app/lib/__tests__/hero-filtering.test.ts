// ABOUTME: Tests for hero filtering utility functions
// ABOUTME: Validates filtering by class, faction, stats, artifacts, and collection status

import { describe, test, expect } from "vitest";
import {
  filterHeroes,
  parseFilterParams,
  createFilterParams,
  countActiveFilters,
  getActiveFilterLabels,
  removeFilter,
  clearAllFilters,
} from "../hero-filtering";
import type { HeroRecord } from "~/data/hero.zod";

describe("hero-filtering", () => {
  const mockHeroes: Partial<HeroRecord>[] = [
    {
      slug: "astaroth",
      name: "Astaroth",
      class: "tank",
      faction: "chaos",
      main_stat: "strength",
      attack_type: ["physical"],
      stone_source: ["Campaign"],
      order_rank: 1,
      artifacts: {
        weapon: { name: "Doom Bringer", team_buff: "magic attack" },
        book: "Defender's Covenant",
      },
      glyphs: ["health", "armor", null, null, "strength"],
      skins: [
        { name: "Default", stat: "health", has_plus: false },
      ],
    },
    {
      slug: "galahad",
      name: "Galahad",
      class: "warrior",
      faction: "honor",
      main_stat: "strength",
      attack_type: ["physical"],
      stone_source: ["Arena Shop"],
      order_rank: 2,
      artifacts: {
        weapon: { name: "Lion's Mane", team_buff: "armor" },
        book: "Warrior's Code",
      },
      glyphs: ["physical attack", "crit hit chance", null, null, "strength"],
      skins: [
        { name: "Default", stat: "physical attack", has_plus: false },
      ],
    },
    {
      slug: "celeste",
      name: "Celeste",
      class: "support",
      faction: "nature",
      main_stat: "intelligence",
      attack_type: ["magic", "pure"],
      stone_source: ["Heroic Chest"],
      order_rank: 3,
      artifacts: {
        weapon: { name: "Star's Tears", team_buff: "magic defense" },
        book: "Tome of Arcane Knowledge",
      },
      glyphs: ["magic attack", "magic penetration", null, null, "intelligence"],
      skins: [
        { name: "Default", stat: "magic attack", has_plus: false },
      ],
    },
  ];

  describe("filterHeroes", () => {
    test("should filter by class", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        class: ["tank"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("astaroth");
    });

    test("should filter by multiple classes", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        class: ["tank", "warrior"],
      });

      expect(result).toHaveLength(2);
      expect(result.map((h) => h.slug)).toContain("astaroth");
      expect(result.map((h) => h.slug)).toContain("galahad");
    });

    test("should filter by faction", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        faction: ["chaos"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("astaroth");
    });

    test("should filter by main_stat", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        main_stat: ["intelligence"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("celeste");
    });

    test("should filter by attack_type", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        attack_type: ["magic"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("celeste");
    });

    test("should filter by stone_source", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        stone_source: ["Campaign"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("astaroth");
    });

    test("should filter by weapon_buff", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        weapon_buff: ["armor"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("galahad");
    });

    test("should filter by book", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        book: ["Warrior's Code"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("galahad");
    });

    test("should filter by glyph_stat", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        glyph_stat: ["magic penetration"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("celeste");
    });

    test("should filter by skin_stat", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        skin_stat: ["magic attack"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("celeste");
    });

    test("should filter by search query", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        search: "gala",
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("galahad");
    });

    test("should apply AND logic across multiple filters", () => {
      const result = filterHeroes(mockHeroes as HeroRecord[], {
        class: ["warrior", "tank"],
        main_stat: ["strength"],
      });

      expect(result).toHaveLength(2);
      expect(result.map((h) => h.slug)).toContain("astaroth");
      expect(result.map((h) => h.slug)).toContain("galahad");
    });

    test("should filter by in_collection", () => {
      const result = filterHeroes(
        mockHeroes as HeroRecord[],
        { in_collection: true },
        ["astaroth", "celeste"]
      );

      expect(result).toHaveLength(2);
      expect(result.map((h) => h.slug)).toContain("astaroth");
      expect(result.map((h) => h.slug)).toContain("celeste");
    });

    test("should filter by not_in_collection", () => {
      const result = filterHeroes(
        mockHeroes as HeroRecord[],
        { not_in_collection: true },
        ["astaroth"]
      );

      expect(result).toHaveLength(2);
      expect(result.map((h) => h.slug)).toContain("galahad");
      expect(result.map((h) => h.slug)).toContain("celeste");
    });
  });

  describe("parseFilterParams", () => {
    test("should parse filter params", () => {
      const params = new URLSearchParams("class=tank,warrior&faction=chaos");
      const result = parseFilterParams(params);

      expect(result.class).toEqual(["tank", "warrior"]);
      expect(result.faction).toEqual(["chaos"]);
    });

    test("should handle empty params", () => {
      const params = new URLSearchParams("");
      const result = parseFilterParams(params);

      expect(result).toEqual({});
    });

    test("should parse search param", () => {
      const params = new URLSearchParams("search=astaroth");
      const result = parseFilterParams(params);

      expect(result.search).toBe("astaroth");
    });

    test("should parse collection filters", () => {
      const params = new URLSearchParams("in_collection=true");
      const result = parseFilterParams(params);

      expect(result.in_collection).toBe(true);
    });
  });

  describe("createFilterParams", () => {
    test("should create filter params", () => {
      const params = createFilterParams({
        class: ["tank", "warrior"],
        faction: ["chaos"],
      });

      expect(params.get("class")).toBe("tank,warrior");
      expect(params.get("faction")).toBe("chaos");
    });

    test("should handle empty filters", () => {
      const params = createFilterParams({});

      expect(Array.from(params.keys())).toHaveLength(0);
    });
  });

  describe("countActiveFilters", () => {
    test("should count active filters", () => {
      const count = countActiveFilters({
        class: ["tank", "warrior"],
        faction: ["chaos"],
        in_collection: true,
      });

      expect(count).toBe(4); // 2 classes + 1 faction + 1 collection
    });

    test("should return 0 for no filters", () => {
      const count = countActiveFilters({});

      expect(count).toBe(0);
    });
  });

  describe("getActiveFilterLabels", () => {
    test("should get active filter labels", () => {
      const labels = getActiveFilterLabels({
        class: ["tank"],
        faction: ["chaos"],
      });

      expect(labels).toHaveLength(2);
      expect(labels[0]).toEqual({ key: "class", label: "Class", value: "tank" });
      expect(labels[1]).toEqual({ key: "faction", label: "Faction", value: "chaos" });
    });

    test("should return empty array for no filters", () => {
      const labels = getActiveFilterLabels({});

      expect(labels).toHaveLength(0);
    });
  });

  describe("removeFilter", () => {
    test("should remove specific filter value", () => {
      const result = removeFilter(
        { class: ["tank", "warrior"] },
        "class",
        "tank"
      );

      expect(result.class).toEqual(["warrior"]);
    });

    test("should remove filter key when last value removed", () => {
      const result = removeFilter({ class: ["tank"] }, "class", "tank");

      expect(result.class).toBeUndefined();
    });

    test("should remove boolean filters", () => {
      const result = removeFilter({ in_collection: true }, "in_collection");

      expect(result.in_collection).toBeUndefined();
    });
  });

  describe("clearAllFilters", () => {
    test("should return empty filters object", () => {
      const result = clearAllFilters();

      expect(result).toEqual({});
    });
  });
});
