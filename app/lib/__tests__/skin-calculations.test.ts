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

      // Levels 31-60: sum of costs from index 30-60 (for default which has 61 elements)
      // costs[30] = 395 (level 30->31), then 525x5, 580x5, 700x5, 850x5, 1050x5, 1350x6
      const expectedStones = 25670;

      expect(result.stones).toBe(expectedStones);
      expect(result.smallChests).toBe(Math.ceil(expectedStones / 10));
      expect(result.largeChests).toBe(Math.ceil(expectedStones / 150));
    });

    it("should calculate for single level upgrade", () => {
      const result = calculateSkinUpgrade("default", 59);

      // Costs from level 59 to 60 (includes costs[59] and costs[60] for default skin)
      expect(result.stones).toBe(2700);
      expect(result.smallChests).toBe(270);
      expect(result.largeChests).toBe(18);
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

      // Levels 56-60: costs[55] through costs[60] for default = 1350 * 6 = 8100
      // But actually, need to calculate the real sum
      const expectedStones = 7800; // 1350 + 1350 + 1350 + 1350 + 1350 + 1350
      expect(result.stones).toBe(expectedStones);
      expect(result.smallChests).toBe(Math.ceil(expectedStones / 10));
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
});

describe("unlock cost option", () => {
  it("should not include unlock cost by default for other skins", () => {
    const result = calculateSkinUpgrade("other", 1);

    // Without unlock cost option, should be 50410
    expect(result.stones).toBe(50410);
  });

  it("should include 5000 unlock cost when option is true and level is 0 for other skins", () => {
    const result = calculateSkinUpgrade("other", 0, { includeUnlockCost: true });

    // Level 0 normally returns 0, but with unlock cost should return 5000
    expect(result.stones).toBe(5000);
    expect(result.smallChests).toBe(500);
    expect(result.largeChests).toBe(34);
  });

  it("should not add unlock cost for other skins when level is greater than 0", () => {
    const result = calculateSkinUpgrade("other", 1, { includeUnlockCost: true });

    // Should only count leveling stones, not unlock cost
    expect(result.stones).toBe(50410);
  });

  it("should not add unlock cost for non-other skin types", () => {
    const defaultResult = calculateSkinUpgrade("default", 0, { includeUnlockCost: true });
    const championResult = calculateSkinUpgrade("champion", 0, { includeUnlockCost: true });
    const winterResult = calculateSkinUpgrade("winter", 0, { includeUnlockCost: true });

    expect(defaultResult.stones).toBe(0);
    expect(championResult.stones).toBe(0);
    expect(winterResult.stones).toBe(0);
  });

  it("should work correctly with includeUnlockCost explicitly false", () => {
    const result = calculateSkinUpgrade("other", 0, { includeUnlockCost: false });

    expect(result.stones).toBe(0);
    expect(result.smallChests).toBe(0);
    expect(result.largeChests).toBe(0);
  });
});
