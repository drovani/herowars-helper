import { z, ZodError } from "zod";
import log from "loglevel";

export interface DataService<TRecord, TMutation> {
  getAll(ids?: string[]): Promise<TRecord[]>;
  getById(id: string): Promise<TRecord | null>;
  create(record: TMutation): Promise<TRecord | ZodError<TMutation>>;
  update(id: string, record: TMutation): Promise<TRecord | ZodError<TMutation>>;
  delete(id: string): Promise<void>;
  isInitialized(): boolean;
}

interface HydrateDataOptions {
  /** If true, will skip items that already exist */
  skipExisting?: boolean;
  /** If true, will throw an error if any items exist */
  failIfExists?: boolean;
  /** If true, will force update all items regardless of existence */
  forceUpdate?: boolean;
  /** If true, delete all existing data first */
  purgeFirst?: boolean;
}

interface HydrateDataResult {
  success: number;
  skipped: number;
  errors: number;
  total: number;
  existingCount: number;
  details: string[];
}

export const ChangeTrackedSchema = z.object({
  updated_on: z.string().date(),
});
export interface IChangeTracked extends z.infer<typeof ChangeTrackedSchema> {}

export abstract class BaseDataService<TRecord extends IChangeTracked, TMutation>
  implements DataService<TRecord, TMutation>
{
  protected abstract mutationSchema: z.ZodType<TRecord, z.ZodTypeDef, TMutation>;
  protected recordName: string;

  protected localRecordsCache: Map<string, TRecord> = new Map();
  protected initializedLocalCache: boolean = false;

  constructor(storeName: string, recordName: string, records: TRecord[]) {
    if (records) {
      this.initializeLocalCacheFromData(records);
    }
    this.recordName = recordName;
  }

  protected abstract getRecordId(record: TRecord | TMutation): string;
  protected abstract sortRecords(records: TRecord[]): TRecord[];

  protected initializeLocalCacheFromData(records: TRecord[]): void {
    records.forEach((record) => {
      this.localRecordsCache.set(this.getRecordId(record), record);
    });
    this.initializedLocalCache = true;
  }


  async getAll(ids?: string[]): Promise<TRecord[]> {
    try {
      if (ids) {
        const found: TRecord[] = [];
        this.localRecordsCache.forEach((value, key) => (ids.includes(key) ? found.push(value) : null));
        return this.sortRecords(found);
      } else {
        return this.sortRecords([...this.localRecordsCache.values()]);
      }
    } catch (error) {
      log.error(`Failed to get all ${this.recordName} records:`, error);
      throw new Error(`Failed to retrieve ${this.recordName} records.`);
    }
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
    try {
      return this.localRecordsCache.get(id) || null;
    } catch (error) {
      log.error(`Failed to get ${this.recordName} ${id}:`, error);
      throw new Error(`Failed to retrieve ${this.recordName} ${id}`);
    }
  }

  async create(record: TMutation): Promise<TRecord | ZodError<TMutation>> {
    try {
      const parseResults = this.mutationSchema.safeParse(record);
      if (!parseResults.success) {
        return parseResults.error;
      }

      const id = this.getRecordId(parseResults.data);
      const existing = await this.getById(id);

      if (existing) {
        throw new Error(`${this.recordName} record with id ${id} already exists.`);
      }

      this.localRecordsCache.set(id, parseResults.data);
      return parseResults.data;
    } catch (error) {
      log.error(`Failed to create ${this.recordName} record:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to create ${this.recordName} record.`);
    }
  }

  async update(id: string, mutation: TMutation): Promise<TRecord | ZodError<TMutation>> {
    try {
      const parseResults = this.mutationSchema.safeParse(mutation);
      if (!parseResults.success) {
        return parseResults.error;
      }

      const newId = this.getRecordId(parseResults.data);

      if (newId !== id) {
        throw new Error(`Cannot change ${this.recordName} record ID from ${id} to ${newId}`);
      }

      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`${this.recordName} record with id ${id} not found.`);
      }

      // Explicitly handle undefined values to ensure they overwrite existing values
      const updated = { ...existing, updated_on: new Date().toISOString() };
      
      // Copy all properties from parseResults.data, including undefined values
      for (const key in parseResults.data) {
        if (key in parseResults.data) {
          updated[key as keyof TRecord] = parseResults.data[key as keyof typeof parseResults.data] as any;
        }
      }
      this.localRecordsCache.set(id, updated);
      return updated;
    } catch (error) {
      log.error(`Failed to update ${this.recordName} record ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to update ${this.recordName} record ${id}.`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`${this.recordName} record with id ${id} not found.`);
      }

      this.localRecordsCache.delete(id);
    } catch (error) {
      log.error(`Failed to delete ${this.recordName} record ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to delete ${this.recordName} record ${id}.`);
    }
  }

  isInitialized(): boolean {
    return this.initializedLocalCache;
  }

  async hydrateData(
    records: TRecord[],
    options: HydrateDataOptions = { skipExisting: true, failIfExists: false, forceUpdate: false, purgeFirst: false }
  ): Promise<HydrateDataResult> {
    const { skipExisting, failIfExists, forceUpdate } = options;
    const details: string[] = [];

    try {
      details.push(`Starting ${this.recordName} data hydration...`);

      const existingCount = this.localRecordsCache.size;

      if (existingCount > 0) {
        details.push(`Found ${existingCount} existing ${this.recordName} records`);

        if (failIfExists) {
          throw new Error(`Existing ${this.recordName} data found. Aborting data hydration.`);
        }
      }

      if (options.purgeFirst) {
        this.localRecordsCache.clear();
        details.push(`Purged all existing ${this.recordName} data`);
      }

      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;

      for (const record of records) {
        const id = this.getRecordId(record);

        try {
          const exists = Boolean(await this.getById(id));

          if (exists && !forceUpdate) {
            if (skipExisting) {
              details.push(`⤍ Skipping existing ${this.recordName}: ${id}`);
              skippedCount++;
              continue;
            } else {
              throw new Error(`${this.recordName} already exists and skipExisting is false`);
            }
          }

          this.localRecordsCache.set(id, record);

          const action = exists ? "updated" : "stored";
          details.push(`✓ Successfully ${action} ${this.recordName} ${id}`);
          successCount++;
        } catch (error) {
          log.error(`✗ Failed to handle ${this.recordName} ${id}:`, error);
          errorCount++;
        }
      }

      details.push("Initialization complete:");
      details.push(`✓ Successfully stored ${successCount} ${this.recordName} records`);
      details.push(`⤍ Skipped ${skippedCount} existing ${this.recordName} records`);
      if (errorCount > 0) {
        details.push(`✗ Failed to store ${errorCount} ${this.recordName} records`);
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
