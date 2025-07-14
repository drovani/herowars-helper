// ABOUTME: Repository for managing hero data in the Hero Wars Helper application
// ABOUTME: Extends BaseRepository to provide hero-specific query methods and complex relationship loading

import type { SupabaseClient } from '@supabase/supabase-js'
import log from 'loglevel'
import { z } from 'zod'
import { BaseRepository } from './BaseRepository'
import type {
  BulkOptions,
  CompleteHero,
  CreateHeroWithData,
  CreateInput,
  Hero,
  HeroArtifact,
  HeroEquipmentSlot,
  HeroGlyph,
  HeroSkin,
  HeroWithArtifacts,
  HeroWithEquipment,
  HeroWithGlyphs,
  HeroWithSkins,
  RepositoryResult,
} from './types'

// Hero validation schema for the main hero table
const HeroSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  class: z.string().min(1),
  faction: z.string().min(1),
  main_stat: z.string().min(1),
  attack_type: z.array(z.string()),
  stone_source: z.array(z.string()),
  order_rank: z.number().positive(),
  updated_on: z.string().optional(),
})

export class HeroRepository extends BaseRepository<'hero'> {
  constructor(requestOrSupabase: Request | SupabaseClient<any> | null = null) {
    if (requestOrSupabase && typeof requestOrSupabase === 'object' && 'from' in requestOrSupabase) {
      // Custom supabase client provided (for admin operations)
      super(requestOrSupabase, HeroSchema, 'hero', HeroSchema, 'slug')
    } else {
      // Request or null provided (standard operation)
      super('hero', HeroSchema, requestOrSupabase as Request | null, 'slug')
    }
  }

  protected getTableRelationships(): Record<string, boolean> {
    return {
      hero_artifact: true,
      hero_skin: true,
      hero_glyph: true,
      hero_equipment_slot: true,
    }
  }

  // Hero-specific query methods
  async findByClass(heroClass: string): Promise<RepositoryResult<Hero[]>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select('*')
        .eq('class', heroClass)
        .order('name')

      if (error) {
        log.error(`Error finding heroes by class ${heroClass}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data as Hero[],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding heroes by class ${heroClass}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findByFaction(faction: string): Promise<RepositoryResult<Hero[]>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select('*')
        .eq('faction', faction)
        .order('name')

      if (error) {
        log.error(`Error finding heroes by faction ${faction}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data as Hero[],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding heroes by faction ${faction}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findByMainStat(mainStat: string): Promise<RepositoryResult<Hero[]>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select('*')
        .eq('main_stat', mainStat)
        .order('name')

      if (error) {
        log.error(`Error finding heroes by main stat ${mainStat}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data as Hero[],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding heroes by main stat ${mainStat}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findByAttackType(attackType: string): Promise<RepositoryResult<Hero[]>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select('*')
        .contains('attack_type', [attackType])
        .order('name')

      if (error) {
        log.error(`Error finding heroes by attack type ${attackType}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data as Hero[],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding heroes by attack type ${attackType}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  // Complex hero data loading with relationships
  async findWithAllData(slug: string): Promise<RepositoryResult<CompleteHero>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select(`
          *,
          hero_artifact!hero_artifact_hero_slug_fkey(*),
          hero_skin!hero_skin_hero_slug_fkey(*),
          hero_glyph!hero_glyph_hero_slug_fkey(*),
          hero_equipment_slot!hero_equipment_slot_hero_slug_fkey(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        log.error(`Error finding complete hero data for ${slug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      const completeHero: CompleteHero = {
        ...data,
        artifacts: data.hero_artifact || [],
        skins: data.hero_skin || [],
        glyphs: (data.hero_glyph || []).sort((a: HeroGlyph, b: HeroGlyph) => a.position - b.position),
        equipmentSlots: data.hero_equipment_slot || [],
      }

      // Remove the raw relationship data
      delete (completeHero as any).hero_artifact
      delete (completeHero as any).hero_skin
      delete (completeHero as any).hero_glyph
      delete (completeHero as any).hero_equipment_slot

      return {
        data: completeHero,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding complete hero data for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findWithArtifacts(slug: string): Promise<RepositoryResult<HeroWithArtifacts>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select(`
          *,
          hero_artifact!hero_artifact_hero_slug_fkey(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        log.error(`Error finding hero with artifacts for ${slug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      const heroWithArtifacts: HeroWithArtifacts = {
        ...data,
        artifacts: data.hero_artifact || [],
      }

      delete (heroWithArtifacts as any).hero_artifact

      return {
        data: heroWithArtifacts,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding hero with artifacts for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findWithSkins(slug: string): Promise<RepositoryResult<HeroWithSkins>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select(`
          *,
          hero_skin!hero_skin_hero_slug_fkey(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        log.error(`Error finding hero with skins for ${slug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      const heroWithSkins: HeroWithSkins = {
        ...data,
        skins: data.hero_skin || [],
      }

      delete (heroWithSkins as any).hero_skin

      return {
        data: heroWithSkins,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding hero with skins for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findWithGlyphs(slug: string): Promise<RepositoryResult<HeroWithGlyphs>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select(`
          *,
          hero_glyph!hero_glyph_hero_slug_fkey(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        log.error(`Error finding hero with glyphs for ${slug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      const heroWithGlyphs: HeroWithGlyphs = {
        ...data,
        glyphs: (data.hero_glyph || []).sort((a: HeroGlyph, b: HeroGlyph) => a.position - b.position),
      }

      delete (heroWithGlyphs as any).hero_glyph

      return {
        data: heroWithGlyphs,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding hero with glyphs for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async findWithEquipment(slug: string): Promise<RepositoryResult<HeroWithEquipment>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select(`
          *,
          hero_equipment_slot!hero_equipment_slot_hero_slug_fkey(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        log.error(`Error finding hero with equipment for ${slug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      const heroWithEquipment: HeroWithEquipment = {
        ...data,
        equipmentSlots: data.hero_equipment_slot || [],
      }

      delete (heroWithEquipment as any).hero_equipment_slot

      return {
        data: heroWithEquipment,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding hero with equipment for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  // Equipment relationship queries
  async findHeroesUsingEquipment(equipmentSlug: string): Promise<RepositoryResult<Hero[]>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero')
        .select(`
          *,
          hero_equipment_slot!hero_equipment_slot_hero_slug_fkey(equipment_slug)
        `)
        .eq('hero_equipment_slot.equipment_slug', equipmentSlug)

      if (error) {
        log.error(`Error finding heroes using equipment ${equipmentSlug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      // Extract unique heroes (remove duplicates if hero uses same equipment in multiple slots)
      const uniqueHeroes = data.reduce((acc: Hero[], current: any) => {
        if (!acc.find(h => h.slug === current.slug)) {
          const { hero_equipment_slot, ...hero } = current
          acc.push(hero as Hero)
        }
        return acc
      }, [])

      return {
        data: uniqueHeroes,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding heroes using equipment ${equipmentSlug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async getHeroEquipmentByQuality(heroSlug: string, quality: string): Promise<RepositoryResult<HeroEquipmentSlot[]>> {
    try {
      const { data, error } = await (this.supabase)
        .from('hero_equipment_slot')
        .select('*')
        .eq('hero_slug', heroSlug)
        .eq('quality', quality)
        .order('slot_position')

      if (error) {
        log.error(`Error finding hero equipment by quality for ${heroSlug}, quality ${quality}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data as HeroEquipmentSlot[],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding hero equipment by quality for ${heroSlug}, quality ${quality}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  // Bulk operations for complex hero data
  async createWithAllData(heroData: CreateHeroWithData): Promise<RepositoryResult<CompleteHero>> {
    try {
      // Start transaction - create hero first
      const heroResult = await this.create(heroData.hero)
      if (heroResult.error) {
        return heroResult as RepositoryResult<CompleteHero>
      }

      const hero = heroResult.data!
      const results: {
        artifacts: HeroArtifact[]
        skins: HeroSkin[]
        glyphs: HeroGlyph[]
        equipmentSlots: HeroEquipmentSlot[]
      } = {
        artifacts: [],
        skins: [],
        glyphs: [],
        equipmentSlots: [],
      }

      // Create related data
      if (heroData.artifacts && heroData.artifacts.length > 0) {
        const artifactsResult = await this.bulkCreateArtifacts(heroData.artifacts)
        if (artifactsResult.error) {
          log.warn(`Some artifacts failed to create for hero ${hero.slug}:`, artifactsResult.error)
        }
        results.artifacts = artifactsResult.data || []
      }

      if (heroData.skins && heroData.skins.length > 0) {
        const skinsResult = await this.bulkCreateSkins(heroData.skins)
        if (skinsResult.error) {
          log.warn(`Some skins failed to create for hero ${hero.slug}:`, skinsResult.error)
        }
        results.skins = skinsResult.data || []
      }

      if (heroData.glyphs && heroData.glyphs.length > 0) {
        const glyphsResult = await this.bulkCreateGlyphs(heroData.glyphs)
        if (glyphsResult.error) {
          log.warn(`Some glyphs failed to create for hero ${hero.slug}:`, glyphsResult.error)
        }
        results.glyphs = glyphsResult.data || []
      }

      if (heroData.equipmentSlots && heroData.equipmentSlots.length > 0) {
        const equipmentResult = await this.bulkCreateEquipmentSlots(heroData.equipmentSlots)
        if (equipmentResult.error) {
          log.warn(`Some equipment slots failed to create for hero ${hero.slug}:`, equipmentResult.error)
        }
        results.equipmentSlots = equipmentResult.data || []
      }

      const completeHero: CompleteHero = {
        ...hero,
        artifacts: results.artifacts,
        skins: results.skins,
        glyphs: results.glyphs.sort((a, b) => a.position - b.position),
        equipmentSlots: results.equipmentSlots,
      }

      return {
        data: completeHero,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error creating hero with all data:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  // Bulk operations for individual relationship tables
  async bulkCreateArtifacts(
    artifacts: CreateInput<'hero_artifact'>[],
    options: BulkOptions = {}
  ): Promise<RepositoryResult<HeroArtifact[]>> {
    const { batchSize = 100, onProgress } = options
    const results: HeroArtifact[] = []
    const errors: any[] = []

    try {
      for (let i = 0; i < artifacts.length; i += batchSize) {
        const batch = artifacts.slice(i, i + batchSize)
        const { data, error } = await (this.supabase)
          .from('hero_artifact')
          .insert(batch)
          .select()

        if (error) {
          errors.push(error)
          log.error(`Error in bulk create artifacts batch ${i}:`, error)
        } else {
          results.push(...(data as HeroArtifact[]))
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, artifacts.length), artifacts.length)
        }
      }

      if (errors.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk artifact creation completed with ${errors.length} errors`,
            code: 'BULK_PARTIAL_FAILURE',
            details: errors,
          },
        }
      }

      return {
        data: results,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error in bulk create artifacts:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async bulkCreateSkins(
    skins: CreateInput<'hero_skin'>[],
    options: BulkOptions = {}
  ): Promise<RepositoryResult<HeroSkin[]>> {
    const { batchSize = 100, onProgress } = options
    const results: HeroSkin[] = []
    const errors: any[] = []

    try {
      for (let i = 0; i < skins.length; i += batchSize) {
        const batch = skins.slice(i, i + batchSize)
        const { data, error } = await (this.supabase)
          .from('hero_skin')
          .insert(batch)
          .select()

        if (error) {
          errors.push(error)
          log.error(`Error in bulk create skins batch ${i}:`, error)
        } else {
          results.push(...(data as HeroSkin[]))
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, skins.length), skins.length)
        }
      }

      if (errors.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk skin creation completed with ${errors.length} errors`,
            code: 'BULK_PARTIAL_FAILURE',
            details: errors,
          },
        }
      }

      return {
        data: results,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error in bulk create skins:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async bulkCreateGlyphs(
    glyphs: CreateInput<'hero_glyph'>[],
    options: BulkOptions = {}
  ): Promise<RepositoryResult<HeroGlyph[]>> {
    const { batchSize = 100, onProgress } = options
    const results: HeroGlyph[] = []
    const errors: any[] = []

    try {
      for (let i = 0; i < glyphs.length; i += batchSize) {
        const batch = glyphs.slice(i, i + batchSize)
        const { data, error } = await (this.supabase)
          .from('hero_glyph')
          .insert(batch)
          .select()

        if (error) {
          errors.push(error)
          log.error(`Error in bulk create glyphs batch ${i}:`, error)
        } else {
          results.push(...(data as HeroGlyph[]))
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, glyphs.length), glyphs.length)
        }
      }

      if (errors.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk glyph creation completed with ${errors.length} errors`,
            code: 'BULK_PARTIAL_FAILURE',
            details: errors,
          },
        }
      }

      return {
        data: results,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error in bulk create glyphs:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  async bulkCreateEquipmentSlots(
    equipmentSlots: CreateInput<'hero_equipment_slot'>[],
    options: BulkOptions = {}
  ): Promise<RepositoryResult<HeroEquipmentSlot[]>> {
    const { batchSize = 100, onProgress } = options
    const results: HeroEquipmentSlot[] = []
    const errors: any[] = []

    try {
      for (let i = 0; i < equipmentSlots.length; i += batchSize) {
        const batch = equipmentSlots.slice(i, i + batchSize)
        const { data, error } = await (this.supabase)
          .from('hero_equipment_slot')
          .insert(batch)
          .select()

        if (error) {
          errors.push(error)
          log.error(`Error in bulk create equipment slots batch ${i}:`, error)
        } else {
          results.push(...(data as HeroEquipmentSlot[]))
        }

        if (onProgress) {
          onProgress(Math.min(i + batchSize, equipmentSlots.length), equipmentSlots.length)
        }
      }

      if (errors.length > 0) {
        return {
          data: results,
          error: {
            message: `Bulk equipment slot creation completed with ${errors.length} errors`,
            code: 'BULK_PARTIAL_FAILURE',
            details: errors,
          },
        }
      }

      return {
        data: results,
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error in bulk create equipment slots:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      }
    }
  }

  /**
   * Purge all hero-related data from the database
   * This includes heroes, artifacts, skins, glyphs, and equipment slots
   */
  async purgeHeroDomain(): Promise<RepositoryResult<{ heroes: number }>> {
    try {
      log.info('Starting hero domain purge...');

      // Delete in correct order to respect foreign key constraints
      const deleteResults = await Promise.all([
        this.supabase.from('hero_equipment_slot').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        this.supabase.from('hero_glyph').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        this.supabase.from('hero_skin').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        this.supabase.from('hero_artifact').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      // Check for errors in the related table deletions
      for (const result of deleteResults) {
        if (result.error) {
          log.error('Failed to purge hero related data:', result.error);
          return {
            data: null,
            error: {
              message: `Failed to purge hero related data: ${result.error.message}`,
              code: 'PURGE_RELATED_FAILED',
              details: result.error
            }
          };
        }
      }

      // Now delete all heroes
      const heroDeleteResult = await this.supabase
        .from('hero')
        .delete()
        .neq('slug', '__nonexistent__');

      if (heroDeleteResult.error) {
        log.error('Failed to purge heroes:', heroDeleteResult.error);
        return {
          data: null,
          error: {
            message: `Failed to purge heroes: ${heroDeleteResult.error.message}`,
            code: 'PURGE_HEROES_FAILED',
            details: heroDeleteResult.error
          }
        };
      }

      const heroCount = heroDeleteResult.count || 0;
      log.info(`Successfully purged ${heroCount} heroes and all related data`);

      return {
        data: { heroes: heroCount },
        error: null
      };

    } catch (error) {
      log.error('Hero domain purge failed:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error during hero domain purge',
          code: 'PURGE_DOMAIN_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Initialize hero data from JSON files
   * Transforms JSON hero data and loads it into the database using bulk operations
   */
  async initializeFromJSON(heroesJsonData: any[]): Promise<RepositoryResult<{ heroes: CompleteHero[] }>> {
    try {
      log.info(`Starting hero data initialization from JSON (${heroesJsonData.length} heroes)...`);

      const createdHeroes: CompleteHero[] = [];
      const errors: any[] = [];
      const skipped: any[] = [];

      // Process each hero individually for better error handling
      for (let i = 0; i < heroesJsonData.length; i++) {
        const heroJson = heroesJsonData[i];

        try {
          // Transform JSON hero to database format
          const transformedHero = this.transformJsonHeroToDatabase(heroJson);

          // Create hero with all related data
          const createResult = await this.createWithAllData(transformedHero);

          if (createResult.error) {
            if (createResult.error.code === 'UNIQUE_VIOLATION' || createResult.error.message?.includes('already exists')) {
              skipped.push({
                slug: heroJson.slug,
                name: heroJson.name,
                reason: 'Already exists'
              });
            } else {
              errors.push({
                inputData: heroJson,
                message: createResult.error.message,
                code: createResult.error.code,
                batchIndex: i,
                details: createResult.error.details
              });
            }
          } else if (createResult.data) {
            createdHeroes.push(createResult.data);
          }

        } catch (transformError) {
          errors.push({
            inputData: heroJson,
            message: transformError instanceof Error ? transformError.message : 'Data transformation failed',
            code: 'TRANSFORM_ERROR',
            batchIndex: i,
            details: transformError
          });
        }
      }

      log.info(`Hero initialization completed: ${createdHeroes.length} created, ${skipped.length} skipped, ${errors.length} errors`);

      // Determine result status
      if (errors.length > 0 && createdHeroes.length === 0) {
        return {
          data: null,
          error: {
            message: `Hero initialization failed: ${errors.length} errors, no heroes created`,
            code: 'BULK_INITIALIZATION_FAILED',
            details: { errors, skipped }
          }
        };
      } else if (errors.length > 0 || skipped.length > 0) {
        return {
          data: { heroes: createdHeroes },
          error: {
            message: `Hero initialization partially successful: ${createdHeroes.length} created, ${errors.length} errors, ${skipped.length} skipped`,
            code: 'BULK_PARTIAL_SUCCESS',
            details: { errors, skipped }
          }
        };
      } else {
        return {
          data: { heroes: createdHeroes },
          error: null
        };
      }

    } catch (error) {
      log.error('Hero JSON initialization failed:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error during hero JSON initialization',
          code: 'JSON_INIT_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Transform JSON hero data to database format for createWithAllData
   */
  private transformJsonHeroToDatabase(heroJson: any): CreateHeroWithData {
    const createData: CreateHeroWithData = {
      hero: {
        slug: heroJson.slug,
        name: heroJson.name,
        class: heroJson.class,
        faction: heroJson.faction,
        main_stat: heroJson.main_stat,
        attack_type: heroJson.attack_type || [],
        stone_source: heroJson.stone_source || [],
        order_rank: heroJson.order_rank || 0,
      },
      artifacts: [],
      skins: [],
      glyphs: [],
      equipmentSlots: []
    };

    // Transform artifacts
    if (heroJson.artifacts) {
      if (heroJson.artifacts.weapon) {
        createData.artifacts!.push({
          hero_slug: heroJson.slug,
          artifact_type: 'weapon',
          name: heroJson.artifacts.weapon.name,
          team_buff: heroJson.artifacts.weapon.team_buff,
          team_buff_secondary: heroJson.artifacts.weapon.team_buff_secondary || null
        });
      }
      if (heroJson.artifacts.book) {
        createData.artifacts!.push({
          hero_slug: heroJson.slug,
          artifact_type: 'book',
          name: heroJson.artifacts.book,
          team_buff: null,
          team_buff_secondary: null
        });
      }
      if (heroJson.artifacts.ring !== undefined) {
        createData.artifacts!.push({
          hero_slug: heroJson.slug,
          artifact_type: 'ring',
          name: null,
          team_buff: null,
          team_buff_secondary: null
        });
      }
    }

    // Transform skins
    if (heroJson.skins && Array.isArray(heroJson.skins)) {
      createData.skins = heroJson.skins.map((skin: any) => ({
        hero_slug: heroJson.slug,
        name: skin.name,
        stat_type: skin.stat,
        stat_value: 0, // JSON doesn't include values, use 0 as default
        has_plus: skin.has_plus || false,
        source: skin.source || null
      }));
    }

    // Transform glyphs
    if (heroJson.glyphs && Array.isArray(heroJson.glyphs)) {
      heroJson.glyphs.forEach((glyphStat: string | null, index: number) => {
        if (glyphStat !== null) {
          createData.glyphs!.push({
            hero_slug: heroJson.slug,
            position: index + 1,
            stat_type: glyphStat,
            stat_value: 0 // JSON doesn't include values, use 0 as default
          });
        }
      });
    }

    // Transform equipment items
    if (heroJson.items) {
      for (const [quality, equipmentArray] of Object.entries(heroJson.items)) {
        if (Array.isArray(equipmentArray)) {
          equipmentArray.forEach((equipmentSlug: string | null, slotIndex: number) => {
            if (equipmentSlug) {
              createData.equipmentSlots!.push({
                hero_slug: heroJson.slug,
                quality: quality,
                slot_position: slotIndex + 1,
                equipment_slug: equipmentSlug
              });
            }
          });
        }
      }
    }

    return createData;
  }
}