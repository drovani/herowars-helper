// ABOUTME: Database-backed hero service using HeroRepository for data operations
// ABOUTME: Maintains same interface as JSON-based HeroDataService for seamless migration

import type { z, ZodError } from "zod";
import log from "loglevel";
import { HeroMutationSchema, type HeroMutation, type HeroRecord } from "~/data/hero.zod";
import { HeroRepository } from "~/repositories/HeroRepository";
import type { DataService, IChangeTracked } from "./types";
import type { CompleteHero } from "~/repositories/types";

interface DatabaseHeroServiceOptions {
  /** Enable caching for frequently accessed data */
  cacheEnabled?: boolean;
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
  /** Maximum number of cached items */
  maxCacheSize?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

class DatabaseHeroService implements DataService<HeroRecord, HeroMutation> {
  private repository: HeroRepository;
  private mutationSchema = HeroMutationSchema as any;
  private recordName = "Hero";
  
  // Caching configuration
  private options: Required<DatabaseHeroServiceOptions>;
  private cache = new Map<string, CacheEntry<HeroRecord>>();
  private allHeroesCache: CacheEntry<HeroRecord[]> | null = null;
  
  constructor(
    request?: Request | any,
    options: DatabaseHeroServiceOptions = {}
  ) {
    this.repository = new HeroRepository(request);
    this.options = {
      cacheEnabled: options.cacheEnabled ?? true,
      cacheTTL: options.cacheTTL ?? 5 * 60 * 1000, // 5 minutes
      maxCacheSize: options.maxCacheSize ?? 100,
      ...options,
    };
  }

  // Cache management methods
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    if (!this.options.cacheEnabled) return false;
    return Date.now() - entry.timestamp < this.options.cacheTTL;
  }

  private setCacheEntry<T>(key: string, data: T, isSpecialKey = false): void {
    if (!this.options.cacheEnabled) return;
    
    if (!isSpecialKey && this.cache.size >= this.options.maxCacheSize) {
      // Remove least recently used entry
      let oldestKey = '';
      let oldestAccess = Infinity;
      
      for (const [k, entry] of this.cache.entries()) {
        if (entry.accessCount < oldestAccess) {
          oldestAccess = entry.accessCount;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const entry = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
    };

    if (isSpecialKey) {
      this.allHeroesCache = entry as any;
    } else {
      this.cache.set(key, entry as any);
    }
  }

  private getCacheEntry<T>(key: string, isSpecialKey = false): T | null {
    if (!this.options.cacheEnabled) return null;
    
    const entry = isSpecialKey ? this.allHeroesCache : this.cache.get(key);
    if (!entry || !this.isCacheValid(entry as any)) {
      if (isSpecialKey) {
        this.allHeroesCache = null;
      } else {
        this.cache.delete(key);
      }
      return null;
    }

    (entry as any).accessCount++;
    return (entry as any).data as T;
  }

  private invalidateCache(): void {
    this.cache.clear();
    this.allHeroesCache = null;
  }

  private transformCompleteHeroToRecord(completeHero: CompleteHero): HeroRecord {
    // Transform the database CompleteHero back to the JSON format expected by components
    const record: Partial<HeroRecord> = {
      slug: completeHero.slug,
      name: completeHero.name,
      class: this.validateHeroClass(completeHero.class),
      faction: this.validateHeroFaction(completeHero.faction),
      main_stat: this.validateMainStat(completeHero.main_stat),
      attack_type: this.validateAttackTypes(completeHero.attack_type),
      stone_source: completeHero.stone_source as any || [],
      order_rank: completeHero.order_rank || 0,
      updated_on: completeHero.updated_on || new Date().toISOString(),
    };

    // Transform artifacts back to JSON format
    if (completeHero.artifacts && completeHero.artifacts.length > 0) {
      const artifactsResult = this.transformArtifacts(completeHero.artifacts);
      if (artifactsResult) {
        record.artifacts = artifactsResult;
      }
    }

    // Transform skins back to JSON format
    if (completeHero.skins && completeHero.skins.length > 0) {
      record.skins = this.transformSkins(completeHero.skins);
    }

    // Transform glyphs back to JSON format
    if (completeHero.glyphs && completeHero.glyphs.length > 0) {
      record.glyphs = this.transformGlyphs(completeHero.glyphs);
    }

    // Transform equipment slots back to JSON format
    if (completeHero.equipmentSlots && completeHero.equipmentSlots.length > 0) {
      record.items = this.transformEquipmentSlots(completeHero.equipmentSlots);
    }

    return record as HeroRecord;
  }

  private validateHeroClass(heroClass: string): HeroRecord['class'] {
    const validClasses = ['control', 'tank', 'warrior', 'mage', 'support', 'marksman', 'healer'] as const;
    return validClasses.includes(heroClass as any) ? heroClass as HeroRecord['class'] : 'tank';
  }

  private validateHeroFaction(faction: string): HeroRecord['faction'] {
    const validFactions = ['progress', 'nature', 'chaos', 'honor', 'eternity', 'mystery'] as const;
    return validFactions.includes(faction as any) ? faction as HeroRecord['faction'] : 'honor';
  }

  private validateMainStat(mainStat: string): HeroRecord['main_stat'] {
    const validMainStats = ['intelligence', 'agility', 'strength'] as const;
    return validMainStats.includes(mainStat as any) ? mainStat as HeroRecord['main_stat'] : 'strength';
  }

  private validateAttackTypes(attackTypes: string[]): HeroRecord['attack_type'] {
    const validAttackTypes = ['physical', 'magic', 'pure'] as const;
    const filtered = attackTypes.filter(type => validAttackTypes.includes(type as any));
    return filtered.length > 0 ? filtered as HeroRecord['attack_type'] : ['physical'];
  }

  private transformArtifacts(artifacts: CompleteHero['artifacts']): HeroRecord['artifacts'] | undefined {
    if (!artifacts) return undefined;

    const result: Partial<NonNullable<HeroRecord['artifacts']>> = {};
    
    for (const artifact of artifacts) {
      if (artifact.artifact_type === 'weapon' && artifact.name && artifact.team_buff) {
        result.weapon = {
          name: artifact.name,
          team_buff: this.validateTeamBuff(artifact.team_buff),
          team_buff_secondary: artifact.team_buff_secondary ? this.validateTeamBuff(artifact.team_buff_secondary) : undefined,
        };
      } else if (artifact.artifact_type === 'book' && artifact.name) {
        result.book = this.validateBookName(artifact.name);
      } else if (artifact.artifact_type === 'ring') {
        result.ring = null;
      }
    }

    return Object.keys(result).length > 0 ? result as HeroRecord['artifacts'] : undefined;
  }

  private validateTeamBuff(teamBuff: string): NonNullable<HeroRecord['artifacts']>['weapon']['team_buff'] {
    const validBuffs = [
      'physical attack', 'magic attack', 'armor', 'magic defense', 'dodge',
      'magic penetration', 'armor penetration', 'crit hit chance'
    ] as const;
    return validBuffs.includes(teamBuff as any) ? teamBuff as any : 'armor';
  }

  private validateBookName(bookName: string): NonNullable<HeroRecord['artifacts']>['book'] {
    const validBooks = [
      'Alchemist\'s Folio', 'Book of Illusions', 'Defender\'s Covenant',
      'Manuscript of the Void', 'Tome of Arcane Knowledge', 'Warrior\'s Code'
    ] as const;
    return validBooks.includes(bookName as any) ? bookName as any : 'Tome of Arcane Knowledge';
  }

  private transformSkins(skins: CompleteHero['skins']): HeroRecord['skins'] {
    if (!skins) return undefined;

    return skins.map(skin => ({
      name: skin.name,
      stat: this.validateSkinStat(skin.stat_type),
      has_plus: Boolean(skin.has_plus),
      source: skin.source || undefined,
    }));
  }

  private validateSkinStat(statType: string): NonNullable<HeroRecord['skins']>[0]['stat'] {
    const validStats = [
      'intelligence', 'agility', 'strength', 'health', 'physical attack', 'magic attack',
      'armor', 'magic defense', 'dodge', 'magic penetration', 'vampirism', 'armor penetration',
      'crit hit chance', 'healing', 'magic crit hit chance'
    ] as const;
    return validStats.includes(statType as any) ? statType as any : 'strength';
  }

  private transformGlyphs(glyphs: CompleteHero['glyphs']): HeroRecord['glyphs'] {
    if (!glyphs) return undefined;

    const result: (string | null)[] = [null, null, null, null, null];
    const sortedGlyphs = glyphs.sort((a, b) => a.position - b.position);
    
    for (const glyph of sortedGlyphs) {
      if (glyph.position >= 1 && glyph.position <= 5) {
        result[glyph.position - 1] = this.validateGlyphStat(glyph.stat_type);
      }
    }

    return result as HeroRecord['glyphs'];
  }

  private validateGlyphStat(statType: string): string {
    const validStats = [
      'intelligence', 'agility', 'strength', 'health', 'physical attack', 'magic attack',
      'armor', 'magic defense', 'dodge', 'magic penetration', 'vampirism', 'armor penetration',
      'crit hit chance', 'healing', 'magic crit hit chance'
    ] as const;
    return validStats.includes(statType as any) ? statType : 'strength';
  }

  private transformEquipmentSlots(equipmentSlots: CompleteHero['equipmentSlots']): HeroRecord['items'] {
    if (!equipmentSlots) return undefined;

    const result: Partial<NonNullable<HeroRecord['items']>> = {};
    
    // Group by quality
    const slotsByQuality = equipmentSlots.reduce((acc, slot) => {
      if (!acc[slot.quality]) {
        acc[slot.quality] = [];
      }
      acc[slot.quality].push(slot);
      return acc;
    }, {} as Record<string, typeof equipmentSlots>);

    // Convert to arrays sorted by slot position
    for (const [quality, slots] of Object.entries(slotsByQuality)) {
      const sortedSlots = slots.sort((a, b) => a.slot_position - b.slot_position);
      const equipmentSlugs = sortedSlots
        .map(slot => slot.equipment_slug)
        .filter((slug): slug is string => Boolean(slug));
      
      if (equipmentSlugs.length > 0) {
        (result as any)[quality] = equipmentSlugs;
      }
    }

    return Object.keys(result).length > 0 ? result as HeroRecord['items'] : undefined;
  }

  private async transformHeroToRecord(hero: any): Promise<HeroRecord> {
    // If it's already a complete hero with relationships, transform it
    if (hero.artifacts !== undefined || hero.skins !== undefined) {
      return this.transformCompleteHeroToRecord(hero as CompleteHero);
    }

    // If it's a basic hero, load the complete data
    const completeResult = await this.repository.findWithAllData(hero.slug);
    if (completeResult.error || !completeResult.data) {
      // Fallback to basic record format
      return {
        slug: hero.slug,
        name: hero.name,
        class: hero.class,
        faction: hero.faction,
        main_stat: hero.main_stat,
        attack_type: hero.attack_type,
        stone_source: hero.stone_source,
        order_rank: hero.order_rank,
        updated_on: hero.updated_on,
      };
    }

    return this.transformCompleteHeroToRecord(completeResult.data);
  }

  // DataService interface implementation
  async getAll(ids?: string[]): Promise<HeroRecord[]> {
    try {
      // Check cache for all heroes (only if no specific ids requested)
      if (!ids) {
        const cached = this.getCacheEntry<HeroRecord[]>('all-heroes', true);
        if (cached) {
          log.debug('Returning cached hero list');
          return this.sortRecords(cached);
        }
      }

      if (ids && ids.length > 0) {
        // Get specific heroes by IDs
        const heroes: HeroRecord[] = [];
        for (const id of ids) {
          const cached = this.getCacheEntry<HeroRecord>(id);
          if (cached) {
            heroes.push(cached);
          } else {
            const heroResult = await this.repository.findById(id);
            if (heroResult.error) {
              log.error(`Failed to get ${this.recordName} ${id}:`, heroResult.error);
              throw new Error(`Failed to retrieve ${this.recordName} records: ${heroResult.error.message}`);
            }
            if (heroResult.data) {
              const record = await this.transformHeroToRecord(heroResult.data);
              heroes.push(record);
              this.setCacheEntry(id, record);
            }
          }
        }
        return this.sortRecords(heroes);
      } else {
        // Get all heroes
        const result = await this.repository.findAll();
        
        if (result.error) {
          log.error(`Failed to get ${this.recordName} records:`, result.error);
          throw new Error(`Failed to retrieve ${this.recordName} records: ${result.error.message}`);
        }

        if (!result.data) {
          return [];
        }

        // Transform all heroes to records
        const records: HeroRecord[] = [];
        for (const hero of result.data) {
          const record = await this.transformHeroToRecord(hero);
          records.push(record);
          
          // Cache individual heroes
          this.setCacheEntry(record.slug, record);
        }

        const sortedRecords = this.sortRecords(records);

        // Cache all heroes result
        this.setCacheEntry('all-heroes', sortedRecords, true);

        return sortedRecords;
      }
    } catch (error) {
      log.error(`Failed to get all ${this.recordName} records:`, error);
      throw new Error(`Failed to retrieve ${this.recordName} records.`);
    }
  }

  async getAllAsJson(ids?: string[]): Promise<string> {
    const records = await this.getAll(ids);
    const jsonString = JSON.stringify(
      records,
      (_: string, value: any): any | undefined => {
        if (Array.isArray(value) && value.length === 0) {
          // remove properties that are empty arrays
          return undefined;
        }
        return value;
      },
      2
    );
    return jsonString;
  }

  async getById(id: string): Promise<HeroRecord | null> {
    try {
      // Check cache first
      const cached = this.getCacheEntry<HeroRecord>(id);
      if (cached) {
        log.debug(`Returning cached hero: ${id}`);
        return cached;
      }

      const result = await this.repository.findById(id);
      
      if (result.error) {
        log.error(`Failed to get ${this.recordName} ${id}:`, result.error);
        throw new Error(`Failed to retrieve ${this.recordName} ${id}: ${result.error.message}`);
      }

      if (!result.data) {
        return null;
      }

      const record = await this.transformHeroToRecord(result.data);
      
      // Cache the result
      this.setCacheEntry(id, record);
      
      return record;
    } catch (error) {
      log.error(`Failed to get ${this.recordName} ${id}:`, error);
      throw new Error(`Failed to retrieve ${this.recordName} ${id}`);
    }
  }

  create(_: HeroMutation): Promise<HeroRecord | ZodError<HeroMutation>> {
    // Maintain same interface as original service - hero creation disabled
    throw new Error("Cannot create new Hero record.");
  }

  async update(id: string, mutation: HeroMutation): Promise<HeroRecord | ZodError<HeroMutation>> {
    try {
      const parseResults = this.mutationSchema.safeParse(mutation);
      if (!parseResults.success) {
        return parseResults.error as ZodError<HeroMutation>;
      }

      const newId = this.getRecordId(parseResults.data);
      if (newId !== id) {
        throw new Error(`Cannot change ${this.recordName} record ID from ${id} to ${newId}`);
      }

      // Get existing hero to verify it exists
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`${this.recordName} record with id ${id} not found.`);
      }

      // Convert mutation to database format
      const updateData = {
        ...parseResults.data,
        updated_on: new Date().toISOString(),
      };

      const result = await this.repository.update(id, updateData);
      
      if (result.error) {
        log.error(`Failed to update ${this.recordName} record ${id}:`, result.error);
        throw new Error(`Failed to update ${this.recordName} record ${id}: ${result.error.message}`);
      }

      if (!result.data) {
        throw new Error(`Failed to update ${this.recordName} record ${id}: No data returned`);
      }

      // Transform updated hero back to record format
      const updatedRecord = await this.transformHeroToRecord(result.data);
      
      // Invalidate cache for this hero and all heroes
      this.cache.delete(id);
      this.allHeroesCache = null;
      
      return updatedRecord;
    } catch (error) {
      log.error(`Failed to update ${this.recordName} record ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to update ${this.recordName} record ${id}.`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`${this.recordName} record with id ${id} not found.`);
      }

      const result = await this.repository.delete(id);
      
      if (result.error) {
        log.error(`Failed to delete ${this.recordName} record ${id}:`, result.error);
        throw new Error(`Failed to delete ${this.recordName} record ${id}: ${result.error.message}`);
      }

      // Invalidate cache
      this.cache.delete(id);
      this.allHeroesCache = null;
    } catch (error) {
      log.error(`Failed to delete ${this.recordName} record ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to delete ${this.recordName} record ${id}.`);
    }
  }

  isInitialized(): boolean {
    // For database service, always consider initialized if repository is available
    return Boolean(this.repository);
  }

  // Helper methods
  private getRecordId(record: HeroRecord | HeroMutation): string {
    return record.slug;
  }

  private sortRecords(records: HeroRecord[]): HeroRecord[] {
    return records.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Hero-specific methods to maintain compatibility
  async getHeroesUsingItem(slug: string): Promise<HeroRecord[]> {
    try {
      const result = await this.repository.findHeroesUsingEquipment(slug);
      
      if (result.error) {
        log.error(`Failed to get heroes using item ${slug}:`, result.error);
        throw new Error(`Failed to find heroes using item ${slug}: ${result.error.message}`);
      }

      if (!result.data) {
        return [];
      }

      // Transform heroes to records
      const records: HeroRecord[] = [];
      for (const hero of result.data) {
        const record = await this.transformHeroToRecord(hero);
        records.push(record);
      }

      return this.sortRecords(records);
    } catch (error) {
      log.error(`Failed to get heroes using item ${slug}:`, error);
      throw new Error(`Failed to find heroes using item ${slug}`);
    }
  }

  // Additional database-specific convenience methods
  async getHeroWithCompleteData(slug: string): Promise<CompleteHero | null> {
    try {
      const result = await this.repository.findWithAllData(slug);
      
      if (result.error) {
        log.error(`Failed to get complete hero data for ${slug}:`, result.error);
        return null;
      }

      return result.data || null;
    } catch (error) {
      log.error(`Failed to get complete hero data for ${slug}:`, error);
      return null;
    }
  }

  async getHeroesByClass(heroClass: string): Promise<HeroRecord[]> {
    try {
      const result = await this.repository.findByClass(heroClass);
      
      if (result.error) {
        log.error(`Failed to get heroes by class ${heroClass}:`, result.error);
        throw new Error(`Failed to find heroes by class ${heroClass}: ${result.error.message}`);
      }

      if (!result.data) {
        return [];
      }

      const records: HeroRecord[] = [];
      for (const hero of result.data) {
        const record = await this.transformHeroToRecord(hero);
        records.push(record);
      }

      return this.sortRecords(records);
    } catch (error) {
      log.error(`Failed to get heroes by class ${heroClass}:`, error);
      throw new Error(`Failed to find heroes by class ${heroClass}`);
    }
  }

  async getHeroesByFaction(faction: string): Promise<HeroRecord[]> {
    try {
      const result = await this.repository.findByFaction(faction);
      
      if (result.error) {
        log.error(`Failed to get heroes by faction ${faction}:`, result.error);
        throw new Error(`Failed to find heroes by faction ${faction}: ${result.error.message}`);
      }

      if (!result.data) {
        return [];
      }

      const records: HeroRecord[] = [];
      for (const hero of result.data) {
        const record = await this.transformHeroToRecord(hero);
        records.push(record);
      }

      return this.sortRecords(records);
    } catch (error) {
      log.error(`Failed to get heroes by faction ${faction}:`, error);
      throw new Error(`Failed to find heroes by faction ${faction}`);
    }
  }

  // Cache management
  clearCache(): void {
    this.invalidateCache();
    log.debug('Hero service cache cleared');
  }

  getCacheStats(): { size: number; allHeroesCached: boolean; hitRate?: number } {
    return {
      size: this.cache.size,
      allHeroesCached: Boolean(this.allHeroesCache && this.isCacheValid(this.allHeroesCache)),
    };
  }
}

// Export a factory function to create instances
export function createDatabaseHeroService(
  request?: Request | any,
  options?: DatabaseHeroServiceOptions
): DatabaseHeroService {
  return new DatabaseHeroService(request, options);
}

// Export default singleton instance for backwards compatibility
export default new DatabaseHeroService();