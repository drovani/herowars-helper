// ABOUTME: Static provider that serves equipment data from the JSON file on disk.
// ABOUTME: Used in static mode when Supabase environment variables are not set.

import equipmentsJson from "~/data/equipments.json";
import {
  EQUIPMENT_QUALITIES,
  type EquipmentRecord,
} from "~/data/equipment.zod";
import type { RepositoryResult } from "~/repositories/types";
import type { Database } from "~/types/supabase";

type EquipmentRow = Database["public"]["Tables"]["equipment"]["Row"];

// The equipments.json records already closely match EquipmentRecord shape.
// We cast them via unknown since the JSON loader types don't exactly match but
// the runtime data is compatible.
const equipments = equipmentsJson as unknown as EquipmentRecord[];

function mapRecordToRow(record: EquipmentRecord): EquipmentRow {
  return {
    slug: record.slug,
    name: record.name,
    quality: record.quality,
    type: record.type,
    sell_value: record.sell_value,
    guild_activity_points: record.guild_activity_points,
    buy_value_gold: record.buy_value_gold ?? null,
    buy_value_coin: record.buy_value_coin ?? null,
    campaign_sources: record.campaign_sources ?? null,
    crafting_gold_cost:
      "crafting" in record && record.crafting
        ? record.crafting.gold_cost
        : null,
    hero_level_required:
      "hero_level_required" in record
        ? (record.hero_level_required ?? null)
        : null,
    image_hash: null,
  };
}

function sortByQuality(rows: EquipmentRow[]): EquipmentRow[] {
  return [...rows].sort((l, r) => {
    const lIdx = EQUIPMENT_QUALITIES.indexOf(l.quality);
    const rIdx = EQUIPMENT_QUALITIES.indexOf(r.quality);
    if (lIdx !== rIdx) return lIdx - rIdx;
    return l.name.localeCompare(r.name);
  });
}

export class StaticEquipmentProvider {
  async findAll(): Promise<RepositoryResult<EquipmentRow[]>> {
    const rows = sortByQuality(equipments.map(mapRecordToRow));
    return { data: rows, error: null };
  }

  async getAllAsJson(
    ids?: string[],
  ): Promise<RepositoryResult<EquipmentRecord[]>> {
    let records = equipments;

    if (ids && ids.length > 0) {
      records = records.filter((r) => ids.includes(r.slug));
    }

    // Sort using quality ordering, same as live repository
    const sorted = [...records].sort((l, r) => {
      const lIdx = EQUIPMENT_QUALITIES.indexOf(l.quality);
      const rIdx = EQUIPMENT_QUALITIES.indexOf(r.quality);
      if (lIdx !== rIdx) return lIdx - rIdx;
      return l.name.localeCompare(r.name);
    });

    return { data: sorted, error: null };
  }
}
