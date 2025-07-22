// ABOUTME: Pure transformation functions to convert CompleteHero database format to HeroRecord JSON format
// ABOUTME: Pure transformation functions for converting database hero data to JSON format

import type { HeroRecord } from "~/data/hero.zod";
import type { CompleteHero } from "~/repositories/types";

/**
 * Transform a CompleteHero from database format to HeroRecord JSON format
 * This is the main transformation function used by routes
 */
export function transformCompleteHeroToRecord(
  completeHero: CompleteHero
): HeroRecord {
  const record: Partial<HeroRecord> = {
    slug: completeHero.slug,
    name: completeHero.name,
    class: validateHeroClass(completeHero.class),
    faction: validateHeroFaction(completeHero.faction),
    main_stat: validateMainStat(completeHero.main_stat),
    attack_type: validateAttackTypes(completeHero.attack_type),
    stone_source: (completeHero.stone_source as any) || [],
    order_rank: completeHero.order_rank || 0,
    updated_on: completeHero.updated_on || new Date().toISOString(),
  };

  // Transform artifacts back to JSON format
  if (completeHero.artifacts && completeHero.artifacts.length > 0) {
    const artifactsResult = transformArtifacts(completeHero.artifacts);
    if (artifactsResult) {
      record.artifacts = artifactsResult;
    }
  }

  // Transform skins back to JSON format
  if (completeHero.skins && completeHero.skins.length > 0) {
    record.skins = transformSkins(completeHero.skins);
  }

  // Transform glyphs back to JSON format
  if (completeHero.glyphs && completeHero.glyphs.length > 0) {
    record.glyphs = transformGlyphs(completeHero.glyphs);
  }

  // Transform equipment slots back to JSON format
  if (completeHero.equipmentSlots && completeHero.equipmentSlots.length > 0) {
    record.items = transformEquipmentSlots(completeHero.equipmentSlots);
  }

  return record as HeroRecord;
}

/**
 * Transform basic hero data to HeroRecord format (fallback for heroes without relationships)
 */
export function transformBasicHeroToRecord(hero: any): HeroRecord {
  return {
    slug: hero.slug,
    name: hero.name,
    class: validateHeroClass(hero.class),
    faction: validateHeroFaction(hero.faction),
    main_stat: validateMainStat(hero.main_stat),
    attack_type: validateAttackTypes(hero.attack_type),
    stone_source: hero.stone_source || [],
    order_rank: hero.order_rank || 0,
    updated_on: hero.updated_on || new Date().toISOString(),
  };
}

/**
 * Transform artifacts from database format to JSON format
 */
export function transformArtifacts(
  artifacts: CompleteHero["artifacts"] | undefined
): HeroRecord["artifacts"] | undefined {
  if (!artifacts) return undefined;

  const result: Partial<NonNullable<HeroRecord["artifacts"]>> = {};

  for (const artifact of artifacts) {
    if (
      artifact.artifact_type === "weapon" &&
      artifact.name &&
      artifact.team_buff
    ) {
      result.weapon = {
        name: artifact.name,
        team_buff: validateTeamBuff(artifact.team_buff),
        team_buff_secondary: artifact.team_buff_secondary
          ? validateTeamBuff(artifact.team_buff_secondary)
          : undefined,
      };
    } else if (artifact.artifact_type === "book" && artifact.name) {
      result.book = validateBookName(artifact.name);
    } else if (artifact.artifact_type === "ring") {
      result.ring = null;
    }
  }

  return Object.keys(result).length > 0
    ? (result as HeroRecord["artifacts"])
    : undefined;
}

/**
 * Transform skins from database format to JSON format
 */
export function transformSkins(
  skins: CompleteHero["skins"] | undefined
): HeroRecord["skins"] {
  if (!skins) return undefined;

  return skins.map((skin) => ({
    name: skin.name,
    stat: validateSkinStat(skin.stat_type),
    has_plus: Boolean(skin.has_plus),
    source: skin.source || undefined,
  }));
}

/**
 * Transform glyphs from database format to JSON format
 */
export function transformGlyphs(
  glyphs: CompleteHero["glyphs"] | undefined
): HeroRecord["glyphs"] {
  if (!glyphs) return undefined;

  const result: (string | null)[] = [null, null, null, null, null];
  const sortedGlyphs = glyphs.sort((a, b) => a.position - b.position);

  for (const glyph of sortedGlyphs) {
    if (glyph.position >= 1 && glyph.position <= 5) {
      result[glyph.position - 1] = validateGlyphStat(glyph.stat_type);
    }
  }

  return result as HeroRecord["glyphs"];
}

/**
 * Transform equipment slots from database format to JSON format
 */
export function transformEquipmentSlots(
  equipmentSlots: CompleteHero["equipmentSlots"] | undefined
): HeroRecord["items"] {
  if (!equipmentSlots) return undefined;

  const result: Partial<NonNullable<HeroRecord["items"]>> = {};

  // Group by quality
  const slotsByQuality = equipmentSlots.reduce((acc, slot) => {
    if (!acc[slot.quality]) {
      acc[slot.quality] = [];
    }
    acc[slot.quality].push(slot);
    return acc;
  }, {} as Record<string, typeof equipmentSlots>);

  // Convert to arrays sorted by slot position
  for (const [quality, slots] of Object.entries(slotsByQuality)) {
    const sortedSlots = slots.sort((a, b) => a.slot_position - b.slot_position);
    const equipmentSlugs = sortedSlots
      .map((slot) => slot.equipment_slug)
      .filter((slug): slug is string => Boolean(slug));

    if (equipmentSlugs.length > 0) {
      (result as any)[quality] = equipmentSlugs;
    }
  }

  return Object.keys(result).length > 0
    ? (result as HeroRecord["items"])
    : undefined;
}

/**
 * Sort hero records by name
 */
export function sortHeroRecords(records: HeroRecord[]): HeroRecord[] {
  return records.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Create JSON string from hero records with empty array removal
 */
export function createHeroesJsonString(records: HeroRecord[]): string {
  return JSON.stringify(
    records,
    (_: string, value: any): any | undefined => {
      if (Array.isArray(value) && value.length === 0) {
        // remove properties that are empty arrays
        return undefined;
      }
      return value;
    },
    2
  );
}

// Validation functions

export function validateHeroClass(heroClass: string): HeroRecord["class"] {
  const validClasses = [
    "control",
    "tank",
    "warrior",
    "mage",
    "support",
    "marksman",
    "healer",
  ] as const;
  return validClasses.includes(heroClass as any)
    ? (heroClass as HeroRecord["class"])
    : "tank";
}

export function validateHeroFaction(faction: string): HeroRecord["faction"] {
  const validFactions = [
    "progress",
    "nature",
    "chaos",
    "honor",
    "eternity",
    "mystery",
  ] as const;
  return validFactions.includes(faction as any)
    ? (faction as HeroRecord["faction"])
    : "honor";
}

export function validateMainStat(mainStat: string): HeroRecord["main_stat"] {
  const validMainStats = ["intelligence", "agility", "strength"] as const;
  return validMainStats.includes(mainStat as any)
    ? (mainStat as HeroRecord["main_stat"])
    : "strength";
}

export function validateAttackTypes(
  attackTypes: string[]
): HeroRecord["attack_type"] {
  const validAttackTypes = ["physical", "magic", "pure"] as const;
  const filtered = attackTypes.filter((type) =>
    validAttackTypes.includes(type as any)
  );
  return filtered.length > 0
    ? (filtered as HeroRecord["attack_type"])
    : ["physical"];
}

export function validateTeamBuff(
  teamBuff: string
): NonNullable<HeroRecord["artifacts"]>["weapon"]["team_buff"] {
  const validBuffs = [
    "physical attack",
    "magic attack",
    "armor",
    "magic defense",
    "dodge",
    "magic penetration",
    "armor penetration",
    "crit hit chance",
  ] as const;
  return validBuffs.includes(teamBuff as any) ? (teamBuff as any) : "armor";
}

export function validateBookName(
  bookName: string
): NonNullable<HeroRecord["artifacts"]>["book"] {
  const validBooks = [
    "Alchemist's Folio",
    "Book of Illusions",
    "Defender's Covenant",
    "Manuscript of the Void",
    "Tome of Arcane Knowledge",
    "Warrior's Code",
  ] as const;
  return validBooks.includes(bookName as any)
    ? (bookName as any)
    : "Tome of Arcane Knowledge";
}

export function validateSkinStat(
  statType: string
): NonNullable<HeroRecord["skins"]>[0]["stat"] {
  const validStats = [
    "intelligence",
    "agility",
    "strength",
    "health",
    "physical attack",
    "magic attack",
    "armor",
    "magic defense",
    "dodge",
    "magic penetration",
    "vampirism",
    "armor penetration",
    "crit hit chance",
    "healing",
    "magic crit hit chance",
  ] as const;
  return validStats.includes(statType as any) ? (statType as any) : "strength";
}

export function validateGlyphStat(statType: string): string {
  const validStats = [
    "intelligence",
    "agility",
    "strength",
    "health",
    "physical attack",
    "magic attack",
    "armor",
    "magic defense",
    "dodge",
    "magic penetration",
    "vampirism",
    "armor penetration",
    "crit hit chance",
    "healing",
    "magic crit hit chance",
  ] as const;
  return validStats.includes(statType as any) ? statType : "strength";
}
