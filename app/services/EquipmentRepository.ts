import { PostgrestFilterBuilder, PostgrestTransformBuilder } from "@supabase/postgrest-js";
import log from "loglevel";
import { Stats } from "~/data/ReadonlyArrays";
import BaseRepository from "./BaseRepository";
import type { HydrateDataOptions, HydrateDataResult } from "./IDataService";
import type { Mission } from "./MissionRepository";

export const EQUIPMENT_QUALITIES = ["gray", "green", "blue", "violet", "orange"] as const;

interface BaseEquipment {
  slug: string;
  name: string;
  quality: (typeof EQUIPMENT_QUALITIES)[number];
  buy_value_gold?: number;
  buy_value_coin?: number;
  sell_value: number;
  guild_activity_points: number;
  campaign_sources?: Mission["slug"][];
}
export interface Craftable {
  crafting_gold_cost?: number;
  required_items?: { quantity: number; required_slug: string }[];
}

export interface Equipable extends BaseEquipment, Partial<Craftable> {
  type: "equipable";
  stats: {
    stat: (typeof Stats)[number];
    value: number;
  }[];
  hero_level_required: number;
}

export interface Fragment extends BaseEquipment {
  type: "fragment";
}

export interface Recipe extends BaseEquipment, Partial<Craftable> {
  type: "recipe";
}

export type Equipment = Equipable | Fragment | Recipe;

export interface EquipmentRow extends BaseEquipment {
  crafting_gold_cost?: number;
  hero_level_required?: number;
}
export interface EquipmentCraftingRow {
  base_slug: Equipment["slug"];
  required_slug: Equipment["slug"];
  quantity: number;
}
export interface EquipmentStatsRow {
  equipment_slug: Equipment["slug"];
  stat: (typeof Stats)[number];
  value: number;
}

export interface EquipmentRequirements {
  gold_cost: number;
  required_items: {
    equipment: Equipment;
    quantity: number;
  }[];
}

class EquipmentRepository extends BaseRepository<Equipment, EquipmentRow> {
  constructor() {
    const select = [
      "slug",
      "name",
      "quality",
      "type",
      "buy_value_gold",
      "buy_value_coin",
      "sell_value",
      "guild_activity_points",
      "campaign_sources",
      "crafting_gold_cost",
      "required_items:equipment_required_item!equipment_required_item_base_slug_fkey(required_slug, quantity)",
      "stats:equipment_stat(stat, value)",
    ] as const;
    super("equipment", "slug", select);
  }

  protected getRecordId(record: Equipment): string {
    return record.slug;
  }
  protected sortRecords(records: Equipment[]): Equipment[] {
    return records.sort((a, b) =>
      EQUIPMENT_QUALITIES.indexOf(a.quality) !== EQUIPMENT_QUALITIES.indexOf(b.quality)
        ? EQUIPMENT_QUALITIES.indexOf(a.quality) - EQUIPMENT_QUALITIES.indexOf(b.quality)
        : a.name.localeCompare(b.name)
    );
  }
  protected finalize(
    query: PostgrestFilterBuilder<any, any, any, unknown, unknown>
  ): PostgrestTransformBuilder<any, any, Equipment[], string, unknown> {
    return query.order("quality").order("name").returns<Equipment[]>();
  }

  hydrateTableData(
    records: Equipment[],
    options: HydrateDataOptions = { skipExisting: true, failIfExists: false, forceUpdate: false }
  ): Promise<HydrateDataResult> {
    const craftingRows: { [base_slug: EquipmentRow["slug"]]: EquipmentCraftingRow[] } = {};
    const statsRows: { [base_slug: EquipmentRow["slug"]]: EquipmentStatsRow[] } = {};
    const equipRows: EquipmentRow[] = records.map((eq) => {
      if (eq.type === "equipable") {
        if (eq.required_items) {
          craftingRows[eq.slug] = eq.required_items.map((ri) => ({
            base_slug: eq.slug,
            ...ri,
          }));
        }
        statsRows[eq.slug] = eq.stats.map((st) => ({
          equipment_slug: eq.slug,
          ...st,
        }));

        return {
          type: eq.type,
          buy_value_gold: eq.buy_value_gold,
          guild_activity_points: eq.guild_activity_points,
          name: eq.name,
          quality: eq.quality,
          sell_value: eq.sell_value,
          slug: eq.slug,
          buy_value_coin: eq.buy_value_coin,
          crafting_gold_cost: eq.crafting_gold_cost,
          hero_level_required: eq.hero_level_required,
          campaign_sources: eq.campaign_sources,
        };
      } else if (eq.type === "recipe") {
        if (eq.required_items) {
          craftingRows[eq.slug] = eq.required_items.map((ri) => ({
            base_slug: eq.slug,
            ...ri,
          }));
        }
        return {
          type: eq.type,
          buy_value_gold: eq.buy_value_gold,
          guild_activity_points: eq.guild_activity_points,
          name: eq.name,
          quality: eq.quality,
          sell_value: eq.sell_value,
          slug: eq.slug,
          buy_value_coin: eq.buy_value_coin,
          crafting_gold_cost: eq.crafting_gold_cost,
          campaign_sources: eq.campaign_sources,
        };
      } else if (eq.type === "fragment") {
        return {
          type: eq.type,
          buy_value_gold: eq.buy_value_gold,
          guild_activity_points: eq.guild_activity_points,
          name: eq.name,
          quality: eq.quality,
          sell_value: eq.sell_value,
          slug: eq.slug,
          buy_value_coin: eq.buy_value_coin,
          campaign_sources: eq.campaign_sources,
        };
      } else {
        const _: never = eq;
        throw new Error(`Unknown equipment type during hydrateTableData.`);
      }
    });

    return super.hydrateTableData(equipRows, options, async (equipment) => {
      if (equipment === null) {
        return;
      }
      const stats = statsRows[equipment.slug];
      if (stats) {
        const { error } = await this.supabase.from("equipment_stat").upsert(stats);
        error && log.error(`Error during upsert of equipment_stat records for ${equipment.slug}`, error);
      }
      const crafting = craftingRows[equipment.slug];
      if (crafting) {
        const { error } = await this.supabase.from("equipment_required_item").upsert(crafting);
        error && log.error(`Error during upsert of equipment_required_item records for ${equipment.slug}`, error);
      }
    });
  }

  public async getAllThatRequires(slug: string): Promise<(Equipment & { qty_needed: number })[]> {
    const { data, error } = await this.supabase
      .from("equipment_required_item")
      .select(
        "qty_needed:quantity,...equipment!equipment_required_item_base_slug_fkey(slug,name,quality,type,buy_value_gold,buy_value_coin,sell_value,guild_activity_points,campaign_sources)"
      )
      .eq("required_slug", slug)
      .returns<(Equipment & { qty_needed: number })[]>();

    if (error) {
      log.error(`Error during getAllThatRequires(${slug}): `, error);
      throw new Error(`Error during getAllThatRequires(${slug})`);
    }
    return data;
  }
  public async getAllRequiredFor(
    equipment: Equipment,
    options: { deep: boolean } = { deep: false }
  ): Promise<EquipmentRequirements | null> {
    if (!equipment || !("crafting_gold_cost" in equipment) || !equipment.required_items?.length) return null;

    const baseItems: EquipmentRequirements = { gold_cost: equipment.crafting_gold_cost || 0, required_items: [] };

    const requiredFor = await this.getAll(equipment.required_items.map((ri) => ri.required_slug));

    for (const reqFor of requiredFor) {
      const reqQty = equipment.required_items.find((ri) => ri.required_slug === reqFor.slug)?.quantity || 0;
      if ("required_items" in reqFor && reqFor.required_items?.length && options.deep) {
        baseItems.gold_cost += reqFor.crafting_gold_cost || 0 * reqQty;

        const nested = await this.getAllRequiredFor(reqFor, options);
        if (!nested) {
          log.debug("whaaat???", reqFor);
          continue;
        }
        this.combineEquipmentRequirements(baseItems.required_items, nested.required_items, reqQty);
      } else {
        this.combineEquipmentRequirements(baseItems.required_items, [{ equipment: reqFor, quantity: reqQty }], 1);
      }
    }

    return baseItems;
  }
  public async getAllForMission(missionSlug: string): Promise<Equipment[] | null> {
    const {data, error} = await this.supabase.from("equipment").select(this.select).an

  }

  protected combineEquipmentRequirements(
    target: EquipmentRequirements["required_items"],
    source: EquipmentRequirements["required_items"],
    qty: number
  ): void {
    for (const req of source) {
      const found = target.find((t) => t.equipment.slug === req.equipment.slug);
      if (found) found.quantity += req.quantity * qty;
      else target.push({ ...req, quantity: req.quantity * qty });
    }
  }

  // public async getPrevNextEquipment(
  //   equipment: Equipment
  // ): Promise<[prevEquipment: Equipment | null, nextEquipment: Equipment | null]> {
  //   let prevEquipmentSlug = "";
  //   if (equipment.level > 1) prevEquipmentSlug = `${equipment.chapter_id}-${equipment.level - 1}`;
  //   else if (equipment.chapter_id > 1)
  //     prevEquipmentSlug = `${equipment.chapter_id - 1}-${equipment.chapter_id > 2 ? 15 : 10}`;
  //   let nextEquipmentSlug = "";
  //   if ((equipment.chapter_id > 1 && equipment.level < 15) || (equipment.chapter_id === 1 && equipment.level < 10))
  //     nextEquipmentSlug = `${equipment.chapter_id}-${equipment.level + 1}`;
  //   else if (equipment.chapter_id < 13) nextEquipmentSlug = `${equipment.chapter_id + 1}-1`;

  //   const prevEquipment = await this.getById(prevEquipmentSlug);
  //   const nextEquipment = await this.getById(nextEquipmentSlug);

  //   return [prevEquipment, nextEquipment];
  // }
}

export default new EquipmentRepository();
