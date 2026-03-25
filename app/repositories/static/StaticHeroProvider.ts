// ABOUTME: Static provider that serves hero data from the JSON file on disk.
// ABOUTME: Used in static mode when Supabase environment variables are not set.

import log from "loglevel";

import heroesJson from "~/data/heroes.json";
import type {
  CompleteHero,
  Hero,
  HeroArtifact,
  HeroEquipmentSlot,
  HeroGlyph,
  HeroSkin,
  RepositoryResult,
} from "~/repositories/types";

// Shape of a hero record in heroes.json
interface HeroJsonRecord {
  slug: string;
  name: string;
  class: string;
  faction: string;
  main_stat: string;
  attack_type?: string[];
  stone_source?: string[];
  order_rank?: number;
  updated_on?: string;
  artifacts?: {
    weapon?: { name: string; team_buff: string; team_buff_secondary?: string };
    book?: string;
    ring?: null;
  };
  skins?: Array<{
    name: string;
    stat: string;
    has_plus?: boolean;
    source?: string;
  }>;
  glyphs?: (string | null)[];
  items?: Record<string, (string | null)[]>;
}

function mapJsonToHeroRow(json: HeroJsonRecord): Hero {
  return {
    slug: json.slug,
    name: json.name,
    class: json.class,
    faction: json.faction,
    main_stat: json.main_stat,
    attack_type: json.attack_type ?? [],
    stone_source: json.stone_source ?? [],
    order_rank: json.order_rank ?? 0,
    updated_on: json.updated_on ?? null,
  };
}

function mapJsonToArtifacts(json: HeroJsonRecord): HeroArtifact[] {
  if (!json.artifacts) return [];

  const artifacts: HeroArtifact[] = [];

  if (json.artifacts.weapon) {
    artifacts.push({
      id: `${json.slug}-weapon`,
      hero_slug: json.slug,
      artifact_type: "weapon",
      name: json.artifacts.weapon.name,
      team_buff: json.artifacts.weapon.team_buff,
      team_buff_secondary: json.artifacts.weapon.team_buff_secondary ?? null,
      created_at: null,
    });
  }

  if (json.artifacts.book !== undefined) {
    artifacts.push({
      id: `${json.slug}-book`,
      hero_slug: json.slug,
      artifact_type: "book",
      name: json.artifacts.book,
      team_buff: null,
      team_buff_secondary: null,
      created_at: null,
    });
  }

  if ("ring" in json.artifacts) {
    artifacts.push({
      id: `${json.slug}-ring`,
      hero_slug: json.slug,
      artifact_type: "ring",
      name: null,
      team_buff: null,
      team_buff_secondary: null,
      created_at: null,
    });
  }

  return artifacts;
}

function mapJsonToSkins(json: HeroJsonRecord): HeroSkin[] {
  if (!json.skins) return [];

  return json.skins.map((skin, index) => ({
    id: `${json.slug}-skin-${index}`,
    hero_slug: json.slug,
    name: skin.name,
    stat_type: skin.stat,
    stat_value: 0,
    has_plus: skin.has_plus ?? false,
    source: skin.source ?? null,
    created_at: null,
  }));
}

function mapJsonToGlyphs(json: HeroJsonRecord): HeroGlyph[] {
  if (!json.glyphs) return [];

  const result: HeroGlyph[] = [];
  json.glyphs.forEach((stat, index) => {
    if (stat === null) return;
    result.push({
      id: `${json.slug}-glyph-${index + 1}`,
      hero_slug: json.slug,
      position: index + 1,
      stat_type: stat,
      stat_value: 0,
      created_at: null,
    });
  });
  return result;
}

function mapJsonToEquipmentSlots(json: HeroJsonRecord): HeroEquipmentSlot[] {
  if (!json.items) return [];

  const slots: HeroEquipmentSlot[] = [];
  let idCounter = 0;

  for (const [quality, equipmentList] of Object.entries(json.items)) {
    if (!Array.isArray(equipmentList)) continue;
    equipmentList.forEach((equipSlug, slotIndex) => {
      idCounter++;
      slots.push({
        id: `${json.slug}-slot-${idCounter}`,
        hero_slug: json.slug,
        quality,
        slot_position: slotIndex + 1,
        equipment_slug: equipSlug ?? null,
        created_at: null,
      });
    });
  }

  return slots;
}

function buildCompleteHero(json: HeroJsonRecord): CompleteHero {
  return {
    ...mapJsonToHeroRow(json),
    artifacts: mapJsonToArtifacts(json),
    skins: mapJsonToSkins(json),
    glyphs: mapJsonToGlyphs(json).sort((a, b) => a.position - b.position),
    equipmentSlots: mapJsonToEquipmentSlots(json),
  };
}

export class StaticHeroProvider {
  private readonly heroes: HeroJsonRecord[] = heroesJson as HeroJsonRecord[];

  constructor() {
    log.info("StaticHeroProvider: serving hero data from static JSON files");
  }

  async findAll(): Promise<RepositoryResult<Hero[]>> {
    const rows = this.heroes
      .map(mapJsonToHeroRow)
      .sort((a, b) => a.order_rank - b.order_rank);

    return { data: rows, error: null };
  }

  async findById(slug: string): Promise<RepositoryResult<Hero>> {
    const json = this.heroes.find((h) => h.slug === slug);
    if (!json) {
      return {
        data: null,
        error: { message: `Hero not found: ${slug}`, code: "NOT_FOUND" },
      };
    }
    return { data: mapJsonToHeroRow(json), error: null };
  }

  async findWithAllData(slug: string): Promise<RepositoryResult<CompleteHero>> {
    const json = this.heroes.find((h) => h.slug === slug);

    if (!json) {
      return {
        data: null,
        error: {
          message: `Hero not found: ${slug}`,
          code: "NOT_FOUND",
        },
      };
    }

    return { data: buildCompleteHero(json), error: null };
  }

  async findAllWithRelationships(): Promise<RepositoryResult<CompleteHero[]>> {
    const completeHeroes = this.heroes
      .map(buildCompleteHero)
      .sort((a, b) => a.order_rank - b.order_rank);

    return { data: completeHeroes, error: null };
  }

  // Reverse-lookup: iterate all heroes and check if any equipment slot matches the given slug.
  async findHeroesUsingEquipment(
    equipmentSlug: string,
  ): Promise<RepositoryResult<Hero[]>> {
    const matching = this.heroes.filter((json) => {
      if (!json.items) return false;
      return Object.values(json.items).some((slots) =>
        slots.some((slot) => slot === equipmentSlug),
      );
    });
    return { data: matching.map(mapJsonToHeroRow), error: null };
  }
}
