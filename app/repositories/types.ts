import type { Database, Tables, TablesInsert, TablesUpdate, Json } from "~/types/supabase"

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
  orderBy?: { column: string; ascending?: boolean } | Array<{ column: string; ascending?: boolean }>
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

// Hero-specific repository types
export type Hero = Tables<'hero'>
export type HeroArtifact = Tables<'hero_artifact'>
export type HeroSkin = Tables<'hero_skin'>
export type HeroGlyph = Tables<'hero_glyph'>
export type HeroEquipmentSlot = Tables<'hero_equipment_slot'>

// Complex hero data with relationships
export interface CompleteHero extends Hero {
  artifacts: HeroArtifact[]
  skins: HeroSkin[]
  glyphs: HeroGlyph[]
  equipmentSlots: HeroEquipmentSlot[]
}

export interface HeroWithArtifacts extends Hero {
  artifacts: HeroArtifact[]
}

export interface HeroWithSkins extends Hero {
  skins: HeroSkin[]
}

export interface HeroWithGlyphs extends Hero {
  glyphs: HeroGlyph[]
}

export interface HeroWithEquipment extends Hero {
  equipmentSlots: HeroEquipmentSlot[]
}

// Hero repository input types for complex data structures
export interface CreateHeroWithData {
  hero: CreateInput<'hero'>
  artifacts?: CreateInput<'hero_artifact'>[]
  skins?: CreateInput<'hero_skin'>[]
  glyphs?: CreateInput<'hero_glyph'>[]
  equipmentSlots?: CreateInput<'hero_equipment_slot'>[]
}

// Player hero collection types
export type PlayerHero = Tables<'player_hero'>
export type PlayerEvent = Tables<'player_event'>

export interface PlayerHeroWithDetails extends PlayerHero {
  hero: Hero
}

export interface CreatePlayerHeroInput {
  hero_slug: string
  stars?: number
  equipment_level?: number
}

export interface UpdatePlayerHeroInput {
  stars?: number
  equipment_level?: number
}

export interface CreatePlayerEventInput {
  event_type: 'CLAIM_HERO' | 'UNCLAIM_HERO' | 'UPDATE_HERO_STARS' | 'UPDATE_HERO_EQUIPMENT'
  hero_slug: string
  event_data?: Json
}