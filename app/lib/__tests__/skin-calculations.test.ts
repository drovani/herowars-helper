// ABOUTME: Unit tests for skin upgrade calculation utility functions
// ABOUTME: Tests calculation logic, edge cases, and input validation

import { describe, expect, it } from "vitest";
import { calculateSkinUpgrade, getOtherSkinNames } from "../skin-calculations";

describe("calculateSkinUpgrade", () => {
  describe("valid calculations", () => {
    it("should calculate upgrades from level 1 to 60 for default skin", () => {
      const result = calculateSkinUpgrade("default", 1);

      expect(result.stones).toBe(30825);
      // 30825 / 10 = 3082.5, round up to 3083
      expect(result.smallChests).toBe(3083);
      // 30825 / 150 = 205.5, round up to 206
      expect(result.largeChests).toBe(206);
    });

    it("should calculate upgrades from level 1 to 60 for champion skin", () => {
      const result = calculateSkinUpgrade("champion", 1);

      expect(result.stones).toBe(54330);
      // 54330 / 10 = 5433
      expect(result.smallChests).toBe(5433);
      // 54330 / 150 = 362.2, round up to 363
      expect(result.largeChests).toBe(363);
    });

    it("should calculate upgrades from level 1 to 60 for winter skin", () => {
      const result = calculateSkinUpgrade("winter", 1);

      expect(result.stones).toBe(53412);
      // 53412 / 10 = 5341.2, round up to 5342
      expect(result.smallChests).toBe(5342);
      // 53412 / 150 = 356.08, round up to 357
      expect(result.largeChests).toBe(357);
    });

    it("should calculate upgrades from level 1 to 60 for other skin", () => {
      const result = calculateSkinUpgrade("other", 1);

      // Note: This doesn't include the 5000 unlock cost per wiki
      expect(result.stones).toBe(50410);
      // 50410 / 10 = 5041
      expect(result.smallChests).toBe(5041);
      // 50410 / 150 = 336.07, round up to 337
      expect(result.largeChests).toBe(337);
    });

    it("should calculate partial upgrades from level 30 to 60", () => {
      const result = calculateSkinUpgrade("default", 30);

      // Levels 31-60: sum of costs from index 30-59
      let expectedStones = 0;
      const costs = [
        525, 525, 525, 525, 525, 580, 580, 580, 580, 580, 700, 700, 700, 700, 700, 850, 850, 850, 850, 850, 1050, 1050,
        1050, 1050, 1050, 1350, 1350, 1350, 1350, 1350,
      ];
      costs.forEach((cost) => (expectedStones += cost));

      expect(result.stones).toBe(expectedStones);
      expect(result.smallChests).toBe(Math.ceil(expectedStones / 10));
      expect(result.largeChests).toBe(Math.ceil(expectedStones / 150));
    });

    it("should calculate for single level upgrade", () => {
      const result = calculateSkinUpgrade("default", 59);

      // Only level 60 cost
      expect(result.stones).toBe(1350);
      expect(result.smallChests).toBe(135);
      expect(result.largeChests).toBe(9);
    });
  });

  describe("edge cases", () => {
    it("should return zeros for level 0 (not unlocked)", () => {
      const result = calculateSkinUpgrade("default", 0);

      expect(result.stones).toBe(0);
      expect(result.smallChests).toBe(0);
      expect(result.largeChests).toBe(0);
    });

    it("should return zeros for level 60 (already maxed)", () => {
      const result = calculateSkinUpgrade("champion", 60);

      expect(result.stones).toBe(0);
      expect(result.smallChests).toBe(0);
      expect(result.largeChests).toBe(0);
    });
  });

  describe("input validation", () => {
    it("should throw error for level less than 0", () => {
      expect(() => calculateSkinUpgrade("default", -1)).toThrow(
        "Current level must be an integer between 0 and 60 inclusive"
      );
      expect(() => calculateSkinUpgrade("default", -5)).toThrow(
        "Current level must be an integer between 0 and 60 inclusive"
      );
    });

    it("should throw error for level greater than 60", () => {
      expect(() => calculateSkinUpgrade("default", 61)).toThrow(
        "Current level must be an integer between 0 and 60 inclusive"
      );
      expect(() => calculateSkinUpgrade("default", 100)).toThrow(
        "Current level must be an integer between 0 and 60 inclusive"
      );
    });

    it("should throw error for non-integer values", () => {
      expect(() => calculateSkinUpgrade("default", 30.5)).toThrow(
        "Current level must be an integer between 0 and 60 inclusive"
      );
      expect(() => calculateSkinUpgrade("default", 25.9)).toThrow(
        "Current level must be an integer between 0 and 60 inclusive"
      );
    });
  });

  describe("chest calculations", () => {
    it("should correctly round up small chest counts", () => {
      // Test a level where division doesn't result in a whole number
      const result = calculateSkinUpgrade("default", 55);

      // Levels 56-60: 1350 * 5 = 6750
      expect(result.stones).toBe(6750);
      // 6750 / 10 = 675 (exact)
      expect(result.smallChests).toBe(675);
    });

    it("should correctly round up large chest counts", () => {
      const result = calculateSkinUpgrade("champion", 1);

      // 54330 / 150 = 362.2, should round up to 363
      expect(result.largeChests).toBe(363);
    });
  });
});

describe("getOtherSkinNames", () => {
  it("should return array of other skin names", () => {
    const names = getOtherSkinNames();

    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain("Beach");
    expect(names).toContain("Stellar");
    expect(names).toContain("Masquerade");
  });

  it("should return names in alphabetical order", () => {
    const names = getOtherSkinNames();
    const sorted = [...names].sort();

    expect(names).toEqual(sorted);
  });
});
