// ABOUTME: Zod schema for validating skin upgrade data structure
// ABOUTME: Ensures skin-upgrades.json has the correct format and data types

import { z } from "zod";

// Schema for a single skin type's data
const SkinTypeDataSchema = z.object({
  name: z.string(),
  maxLevel: z.literal(60),
  costs: z.array(z.number().int().min(0)).refine(
    (costs) => costs.length >= 60,
    {
      message: "Costs array must have at least 60 elements (for levels 0-59+)",
    }
  ),
});

// Schema for the entire skin upgrades data file
export const SkinUpgradesDataSchema = z.object({
  skinTypes: z.object({
    default: SkinTypeDataSchema,
    champion: SkinTypeDataSchema,
    winter: SkinTypeDataSchema,
    other: SkinTypeDataSchema,
  }),
  otherSkinNames: z.array(z.string()).min(1),
});

// Inferred type from schema
export type SkinUpgradesData = z.infer<typeof SkinUpgradesDataSchema>;

/**
 * Validates skin upgrades data against the schema
 * @param data - The data to validate
 * @returns The validated data
 * @throws {ZodError} If validation fails
 */
export function validateSkinUpgradesData(data: unknown): SkinUpgradesData {
  return SkinUpgradesDataSchema.parse(data);
}
