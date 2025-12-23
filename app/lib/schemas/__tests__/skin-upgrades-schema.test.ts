// ABOUTME: Tests for skin upgrades data schema validation
// ABOUTME: Ensures Zod schema correctly validates skin-upgrades.json structure

import { describe, expect, it } from "vitest";
import { validateSkinUpgradesData, SkinUpgradesDataSchema } from "../skin-upgrades-schema";
import skinData from "~/data/skin-upgrades.json";

describe("SkinUpgradesDataSchema", () => {
  describe("Valid data", () => {
    it("should validate actual skin-upgrades.json data", () => {
      expect(() => validateSkinUpgradesData(skinData)).not.toThrow();
    });

    it("should accept valid skin type data", () => {
      const validData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60,
            costs: new Array(61).fill(100),
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          winter: {
            name: "Winter",
            maxLevel: 60,
            costs: new Array(60).fill(150),
          },
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
        otherSkinNames: ["Beach", "Stellar"],
      };

      expect(() => validateSkinUpgradesData(validData)).not.toThrow();
    });
  });

  describe("Invalid data", () => {
    it("should reject data missing skinTypes", () => {
      const invalidData = {
        otherSkinNames: ["Beach"],
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });

    it("should reject data missing otherSkinNames", () => {
      const invalidData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60,
            costs: new Array(61).fill(100),
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          winter: {
            name: "Winter",
            maxLevel: 60,
            costs: new Array(60).fill(150),
          },
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });

    it("should reject skin type with maxLevel not equal to 60", () => {
      const invalidData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 100, // Wrong!
            costs: new Array(61).fill(100),
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          winter: {
            name: "Winter",
            maxLevel: 60,
            costs: new Array(60).fill(150),
          },
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
        otherSkinNames: ["Beach"],
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });

    it("should reject skin type with costs array too short", () => {
      const invalidData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60,
            costs: new Array(30).fill(100), // Too short!
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          winter: {
            name: "Winter",
            maxLevel: 60,
            costs: new Array(60).fill(150),
          },
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
        otherSkinNames: ["Beach"],
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });

    it("should reject skin type with negative costs", () => {
      const invalidData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60,
            costs: new Array(61).fill(-10), // Negative!
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          winter: {
            name: "Winter",
            maxLevel: 60,
            costs: new Array(60).fill(150),
          },
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
        otherSkinNames: ["Beach"],
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });

    it("should reject empty otherSkinNames array", () => {
      const invalidData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60,
            costs: new Array(61).fill(100),
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          winter: {
            name: "Winter",
            maxLevel: 60,
            costs: new Array(60).fill(150),
          },
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
        otherSkinNames: [], // Empty!
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });

    it("should reject missing required skin type", () => {
      const invalidData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60,
            costs: new Array(61).fill(100),
          },
          champion: {
            name: "Champion",
            maxLevel: 60,
            costs: new Array(60).fill(200),
          },
          // Missing winter!
          other: {
            name: "Other",
            maxLevel: 60,
            costs: new Array(60).fill(180),
          },
        },
        otherSkinNames: ["Beach"],
      };

      expect(() => validateSkinUpgradesData(invalidData)).toThrow();
    });
  });

  describe("Type inference", () => {
    it("should infer correct TypeScript types", () => {
      const validData = {
        skinTypes: {
          default: {
            name: "Default",
            maxLevel: 60 as const,
            costs: new Array(61).fill(35),
          },
          champion: {
            name: "Champion",
            maxLevel: 60 as const,
            costs: new Array(60).fill(70),
          },
          winter: {
            name: "Winter",
            maxLevel: 60 as const,
            costs: new Array(60).fill(78),
          },
          other: {
            name: "Other",
            maxLevel: 60 as const,
            costs: new Array(60).fill(65),
          },
        },
        otherSkinNames: ["Beach", "Stellar"],
      };

      const result = SkinUpgradesDataSchema.parse(validData);

      // Type assertions to verify inference
      expect(result.skinTypes.default.maxLevel).toBe(60);
      expect(result.skinTypes.champion.name).toBe("Champion");
      expect(Array.isArray(result.skinTypes.winter.costs)).toBe(true);
      expect(Array.isArray(result.otherSkinNames)).toBe(true);
    });
  });
});
