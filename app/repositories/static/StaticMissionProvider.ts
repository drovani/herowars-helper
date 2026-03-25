// ABOUTME: Static provider that serves mission and chapter data from the JSON file on disk.
// ABOUTME: Used in static mode when Supabase environment variables are not set.

import log from "loglevel";

import equipmentsJson from "~/data/equipments.json";
import missionsJson from "~/data/missions.json";
import type { RepositoryResult } from "~/repositories/types";
import type { Chapter, Mission } from "~/repositories/MissionRepository";

interface MissionsJsonData {
  chapters: Array<{ id: number; title: string }>;
  missions: Array<{
    slug: string;
    name: string;
    hero_slug?: string;
    energy_cost?: number;
  }>;
}

interface EquipmentJsonRecord {
  slug: string;
  campaign_sources?: string[];
}

interface OrderByOption {
  column: string;
  ascending?: boolean;
}

interface FindAllOptions {
  orderBy?: OrderByOption | OrderByOption[];
}

const jsonData = missionsJson as MissionsJsonData;
const equipmentData = equipmentsJson as unknown as EquipmentJsonRecord[];

function parseMissionSlug(slug: string): { chapter_id: number; level: number } {
  const parts = slug.split("-");
  if (parts.length >= 2) {
    const chapter_id = parseInt(parts[0], 10);
    const level = parseInt(parts[1], 10);
    if (!isNaN(chapter_id) && !isNaN(level)) {
      return { chapter_id, level };
    }
  }
  return { chapter_id: 0, level: 0 };
}

function mapJsonToMissionRow(json: MissionsJsonData["missions"][0]): Mission {
  const { chapter_id, level } = parseMissionSlug(json.slug);
  return {
    slug: json.slug,
    name: json.name,
    chapter_id,
    level,
    hero_slug: json.hero_slug ?? null,
    energy_cost: json.energy_cost ?? null,
  };
}

function sortMissions(missions: Mission[]): Mission[] {
  return [...missions].sort((a, b) => {
    if (a.chapter_id !== b.chapter_id) return a.chapter_id - b.chapter_id;
    return (a.level ?? 0) - (b.level ?? 0);
  });
}

export class StaticMissionProvider {
  constructor() {
    log.info(
      "StaticMissionProvider: serving mission data from static JSON files",
    );
  }

  async findAll(
    options?: FindAllOptions,
  ): Promise<RepositoryResult<Mission[]>> {
    // The options parameter is accepted for interface compatibility with MissionRepository.
    // Static data is always sorted by chapter_id then level by default.
    void options;
    const missions = sortMissions(jsonData.missions.map(mapJsonToMissionRow));
    return { data: missions, error: null };
  }

  async findById(slug: string): Promise<RepositoryResult<Mission>> {
    const raw = jsonData.missions.find((m) => m.slug === slug);
    if (!raw) {
      return {
        data: null,
        error: { message: `Mission not found: ${slug}`, code: "NOT_FOUND" },
      };
    }
    return { data: mapJsonToMissionRow(raw), error: null };
  }

  async findAllChapters(): Promise<RepositoryResult<Chapter[]>> {
    const chapters = [...jsonData.chapters].sort((a, b) => a.id - b.id);
    return { data: chapters, error: null };
  }

  async findChapterById(id: number): Promise<RepositoryResult<Chapter>> {
    const chapter = jsonData.chapters.find((c) => c.id === id);
    if (!chapter) {
      return {
        data: null,
        error: { message: `Chapter not found: ${id}`, code: "NOT_FOUND" },
      };
    }
    return { data: chapter, error: null };
  }

  async findByHeroSlug(heroSlug: string): Promise<RepositoryResult<Mission[]>> {
    const missions = sortMissions(
      jsonData.missions
        .filter((m) => m.hero_slug === heroSlug)
        .map(mapJsonToMissionRow),
    );
    return { data: missions, error: null };
  }

  async findByCampaignSource(
    equipmentSlug: string,
  ): Promise<RepositoryResult<Mission[]>> {
    // Look up the equipment record by slug to retrieve its campaign_sources mission slugs,
    // then return the corresponding mission rows from the missions JSON.
    const equipment = equipmentData.find((e) => e.slug === equipmentSlug);
    if (
      !equipment?.campaign_sources ||
      equipment.campaign_sources.length === 0
    ) {
      return { data: [], error: null };
    }
    const missionSlugs = new Set(equipment.campaign_sources);
    const missions = sortMissions(
      jsonData.missions
        .filter((m) => missionSlugs.has(m.slug))
        .map(mapJsonToMissionRow),
    );
    return { data: missions, error: null };
  }
}
