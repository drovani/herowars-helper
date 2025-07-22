import type { SupabaseClient } from "@supabase/supabase-js";
import log from "loglevel";
import type { ZodSchema } from "zod";
import { createClient } from "~/lib/supabase/client";
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

export abstract class BaseRepository<T extends TableName> {
  protected supabase: SupabaseClient<any>;
  protected tableName: T;
  protected schema: ZodSchema<any>;
  protected primaryKeyColumn: string;

  constructor(
    tableNameOrSupabase: T | SupabaseClient<any>,
    schema: ZodSchema<any>,
    requestOrTableName?: Request | T | null,
    primaryKeyColumnOrSchema?: string | ZodSchema<any>,
    primaryKeyColumn: string = "id"
  ) {
    // Handle different constructor signatures
    if (typeof tableNameOrSupabase === "string") {
      // First signature: (tableName, schema, request?, primaryKeyColumn?)
      const { supabase } = createClient(requestOrTableName as Request | null);
      this.supabase = supabase as unknown as SupabaseClient<any>;
      this.tableName = tableNameOrSupabase;
      this.schema = schema;
      this.primaryKeyColumn = (primaryKeyColumnOrSchema as string) || "id";
    } else {
      // Second signature: (supabase, tableName, schema, primaryKeyColumn?)
      this.supabase = tableNameOrSupabase as unknown as SupabaseClient<any>;
      this.tableName = requestOrTableName as T;
      this.schema = primaryKeyColumnOrSchema as ZodSchema<any>;
      this.primaryKeyColumn = primaryKeyColumn;
    }
  }

  async findAll(
    options: FindAllOptions = {}
  ): Promise<RepositoryResult<EntityRow<T>[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select(this.buildSelectClause(options.include));

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = (query as any).eq(key, value);
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

      const { data, error } = await query;

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
      const { data, error } = await (this.supabase as any)
        .from(this.tableName)
        .select(this.buildSelectClause(options.include))
        .eq(this.primaryKeyColumn as any, id)
        .single();

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
        const primaryKeyValue = (input as any)[this.primaryKeyColumn];
        if (primaryKeyValue) {
          const existingRecord = await this.findById(primaryKeyValue);
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
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(input as any)
        .select()
        .single();

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
      const validation = (this.schema as any).partial().safeParse(input);
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

      const { data, error } = await (this.supabase as any)
        .from(this.tableName)
        .update(input as any)
        .eq(this.primaryKeyColumn as any, id)
        .select()
        .single();

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
      const { error } = await (this.supabase as any)
        .from(this.tableName)
        .delete()
        .eq(this.primaryKeyColumn as any, id);

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
            const errorMsg =
              result.reason?.message ||
              result.reason?.error?.message ||
              result.reason?.details ||
              "Unknown error in bulk create";
            const errorCode =
              result.reason?.code ||
              result.reason?.error?.code ||
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
              inputData: result.reason?.inputData,
              batchIndex: result.reason?.batchIndex,
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

      const { data, error } = await this.supabase
        .from(this.tableName)
        .upsert(input as any, {
          onConflict: this.primaryKeyColumn,
          ignoreDuplicates: false,
        })
        .select()
        .single();

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
            errors.push({
              message: result.reason.message || "Unknown error in bulk upsert",
              code: result.reason.code,
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
            errors.push({
              message: result.reason.message || "Unknown error in bulk update",
              code: result.reason.code,
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

  protected handleError(error: any): RepositoryError {
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
