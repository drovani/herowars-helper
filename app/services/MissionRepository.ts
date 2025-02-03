import { PostgrestFilterBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import BaseRepository from "~/services/BaseRepository";

export interface Mission {
  slug: string;
  chapter_id: number;
  chapter_title: string;
  name: string;
  level: number;
  hero_slug?: string;
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
    ] as const;
    super("mission", "slug", select);
    this.supabase.from(this.tableName).select().order;
  }

  protected getRecordId(record: Mission | MissionRow) {
    return record.slug;
  }
  protected sortRecords(records: Mission[]): Mission[] {
    return records.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  protected finalize(
    query: PostgrestFilterBuilder<any, any, any, unknown, unknown>
  ): PostgrestTransformBuilder<any, any, Mission[], string, unknown> {
    return query.order("chapter_id").order("level").returns<Mission[]>();
  }
}

export default new MissionRepository();
