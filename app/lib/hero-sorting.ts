// ABOUTME: Utility functions for sorting heroes in various ways with type safety
// ABOUTME: Provides sorting by name, order_rank, and other hero attributes with ascending/descending options

import type { Hero } from "~/repositories/types";
import type { HeroRecord } from "~/data/hero.zod";

export type SortField = "name" | "order_rank";
export type SortDirection = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

/**
 * Sort heroes by the specified field and direction
 * Works with both Hero (database) and HeroRecord (JSON) types
 */
export function sortHeroes<T extends Hero | HeroRecord>(
  heroes: T[],
  options: SortOptions
): T[] {
  const { field, direction } = options;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...heroes].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "order_rank":
        comparison = a.order_rank - b.order_rank;
        break;
      default:
        comparison = 0;
    }

    return comparison * multiplier;
  });
}

/**
 * Parse sort parameters from URL search params
 * Provides defaults if parameters are invalid or missing
 */
export function parseSortParams(searchParams: URLSearchParams): SortOptions {
  const field = searchParams.get("sort") as SortField;
  const direction = searchParams.get("dir") as SortDirection;

  return {
    field: field === "name" || field === "order_rank" ? field : "order_rank",
    direction: direction === "asc" || direction === "desc" ? direction : "asc",
  };
}

/**
 * Create URL search params for the current sort options
 */
export function createSortParams(options: SortOptions): URLSearchParams {
  const params = new URLSearchParams();
  params.set("sort", options.field);
  params.set("dir", options.direction);
  return params;
}

/**
 * Toggle sort direction for the given field
 * If switching to a new field, default to ascending
 */
export function toggleSortDirection(
  currentOptions: SortOptions,
  newField: SortField
): SortOptions {
  if (currentOptions.field === newField) {
    return {
      field: newField,
      direction: currentOptions.direction === "asc" ? "desc" : "asc",
    };
  }

  return {
    field: newField,
    direction: "asc",
  };
}
