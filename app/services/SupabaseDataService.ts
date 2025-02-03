import { createClient } from "@supabase/supabase-js";
import { z, ZodError } from "zod";
import type { HydrateDataOptions, HydrateDataResult, IChangeTracked, IDataService } from "./IDataService";

export abstract class SupabaseDataService<TRecord extends IChangeTracked, TMutation>
  implements IDataService<TRecord, TMutation>
{
  protected abstract mutationSchema: z.ZodType<TRecord, z.ZodTypeDef, TMutation>;
  protected tableName: string;
  protected recordName: string;
  protected selectColumns: string;

  protected localRecordsCache: Map<string, TRecord> = new Map();
  protected initializedLocalCache: boolean = false;
  protected useLocalCache: boolean = true;
  protected dirtyLocalRecords: Map<string, TRecord | undefined> = new Map();
  protected supabase;

  constructor(tableName: string, recordName: string, selectColumns: readonly string[]) {
    this.tableName = tableName.toLowerCase();
    this.recordName = recordName;
    this.selectColumns = selectColumns.join(",");
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }

  protected abstract getRecordId(record: TRecord | TMutation): string;
  protected abstract sortRecords(records: TRecord[]): TRecord[];

  async getAll(ids?: string[]): Promise<TRecord[]> {
    let query = this.supabase.from(this.tableName).select(this.selectColumns);
    if (ids) {
      query = query.in("id", ids);
    }
    const { data, error } = await query.returns<TRecord[]>();

    if (error) {
      console.error(`Failed to get all ${this.recordName} records:`, error);
      throw new Error(`Failed to retrieve ${this.recordName} records.`);
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
      .select(this.selectColumns)
      .eq("id", id)
      .returns<TRecord[]>()
      .maybeSingle();

    if (error) {
      console.error(`Failed to get ${this.recordName} ${id}:`, error);
      throw new Error(`Failed to retrieve ${this.recordName} ${id}`);
    }

    return data;
  }

  async create(record: TMutation): Promise<TRecord | ZodError<TMutation>> {
    const { success, data, error } = this.mutationSchema.safeParse(record);
    if (!success) {
      return error;
    }

    const id = this.getRecordId(data);
    const existing = await this.getById(id);

    if (existing) {
      throw new Error(`${this.recordName} record with id ${id} already exists.`);
    }

    const { data: created, error: insertError } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select(this.selectColumns)
      .returns<TRecord[]>()
      .single();

    if (insertError) {
      console.error(`Failed to create ${this.recordName} record:`, insertError);
      throw new Error(`Failed to create ${this.recordName} record.`);
    }

    return created;
  }

  async update(id: string, mutation: TMutation): Promise<TRecord | ZodError<TMutation>> {
    const { success, data, error } = this.mutationSchema.safeParse(mutation);

    if (!success) {
      return error;
    }

    const newId = this.getRecordId(data);

    if (newId !== id) {
      throw new Error(`Cannot change ${this.recordName} record ID from ${id} to ${newId}`);
    }

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`${this.recordName} record with id ${id} not found.`);
    }

    const updating = { ...existing, ...data, updated_on: new Date().toISOString() };

    const { data: updated, error: updateError } = await this.supabase
      .from(this.tableName)
      .update(updating)
      .select(this.selectColumns)
      .returns<TRecord[]>()
      .single();

    if (updateError) {
      console.error(`Failed to update ${this.recordName} record ${id}:`, updateError);
      throw new Error(`Failed to update ${this.recordName} record ${id}.`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from(this.tableName).delete().eq("id", id);

    if (error) {
      console.error(`Failed to delete ${this.recordName} record ${id}:`, error);
      throw new Error(`Failed to delete ${this.recordName} record ${id}.`);
    }
  }

  isInitialized(): boolean {
    return this.initializedLocalCache;
  }

  async hydrateTableData(
    records: TRecord[],
    options: HydrateDataOptions = { skipExisting: true, failIfExists: false, forceUpdate: false}
  ): Promise<HydrateDataResult> {
    const { skipExisting, failIfExists, forceUpdate} = options;
    const details: string[] = [];

    try {
      details.push(`Starting ${this.tableName} table hydration...`);

      // Check for existing data by listing all keys
      const { data: existingIds } = await this.supabase.from(this.tableName).select("id");
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
        const { error: upsertError } = await this.supabase.from(this.tableName).upsert(record, { onConflict: "id" });

        if (upsertError) {
          console.error(`✗ Failed to handle ${this.tableName} ${id}:`, upsertError);
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
      console.error("Fatal error during initialization:", error);
      throw error;
    }
  }
}
