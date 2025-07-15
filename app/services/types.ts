// ABOUTME: Type definitions for data services and interfaces
// ABOUTME: Extracted from BaseDataService for use by database-backed services

import { z, ZodError } from "zod";

export interface DataService<TRecord, TMutation> {
  getAll(ids?: string[]): Promise<TRecord[]>;
  getById(id: string): Promise<TRecord | null>;
  create(record: TMutation): Promise<TRecord | ZodError<TMutation>>;
  update(id: string, record: TMutation): Promise<TRecord | ZodError<TMutation>>;
  delete(id: string): Promise<void>;
  isInitialized(): boolean;
}

export const ChangeTrackedSchema = z.object({
  updated_on: z.string().date(),
});

export interface IChangeTracked extends z.infer<typeof ChangeTrackedSchema> {}