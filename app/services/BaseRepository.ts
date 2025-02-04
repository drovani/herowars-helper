import { PostgrestFilterBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import { createClient } from "@supabase/supabase-js";
import log from "loglevel";
import type { HydrateDataOptions, HydrateDataResult } from "./IDataService";

export default abstract class BaseRepository<TRecord, TMutation> {
  protected readonly tableName: string;
  protected readonly select: string;
  protected readonly idField: string;
  protected readonly supabase;

  constructor(tableName: string, idField: string, select: readonly string[]) {
    this.tableName = tableName;
    this.idField = idField;
    this.select = select.join(",");
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }

  protected abstract getRecordId(record: TRecord | TMutation): string;
  protected abstract sortRecords(records: TRecord[]): TRecord[];
  protected abstract finalize(
    query: PostgrestFilterBuilder<any, any, any, unknown, unknown>
  ): PostgrestTransformBuilder<any, any, TRecord[], string, unknown>;

  async getAll(ids?: string[]): Promise<TRecord[]> {
    let query = this.supabase.from(this.tableName).select(this.select);
    if (ids) {
      query = query.in(this.idField, ids);
    }
    const { data, error } = await this.finalize(query);

    if (error) {
      log.error(`Failed to get all ${this.tableName} records:`, error);
      throw new Error(`Failed to retrieve ${this.tableName} records.`);
    }

    return this.sortRecords(data ?? []);
  }
  async getAllAsJson(ids?: string[]): Promise<string> {
    const records = await this.getAll(ids);
    const jsonString = JSON.stringify(
      records,
      (_: string, value: any): any | undefined => {
        if (Array.isArray(value) && value.length === 0) {
          // remove properties that are empty arrays
          return undefined;
        } else if (value === null) {
          return undefined;
        }
        return value;
      },
      2
    );
    return jsonString;
  }
  async getById(id: string): Promise<TRecord | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(this.select)
      .eq(this.idField, id)
      .returns<TRecord[]>()
      .maybeSingle();

    if (error) {
      log.error(`Failed to get ${this.tableName} ${id}:`, error);
      throw new Error(`Failed to retrieve ${this.tableName} ${id}`);
    }

    return data;
  }

  async hydrateTableData(
    records: TMutation[],
    options: HydrateDataOptions = { skipExisting: true, failIfExists: false, forceUpdate: false }
  ): Promise<HydrateDataResult> {
    const { skipExisting, failIfExists, forceUpdate } = options;
    const details: string[] = [];

    try {
      details.push(`Starting ${this.tableName} table hydration...`);

      // Check for existing data by listing all keys
      const { data: existingIds } = await this.supabase.from(this.tableName).select(this.idField);
      const existingCount = existingIds?.length || 0;

      if (existingCount > 0) {
        details.push(`Found ${existingCount} existing ${this.tableName} records`);

        if (failIfExists) {
          throw new Error(`Existing ${this.tableName} data found. Aborting data hydration.`);
        }
      }

      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      for (const record of records) {
        const id = this.getRecordId(record);

        const exists = Boolean(await this.getById(id));

        if (exists && !forceUpdate) {
          if (skipExisting) {
            details.push(`⤍ Skipping existing ${this.tableName}: ${id}`);
            skippedCount++;
            continue;
          } else {
            throw new Error(`${this.tableName} ${id} already exists and skipExisting is false`);
          }
        }
        const { error: upsertError } = await this.supabase
          .from(this.tableName)
          .upsert(record, { onConflict: this.idField });

        if (upsertError) {
          log.error(`✗ Failed to handle ${this.tableName} ${id}:`, upsertError);
          errorCount++;
        }

        const action = exists ? "updated" : "stored";
        details.push(`✓ Successfully ${action} ${this.tableName} ${id}`);
        successCount++;
      }

      details.push("Initialization complete:");
      details.push(`✓ Successfully stored ${successCount} ${this.tableName} records`);
      details.push(`⤍ Skipped ${skippedCount} existing ${this.tableName} records`);
      if (errorCount > 0) {
        details.push(`✗ Failed to store ${errorCount} ${this.tableName} records`);
      }

      return {
        success: successCount,
        skipped: skippedCount,
        errors: errorCount,
        total: records.length,
        existingCount,
        details,
      } satisfies HydrateDataResult;
    } catch (error) {
      log.error("Fatal error during initialization:", error);
      throw error;
    }
  }
}
