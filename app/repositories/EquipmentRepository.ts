// ABOUTME: Equipment repository handling equipment, stats, and required items tables
// ABOUTME: Extends BaseRepository with equipment-specific queries and data transformation

import type { SupabaseClient } from "@supabase/supabase-js"
import log from "loglevel"
import { EquipmentMutationSchema, type EquipmentRecord, isEquipable } from "~/data/equipment.zod"
import type { Database } from "~/types/supabase"
import { BaseRepository } from "./BaseRepository"
import type { RepositoryResult } from "./types"

export interface EquipmentStat {
  equipment_slug: string
  stat: string
  value: number
}

export interface EquipmentRequiredItem {
  base_slug: string
  required_slug: string
  quantity: number
}

export interface EquipmentWithStats {
  equipment: Database["public"]["Tables"]["equipment"]["Row"]
  stats: EquipmentStat[]
}

export interface EquipmentWithRequiredItems {
  equipment: Database["public"]["Tables"]["equipment"]["Row"]
  required_items: EquipmentRequiredItem[]
}

export interface EquipmentWithFullDetails {
  equipment: Database["public"]["Tables"]["equipment"]["Row"]
  stats: EquipmentStat[]
  required_items: EquipmentRequiredItem[]
}

export class EquipmentRepository extends BaseRepository<'equipment'> {
  constructor(request?: Request | null) {
    super('equipment', EquipmentMutationSchema, request, 'slug')
  }

  // Alternative constructor for direct Supabase client injection
  static withSupabaseClient(supabase: SupabaseClient<Database>) {
    return new EquipmentRepository().withSupabaseClient(supabase)
  }

  private withSupabaseClient(supabase: SupabaseClient<Database>): EquipmentRepository {
    this.supabase = supabase
    return this
  }

  protected getTableRelationships(): Record<string, boolean> {
    return {
      equipment_stat: true,
      equipment_required_item: true,
    }
  }

  // Equipment-specific query methods
  async findByQuality(quality: Database["public"]["Enums"]["equipment_quality"]): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment')
        .select('*')
        .eq('quality', quality)
        .order('name')

      if (error) {
        log.error(`Error finding equipment by quality ${quality}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding equipment by quality ${quality}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async findByType(type: Database["public"]["Enums"]["equipment_type"]): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment')
        .select('*')
        .eq('type', type)
        .order('name')

      if (error) {
        log.error(`Error finding equipment by type ${type}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding equipment by type ${type}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async findByCampaignSource(missionSlug: string): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment')
        .select('*')
        .contains('campaign_sources', [missionSlug])
        .order('name')

      if (error) {
        log.error(`Error finding equipment by campaign source ${missionSlug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding equipment by campaign source ${missionSlug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  // Relationship methods
  async findWithStats(slug: string): Promise<RepositoryResult<EquipmentWithStats>> {
    try {
      const [equipmentResult, statsResult] = await Promise.all([
        this.findById(slug),
        this.findStatsByEquipmentSlug(slug)
      ])

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        }
      }

      if (statsResult.error) {
        return {
          data: null,
          error: statsResult.error,
        }
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          stats: statsResult.data!,
        },
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding equipment with stats for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async findWithRequiredItems(slug: string): Promise<RepositoryResult<EquipmentWithRequiredItems>> {
    try {
      const [equipmentResult, requiredItemsResult] = await Promise.all([
        this.findById(slug),
        this.findRequiredItemsByEquipmentSlug(slug)
      ])

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        }
      }

      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        }
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          required_items: requiredItemsResult.data!,
        },
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding equipment with required items for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async findWithFullDetails(slug: string): Promise<RepositoryResult<EquipmentWithFullDetails>> {
    try {
      const [equipmentResult, statsResult, requiredItemsResult] = await Promise.all([
        this.findById(slug),
        this.findStatsByEquipmentSlug(slug),
        this.findRequiredItemsByEquipmentSlug(slug)
      ])

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        }
      }

      if (statsResult.error) {
        return {
          data: null,
          error: statsResult.error,
        }
      }

      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        }
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          stats: statsResult.data!,
          required_items: requiredItemsResult.data!,
        },
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding equipment with full details for ${slug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  // Data transformation methods for JSON to DB schema mapping
  static transformEquipmentFromJSON(jsonEquipment: EquipmentRecord): Database["public"]["Tables"]["equipment"]["Insert"] {
    return {
      slug: jsonEquipment.slug,
      name: jsonEquipment.name,
      quality: jsonEquipment.quality,
      type: jsonEquipment.type,
      buy_value_gold: jsonEquipment.buy_value_gold ?? null,
      buy_value_coin: jsonEquipment.buy_value_coin ?? null,
      sell_value: jsonEquipment.sell_value,
      guild_activity_points: jsonEquipment.guild_activity_points,
      hero_level_required: isEquipable(jsonEquipment) ? jsonEquipment.hero_level_required : null,
      campaign_sources: jsonEquipment.campaign_sources || null,
      crafting_gold_cost: ('crafting' in jsonEquipment && jsonEquipment.crafting) ? jsonEquipment.crafting.gold_cost : null,
    }
  }

  static transformStatsFromJSON(jsonEquipment: EquipmentRecord): Database["public"]["Tables"]["equipment_stat"]["Insert"][] {
    if (!isEquipable(jsonEquipment) || !jsonEquipment.stats) return []
    
    return Object.entries(jsonEquipment.stats).map(([stat, value]) => ({
      equipment_slug: jsonEquipment.slug,
      stat,
      value: value as number,
    }))
  }

  static transformRequiredItemsFromJSON(jsonEquipment: EquipmentRecord): Database["public"]["Tables"]["equipment_required_item"]["Insert"][] {
    if (!('crafting' in jsonEquipment) || !jsonEquipment.crafting?.required_items) return []
    
    return Object.entries(jsonEquipment.crafting.required_items).map(([required_slug, quantity]) => ({
      base_slug: jsonEquipment.slug,
      required_slug,
      quantity: quantity as number,
    }))
  }

  // Bulk operations for admin data loading
  async bulkCreateStats(statsData: Database["public"]["Tables"]["equipment_stat"]["Insert"][]): Promise<RepositoryResult<EquipmentStat[]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment_stat')
        .insert(statsData)
        .select()

      if (error) {
        log.error('Error bulk creating equipment stats:', error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error('Unexpected error bulk creating equipment stats:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async bulkCreateRequiredItems(requiredItemsData: Database["public"]["Tables"]["equipment_required_item"]["Insert"][]): Promise<RepositoryResult<EquipmentRequiredItem[]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment_required_item')
        .insert(requiredItemsData)
        .select()

      if (error) {
        log.error('Error bulk creating equipment required items:', error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error('Unexpected error bulk creating equipment required items:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  async initializeFromJSON(jsonData: EquipmentRecord[]): Promise<RepositoryResult<{
    equipment: Database["public"]["Tables"]["equipment"]["Row"][]
    stats: EquipmentStat[]
    required_items: EquipmentRequiredItem[]
  }>> {
    try {
      // Transform all data
      const equipmentData = jsonData.map(item => EquipmentRepository.transformEquipmentFromJSON(item))
      const statsData = jsonData.flatMap(item => EquipmentRepository.transformStatsFromJSON(item))
      const requiredItemsData = jsonData.flatMap(item => EquipmentRepository.transformRequiredItemsFromJSON(item))

      // Bulk create equipment first
      const equipmentResult = await this.bulkCreate(equipmentData)
      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        }
      }

      // Then create stats and required items
      const [statsResult, requiredItemsResult] = await Promise.all([
        this.bulkCreateStats(statsData),
        this.bulkCreateRequiredItems(requiredItemsData)
      ])

      if (statsResult.error) {
        return {
          data: null,
          error: statsResult.error,
        }
      }

      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        }
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          stats: statsResult.data!,
          required_items: requiredItemsResult.data!,
        },
        error: null,
      }
    } catch (error) {
      log.error('Unexpected error initializing equipment from JSON:', error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  // Helper methods for stats and required items
  private async findStatsByEquipmentSlug(equipmentSlug: string): Promise<RepositoryResult<EquipmentStat[]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment_stat')
        .select('*')
        .eq('equipment_slug', equipmentSlug)
        .order('stat')

      if (error) {
        log.error(`Error finding stats for equipment ${equipmentSlug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding stats for equipment ${equipmentSlug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }

  private async findRequiredItemsByEquipmentSlug(equipmentSlug: string): Promise<RepositoryResult<EquipmentRequiredItem[]>> {
    try {
      const { data, error } = await this.supabase
        .from('equipment_required_item')
        .select('*')
        .eq('base_slug', equipmentSlug)
        .order('required_slug')

      if (error) {
        log.error(`Error finding required items for equipment ${equipmentSlug}:`, error)
        return {
          data: null,
          error: this.handleError(error),
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      log.error(`Unexpected error finding required items for equipment ${equipmentSlug}:`, error)
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      }
    }
  }
}