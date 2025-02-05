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
interface Craftable {
  crafting?: {
    gold_cost: number;
    required_items: {
      [equipment_slug: BaseEquipment["slug"]]: number;
    };
  };
}

export interface Equipable extends BaseEquipment, Craftable {
  type: "equipable";
  stats: {
    [stat in (typeof Stats)[number]]: number;
  };
  hero_level_required: number;
}

export interface Fragment extends BaseEquipment {
  type: "fragment";
}

export interface Recipe extends BaseEquipment, Craftable {
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
        if (eq.crafting) {
          craftingRows[eq.slug] = Object.entries(eq.crafting.required_items).map(([required_slug, quantity]) => ({
            base_slug: eq.slug,
            required_slug: required_slug,
            quantity: quantity,
          }));
        }
        statsRows[eq.slug] = Object.entries(eq.stats).map(([stat, value]) => ({
          equipment_slug: eq.slug,
          stat: stat as (typeof Stats)[number],
          value: value,
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
          crafting_gold_cost: eq.crafting?.gold_cost,
          hero_level_required: eq.hero_level_required,
          campaign_sources: eq.campaign_sources,
        };
      } else if (eq.type === "recipe") {
        if (eq.crafting) {
          craftingRows[eq.slug] = Object.entries(eq.crafting.required_items).map(([required_slug, quantity]) => ({
            base_slug: eq.slug,
            required_slug: required_slug,
            quantity: quantity,
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
          crafting_gold_cost: eq.crafting?.gold_cost,
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
}

export default new EquipmentRepository();
