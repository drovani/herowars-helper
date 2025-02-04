import { PostgrestFilterBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import log from "loglevel";
import BaseRepository from "~/services/BaseRepository";

export interface Mission {
  slug: string;
  chapter_id: number;
  chapter_title: string;
  name: string;
  level: number;
  hero_slug?: string;
  energy_cost?: number;
}

export interface MissionRow extends Omit<Mission, "chapter_title"> {}

class MissionRepository extends BaseRepository<Mission, MissionRow> {
  constructor() {
    const select = [
      "...chapter!inner(chapter_title:title)",
      "chapter_id",
      "name",
      "slug",
      "level",
      "hero_slug",
      "energy_cost",
    ] as const;
    super("mission", "slug", select);
    this.supabase.from(this.tableName).select().order;
  }

  public async getAllByHeroSlug(heroSlug: string): Promise<Mission[]> {
    let query = this.supabase.from(this.tableName).select(this.select).eq("hero_slug", heroSlug);
    const { data, error } = await this.finalize(query);

    if (error) {
      log.error(`Failed to get all ${this.tableName} records with hero_slug ${heroSlug}:`, error);
      throw new Error(`Failed to get all ${this.tableName} records with hero_slug ${heroSlug}.`);
    }

    return data;
  }

  public async getPrevNextMission(
    mission: Mission
  ): Promise<[prevMission: Mission | null, nextMission: Mission | null]> {
    let prevMissionSlug = "";
    if (mission.level > 1) prevMissionSlug = `${mission.chapter_id}-${mission.level - 1}`;
    else if (mission.chapter_id > 1) prevMissionSlug = `${mission.chapter_id - 1}-${mission.chapter_id > 2 ? 15 : 10}`;
    let nextMissionSlug = "";
    if ((mission.chapter_id > 1 && mission.level < 15) || (mission.chapter_id === 1 && mission.level < 10))
      nextMissionSlug = `${mission.chapter_id}-${mission.level + 1}`;
    else if (mission.chapter_id < 13) nextMissionSlug = `${mission.chapter_id + 1}-1`;

    const prevMission = await this.getById(prevMissionSlug);
    const nextMission = await this.getById(nextMissionSlug);

    return [prevMission, nextMission];
  }

  protected getRecordId(record: Mission | MissionRow) {
    return record.slug;
  }
  protected sortRecords(records: Mission[]): Mission[] {
    return records.sort((a, b) => (a.chapter_id !== b.chapter_id ? a.chapter_id - b.chapter_id : a.level - b.level));
  }

  protected finalize(
    query: PostgrestFilterBuilder<any, any, any, unknown, unknown>
  ): PostgrestTransformBuilder<any, any, Mission[], string, unknown> {
    return query.order("chapter_id").order("level").returns<Mission[]>();
  }
}

export default new MissionRepository();

export function groupMissionsByChapter(missions: Mission[]) {
  return missions.reduce((acc, mission) => {
    const chapter = mission.chapter_id;
    if (!acc[chapter]) {
      acc[chapter] = [mission];
    } else {
      acc[chapter].push(mission);
    }

    return acc;
  }, {} as Record<number, Mission[]>);
}
