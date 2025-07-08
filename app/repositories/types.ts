import type { Database, Tables, TablesInsert, TablesUpdate } from "~/types/supabase"

export type TableName = keyof Database["public"]["Tables"]

// Extract relationship information from Supabase types
export type TableRelationships<T extends TableName> = Database["public"]["Tables"][T]["Relationships"]

// Helper type to extract relationship names from table relationships
export type RelationshipNames<T extends TableName> = TableRelationships<T> extends readonly any[]
  ? TableRelationships<T>[number] extends { referencedRelation: infer R }
    ? R extends string
      ? R
      : never
    : never
  : never

// Helper type to extract foreign key column names for reverse relationships
export type ForeignKeyColumns<T extends TableName> = {
  [K in TableName]: Database["public"]["Tables"][K]["Relationships"] extends readonly any[]
    ? Database["public"]["Tables"][K]["Relationships"][number] extends { referencedRelation: T; foreignKeyName: infer F }
      ? F extends string
        ? K
        : never
      : never
    : never
}[TableName]

export interface QueryOptions {
  where?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
}

export interface BulkOptions {
  batchSize?: number
  onProgress?: (completed: number, total: number) => void
  skipExisting?: boolean
}

export interface UpsertOptions {
  onConflict?: string
  ignoreDuplicates?: boolean
}

export interface BulkOperationOptions {
  batchSize?: number
  continueOnError?: boolean
}

export interface RepositoryResult<T> {
  data: T | null
  error: RepositoryError | null
  skipped?: boolean
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