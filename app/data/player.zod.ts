import { z } from "zod";

// Define the schema for a single glyph's data
export const PlayerHeroGlyphSchema = z.object({
  stat: z.string(),
  level: z.number().int().min(0),
});

// Define the schema for a hero skin's data
export const PlayerHeroSkinSchema = z.object({
  name: z.string(),
  level: z.number().int().min(0).max(60),
  unlocked: z.boolean(),
});

// Define the schema for a single artifact's data
export const PlayerHeroArtifactSchema = z.object({
  level: z.number().int().min(0).max(100),
  stars: z.number().int().min(0).max(6),
});

// Define the schema for a hero's artifacts
export const PlayerHeroArtifactsSchema = z.object({
  weapon: PlayerHeroArtifactSchema,
  book: PlayerHeroArtifactSchema,
  ring: PlayerHeroArtifactSchema,
});

// Define the schema for a hero's item collection status
export const ItemStatusEnum = z.enum(["equipped", "crafted", "none"]);
export type ItemStatus = z.infer<typeof ItemStatusEnum>;

// Define the schema for equipped items
export const PlayerHeroItemsSchema = z.object({
  current_tier: z.string(),
  items: z.array(ItemStatusEnum).length(6), // Exactly 6 items, each with a status
});

// Define the schema for a player's hero data
export const PlayerHeroSchema = z.object({
  slug: z.string(),
  owned: z.boolean(),
  stars: z.number().int().min(0).max(6).optional(),
  level: z.number().int().min(1).max(130).optional(),
  glyphs: z.array(PlayerHeroGlyphSchema).length(5).optional(),
  skins: z.array(PlayerHeroSkinSchema).optional(),
  items: PlayerHeroItemsSchema.optional(),
  artifacts: PlayerHeroArtifactsSchema.optional(),
  lastUpdated: z.string().datetime(),
});

// Define the schema for a player's entire hero collection
export const PlayerHeroCollectionSchema = z.object({
  userId: z.string(),
  heroes: z.array(PlayerHeroSchema),
  lastUpdated: z.string().datetime(),
});

// Define types from schemas
export type PlayerHeroGlyph = z.infer<typeof PlayerHeroGlyphSchema>;
export type PlayerHeroSkin = z.infer<typeof PlayerHeroSkinSchema>;
export type PlayerHeroArtifact = z.infer<typeof PlayerHeroArtifactSchema>;
export type PlayerHeroArtifacts = z.infer<typeof PlayerHeroArtifactsSchema>;
export type PlayerHeroItems = z.infer<typeof PlayerHeroItemsSchema>;
export type PlayerHero = z.infer<typeof PlayerHeroSchema>;
export type PlayerHeroCollection = z.infer<typeof PlayerHeroCollectionSchema>;
