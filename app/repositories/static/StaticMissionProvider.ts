// ABOUTME: Static provider that serves mission and chapter data from the JSON file on disk.
// ABOUTME: Used in static mode when Supabase environment variables are not set.

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

interface OrderByOption {
  column: string;
  ascending?: boolean;
}

interface FindAllOptions {
  orderBy?: OrderByOption | OrderByOption[];
}

const jsonData = missionsJson as MissionsJsonData;

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
  async findAll(
    options?: FindAllOptions,
  ): Promise<RepositoryResult<Mission[]>> {
    // The options parameter is accepted for interface compatibility with MissionRepository.
    // Static data is always sorted by chapter_id then level by default.
    void options;
    const missions = sortMissions(jsonData.missions.map(mapJsonToMissionRow));
    return { data: missions, error: null };
  }

  async findAllChapters(): Promise<RepositoryResult<Chapter[]>> {
    const chapters = [...jsonData.chapters].sort((a, b) => a.id - b.id);
    return { data: chapters, error: null };
  }
}
