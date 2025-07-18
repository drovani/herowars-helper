// ABOUTME: Repository for managing hero data in the Hero Wars Helper application
// ABOUTME: Extends BaseRepository to provide hero-specific query methods and complex relationship loading

import type { SupabaseClient } from '@supabase/supabase-js'
import log from 'loglevel'
import { z } from 'zod'
import { BaseRepository } from './BaseRepository'
import type {
  BasicHero,
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

  /**
   * Find all heroes with basic data for cards view (minimal query)
   * @param options Optional limit and offset for pagination
   * @returns Paginated list of heroes with only essential fields
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findAllBasic({ limit: 50, offset: 0 });
   */
  async findAllBasic(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<RepositoryResult<BasicHero[]>> {
    const { limit, offset } = options;
    
    try {
      let query = this.supabase
        .from('hero')
        .select('slug, name, class, faction, main_stat, order_rank')
        .order('order_rank');

      if (limit !== undefined) {
        query = query.limit(limit);
      }
      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error finding all heroes (basic):', error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data as BasicHero[],
        error: null,
      };
    } catch (error) {
      log.error('Unexpected error finding all heroes (basic):', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Find all heroes with optional pagination support
   * @param options Optional limit and offset for pagination
   * @returns Paginated list of heroes
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findAll({ limit: 20, offset: 0 });
   */
  async findAll(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<RepositoryResult<Hero[]>> {
    const { limit, offset } = options;
    
    try {
      let query = this.supabase
        .from('hero')
        .select('*')
        .order('order_rank');

      if (limit !== undefined) {
        query = query.limit(limit);
      }
      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error finding all heroes:', error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data as Hero[],
        error: null,
      };
    } catch (error) {
      log.error('Unexpected error finding all heroes:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  // Hero-specific query methods
  /**
   * Find heroes by class (Tank, Damage, Support, Control)
   * @param heroClass The hero class to filter by
   * @returns Heroes matching the specified class
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findByClass('Tank');
   */
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

  /**
   * Find heroes by faction (Eternity, Chaos, Order, etc.)
   * @param faction The faction to filter by
   * @returns Heroes matching the specified faction
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findByFaction('Eternity');
   */
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

  /**
   * Find heroes by main stat (strength, agility, intelligence)
   * @param mainStat The main stat to filter by
   * @returns Heroes matching the specified main stat
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findByMainStat('strength');
   */
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

  /**
   * Find heroes by attack type (physical, magical, pure)
   * @param attackType The attack type to filter by
   * @returns Heroes matching the specified attack type
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findByAttackType('physical');
   */
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

  /**
   * Bulk load all heroes with complete relationship data
   * @param options Optional pagination and filtering options
   * @returns All heroes with artifacts, skins, glyphs, and equipment slots loaded
   * @throws {RepositoryError} When database query fails
   * @example
   * const result = await repository.findAllWithRelationships({ limit: 50 });
   */
  async findAllWithRelationships(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<RepositoryResult<CompleteHero[]>> {
    const { limit, offset } = options;
    
    try {
      let query = this.supabase
        .from('hero')
        .select(`
          *,
          hero_artifact!hero_artifact_hero_slug_fkey(*),
          hero_skin!hero_skin_hero_slug_fkey(*),
          hero_glyph!hero_glyph_hero_slug_fkey(*),
          hero_equipment_slot!hero_equipment_slot_hero_slug_fkey(*)
        `)
        .order('order_rank');

      if (limit !== undefined) {
        query = query.limit(limit);
      }
      if (offset !== undefined) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        log.error('Error bulk loading heroes with relationships:', error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      const completeHeroes: CompleteHero[] = data.map((hero: any) => ({
        ...hero,
        artifacts: hero.hero_artifact || [],
        skins: hero.hero_skin || [],
        glyphs: (hero.hero_glyph || []).sort((a: HeroGlyph, b: HeroGlyph) => a.position - b.position),
        equipmentSlots: hero.hero_equipment_slot || [],
      }));

      // Clean up raw relationship data
      completeHeroes.forEach((hero: any) => {
        delete hero.hero_artifact;
        delete hero.hero_skin;
        delete hero.hero_glyph;
        delete hero.hero_equipment_slot;
      });

      return {
        data: completeHeroes,
        error: null,
      };
    } catch (error) {
      log.error('Unexpected error bulk loading heroes with relationships:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  // Complex hero data loading with relationships
  /**
   * Loads a single hero with all related data (artifacts, skins, glyphs, equipment slots)
   * @param slug The unique slug identifier for the hero
   * @returns Hero with all relationships loaded
   * @throws {RepositoryError} When hero not found or database query fails
   * @example
   * const result = await repository.findWithAllData('astaroth');
   */
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
  /**
   * Creates a hero with all related data in a single transaction
   * @param heroData Complete hero data including hero, artifacts, skins, glyphs, and equipment slots
   * @returns Created hero with all relationships loaded
   * @throws {RepositoryError} When validation fails or database constraints violated
   * @example
   * const result = await repository.createWithAllData({
   *   hero: {
   *     slug: 'astaroth',
   *     name: 'Astaroth',
   *     class: 'Tank',
   *     faction: 'Chaos',
   *     main_stat: 'strength',
   *     attack_type: ['physical'],
   *     stone_source: ['campaign'],
   *     order_rank: 1
   *   },
   *   artifacts: [{
   *     hero_slug: 'astaroth',
   *     artifact_type: 'weapon',
   *     name: 'Doom Bringer',
   *     team_buff: 'magic_attack',
   *     team_buff_secondary: null
   *   }],
   *   skins: [],
   *   glyphs: [],
   *   equipmentSlots: []
   * });
   */
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
  /**
   * Creates multiple hero artifacts in batches for optimal performance
   * @param artifacts Array of artifact data to create
   * @param options Bulk operation options including batch size and progress callback
   * @returns Array of created artifacts with partial success handling
   * @throws {RepositoryError} When all batches fail
   * @example
   * const result = await repository.bulkCreateArtifacts([
   *   { hero_slug: 'astaroth', artifact_type: 'weapon', name: 'Doom Bringer', team_buff: 'magic_attack', team_buff_secondary: null },
   *   { hero_slug: 'galahad', artifact_type: 'weapon', name: 'Lion\'s Mane', team_buff: 'armor', team_buff_secondary: null }
   * ], { batchSize: 50, onProgress: (current, total) => console.log(`${current}/${total}`) });
   */
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
   * @param heroesJsonData Array of hero data in JSON format from data/heroes.json
   * @returns Result containing created heroes with full relationship data
   * @throws {RepositoryError} When transformation fails or database operations fail
   * @example
   * const jsonData = await import('../data/heroes.json');
   * const result = await repository.initializeFromJSON(jsonData.default);
   * console.log(`Created ${result.data?.heroes.length} heroes`);
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
   * Transform JSON artifact data to database format
   * @param heroSlug The hero slug for the artifacts
   * @param artifacts Raw artifact data from JSON
   * @returns Array of artifact data ready for database insertion
   */
  private transformJsonArtifacts(heroSlug: string, artifacts: any): CreateInput<'hero_artifact'>[] {
    const artifactData: CreateInput<'hero_artifact'>[] = [];
    
    if (!artifacts) {
      return artifactData;
    }

    if (artifacts.weapon) {
      artifactData.push({
        hero_slug: heroSlug,
        artifact_type: 'weapon',
        name: artifacts.weapon.name,
        team_buff: artifacts.weapon.team_buff,
        team_buff_secondary: artifacts.weapon.team_buff_secondary || null
      });
    }

    if (artifacts.book) {
      artifactData.push({
        hero_slug: heroSlug,
        artifact_type: 'book',
        name: artifacts.book,
        team_buff: null,
        team_buff_secondary: null
      });
    }

    if (artifacts.ring !== undefined) {
      artifactData.push({
        hero_slug: heroSlug,
        artifact_type: 'ring',
        name: null,
        team_buff: null,
        team_buff_secondary: null
      });
    }

    return artifactData;
  }

  /**
   * Transform JSON skin data to database format
   * @param heroSlug The hero slug for the skins
   * @param skins Raw skin data from JSON
   * @returns Array of skin data ready for database insertion
   */
  private transformJsonSkins(heroSlug: string, skins: any): CreateInput<'hero_skin'>[] {
    if (!skins || !Array.isArray(skins)) {
      return [];
    }

    return skins.map((skin: any) => ({
      hero_slug: heroSlug,
      name: skin.name,
      stat_type: skin.stat,
      stat_value: 0, // JSON doesn't include values, use 0 as default
      has_plus: skin.has_plus || false,
      source: skin.source || null
    }));
  }

  /**
   * Transform JSON glyph data to database format
   * @param heroSlug The hero slug for the glyphs
   * @param glyphs Raw glyph data from JSON (array with nulls for empty slots)
   * @returns Array of glyph data ready for database insertion
   */
  private transformJsonGlyphs(heroSlug: string, glyphs: any): CreateInput<'hero_glyph'>[] {
    if (!glyphs || !Array.isArray(glyphs)) {
      return [];
    }

    const glyphData: CreateInput<'hero_glyph'>[] = [];
    
    glyphs.forEach((glyphStat: string | null, index: number) => {
      if (glyphStat !== null) {
        glyphData.push({
          hero_slug: heroSlug,
          position: index + 1,
          stat_type: glyphStat,
          stat_value: 0 // JSON doesn't include values, use 0 as default
        });
      }
    });

    return glyphData;
  }

  /**
   * Transform JSON equipment items to database format
   * @param heroSlug The hero slug for the equipment slots
   * @param items Raw equipment items from JSON organized by quality
   * @returns Array of equipment slot data ready for database insertion
   */
  private transformJsonEquipmentSlots(heroSlug: string, items: any): CreateInput<'hero_equipment_slot'>[] {
    if (!items) {
      return [];
    }

    const equipmentSlotData: CreateInput<'hero_equipment_slot'>[] = [];
    
    for (const [quality, equipmentArray] of Object.entries(items)) {
      if (Array.isArray(equipmentArray)) {
        equipmentArray.forEach((equipmentSlug: string | null, slotIndex: number) => {
          if (equipmentSlug) {
            equipmentSlotData.push({
              hero_slug: heroSlug,
              quality: quality,
              slot_position: slotIndex + 1,
              equipment_slug: equipmentSlug
            });
          }
        });
      }
    }

    return equipmentSlotData;
  }

  /**
   * Transform JSON hero data to database format for createWithAllData
   * @param heroJson Raw hero data from JSON files (heroes.json format)
   * @returns Transformed hero data ready for database insertion
   * @throws {Error} When required fields are missing or invalid
   * @example
   * const jsonHero = {
   *   slug: 'astaroth',
   *   name: 'Astaroth',
   *   class: 'Tank',
   *   faction: 'Chaos',
   *   main_stat: 'strength',
   *   artifacts: { weapon: { name: 'Doom Bringer', team_buff: 'magic_attack' } },
   *   skins: [{ name: 'Demonic', stat: 'health', has_plus: true }],
   *   glyphs: ['health', 'armor', null, null, 'strength'],
   *   items: { white: ['item1', 'item2', null, null, null, null] }
   * };
   * const dbFormat = repository.transformJsonHeroToDatabase(jsonHero);
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
    createData.artifacts = this.transformJsonArtifacts(heroJson.slug, heroJson.artifacts);

    // Transform skins
    createData.skins = this.transformJsonSkins(heroJson.slug, heroJson.skins);

    // Transform glyphs
    createData.glyphs = this.transformJsonGlyphs(heroJson.slug, heroJson.glyphs);

    // Transform equipment items
    createData.equipmentSlots = this.transformJsonEquipmentSlots(heroJson.slug, heroJson.items);

    return createData;
  }
}