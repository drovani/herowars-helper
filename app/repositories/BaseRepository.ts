// ABOUTME: Base repository class providing CRUD operations for Supabase tables.
// ABOUTME: Uses generic typing with type assertions for dynamic table access patterns.

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import log from "loglevel";
import type { ZodSchema, ZodType } from "zod";

import type {
  BulkOptions,
  CreateInput,
  EntityRow,
  FindAllOptions,
  FindByIdOptions,
  IdType,
  IncludeOptions,
  RepositoryError,
  RepositoryResult,
  TableName,
  UpdateInput,
} from "./types";

import { createClient } from "~/lib/supabase/client";
import type { Database } from "~/types/supabase";

// Type for Supabase client with database schema - used for better type inference
type TypedSupabaseClient = SupabaseClient<Database>;

// Type for filter builder query - uses unknown for dynamic query building
type FilterBuilder = {
  eq: (column: string, value: unknown) => FilterBuilder;
  order: (column: string, options?: { ascending?: boolean }) => FilterBuilder;
  limit: (count: number) => FilterBuilder;
  range: (from: number, to: number) => FilterBuilder;
  single: () => Promise<{ data: unknown; error: PostgrestError | null }>;
  select: (columns?: string) => FilterBuilder;
  insert: (
    values: unknown,
    options?: { count?: string }
  ) => { select: () => FilterBuilder };
  update: (values: unknown) => FilterBuilder;
  delete: () => FilterBuilder;
  upsert: (
    values: unknown,
    options?: { onConflict?: string; ignoreDuplicates?: boolean }
  ) => { select: () => FilterBuilder };
};

export abstract class BaseRepository<T extends TableName> {
  protected supabase: TypedSupabaseClient;
  protected tableName: T;
  protected schema: ZodSchema<unknown>;
  protected primaryKeyColumn: string;

  constructor(
    tableNameOrSupabase: T | TypedSupabaseClient,
    schema: ZodSchema<unknown>,
    requestOrTableName?: Request | T | null,
    primaryKeyColumnOrSchema?: string | ZodSchema<unknown>,
    primaryKeyColumn: string = "id"
  ) {
    // Handle different constructor signatures
    if (typeof tableNameOrSupabase === "string") {
      // First signature: (tableName, schema, request?, primaryKeyColumn?)
      const { supabase } = createClient(requestOrTableName as Request | null);
      this.supabase = supabase as unknown as TypedSupabaseClient;
      this.tableName = tableNameOrSupabase;
      this.schema = schema;
      this.primaryKeyColumn = (primaryKeyColumnOrSchema as string) || "id";
    } else {
      // Second signature: (supabase, tableName, schema, primaryKeyColumn?)
      this.supabase = tableNameOrSupabase as unknown as TypedSupabaseClient;
      this.tableName = requestOrTableName as T;
      this.schema = primaryKeyColumnOrSchema as ZodSchema<unknown>;
      this.primaryKeyColumn = primaryKeyColumn;
    }
  }

  async findAll(
    options: FindAllOptions = {}
  ): Promise<RepositoryResult<EntityRow<T>[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select(this.buildSelectClause(options.include)) as unknown as FilterBuilder;

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.orderBy) {
        if (Array.isArray(options.orderBy)) {
          // Handle multiple orderBy criteria
          options.orderBy.forEach((order) => {
            query = query.order(order.column, {
              ascending: order.ascending ?? true,
            });
          });
        } else {
          // Handle single orderBy criteria
          query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending ?? true,
          });
        }
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = (await query) as unknown as {
        data: EntityRow<T>[] | null;
        error: PostgrestError | null;
      };

      if (error) {
        log.error(`Error finding all ${this.tableName}:`, error);
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return {
        data: data as EntityRow<T>[],
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding all ${this.tableName}:`, error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findById(
    id: IdType,
    options: FindByIdOptions = {}
  ): Promise<RepositoryResult<EntityRow<T>>> {
    try {
      const query = this.supabase
        .from(this.tableName)
        .select(this.buildSelectClause(options.include)) as unknown as FilterBuilder;

      const { data, error } = (await query
        .eq(this.primaryKeyColumn, id)
        .single()) as unknown as {
        data: EntityRow<T> | null;
        error: PostgrestError | null;
      };

      if (error) {
        log.error(`Error finding ${this.tableName} by id ${id}:`, error);
        return {
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        };
      }

      return {
        data: data as EntityRow<T>,
        error: null,
      };
    } catch (error) {
      log.error(
        `Unexpected error finding ${this.tableName} by id ${id}:`,
        error
      );
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async create(
    input: CreateInput<T>,
    options: { skipExisting?: boolean } = {}
  ): Promise<RepositoryResult<EntityRow<T>>> {
    try {
      const validation = this.schema.safeParse(input);
      if (!validation.success) {
        return {
          data: null,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: validation.error.issues,
          },
        };
      }

      // If skipExisting is true, check if record already exists
      if (options.skipExisting) {
        const primaryKeyValue = (input as Record<string, unknown>)[
          this.primaryKeyColumn
        ];
        if (primaryKeyValue) {
          const existingRecord = await this.findById(
            primaryKeyValue as IdType
          );
          if (existingRecord.data) {
            // Record exists, return it as skipped
            return {
              data: existingRecord.data,
              error: null,
              skipped: true,
            };
          }
        }
      }

      // Proceed with normal insert
      const query = this.supabase.from(
        this.tableName
      ) as unknown as FilterBuilder;
      const { data, error } = (await query
        .insert(input)
        .select()
        .single()) as unknown as {
        data: EntityRow<T> | null;
        error: PostgrestError | null;
      };

      if (error) {
        log.error(`Error creating ${this.tableName}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data as EntityRow<T>,
        error: null,
        skipped: false,
      };
    } catch (error) {
      log.error(`Unexpected error creating ${this.tableName}:`, error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async update(
    id: IdType,
    input: UpdateInput<T>
  ): Promise<RepositoryResult<EntityRow<T>>> {
    try {
      // Use the schema's partial method if available, otherwise validate as-is
      const schemaWithPartial = this.schema as ZodType<unknown> & {
        partial?: () => ZodType<unknown>;
      };
      const validationSchema = schemaWithPartial.partial
        ? schemaWithPartial.partial()
        : this.schema;
      const validation = validationSchema.safeParse(input);
      if (!validation.success) {
        return {
          data: null,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: validation.error.issues,
          },
        };
      }

      const query = this.supabase.from(
        this.tableName
      ) as unknown as FilterBuilder;
      const { data, error } = (await query
        .update(input)
        .eq(this.primaryKeyColumn, id)
        .select()
        .single()) as unknown as {
        data: EntityRow<T> | null;
        error: PostgrestError | null;
      };

      if (error) {
        log.error(`Error updating ${this.tableName} with id ${id}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data as EntityRow<T>,
        error: null,
      };
    } catch (error) {
      log.error(
        `Unexpected error updating ${this.tableName} with id ${id}:`,
        error
      );
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async delete(id: IdType): Promise<RepositoryResult<boolean>> {
    try {
      const query = this.supabase.from(
        this.tableName
      ) as unknown as FilterBuilder;
      const { error } = (await query
        .delete()
        .eq(this.primaryKeyColumn, id)) as unknown as {
        error: PostgrestError | null;
      };

      if (error) {
        log.error(`Error deleting ${this.tableName} with id ${id}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      log.error(
        `Unexpected error deleting ${this.tableName} with id ${id}:`,
        error
      );
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async bulkCreate(
    inputs: CreateInput<T>[],
    options: BulkOptions = {}
  ): Promise<RepositoryResult<EntityRow<T>[]>> {
    const { batchSize = 100, onProgress, skipExisting = false } = options;
    const results: EntityRow<T>[] = [];
    const skipped: EntityRow<T>[] = [];
    const errors: RepositoryError[] = [];

    try {
      for (let i = 0; i < inputs.length; i += batchSize) {
        const batch = inputs.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(async (input, batchIndex) => {
            const result = await this.create(input, { skipExisting });
            if (result.error) {
              // Attach the input data to the error for debugging
              const errorWithData = {
                ...result.error,
                inputData: input,
                batchIndex: i + batchIndex,
              };
              throw errorWithData;
            }
            return result;
          })
        );

        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            if (result.value.skipped) {
              skipped.push(result.value.data!);
            } else {
              results.push(result.value.data!);
            }
          } else {
            // Extract more detailed error information
            const reason = result.reason as Record<string, unknown>;
            const errorMsg =
              (reason?.message as string) ||
              ((reason?.error as Record<string, unknown>)?.message as string) ||
              (reason?.details as string) ||
              "Unknown error in bulk create";
            const errorCode =
              (reason?.code as string) ||
              ((reason?.error as Record<string, unknown>)?.code as string) ||
              "UNKNOWN_ERROR";

            errors.push({
              message: errorMsg,
              code: errorCode,
              details: result.reason,
            });

            // Log detailed error for debugging
            log.error(`Bulk create error for ${this.tableName}:`, {
              message: errorMsg,
              code: errorCode,
              inputData: reason?.inputData,
              batchIndex: reason?.batchIndex,
              reason: result.reason,
            });
          }
        });

        if (onProgress) {
          onProgress(Math.min(i + batchSize, inputs.length), inputs.length);
        }
      }

      // Determine result structure based on what happened
      if (errors.length > 0) {
        log.warn(
          `Bulk create for ${this.tableName} completed with ${errors.length} errors, ${skipped.length} skipped`
        );
        return {
          data: results,
          error: {
            message: `Bulk operation completed with ${errors.length} errors, ${skipped.length} skipped`,
            code: "BULK_PARTIAL_FAILURE",
            details: { errors, skipped },
          },
        };
      }

      if (skipped.length > 0) {
        log.info(
          `Bulk create for ${this.tableName} completed: ${results.length} created, ${skipped.length} skipped`
        );
        return {
          data: results,
          error: {
            message: `Bulk operation completed: ${results.length} created, ${skipped.length} skipped`,
            code: "BULK_PARTIAL_SUCCESS",
            details: { skipped },
          },
        };
      }

      return {
        data: results,
        error: null,
      };
    } catch (error) {
      log.error(
        `Unexpected error in bulk create for ${this.tableName}:`,
        error
      );
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async upsert(input: CreateInput<T>): Promise<RepositoryResult<EntityRow<T>>> {
    try {
      const validation = this.schema.safeParse(input);
      if (!validation.success) {
        return {
          data: null,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: validation.error.issues,
          },
        };
      }

      const query = this.supabase.from(
        this.tableName
      ) as unknown as FilterBuilder;
      const { data, error } = (await query
        .upsert(input, {
          onConflict: this.primaryKeyColumn,
          ignoreDuplicates: false,
        })
        .select()
        .single()) as unknown as {
        data: EntityRow<T> | null;
        error: PostgrestError | null;
      };

      if (error) {
        log.error(`Error upserting ${this.tableName}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data as EntityRow<T>,
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error upserting ${this.tableName}:`, error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async bulkUpsert(
    inputs: CreateInput<T>[],
    options: BulkOptions = {}
  ): Promise<RepositoryResult<EntityRow<T>[]>> {
    const { batchSize = 100, onProgress } = options;
    const results: EntityRow<T>[] = [];
    const errors: RepositoryError[] = [];

    try {
      for (let i = 0; i < inputs.length; i += batchSize) {
        const batch = inputs.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(async (input) => {
            const result = await this.upsert(input);
            if (result.error) {
              throw result.error;
            }
            return result.data!;
          })
        );

        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          } else {
            const reason = result.reason as RepositoryError;
            errors.push({
              message: reason.message || "Unknown error in bulk upsert",
              code: reason.code,
              details: result.reason,
            });
          }
        });

        if (onProgress) {
          onProgress(Math.min(i + batchSize, inputs.length), inputs.length);
        }
      }

      if (errors.length > 0) {
        log.warn(
          `Bulk upsert for ${this.tableName} completed with ${errors.length} errors`
        );
        return {
          data: results,
          error: {
            message: `Bulk operation completed with ${errors.length} errors`,
            code: "BULK_PARTIAL_FAILURE",
            details: errors,
          },
        };
      }

      return {
        data: results,
        error: null,
      };
    } catch (error) {
      log.error(
        `Unexpected error in bulk upsert for ${this.tableName}:`,
        error
      );
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async bulkUpdate(
    updates: Array<{ id: IdType; data: UpdateInput<T> }>,
    options: BulkOptions = {}
  ): Promise<RepositoryResult<EntityRow<T>[]>> {
    const { batchSize = 100, onProgress } = options;
    const results: EntityRow<T>[] = [];
    const errors: RepositoryError[] = [];

    try {
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(async (update) => {
            const result = await this.update(update.id, update.data);
            if (result.error) {
              throw result.error;
            }
            return result.data!;
          })
        );

        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            results.push(result.value);
          } else {
            const reason = result.reason as RepositoryError;
            errors.push({
              message: reason.message || "Unknown error in bulk update",
              code: reason.code,
              details: result.reason,
            });
          }
        });

        if (onProgress) {
          onProgress(Math.min(i + batchSize, updates.length), updates.length);
        }
      }

      if (errors.length > 0) {
        log.warn(
          `Bulk update for ${this.tableName} completed with ${errors.length} errors`
        );
        return {
          data: results,
          error: {
            message: `Bulk operation completed with ${errors.length} errors`,
            code: "BULK_PARTIAL_FAILURE",
            details: errors,
          },
        };
      }

      return {
        data: results,
        error: null,
      };
    } catch (error) {
      log.error(
        `Unexpected error in bulk update for ${this.tableName}:`,
        error
      );
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  protected buildSelectClause(include?: IncludeOptions): string {
    if (!include) {
      return "*";
    }

    const selections: string[] = ["*"];
    const relationships = this.getTableRelationships();

    Object.entries(include).forEach(([key, value]) => {
      if (value === true && relationships[key]) {
        selections.push(`${key}(*)`);
      } else if (typeof value === "object" && relationships[key]) {
        const nestedSelections = this.buildNestedSelectClause(value);
        selections.push(`${key}(${nestedSelections})`);
      }
    });

    return selections.join(", ");
  }

  protected buildNestedSelectClause(include: IncludeOptions): string {
    const selections: string[] = ["*"];

    Object.entries(include).forEach(([key, value]) => {
      if (value === true) {
        selections.push(`${key}(*)`);
      } else if (typeof value === "object") {
        const nestedSelections = this.buildNestedSelectClause(value);
        selections.push(`${key}(${nestedSelections})`);
      }
    });

    return selections.join(", ");
  }

  protected getTableRelationships(): Record<string, boolean> {
    // Default implementation returns empty relationships
    // Subclasses can override this method to define their specific relationships
    // This follows the open-closed principle - the base class is closed for modification
    // but open for extension via inheritance
    return {};
  }

  protected handleError(error: PostgrestError): RepositoryError {
    // Handle specific PostgreSQL error codes
    if (error.code === "23505") {
      return {
        message: "Unique constraint violation",
        code: "CONSTRAINT_VIOLATION",
        details: error.message,
      };
    }

    if (error.code === "42501") {
      return {
        message: "Permission denied - check RLS policies",
        code: "PERMISSION_DENIED",
        details: error.message,
      };
    }

    if (error.code === "PGRST116") {
      return {
        message: "Not found",
        code: "NOT_FOUND",
        details: error.message,
      };
    }

    // Default error handling
    return {
      message: error.message || "Database operation failed",
      code: error.code || "DATABASE_ERROR",
      details: error.details || error.message,
    };
  }
}
