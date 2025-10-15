// ABOUTME: Unit tests for artifact upgrade calculation utility functions
// ABOUTME: Tests calculation logic, edge cases, and input validation

import { describe, it, expect } from "vitest";
import {
  calculateArtifactUpgrade,
  type ArtifactUpgradeResult,
} from "../artifact-calculations";

describe("calculateArtifactUpgrade", () => {
  describe("valid calculations", () => {
    it("should calculate upgrades from level 1 to 100 (all colors needed)", () => {
      const result = calculateArtifactUpgrade(1);

      // Verify all colors have values
      expect(result.components.white).toBeGreaterThan(0);
      expect(result.components.green).toBeGreaterThan(0);
      expect(result.components.blue).toBeGreaterThan(0);
      expect(result.components.violet).toBeGreaterThan(0);
      expect(result.components.orange).toBeGreaterThan(0);

      // Verify all chests have values
      expect(result.chests.white).toBeGreaterThan(0);
      expect(result.chests.green).toBeGreaterThan(0);
      expect(result.chests.blue).toBeGreaterThan(0);
      expect(result.chests.violet).toBeGreaterThan(0);
      expect(result.chests.orange).toBeGreaterThan(0);

      // Verify total
      expect(result.totalChests).toBe(
        result.chests.white +
          result.chests.green +
          result.chests.blue +
          result.chests.violet +
          result.chests.orange,
      );
    });

    it("should calculate upgrades from level 80 to 100 (violet and orange only)", () => {
      const result = calculateArtifactUpgrade(80);

      // White, green, and blue should be 0
      expect(result.components.white).toBe(0);
      expect(result.components.green).toBe(0);
      expect(result.components.blue).toBe(0);
      expect(result.chests.white).toBe(0);
      expect(result.chests.green).toBe(0);
      expect(result.chests.blue).toBe(0);

      // Violet: levels 81-85 (5 levels)
      // Costs at indices 10-14: 40+41+42+43+44 = 210
      expect(result.components.violet).toBe(210);
      // 210 / 3 = 70
      expect(result.chests.violet).toBe(70);

      // Orange: levels 86-100 (15 levels)
      // Costs at indices 0-14: 30+31+32+33+34+35+36+37+38+39+40+41+42+43+44 = 555
      expect(result.components.orange).toBe(555);
      // 555 / 2 = 277.5, rounds up to 278
      expect(result.chests.orange).toBe(278);

      // Total
      expect(result.totalChests).toBe(348);
    });

    it("should return all zeros for level 100 (already maxed)", () => {
      const result = calculateArtifactUpgrade(100);

      expect(result.components.white).toBe(0);
      expect(result.components.green).toBe(0);
      expect(result.components.blue).toBe(0);
      expect(result.components.violet).toBe(0);
      expect(result.components.orange).toBe(0);

      expect(result.chests.white).toBe(0);
      expect(result.chests.green).toBe(0);
      expect(result.chests.blue).toBe(0);
      expect(result.chests.violet).toBe(0);
      expect(result.chests.orange).toBe(0);

      expect(result.totalChests).toBe(0);
    });

    it("should handle edge case at white-green boundary (level 25)", () => {
      const result = calculateArtifactUpgrade(25);

      // White should be 0 (level 25 is the end of white tier)
      expect(result.components.white).toBe(0);
      expect(result.chests.white).toBe(0);

      // Green and above should have values
      expect(result.components.green).toBeGreaterThan(0);
      expect(result.components.blue).toBeGreaterThan(0);
      expect(result.components.violet).toBeGreaterThan(0);
      expect(result.components.orange).toBeGreaterThan(0);
    });

    it("should handle edge case at green-blue boundary (level 50)", () => {
      const result = calculateArtifactUpgrade(50);

      // White and green should be 0
      expect(result.components.white).toBe(0);
      expect(result.components.green).toBe(0);
      expect(result.chests.white).toBe(0);
      expect(result.chests.green).toBe(0);

      // Blue and above should have values
      expect(result.components.blue).toBeGreaterThan(0);
      expect(result.components.violet).toBeGreaterThan(0);
      expect(result.components.orange).toBeGreaterThan(0);
    });

    it("should handle edge case at blue-violet boundary (level 70)", () => {
      const result = calculateArtifactUpgrade(70);

      // White, green, and blue should be 0
      expect(result.components.white).toBe(0);
      expect(result.components.green).toBe(0);
      expect(result.components.blue).toBe(0);
      expect(result.chests.white).toBe(0);
      expect(result.chests.green).toBe(0);
      expect(result.chests.blue).toBe(0);

      // Violet and orange should have values
      expect(result.components.violet).toBeGreaterThan(0);
      expect(result.components.orange).toBeGreaterThan(0);
    });

    it("should handle edge case at violet-orange boundary (level 85)", () => {
      const result = calculateArtifactUpgrade(85);

      // White, green, blue, and violet should be 0
      expect(result.components.white).toBe(0);
      expect(result.components.green).toBe(0);
      expect(result.components.blue).toBe(0);
      expect(result.components.violet).toBe(0);
      expect(result.chests.white).toBe(0);
      expect(result.chests.green).toBe(0);
      expect(result.chests.blue).toBe(0);
      expect(result.chests.violet).toBe(0);

      // Only orange should have values
      expect(result.components.orange).toBeGreaterThan(0);
      expect(result.chests.orange).toBeGreaterThan(0);
    });

    it("should correctly round up chest counts", () => {
      // Test a level where division doesn't result in a whole number
      const result = calculateArtifactUpgrade(86);

      // Orange: levels 87-100 (14 levels)
      // Costs: 31+32+33+34+35+36+37+38+39+40+41+42+43+44 = 525
      expect(result.components.orange).toBe(525);
      // 525 / 2 = 262.5, should round up to 263
      expect(result.chests.orange).toBe(263);
    });

    it("should calculate from level 1 with correct white tier components", () => {
      const result = calculateArtifactUpgrade(1);

      // White: levels 2-25 (24 levels, since level 1 is starting point)
      // Costs at indices 1-24: 3+5+7+9+11+13+15+17+19+21+23+25+27+29+31+33+35+37+39+41+43+45+47+49 = 624
      expect(result.components.white).toBe(624);
      // 624 / 12 = 52
      expect(result.chests.white).toBe(52);
    });
  });

  describe("input validation", () => {
    it("should throw error for level less than 1", () => {
      expect(() => calculateArtifactUpgrade(0)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
      expect(() => calculateArtifactUpgrade(-5)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
    });

    it("should throw error for level greater than 100", () => {
      expect(() => calculateArtifactUpgrade(101)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
      expect(() => calculateArtifactUpgrade(150)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
    });

    it("should throw error for non-integer values", () => {
      expect(() => calculateArtifactUpgrade(50.5)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
      expect(() => calculateArtifactUpgrade(25.1)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
    });

    it("should throw error for NaN", () => {
      expect(() => calculateArtifactUpgrade(NaN)).toThrow(
        "Current level must be an integer between 1 and 100 inclusive",
      );
    });
  });

  describe("result structure", () => {
    it("should return correct structure with all required properties", () => {
      const result = calculateArtifactUpgrade(50);

      expect(result).toHaveProperty("components");
      expect(result).toHaveProperty("chests");
      expect(result).toHaveProperty("totalChests");

      expect(result.components).toHaveProperty("white");
      expect(result.components).toHaveProperty("green");
      expect(result.components).toHaveProperty("blue");
      expect(result.components).toHaveProperty("violet");
      expect(result.components).toHaveProperty("orange");

      expect(result.chests).toHaveProperty("white");
      expect(result.chests).toHaveProperty("green");
      expect(result.chests).toHaveProperty("blue");
      expect(result.chests).toHaveProperty("violet");
      expect(result.chests).toHaveProperty("orange");

      expect(typeof result.totalChests).toBe("number");
    });

    it("should have totalChests equal to sum of all chest values", () => {
      const levels = [1, 25, 50, 70, 85, 90];

      for (const level of levels) {
        const result = calculateArtifactUpgrade(level);
        const sum =
          result.chests.white +
          result.chests.green +
          result.chests.blue +
          result.chests.violet +
          result.chests.orange;

        expect(result.totalChests).toBe(sum);
      }
    });
  });
});
