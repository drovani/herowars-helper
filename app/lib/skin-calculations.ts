// ABOUTME: Utility functions for calculating skin upgrade requirements
// ABOUTME: Includes calculations for skin stones and chests needed to upgrade skins from current level to level 60

import skinData from "~/data/skin-upgrades.json";

export type SkinType = "default" | "champion" | "winter" | "other";

export interface SkinUpgradeResult {
  stones: number;
  smallChests: number;
  largeChests: number;
}

export interface SkinUpgradeOptions {
  includeUnlockCost?: boolean;
}

/**
 * Calculates the skin stones and chests needed to upgrade a skin from current level to level 60
 * @param {SkinType} skinType - Type of skin (default, champion, winter, or other)
 * @param {number} currentLevel - Current skin level (0-60)
 * @param {SkinUpgradeOptions} options - Optional settings for calculation
 * @returns {SkinUpgradeResult} Object containing stone and chest requirements
 * @throws {Error} If currentLevel is not a valid integer between 0 and 60
 */
export function calculateSkinUpgrade(
  skinType: SkinType,
  currentLevel: number,
  options: SkinUpgradeOptions = {}
): SkinUpgradeResult {
  // Validate input
  if (!Number.isInteger(currentLevel) || currentLevel < 0 || currentLevel > 60) {
    throw new Error("Current level must be an integer between 0 and 60 inclusive");
  }

  const { includeUnlockCost = false } = options;

  // Handle unlock cost for "other" skins at level 0
  if (currentLevel === 0) {
    if (skinType === "other" && includeUnlockCost) {
      // Return just the unlock cost
      return {
        stones: 5000,
        smallChests: Math.ceil(5000 / 10),
        largeChests: Math.ceil(5000 / 150),
      };
    }
    // For all other cases at level 0, return zeros
    return {
      stones: 0,
      smallChests: 0,
      largeChests: 0,
    };
  }

  // Already at max level
  if (currentLevel === 60) {
    return {
      stones: 0,
      smallChests: 0,
      largeChests: 0,
    };
  }

  const skinTypeData = skinData.skinTypes[skinType];
  const costs = skinTypeData.costs;

  // Sum costs from current level to level 60
  // costs array: index i = cost to upgrade from level i to level i+1
  // Array length varies: default has 61 elements (0-60), others have 60 (0-59)
  // When currentLevel=1, sum from index currentLevel to the last valid index
  let totalStones = 0;
  for (let level = currentLevel; level < costs.length; level++) {
    totalStones += costs[level];
  }

  // Calculate chest counts (hardcoded yields)
  // Small chests: 10 stones each
  const smallChests = Math.ceil(totalStones / 10);
  // Large chests: 150 stones each
  const largeChests = Math.ceil(totalStones / 150);

  return {
    stones: totalStones,
    smallChests,
    largeChests,
  };
}

/**
 * Get the list of "other" skin names for display purposes
 * @returns {string[]} Array of other skin names
 */
export function getOtherSkinNames(): string[] {
  return skinData.otherSkinNames;
}
