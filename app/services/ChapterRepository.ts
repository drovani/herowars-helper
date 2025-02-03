import { PostgrestFilterBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import BaseRepository from "./BaseRepository";

export interface Chapter {
  id: number;
  title: string;
}

class ChapterRepository extends BaseRepository<Chapter, Chapter> {
  constructor() {
    const select = ["id", "title"] as const;
    super("chapter", "id", select);
  }

  protected getRecordId(record: Chapter): string {
    return record.id.toString();
  }

  protected sortRecords(records: Chapter[]): Chapter[] {
    return records.sort((a, b) => a.id - b.id);
  }

  protected finalize(
    query: PostgrestFilterBuilder<any, any, any, unknown, unknown>
  ): PostgrestTransformBuilder<any, any, Chapter[], string, unknown> {
    return query.order(this.idField).returns<Chapter[]>();
  }
}

export default new ChapterRepository();
