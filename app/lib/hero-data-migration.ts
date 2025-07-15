// ABOUTME: Utility for migrating hero data from JSON format to database format
// ABOUTME: Transforms complex nested hero data structures for bulk database operations

import type { HeroRecord } from '~/data/hero.zod'
import type {
  CreateInput,
  CreateHeroWithData,
} from '~/repositories/types'

export interface HeroMigrationResult {
  heroes: CreateInput<'hero'>[]
  artifacts: CreateInput<'hero_artifact'>[]
  skins: CreateInput<'hero_skin'>[]
  glyphs: CreateInput<'hero_glyph'>[]
  equipmentSlots: CreateInput<'hero_equipment_slot'>[]
  errors: string[]
}

export interface HeroMigrationOptions {
  skipInvalidData?: boolean
  logProgress?: boolean
}

/**
 * Transform JSON hero data to database format
 */
export function transformHeroData(
  jsonHeroes: HeroRecord[],
  options: HeroMigrationOptions = {}
): HeroMigrationResult {
  const { skipInvalidData = true, logProgress = false } = options
  
  const result: HeroMigrationResult = {
    heroes: [],
    artifacts: [],
    skins: [],
    glyphs: [],
    equipmentSlots: [],
    errors: [],
  }

  for (const jsonHero of jsonHeroes) {
    try {
      if (logProgress) {
        console.log(`Processing hero: ${jsonHero.name} (${jsonHero.slug})`)
      }

      // Validate required fields
      if (!jsonHero.slug || jsonHero.slug.trim() === '') {
        throw new Error('Hero slug is required and cannot be empty')
      }
      if (!jsonHero.name || jsonHero.name.trim() === '') {
        throw new Error('Hero name is required and cannot be empty')
      }
      if (jsonHero.order_rank <= 0) {
        throw new Error('Hero order_rank must be positive')
      }

      // Transform main hero data
      const heroData: CreateInput<'hero'> = {
        slug: jsonHero.slug,
        name: jsonHero.name,
        class: jsonHero.class,
        faction: jsonHero.faction,
        main_stat: jsonHero.main_stat,
        attack_type: jsonHero.attack_type,
        stone_source: jsonHero.stone_source,
        order_rank: jsonHero.order_rank,
        updated_on: jsonHero.updated_on || new Date().toISOString(),
      }
      result.heroes.push(heroData)

      // Transform artifacts
      if (jsonHero.artifacts) {
        const artifacts = transformArtifacts(jsonHero.slug, jsonHero.artifacts)
        result.artifacts.push(...artifacts)
      }

      // Transform skins
      if (jsonHero.skins && jsonHero.skins.length > 0) {
        const skins = transformSkins(jsonHero.slug, jsonHero.skins)
        result.skins.push(...skins)
      }

      // Transform glyphs
      if (jsonHero.glyphs && jsonHero.glyphs.length > 0) {
        const glyphs = transformGlyphs(jsonHero.slug, jsonHero.glyphs)
        result.glyphs.push(...glyphs)
      }

      // Transform equipment/items
      if (jsonHero.items) {
        const equipmentSlots = transformEquipmentSlots(jsonHero.slug, jsonHero.items)
        result.equipmentSlots.push(...equipmentSlots)
      }
    } catch (error) {
      const errorMessage = `Error processing hero ${jsonHero.slug}: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(errorMessage)
      
      if (!skipInvalidData) {
        throw new Error(errorMessage)
      }
    }
  }

  return result
}

/**
 * Transform artifacts data
 */
function transformArtifacts(
  heroSlug: string,
  artifacts: HeroRecord['artifacts']
): CreateInput<'hero_artifact'>[] {
  if (!artifacts) return []

  const result: CreateInput<'hero_artifact'>[] = []

  // Transform weapon artifact
  if (artifacts.weapon) {
    result.push({
      hero_slug: heroSlug,
      artifact_type: 'weapon',
      name: artifacts.weapon.name,
      team_buff: artifacts.weapon.team_buff,
      team_buff_secondary: artifacts.weapon.team_buff_secondary || null,
    })
  }

  // Transform book artifact
  if (artifacts.book) {
    result.push({
      hero_slug: heroSlug,
      artifact_type: 'book',
      name: artifacts.book,
      team_buff: null,
      team_buff_secondary: null,
    })
  }

  // Transform ring artifact (usually null in JSON data)
  if (artifacts.ring) {
    result.push({
      hero_slug: heroSlug,
      artifact_type: 'ring',
      name: artifacts.ring,
      team_buff: null,
      team_buff_secondary: null,
    })
  }

  return result
}

/**
 * Transform skins data
 */
function transformSkins(
  heroSlug: string,
  skins: HeroRecord['skins']
): CreateInput<'hero_skin'>[] {
  if (!skins) return []

  return skins.map(skin => ({
    hero_slug: heroSlug,
    name: skin.name,
    stat_type: skin.stat,
    stat_value: 0, // JSON data doesn't include stat values, using 0 as default
    has_plus: skin.has_plus || false,
    source: skin.source || null,
  }))
}

/**
 * Transform glyphs data
 */
function transformGlyphs(
  heroSlug: string,
  glyphs: HeroRecord['glyphs']
): CreateInput<'hero_glyph'>[] {
  if (!glyphs) return []

  return glyphs
    .map((glyph, index) => {
      if (!glyph) return null // Skip null/undefined glyphs
      
      return {
        hero_slug: heroSlug,
        position: index + 1, // Convert 0-based index to 1-based position
        stat_type: glyph,
        stat_value: 0, // JSON data doesn't include stat values, using 0 as default
      } as CreateInput<'hero_glyph'>
    })
    .filter((glyph): glyph is CreateInput<'hero_glyph'> => glyph !== null)
}

/**
 * Transform equipment/items data
 */
function transformEquipmentSlots(
  heroSlug: string,
  items: HeroRecord['items']
): CreateInput<'hero_equipment_slot'>[] {
  if (!items) return []

  const result: CreateInput<'hero_equipment_slot'>[] = []

  // Quality levels mapping
  const qualityLevels = [
    'white',
    'green',
    'green+1',
    'blue',
    'blue+1',
    'blue+2',
    'violet',
    'violet+1',
    'violet+2',
    'violet+3',
    'orange',
    'orange+1',
    'orange+2',
    'orange+3',
    'orange+4',
  ] as const

  for (const quality of qualityLevels) {
    const equipmentForQuality = items[quality]
    if (equipmentForQuality && equipmentForQuality.length > 0) {
      equipmentForQuality.forEach((equipmentSlug, slotIndex) => {
        result.push({
          hero_slug: heroSlug,
          quality,
          slot_position: slotIndex + 1, // Convert 0-based index to 1-based position
          equipment_slug: equipmentSlug,
        })
      })
    }
  }

  return result
}

/**
 * Create a complete hero data structure for bulk creation
 */
export function createHeroWithDataFromJson(jsonHero: HeroRecord): CreateHeroWithData {
  const migration = transformHeroData([jsonHero])
  
  if (migration.errors.length > 0) {
    throw new Error(`Failed to transform hero ${jsonHero.slug}: ${migration.errors.join(', ')}`)
  }

  return {
    hero: migration.heroes[0],
    artifacts: migration.artifacts.filter(a => a.hero_slug === jsonHero.slug),
    skins: migration.skins.filter(s => s.hero_slug === jsonHero.slug),
    glyphs: migration.glyphs.filter(g => g.hero_slug === jsonHero.slug),
    equipmentSlots: migration.equipmentSlots.filter(es => es.hero_slug === jsonHero.slug),
  }
}

/**
 * Generate progress callback for bulk operations
 */
export function createProgressCallback(
  operationName: string,
  logProgress: boolean = true
) {
  return (completed: number, total: number) => {
    if (logProgress) {
      const percentage = Math.round((completed / total) * 100)
      console.log(`${operationName}: ${completed}/${total} (${percentage}%)`)
    }
  }
}

/**
 * Validate migrated data before database insertion
 */
export function validateMigrationResult(result: HeroMigrationResult): string[] {
  const validationErrors: string[] = []

  // Check for duplicate hero slugs
  const heroSlugs = result.heroes.map(h => h.slug)
  const duplicateHeroSlugs = heroSlugs.filter((slug, index) => heroSlugs.indexOf(slug) !== index)
  if (duplicateHeroSlugs.length > 0) {
    validationErrors.push(`Duplicate hero slugs found: ${duplicateHeroSlugs.join(', ')}`)
  }

  // Check for orphaned artifacts
  const orphanedArtifacts = result.artifacts.filter(
    a => !heroSlugs.includes(a.hero_slug)
  )
  if (orphanedArtifacts.length > 0) {
    validationErrors.push(`Found ${orphanedArtifacts.length} artifacts with missing hero references`)
  }

  // Check for orphaned skins
  const orphanedSkins = result.skins.filter(
    s => !heroSlugs.includes(s.hero_slug)
  )
  if (orphanedSkins.length > 0) {
    validationErrors.push(`Found ${orphanedSkins.length} skins with missing hero references`)
  }

  // Check for orphaned glyphs
  const orphanedGlyphs = result.glyphs.filter(
    g => !heroSlugs.includes(g.hero_slug)
  )
  if (orphanedGlyphs.length > 0) {
    validationErrors.push(`Found ${orphanedGlyphs.length} glyphs with missing hero references`)
  }

  // Check for orphaned equipment slots
  const orphanedEquipmentSlots = result.equipmentSlots.filter(
    es => !heroSlugs.includes(es.hero_slug)
  )
  if (orphanedEquipmentSlots.length > 0) {
    validationErrors.push(`Found ${orphanedEquipmentSlots.length} equipment slots with missing hero references`)
  }

  // Check for invalid glyph positions
  const invalidGlyphPositions = result.glyphs.filter(
    g => g.position < 1 || g.position > 5
  )
  if (invalidGlyphPositions.length > 0) {
    validationErrors.push(`Found ${invalidGlyphPositions.length} glyphs with invalid positions (must be 1-5)`)
  }

  // Check for invalid equipment slot positions
  const invalidSlotPositions = result.equipmentSlots.filter(
    es => es.slot_position < 1 || es.slot_position > 6
  )
  if (invalidSlotPositions.length > 0) {
    validationErrors.push(`Found ${invalidSlotPositions.length} equipment slots with invalid positions (must be 1-6)`)
  }

  return validationErrors
}