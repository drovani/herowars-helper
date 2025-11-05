// ABOUTME: Tests for hero sorting utility functions
// ABOUTME: Validates sorting by name, order_rank, and direction toggles

import { describe, test, expect } from "vitest";
import {
  sortHeroes,
  parseSortParams,
  createSortParams,
  toggleSortDirection,
} from "../hero-sorting";
import type { Hero } from "~/repositories/types";

describe("hero-sorting", () => {
  const mockHeroes: Partial<Hero>[] = [
    { slug: "hero1", name: "Zephyr", order_rank: 3 },
    { slug: "hero2", name: "Astaroth", order_rank: 1 },
    { slug: "hero3", name: "Martha", order_rank: 2 },
  ];

  describe("sortHeroes", () => {
    test("should sort by name ascending", () => {
      const result = sortHeroes(mockHeroes as Hero[], {
        field: "name",
        direction: "asc",
      });

      expect(result[0].name).toBe("Astaroth");
      expect(result[1].name).toBe("Martha");
      expect(result[2].name).toBe("Zephyr");
    });

    test("should sort by name descending", () => {
      const result = sortHeroes(mockHeroes as Hero[], {
        field: "name",
        direction: "desc",
      });

      expect(result[0].name).toBe("Zephyr");
      expect(result[1].name).toBe("Martha");
      expect(result[2].name).toBe("Astaroth");
    });

    test("should sort by order_rank ascending", () => {
      const result = sortHeroes(mockHeroes as Hero[], {
        field: "order_rank",
        direction: "asc",
      });

      expect(result[0].order_rank).toBe(1);
      expect(result[1].order_rank).toBe(2);
      expect(result[2].order_rank).toBe(3);
    });

    test("should sort by order_rank descending", () => {
      const result = sortHeroes(mockHeroes as Hero[], {
        field: "order_rank",
        direction: "desc",
      });

      expect(result[0].order_rank).toBe(3);
      expect(result[1].order_rank).toBe(2);
      expect(result[2].order_rank).toBe(1);
    });

    test("should not mutate original array", () => {
      const original = [...mockHeroes] as Hero[];
      sortHeroes(original, { field: "name", direction: "asc" });

      expect(original[0].name).toBe("Zephyr");
    });
  });

  describe("parseSortParams", () => {
    test("should parse valid sort params", () => {
      const params = new URLSearchParams("sort=name&dir=desc");
      const result = parseSortParams(params);

      expect(result.field).toBe("name");
      expect(result.direction).toBe("desc");
    });

    test("should default to order_rank asc for invalid params", () => {
      const params = new URLSearchParams("sort=invalid&dir=invalid");
      const result = parseSortParams(params);

      expect(result.field).toBe("order_rank");
      expect(result.direction).toBe("asc");
    });

    test("should default to order_rank asc for missing params", () => {
      const params = new URLSearchParams("");
      const result = parseSortParams(params);

      expect(result.field).toBe("order_rank");
      expect(result.direction).toBe("asc");
    });
  });

  describe("createSortParams", () => {
    test("should create sort params", () => {
      const params = createSortParams({
        field: "name",
        direction: "desc",
      });

      expect(params.get("sort")).toBe("name");
      expect(params.get("dir")).toBe("desc");
    });
  });

  describe("toggleSortDirection", () => {
    test("should toggle direction for same field", () => {
      const result = toggleSortDirection(
        { field: "name", direction: "asc" },
        "name"
      );

      expect(result.field).toBe("name");
      expect(result.direction).toBe("desc");
    });

    test("should default to asc for new field", () => {
      const result = toggleSortDirection(
        { field: "name", direction: "desc" },
        "order_rank"
      );

      expect(result.field).toBe("order_rank");
      expect(result.direction).toBe("asc");
    });
  });
});
