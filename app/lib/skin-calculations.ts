// ABOUTME: Utility functions for calculating skin upgrade requirements
// ABOUTME: Includes calculations for skin stones and chests needed to upgrade skins from current level to level 60

import skinData from "~/data/skin-upgrades.json";

export type SkinType = "default" | "champion" | "winter" | "other";

export interface SkinUpgradeResult {
  stones: number;
  smallChests: number;
  largeChests: number;
}

/**
 * Calculates the skin stones and chests needed to upgrade a skin from current level to level 60
 * @param {SkinType} skinType - Type of skin (default, champion, winter, or other)
 * @param {number} currentLevel - Current skin level (0-60)
 * @returns {SkinUpgradeResult} Object containing stone and chest requirements
 * @throws {Error} If currentLevel is not a valid integer between 0 and 60
 */
export function calculateSkinUpgrade(skinType: SkinType, currentLevel: number): SkinUpgradeResult {
  // Validate input
  if (!Number.isInteger(currentLevel) || currentLevel < 0 || currentLevel > 60) {
    throw new Error("Current level must be an integer between 0 and 60 inclusive");
  }

  // If level is 0 (not unlocked) or already at max level, return zeros
  if (currentLevel === 0 || currentLevel === 60) {
    return {
      stones: 0,
      smallChests: 0,
      largeChests: 0,
    };
  }

  const skinTypeData = skinData.skinTypes[skinType];
  const costs = skinTypeData.costs;

  // Sum costs from current level + 1 to level 60
  let totalStones = 0;
  for (let level = currentLevel + 1; level <= 60; level++) {
    totalStones += costs[level - 1];
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
