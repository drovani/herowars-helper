// ABOUTME: Utility functions for calculating artifact upgrade requirements
// ABOUTME: Includes calculations for components and chests needed to upgrade artifacts from current level to level 100

import artifactData from "~/data/artifact-upgrades.json";

export type ColorTier = "white" | "green" | "blue" | "violet" | "orange";

export interface ArtifactUpgradeResult {
  components: Record<ColorTier, number>;
  chests: Record<ColorTier, number>;
  totalChests: number;
}

/**
 * Calculates the components and chests needed to upgrade an artifact from current level to level 100
 * @param {number} currentLevel - Current artifact level (1-100)
 * @returns {ArtifactUpgradeResult} Object containing component and chest requirements by color
 * @throws {Error} If currentLevel is not a valid integer between 1 and 100
 */
export function calculateArtifactUpgrade(
  currentLevel: number,
): ArtifactUpgradeResult {
  // Validate input
  if (
    !Number.isInteger(currentLevel) ||
    currentLevel < 1 ||
    currentLevel > 100
  ) {
    throw new Error(
      "Current level must be an integer between 1 and 100 inclusive",
    );
  }

  // If already at max level, return all zeros
  if (currentLevel === 100) {
    return {
      components: {
        white: 0,
        green: 0,
        blue: 0,
        violet: 0,
        orange: 0,
      },
      chests: {
        white: 0,
        green: 0,
        blue: 0,
        violet: 0,
        orange: 0,
      },
      totalChests: 0,
    };
  }

  const result: ArtifactUpgradeResult = {
    components: {
      white: 0,
      green: 0,
      blue: 0,
      violet: 0,
      orange: 0,
    },
    chests: {
      white: 0,
      green: 0,
      blue: 0,
      violet: 0,
      orange: 0,
    },
    totalChests: 0,
  };

  // Calculate for each color tier
  const colors: ColorTier[] = ["white", "green", "blue", "violet", "orange"];

  for (const color of colors) {
    const range = artifactData.levelRanges[color];
    const costs = artifactData.upgradeCosts[color];
    const chestYield = artifactData.chestYields[color];

    // Skip this tier if current level is already past it
    if (currentLevel > range.end) {
      continue;
    }

    // Determine which levels in this tier we need to upgrade through
    // If currentLevel is 80, we need to upgrade levels 81-85 in violet tier (levels 71-85)
    // Array index for level N in a tier starting at S is: N - S
    const startLevel = Math.max(currentLevel + 1, range.start);
    const endLevel = range.end;

    // Calculate total components needed for this tier
    let componentsNeeded = 0;
    for (let level = startLevel; level <= endLevel; level++) {
      const arrayIndex = level - range.start;
      componentsNeeded += costs[arrayIndex];
    }

    result.components[color] = componentsNeeded;

    // Calculate chests needed (always round up)
    if (componentsNeeded > 0) {
      const chestsNeeded = Math.ceil(componentsNeeded / chestYield);
      result.chests[color] = chestsNeeded;
      result.totalChests += chestsNeeded;
    }
  }

  return result;
}
