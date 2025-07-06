import type { Database, Tables, TablesInsert, TablesUpdate } from "~/types/supabase"

export type TableName = keyof Database["public"]["Tables"]

export interface QueryOptions {
  where?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
}

export interface BulkOptions {
  batchSize?: number
  onProgress?: (completed: number, total: number) => void
}

export interface RepositoryResult<T> {
  data: T | null
  error: RepositoryError | null
}

export interface RepositoryError {
  message: string
  code?: string
  details?: unknown
}

export interface IncludeOptions {
  [key: string]: boolean | Record<string, boolean>
}

export interface FindAllOptions extends QueryOptions {
  include?: IncludeOptions
}

export interface FindByIdOptions {
  include?: IncludeOptions
}

export type CreateInput<T extends TableName> = TablesInsert<T>
export type UpdateInput<T extends TableName> = TablesUpdate<T>
export type EntityRow<T extends TableName> = Tables<T>

export type IdType = string | number