// ABOUTME: Test data factory functions for generating mock data in MSW handlers
// ABOUTME: Provides consistent test data generation for equipment, missions, and other entities

import type { Database } from "~/types/supabase";

type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
type Mission = Database["public"]["Tables"]["mission"]["Row"];
type Chapter = Database["public"]["Tables"]["chapter"]["Row"];

/**
 * Creates mock equipment data with sensible defaults
 */
export const createMockEquipment = (
  overrides: Partial<Equipment> = {}
): Equipment => ({
  slug: "test-equipment",
  name: "Test Equipment",
  quality: "green",
  type: "equipable",
  sell_value: 100,
  guild_activity_points: 5,
  buy_value_coin: null,
  buy_value_gold: null,
  campaign_sources: null,
  crafting_gold_cost: null,
  hero_level_required: null,
  ...overrides,
});

/**
 * Creates mock mission data with sensible defaults
 */
export const createMockMission = (
  overrides: Partial<Mission> = {}
): Mission => ({
  slug: "test-mission",
  name: "Test Mission",
  chapter_id: 1,
  hero_slug: null,
  energy_cost: 6,
  level: 1,
  ...overrides,
});

/**
 * Creates mock chapter data with sensible defaults
 */
export const createMockChapter = (
  overrides: Partial<Chapter> = {}
): Chapter => ({
  id: 1,
  title: "Test Chapter",
  ...overrides,
});

/**
 * Creates arrays of mock data for bulk operations
 */
export const createMockEquipmentList = (
  count: number,
  baseOverrides: Partial<Equipment> = {}
): Equipment[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockEquipment({
      ...baseOverrides,
      slug: `test-equipment-${index + 1}`,
      name: `Test Equipment ${index + 1}`,
    })
  );
};

export const createMockMissionList = (
  count: number,
  baseOverrides: Partial<Mission> = {}
): Mission[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockMission({
      ...baseOverrides,
      slug: `test-mission-${index + 1}`,
      name: `Test Mission ${index + 1}`,
    })
  );
};

export const createMockChapterList = (
  count: number,
  baseOverrides: Partial<Chapter> = {}
): Chapter[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockChapter({
      ...baseOverrides,
      id: index + 1,
      title: `Test Chapter ${index + 1}`,
    })
  );
};

/**
 * Common Supabase error responses
 */
export const createSupabaseError = (
  code: string,
  message: string,
  details?: string
) => ({
  error: {
    code,
    message,
    details: details || message,
    hint: null,
  },
});

export const SUPABASE_ERRORS = {
  NOT_FOUND: createSupabaseError(
    "PGRST116",
    "Record not found",
    "No rows found"
  ),
  UNIQUE_CONSTRAINT: createSupabaseError(
    "23505",
    "Unique constraint violation",
    "Key already exists"
  ),
  PERMISSION_DENIED: createSupabaseError(
    "42501",
    "Permission denied",
    "RLS violation"
  ),
  NETWORK_ERROR: createSupabaseError(
    "500",
    "Internal server error",
    "Database connection failed"
  ),
  VALIDATION_ERROR: createSupabaseError(
    "422",
    "Validation error",
    "Invalid input data"
  ),
};
