import { z } from "zod";
import { generateSlug } from "~/lib/utils";
export const EQUIPMENT_QUALITIES = [
  "gray",
  "green",
  "blue",
  "violet",
  "orange",
] as const;

const BaseEquipmentProperties = z.object({
  name: z.string(),
  quality: z.enum(EQUIPMENT_QUALITIES),
  buy_value_gold: z.number().int().min(0).nullable(),
  buy_value_coin: z.number().int().min(0).nullable(),
  sell_value: z.number().int().min(0),
  guild_activity_points: z.number().int().min(0),
  crafting_gold_cost: z.number().int().min(0).nullable().optional(),
});

const CraftedProperties = z.object({
  crafting: z
    .object({
      gold_cost: z.number().int().min(0),
      required_items: z
        .record(z.string(), z.number().int().min(1))
        .refine((items) => Object.keys(items).length > 0, {
          message: "At least one required item must be provided",
        }),
    })
    .optional(),
});

const CampaignSourcedProperties = z.object({
  campaign_sources: z.array(z.string()).nullable().optional(),
});

const EquipableEquipmentSchema = BaseEquipmentProperties.merge(
  CampaignSourcedProperties
)
  .merge(CraftedProperties)
  .extend({
    type: z.literal("equipable"),
    stats: z
      .record(z.string(), z.number())
      .refine((stats) => Object.keys(stats).length > 0, {
        message: "At least one stat must be provided",
      }),
    hero_level_required: z.number().int().min(1).max(120),
  });

const FragmentEquipmentSchema = BaseEquipmentProperties.merge(
  CampaignSourcedProperties
).extend({
  type: z.literal("fragment"),
  name: z.string().refine((name) => name.endsWith(" (Fragment)"), {
    message: "Fragment names must end with ' (Fragment)'",
  }),
});

const RecipeEquipmentSchema = BaseEquipmentProperties.merge(CraftedProperties)
  .merge(CampaignSourcedProperties)
  .extend({
    type: z.literal("recipe"),
    name: z.string().refine((name) => name.indexOf(" Recipe") > 0, {
      message: "Recipe names must contain ' Recipe'",
    }),
  });

export const EquipmentMutationSchema = z
  .discriminatedUnion("type", [
    EquipableEquipmentSchema,
    FragmentEquipmentSchema,
    RecipeEquipmentSchema,
  ])
  .transform((mutation) => {
    return {
      ...mutation,
      slug: generateSlug(mutation.name),
      updated_on: new Date().toISOString(),
    };
  });

export type EquipmentMutation = z.input<typeof EquipmentMutationSchema>;
export type EquipmentRecord = z.infer<typeof EquipmentMutationSchema>;

// Schema for equipment table only (without stats, which are stored separately)
const EquipableEquipmentTableSchema = BaseEquipmentProperties.merge(
  CampaignSourcedProperties
)
  .merge(CraftedProperties)
  .extend({
    type: z.literal("equipable"),
    hero_level_required: z.number().int().min(1).max(120),
    slug: z.string(),
    updated_on: z.string().optional(),
  });

const FragmentEquipmentTableSchema = BaseEquipmentProperties.merge(
  CampaignSourcedProperties
).extend({
  type: z.literal("fragment"),
  name: z.string().refine((name) => name.endsWith(" (Fragment)"), {
    message: "Fragment names must end with ' (Fragment)'",
  }),
  slug: z.string(),
  updated_on: z.string().optional(),
});

const RecipeEquipmentTableSchema = BaseEquipmentProperties.merge(
  CraftedProperties
)
  .merge(CampaignSourcedProperties)
  .extend({
    type: z.literal("recipe"),
    name: z.string().refine((name) => name.indexOf(" Recipe") > 0, {
      message: "Recipe names must contain ' Recipe'",
    }),
    slug: z.string(),
    updated_on: z.string().optional(),
  });

export const EquipmentTableSchema = z.discriminatedUnion("type", [
  EquipableEquipmentTableSchema,
  FragmentEquipmentTableSchema,
  RecipeEquipmentTableSchema,
]);

export function isFragment(
  equipment: EquipmentMutation
): equipment is z.infer<typeof FragmentEquipmentSchema> {
  return equipment.type === "fragment";
}
export function isRecipe(
  equipment: EquipmentMutation
): equipment is z.infer<typeof RecipeEquipmentSchema> {
  return equipment.type === "recipe";
}
export function isEquipable(
  equipment: EquipmentMutation
): equipment is z.infer<typeof EquipableEquipmentSchema> {
  return equipment.type === "equipable";
}
