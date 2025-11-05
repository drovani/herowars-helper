// ABOUTME: Utility functions for filtering heroes by multiple criteria with AND logic
// ABOUTME: Provides filtering by class, faction, stats, artifacts, and user collection status

import type { Hero } from "~/repositories/types";
import type { HeroRecord } from "~/data/hero.zod";
import type {
  HeroClass,
  HeroFaction,
  HeroMainStat,
  AttackType,
  StoneSource,
  WeaponTeamBuff,
  ArtifactBookOption,
  HeroStat,
} from "~/data/ReadonlyArrays";

/**
 * Type guard to check if a hero has HeroRecord properties (artifacts, glyphs, skins)
 */
function isHeroRecord(hero: Hero | HeroRecord): hero is HeroRecord {
  return "artifacts" in hero || "glyphs" in hero || "skins" in hero;
}

export interface HeroFilters {
  // Basic filters
  class?: HeroClass[];
  faction?: HeroFaction[];
  main_stat?: HeroMainStat[];
  attack_type?: AttackType[];

  // Advanced filters
  stone_source?: StoneSource[];
  weapon_buff?: WeaponTeamBuff[];
  book?: ArtifactBookOption[];
  glyph_stat?: HeroStat[];
  skin_stat?: HeroStat[];

  // Collection filter
  in_collection?: boolean;
  not_in_collection?: boolean;

  // Search query
  search?: string;
}

/**
 * Filter heroes based on the provided filter criteria
 * All filters use AND logic (hero must match all active filters)
 */
export function filterHeroes<T extends Hero | HeroRecord>(
  heroes: T[],
  filters: HeroFilters,
  userCollection?: string[]
): T[] {
  return heroes.filter((hero) => {
    // Search filter (name contains query, case insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!hero.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Basic filters
    if (filters.class && filters.class.length > 0) {
      if (!filters.class.includes(hero.class as HeroClass)) {
        return false;
      }
    }

    if (filters.faction && filters.faction.length > 0) {
      if (!filters.faction.includes(hero.faction as HeroFaction)) {
        return false;
      }
    }

    if (filters.main_stat && filters.main_stat.length > 0) {
      if (!filters.main_stat.includes(hero.main_stat as HeroMainStat)) {
        return false;
      }
    }

    if (filters.attack_type && filters.attack_type.length > 0) {
      const heroAttackTypes = hero.attack_type || [];
      const hasMatchingAttackType = filters.attack_type.some((type) =>
        heroAttackTypes.includes(type)
      );
      if (!hasMatchingAttackType) {
        return false;
      }
    }

    // Advanced filters - stone source
    if (filters.stone_source && filters.stone_source.length > 0) {
      const heroStoneSources = (hero.stone_source as string[]) || [];
      const hasMatchingStoneSource = filters.stone_source.some((source) =>
        heroStoneSources.includes(source)
      );
      if (!hasMatchingStoneSource) {
        return false;
      }
    }

    // Advanced filters - artifacts (only for HeroRecord type with artifacts)
    // Use type guard to safely check if hero has HeroRecord properties
    if (filters.weapon_buff && filters.weapon_buff.length > 0) {
      if (!isHeroRecord(hero)) {
        return false;
      }

      const weaponBuffs: string[] = [];
      if (hero.artifacts?.weapon?.team_buff) {
        weaponBuffs.push(hero.artifacts.weapon.team_buff);
      }
      if (hero.artifacts?.weapon?.team_buff_secondary) {
        weaponBuffs.push(hero.artifacts.weapon.team_buff_secondary);
      }

      const hasMatchingWeaponBuff = filters.weapon_buff.some((buff) =>
        weaponBuffs.includes(buff)
      );
      if (!hasMatchingWeaponBuff) {
        return false;
      }
    }

    if (filters.book && filters.book.length > 0) {
      if (!isHeroRecord(hero)) {
        return false;
      }

      const heroBook = hero.artifacts?.book;
      if (!heroBook || !filters.book.includes(heroBook)) {
        return false;
      }
    }

    // Advanced filters - glyphs
    if (filters.glyph_stat && filters.glyph_stat.length > 0) {
      if (!isHeroRecord(hero)) {
        return false;
      }

      const heroGlyphs = (hero.glyphs || []).filter(
        (g): g is string => g !== null && g !== undefined
      );
      const hasMatchingGlyph = filters.glyph_stat.some((stat) =>
        heroGlyphs.includes(stat)
      );
      if (!hasMatchingGlyph) {
        return false;
      }
    }

    // Advanced filters - skins
    if (filters.skin_stat && filters.skin_stat.length > 0) {
      if (!isHeroRecord(hero)) {
        return false;
      }

      const heroSkinStats = hero.skins?.map((skin) => skin.stat) || [];
      const hasMatchingSkin = filters.skin_stat.some((stat) =>
        heroSkinStats.includes(stat)
      );
      if (!hasMatchingSkin) {
        return false;
      }
    }

    // Collection filters
    if (userCollection) {
      const isInCollection = userCollection.includes(hero.slug);

      if (filters.in_collection && !isInCollection) {
        return false;
      }

      if (filters.not_in_collection && isInCollection) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Parse filter parameters from URL search params
 */
export function parseFilterParams(searchParams: URLSearchParams): HeroFilters {
  const filters: HeroFilters = {};

  // Search query
  const search = searchParams.get("search");
  if (search) {
    filters.search = search;
  }

  // Basic filters (can be comma-separated lists)
  const classParam = searchParams.get("class");
  if (classParam) {
    filters.class = classParam.split(",") as HeroClass[];
  }

  const factionParam = searchParams.get("faction");
  if (factionParam) {
    filters.faction = factionParam.split(",") as HeroFaction[];
  }

  const mainStatParam = searchParams.get("main_stat");
  if (mainStatParam) {
    filters.main_stat = mainStatParam.split(",") as HeroMainStat[];
  }

  const attackTypeParam = searchParams.get("attack_type");
  if (attackTypeParam) {
    filters.attack_type = attackTypeParam.split(",") as AttackType[];
  }

  // Advanced filters
  const stoneSourceParam = searchParams.get("stone_source");
  if (stoneSourceParam) {
    filters.stone_source = stoneSourceParam.split(",") as StoneSource[];
  }

  const weaponBuffParam = searchParams.get("weapon_buff");
  if (weaponBuffParam) {
    filters.weapon_buff = weaponBuffParam.split(",") as WeaponTeamBuff[];
  }

  const bookParam = searchParams.get("book");
  if (bookParam) {
    filters.book = bookParam.split(",") as ArtifactBookOption[];
  }

  const glyphStatParam = searchParams.get("glyph_stat");
  if (glyphStatParam) {
    filters.glyph_stat = glyphStatParam.split(",") as HeroStat[];
  }

  const skinStatParam = searchParams.get("skin_stat");
  if (skinStatParam) {
    filters.skin_stat = skinStatParam.split(",") as HeroStat[];
  }

  // Collection filters
  const inCollectionParam = searchParams.get("in_collection");
  if (inCollectionParam === "true") {
    filters.in_collection = true;
  }

  const notInCollectionParam = searchParams.get("not_in_collection");
  if (notInCollectionParam === "true") {
    filters.not_in_collection = true;
  }

  return filters;
}

/**
 * Create URL search params for the current filter options
 */
export function createFilterParams(filters: HeroFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.class && filters.class.length > 0) {
    params.set("class", filters.class.join(","));
  }

  if (filters.faction && filters.faction.length > 0) {
    params.set("faction", filters.faction.join(","));
  }

  if (filters.main_stat && filters.main_stat.length > 0) {
    params.set("main_stat", filters.main_stat.join(","));
  }

  if (filters.attack_type && filters.attack_type.length > 0) {
    params.set("attack_type", filters.attack_type.join(","));
  }

  if (filters.stone_source && filters.stone_source.length > 0) {
    params.set("stone_source", filters.stone_source.join(","));
  }

  if (filters.weapon_buff && filters.weapon_buff.length > 0) {
    params.set("weapon_buff", filters.weapon_buff.join(","));
  }

  if (filters.book && filters.book.length > 0) {
    params.set("book", filters.book.join(","));
  }

  if (filters.glyph_stat && filters.glyph_stat.length > 0) {
    params.set("glyph_stat", filters.glyph_stat.join(","));
  }

  if (filters.skin_stat && filters.skin_stat.length > 0) {
    params.set("skin_stat", filters.skin_stat.join(","));
  }

  if (filters.in_collection) {
    params.set("in_collection", "true");
  }

  if (filters.not_in_collection) {
    params.set("not_in_collection", "true");
  }

  return params;
}

/**
 * Count the number of active filters
 * Note: Search is not counted as it's displayed separately in the search input
 */
export function countActiveFilters(filters: HeroFilters): number {
  let count = 0;

  // Count array filters by their length
  if (filters.class && filters.class.length > 0) count += filters.class.length;
  if (filters.faction && filters.faction.length > 0)
    count += filters.faction.length;
  if (filters.main_stat && filters.main_stat.length > 0)
    count += filters.main_stat.length;
  if (filters.attack_type && filters.attack_type.length > 0)
    count += filters.attack_type.length;
  if (filters.stone_source && filters.stone_source.length > 0)
    count += filters.stone_source.length;
  if (filters.weapon_buff && filters.weapon_buff.length > 0)
    count += filters.weapon_buff.length;
  if (filters.book && filters.book.length > 0) count += filters.book.length;
  if (filters.glyph_stat && filters.glyph_stat.length > 0)
    count += filters.glyph_stat.length;
  if (filters.skin_stat && filters.skin_stat.length > 0)
    count += filters.skin_stat.length;

  // Count boolean filters
  if (filters.in_collection) count += 1;
  if (filters.not_in_collection) count += 1;

  // Note: Search is intentionally excluded from this count as it's
  // displayed in a separate search input field, not as a filter chip

  return count;
}

/**
 * Get a list of active filter labels for display
 */
export function getActiveFilterLabels(filters: HeroFilters): Array<{
  key: string;
  label: string;
  value: string;
}> {
  const labels: Array<{ key: string; label: string; value: string }> = [];

  if (filters.class) {
    filters.class.forEach((value) => {
      labels.push({ key: "class", label: "Class", value });
    });
  }

  if (filters.faction) {
    filters.faction.forEach((value) => {
      labels.push({ key: "faction", label: "Faction", value });
    });
  }

  if (filters.main_stat) {
    filters.main_stat.forEach((value) => {
      labels.push({ key: "main_stat", label: "Main Stat", value });
    });
  }

  if (filters.attack_type) {
    filters.attack_type.forEach((value) => {
      labels.push({ key: "attack_type", label: "Attack Type", value });
    });
  }

  if (filters.stone_source) {
    filters.stone_source.forEach((value) => {
      labels.push({ key: "stone_source", label: "Stone Source", value });
    });
  }

  if (filters.weapon_buff) {
    filters.weapon_buff.forEach((value) => {
      labels.push({ key: "weapon_buff", label: "Weapon Buff", value });
    });
  }

  if (filters.book) {
    filters.book.forEach((value) => {
      labels.push({ key: "book", label: "Book", value });
    });
  }

  if (filters.glyph_stat) {
    filters.glyph_stat.forEach((value) => {
      labels.push({ key: "glyph_stat", label: "Glyph Stat", value });
    });
  }

  if (filters.skin_stat) {
    filters.skin_stat.forEach((value) => {
      labels.push({ key: "skin_stat", label: "Skin Stat", value });
    });
  }

  if (filters.in_collection) {
    labels.push({
      key: "in_collection",
      label: "Collection",
      value: "In Collection",
    });
  }

  if (filters.not_in_collection) {
    labels.push({
      key: "not_in_collection",
      label: "Collection",
      value: "Not In Collection",
    });
  }

  return labels;
}

/**
 * Remove a specific filter value from the filters object
 */
export function removeFilter(
  filters: HeroFilters,
  key: string,
  value?: string
): HeroFilters {
  const newFilters = { ...filters };

  if (key === "in_collection") {
    delete newFilters.in_collection;
  } else if (key === "not_in_collection") {
    delete newFilters.not_in_collection;
  } else if (value) {
    // Type-safe approach: check each known array filter key
    type ArrayFilterKey = Exclude<
      keyof HeroFilters,
      "in_collection" | "not_in_collection" | "search"
    >;

    const filterKey = key as ArrayFilterKey;
    const filterArray = newFilters[filterKey];

    if (filterArray && Array.isArray(filterArray)) {
      const filtered = filterArray.filter((v) => v !== value);
      if (filtered.length > 0) {
        // Safe assignment using type assertion with proper constraint
        (newFilters[filterKey] as typeof filterArray) = filtered as typeof filterArray;
      } else {
        delete newFilters[filterKey];
      }
    }
  }

  return newFilters;
}

/**
 * Clear all filters
 */
export function clearAllFilters(): HeroFilters {
  return {};
}
