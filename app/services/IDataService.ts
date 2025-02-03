import z, { type ZodError } from "zod";

export interface IDataService<TRecord, TMutation> {
  getAll(ids?: string[]): Promise<TRecord[]>;
  getById(id: string): Promise<TRecord | null>;
  create(record: TMutation): Promise<TRecord | ZodError<TMutation>>;
  update(id: string, record: TMutation): Promise<TRecord | ZodError<TMutation>>;
  delete(id: string): Promise<void>;
  isInitialized(): boolean;
}
export interface HydrateDataOptions {
  /** If true, will skip items that already exist */
  skipExisting?: boolean;
  /** If true, will throw an error if any items exist */
  failIfExists?: boolean;
  /** If true, will force update all items regardless of existence */
  forceUpdate?: boolean;
}
export interface HydrateDataResult {
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
