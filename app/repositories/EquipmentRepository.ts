// ABOUTME: Equipment repository handling equipment, stats, and required items tables
// ABOUTME: Extends BaseRepository with equipment-specific queries and data transformation

import type { SupabaseClient } from "@supabase/supabase-js";
import log from "loglevel";
import { EQUIPMENT_QUALITIES, EquipmentTableSchema, isEquipable, type EquipmentRecord } from "~/data/equipment.zod";
import type { Database } from "~/types/supabase";
import { BaseRepository } from "./BaseRepository";
import type { FindAllOptions, RepositoryResult } from "./types";

export interface EquipmentStat {
  equipment_slug: string;
  stat: string;
  value: number;
}

export interface EquipmentRequiredItem {
  base_slug: string;
  required_slug: string;
  quantity: number;
}

export interface EquipmentWithStats {
  equipment: Database["public"]["Tables"]["equipment"]["Row"];
  stats: EquipmentStat[];
}

export interface EquipmentWithRequiredItems {
  equipment: Database["public"]["Tables"]["equipment"]["Row"];
  required_items: EquipmentRequiredItem[];
}

export interface EquipmentWithFullDetails {
  equipment: Database["public"]["Tables"]["equipment"]["Row"];
  stats: EquipmentStat[];
  required_items: EquipmentRequiredItem[];
}

export interface EquipmentRequirements {
  gold_cost: number;
  required_items: {
    equipment: Database["public"]["Tables"]["equipment"]["Row"];
    quantity: number;
  }[];
}

export class EquipmentRepository extends BaseRepository<"equipment"> {
  constructor(requestOrSupabase: Request | SupabaseClient<any> | null = null) {
    if (requestOrSupabase && typeof requestOrSupabase === "object" && "from" in requestOrSupabase) {
      // Custom supabase client provided (for admin operations)
      super(requestOrSupabase, EquipmentTableSchema, "equipment", EquipmentTableSchema, "slug");
    } else {
      // Request or null provided (standard operation)
      super("equipment", EquipmentTableSchema, requestOrSupabase as Request | null, "slug");
    }
  }

  protected getTableRelationships(): Record<string, boolean> {
    return {
      equipment_stat: true,
      equipment_required_item: true,
    };
  }

  async findAll(
    options: FindAllOptions = {}
  ): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    const { data, error } = await super.findAll(options);
    if (!options?.orderBy && data) {
      return {
        data: this.sortByQuality(data),
        error: null,
      };
    }
    return { data, error };
  }

  // Equipment-specific query methods
  async findByQuality(
    quality: Database["public"]["Enums"]["equipment_quality"]
  ): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase.from("equipment").select("*").eq("quality", quality).order("name");

      if (error) {
        log.error(`Error finding equipment by quality ${quality}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment by quality ${quality}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findByType(
    type: Database["public"]["Enums"]["equipment_type"]
  ): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase.from("equipment").select("*").eq("type", type).order("name");

      if (error) {
        log.error(`Error finding equipment by type ${type}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment by type ${type}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findByCampaignSource(
    missionSlug: string
  ): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase
        .from("equipment")
        .select("*")
        .contains("campaign_sources", [missionSlug])
        .order("name");

      if (error) {
        log.error(`Error finding equipment by campaign source ${missionSlug}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment by campaign source ${missionSlug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  // Core replacement methods for EquipmentDataService
  async findEquipableEquipment(): Promise<RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>> {
    try {
      const { data, error } = await this.supabase.from("equipment").select("*").eq("type", "equipable").order("name");

      if (error) {
        log.error("Error finding equipable equipment:", error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      // Apply custom quality sorting
      const sortedData = data ? this.sortByQuality(data) : [];

      return {
        data: sortedData,
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error finding equipable equipment:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findEquipmentThatRequires(
    slug: string
  ): Promise<RepositoryResult<Array<{ equipment: Database["public"]["Tables"]["equipment"]["Row"]; quantity: number }>>> {
    try {
      const { data, error } = await this.supabase
        .from("equipment_required_item")
        .select("base_slug, quantity, equipment!equipment_required_item_base_slug_fkey(*)")
        .eq("required_slug", slug);

      if (error) {
        log.error(`Error finding equipment that requires ${slug}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      // Extract equipment records with quantities from the joined data
      const equipmentWithQuantities = data?.map((item: any) => ({
        equipment: item.equipment,
        quantity: item.quantity,
      })) || [];

      return {
        data: equipmentWithQuantities,
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment that requires ${slug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findEquipmentRequiredFor(
    slugOrEquipment: string | Database["public"]["Tables"]["equipment"]["Row"]
  ): Promise<
    RepositoryResult<Array<{ equipment: Database["public"]["Tables"]["equipment"]["Row"]; quantity: number }>>
  > {
    try {
      let equipment: Database["public"]["Tables"]["equipment"]["Row"];

      if (typeof slugOrEquipment === "string") {
        const equipmentResult = await this.findById(slugOrEquipment);
        if (equipmentResult.error || !equipmentResult.data) {
          return {
            data: [],
            error: equipmentResult.error,
          };
        }
        equipment = equipmentResult.data;
      } else {
        equipment = slugOrEquipment;
      }

      // Find required items for this equipment
      const requiredItemsResult = await this.findRequiredItemsByEquipmentSlug(equipment.slug);
      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        };
      }

      if (!requiredItemsResult.data || requiredItemsResult.data.length === 0) {
        return {
          data: [],
          error: null,
        };
      }

      // Get the actual equipment records for the required items with quantities
      const requiredItemsWithEquipment = await Promise.all(
        requiredItemsResult.data.map(async (requiredItem) => {
          const equipmentResult = await this.findById(requiredItem.required_slug);
          return {
            equipment: equipmentResult.data!,
            quantity: requiredItem.quantity,
          };
        })
      );

      // Filter out any failed results
      const validRequiredItems = requiredItemsWithEquipment.filter((item) => item.equipment !== null);

      return {
        data: validRequiredItems,
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error finding equipment required for:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findEquipmentRequiredForRaw(
    equipment: Database["public"]["Tables"]["equipment"]["Row"]
  ): Promise<RepositoryResult<EquipmentRequirements | null>> {
    try {
      const baseItems: EquipmentRequirements = { gold_cost: 0, required_items: [] };

      // Get required items for this equipment
      const requiredItemsResult = await this.findRequiredItemsByEquipmentSlug(equipment.slug);
      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        };
      }

      if (!requiredItemsResult.data || requiredItemsResult.data.length === 0) {
        return {
          data: null,
          error: null,
        };
      }

      // Add crafting gold cost
      baseItems.gold_cost += equipment.crafting_gold_cost || 0;

      // Process each required item
      for (const requiredItem of requiredItemsResult.data) {
        const componentResult = await this.findById(requiredItem.required_slug);
        if (componentResult.error || !componentResult.data) {
          continue;
        }

        const component = componentResult.data;

        // Check if this component also has crafting requirements (recursive)
        if (component.crafting_gold_cost && component.crafting_gold_cost > 0) {
          const rawsResult = await this.findEquipmentRequiredForRaw(component);
          if (rawsResult.error || !rawsResult.data) {
            continue;
          }

          const raws = rawsResult.data;
          baseItems.gold_cost += raws.gold_cost * requiredItem.quantity;
          this.combineEquipmentRequirements(baseItems.required_items, raws.required_items, requiredItem.quantity);
        } else {
          // This is a raw component
          const found = baseItems.required_items.find((ri) => ri.equipment.slug === component.slug);
          if (found) {
            found.quantity += requiredItem.quantity;
          } else {
            baseItems.required_items.push({ equipment: component, quantity: requiredItem.quantity });
          }
        }
      }

      return {
        data: baseItems,
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error finding equipment required for raw:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findRawComponentOf(
    slug: string
  ): Promise<RepositoryResult<Array<{ equipment: Database["public"]["Tables"]["equipment"]["Row"]; totalQuantity: number }>>> {
    try {
      const finalProducts: Map<string, { equipment: Database["public"]["Tables"]["equipment"]["Row"]; totalQuantity: number }> = new Map();

      // Recursive helper function
      const traverse = async (componentSlug: string, multiplier: number = 1, path: string[] = []): Promise<void> => {
        // Prevent circular dependencies by checking current path
        if (path.includes(componentSlug)) {
          return;
        }

        const newPath = [...path, componentSlug];

        // Find what equipment requires this component
        const requiredForResult = await this.findEquipmentThatRequires(componentSlug);
        if (requiredForResult.error) {
          // Propagate database errors up with the full error structure
          const error = new Error(requiredForResult.error.message);
          (error as any).code = requiredForResult.error.code;
          (error as any).details = requiredForResult.error.details;
          throw error;
        }

        if (!requiredForResult.data?.length) {
          // No equipment requires this - it might be a final product
          return;
        }

        for (const { equipment, quantity } of requiredForResult.data) {
          const newMultiplier = multiplier * quantity;

          // Check if this equipment is used in other recipes
          const nextLevelResult = await this.findEquipmentThatRequires(equipment.slug);

          if (nextLevelResult.error) {
            // Propagate database errors up with the full error structure
            const error = new Error(nextLevelResult.error.message);
            (error as any).code = nextLevelResult.error.code;
            (error as any).details = nextLevelResult.error.details;
            throw error;
          }

          if (!nextLevelResult.data?.length) {
            // This is a final product - add to results
            const existing = finalProducts.get(equipment.slug);
            if (existing) {
              existing.totalQuantity += newMultiplier;
            } else {
              finalProducts.set(equipment.slug, {
                equipment,
                totalQuantity: newMultiplier
              });
            }
          } else {
            // This equipment is used in other recipes - continue traversing
            await traverse(equipment.slug, newMultiplier, newPath);
          }
        }
      };

      await traverse(slug);

      return {
        data: Array.from(finalProducts.values()),
        error: null
      };
    } catch (error) {
      log.error(`Unexpected error finding raw component of ${slug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          code: (error as any).code,
          details: (error as any).details || error,
        },
      };
    }
  }

  // Helper methods
  private sortByQuality(
    records: Database["public"]["Tables"]["equipment"]["Row"][]
  ): Database["public"]["Tables"]["equipment"]["Row"][] {
    return records.sort((l, r) =>
      EQUIPMENT_QUALITIES.indexOf(l.quality) !== EQUIPMENT_QUALITIES.indexOf(r.quality)
        ? EQUIPMENT_QUALITIES.indexOf(l.quality) - EQUIPMENT_QUALITIES.indexOf(r.quality)
        : l.name.localeCompare(r.name)
    );
  }

  private combineEquipmentRequirements(
    target: EquipmentRequirements["required_items"],
    source: EquipmentRequirements["required_items"],
    qty: number
  ): void {
    for (const req of source) {
      const found = target.find((t) => t.equipment.slug === req.equipment.slug);
      if (found) {
        found.quantity += req.quantity * qty;
      } else {
        target.push({ ...req, quantity: req.quantity * qty });
      }
    }
  }

  // JSON export functionality
  async getAllAsJson(ids?: string[]): Promise<RepositoryResult<EquipmentRecord[]>> {
    try {
      let equipmentResult: RepositoryResult<Database["public"]["Tables"]["equipment"]["Row"][]>;

      if (ids && ids.length > 0) {
        // Get specific equipment by IDs
        const equipmentPromises = ids.map((id) => this.findById(id));
        const equipmentResults = await Promise.all(equipmentPromises);

        // Filter out any failed results and extract the data
        const equipmentRecords = equipmentResults
          .filter((result) => result.data !== null)
          .map((result) => result.data!);

        equipmentResult = {
          data: equipmentRecords,
          error: null,
        };
      } else {
        // Get all equipment
        equipmentResult = await this.findAll({});
      }

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        };
      }

      // Transform database records back to JSON format
      const jsonRecords: EquipmentRecord[] = [];

      for (const equipment of equipmentResult.data!) {
        // Get stats and required items for this equipment
        const [statsResult, requiredItemsResult] = await Promise.all([
          this.findStatsByEquipmentSlug(equipment.slug),
          this.findRequiredItemsByEquipmentSlug(equipment.slug),
        ]);

        // Build the JSON record - use any type to handle the flexible EquipmentRecord structure
        const jsonRecord: any = {
          slug: equipment.slug,
          name: equipment.name,
          quality: equipment.quality,
          type: equipment.type,
          buy_value_gold: equipment.buy_value_gold || 0,
          buy_value_coin: equipment.buy_value_coin || 0,
          sell_value: equipment.sell_value,
          guild_activity_points: equipment.guild_activity_points,
          updated_on: new Date().toISOString(),
        };

        // Add campaign_sources if present
        if (equipment.campaign_sources && equipment.campaign_sources.length > 0) {
          jsonRecord.campaign_sources = equipment.campaign_sources;
        }

        // Add stats for equipable items
        if (equipment.type === "equipable" && statsResult.data && statsResult.data.length > 0) {
          jsonRecord.stats = {};
          for (const stat of statsResult.data) {
            jsonRecord.stats[stat.stat] = stat.value;
          }
          jsonRecord.hero_level_required = equipment.hero_level_required || 1;
        }

        // Add crafting info if it has required items
        if (requiredItemsResult.data && requiredItemsResult.data.length > 0) {
          jsonRecord.crafting = {
            gold_cost: equipment.crafting_gold_cost || 0,
            required_items: {},
          };
          for (const required of requiredItemsResult.data) {
            jsonRecord.crafting.required_items[required.required_slug] = required.quantity;
          }
        }

        jsonRecords.push(jsonRecord as EquipmentRecord);
      }

      // Sort using the same logic as the original service
      const sortedRecords = this.sortByQuality(
        jsonRecords as unknown as Database["public"]["Tables"]["equipment"]["Row"][]
      ) as unknown as EquipmentRecord[];

      return {
        data: sortedRecords,
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error getting all equipment as JSON:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  // Relationship methods
  async findWithStats(slug: string): Promise<RepositoryResult<EquipmentWithStats>> {
    try {
      const [equipmentResult, statsResult] = await Promise.all([
        this.findById(slug),
        this.findStatsByEquipmentSlug(slug),
      ]);

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        };
      }

      if (statsResult.error) {
        return {
          data: null,
          error: statsResult.error,
        };
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          stats: statsResult.data!,
        },
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment with stats for ${slug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findWithRequiredItems(slug: string): Promise<RepositoryResult<EquipmentWithRequiredItems>> {
    try {
      const [equipmentResult, requiredItemsResult] = await Promise.all([
        this.findById(slug),
        this.findRequiredItemsByEquipmentSlug(slug),
      ]);

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        };
      }

      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        };
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          required_items: requiredItemsResult.data!,
        },
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment with required items for ${slug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async findWithFullDetails(slug: string): Promise<RepositoryResult<EquipmentWithFullDetails>> {
    try {
      const [equipmentResult, statsResult, requiredItemsResult] = await Promise.all([
        this.findById(slug),
        this.findStatsByEquipmentSlug(slug),
        this.findRequiredItemsByEquipmentSlug(slug),
      ]);

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        };
      }

      if (statsResult.error) {
        return {
          data: null,
          error: statsResult.error,
        };
      }

      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        };
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          stats: statsResult.data!,
          required_items: requiredItemsResult.data!,
        },
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding equipment with full details for ${slug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  // Data transformation methods for JSON to DB schema mapping
  static transformEquipmentFromJSON(
    jsonEquipment: EquipmentRecord
  ): Database["public"]["Tables"]["equipment"]["Insert"] {
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
      crafting_gold_cost:
        "crafting" in jsonEquipment && jsonEquipment.crafting?.gold_cost ? jsonEquipment.crafting.gold_cost : null,
    };
  }

  static transformStatsFromJSON(
    jsonEquipment: EquipmentRecord
  ): Database["public"]["Tables"]["equipment_stat"]["Insert"][] {
    if (!isEquipable(jsonEquipment) || !jsonEquipment.stats) return [];

    return Object.entries(jsonEquipment.stats).map(([stat, value]) => ({
      equipment_slug: jsonEquipment.slug,
      stat,
      value: value as number,
    }));
  }

  static transformRequiredItemsFromJSON(
    jsonEquipment: EquipmentRecord
  ): Database["public"]["Tables"]["equipment_required_item"]["Insert"][] {
    if (!("crafting" in jsonEquipment) || !jsonEquipment.crafting?.required_items) return [];

    return Object.entries(jsonEquipment.crafting.required_items).map(([required_slug, quantity]) => ({
      base_slug: jsonEquipment.slug,
      required_slug,
      quantity: quantity as number,
    }));
  }

  // Bulk operations for admin data loading
  async bulkCreateStats(
    statsData: Database["public"]["Tables"]["equipment_stat"]["Insert"][]
  ): Promise<RepositoryResult<EquipmentStat[]>> {
    try {
      const { data, error } = await this.supabase.from("equipment_stat").insert(statsData).select();

      if (error) {
        log.error("Error bulk creating equipment stats:", error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error bulk creating equipment stats:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async bulkCreateRequiredItems(
    requiredItemsData: Database["public"]["Tables"]["equipment_required_item"]["Insert"][]
  ): Promise<RepositoryResult<EquipmentRequiredItem[]>> {
    try {
      const { data, error } = await this.supabase.from("equipment_required_item").insert(requiredItemsData).select();

      if (error) {
        log.error("Error bulk creating equipment required items:", error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error bulk creating equipment required items:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async initializeFromJSON(jsonData: EquipmentRecord[]): Promise<
    RepositoryResult<{
      equipment: Database["public"]["Tables"]["equipment"]["Row"][];
      stats: EquipmentStat[];
      required_items: EquipmentRequiredItem[];
    }>
  > {
    try {
      // Transform all data
      const equipmentData = jsonData.map((item) => EquipmentRepository.transformEquipmentFromJSON(item));
      const statsData = jsonData.flatMap((item) => EquipmentRepository.transformStatsFromJSON(item));
      const requiredItemsData = jsonData.flatMap((item) => EquipmentRepository.transformRequiredItemsFromJSON(item));

      // Bulk create equipment first with skipExisting to handle duplicates
      const equipmentResult = await this.bulkCreate(equipmentData, { skipExisting: true });

      if (equipmentResult.error) {
        return {
          data: null,
          error: equipmentResult.error,
        };
      }

      // Then create stats and required items
      const [statsResult, requiredItemsResult] = await Promise.all([
        this.bulkCreateStats(statsData),
        this.bulkCreateRequiredItems(requiredItemsData),
      ]);

      if (statsResult.error) {
        return {
          data: null,
          error: statsResult.error,
        };
      }

      if (requiredItemsResult.error) {
        return {
          data: null,
          error: requiredItemsResult.error,
        };
      }

      return {
        data: {
          equipment: equipmentResult.data!,
          stats: statsResult.data!,
          required_items: requiredItemsResult.data!,
        },
        error: null,
      };
    } catch (error) {
      log.error("Unexpected error initializing equipment from JSON:", error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  // Helper methods for stats and required items
  private async findStatsByEquipmentSlug(equipmentSlug: string): Promise<RepositoryResult<EquipmentStat[]>> {
    try {
      const { data, error } = await this.supabase
        .from("equipment_stat")
        .select("*")
        .eq("equipment_slug", equipmentSlug)
        .order("stat");

      if (error) {
        log.error(`Error finding stats for equipment ${equipmentSlug}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding stats for equipment ${equipmentSlug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  private async findRequiredItemsByEquipmentSlug(
    equipmentSlug: string
  ): Promise<RepositoryResult<EquipmentRequiredItem[]>> {
    try {
      const { data, error } = await this.supabase
        .from("equipment_required_item")
        .select("*")
        .eq("base_slug", equipmentSlug)
        .order("required_slug");

      if (error) {
        log.error(`Error finding required items for equipment ${equipmentSlug}:`, error);
        return {
          data: null,
          error: this.handleError(error),
        };
      }

      return {
        data: data || [],
        error: null,
      };
    } catch (error) {
      log.error(`Unexpected error finding required items for equipment ${equipmentSlug}:`, error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : "Unknown error occurred",
          details: error,
        },
      };
    }
  }

  async purgeEquipmentDomain(): Promise<
    RepositoryResult<{
      equipment: number;
      stats: number;
      required_items: number;
    }>
  > {
    try {
      // Count existing records before deletion
      const [equipmentCount, statsCount, requiredItemsCount] = await Promise.all([
        this.supabase.from("equipment").select("slug", { count: "exact", head: true }),
        this.supabase.from("equipment_stat").select("equipment_slug", { count: "exact", head: true }),
        this.supabase.from("equipment_required_item").select("base_slug", { count: "exact", head: true }),
      ]);

      // Delete in proper order (dependent tables first)
      await this.supabase.from("equipment_stat").delete().neq("equipment_slug", "");
      await this.supabase.from("equipment_required_item").delete().neq("base_slug", "");
      await this.supabase.from("equipment").delete().neq("slug", "");

      return {
        data: {
          equipment: equipmentCount.count || 0,
          stats: statsCount.count || 0,
          required_items: requiredItemsCount.count || 0,
        },
        error: null,
      };
    } catch (error) {
      log.error("Error purging equipment domain:", error);
      return {
        data: null,
        error: this.handleError(error),
      };
    }
  }
}
