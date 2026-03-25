// ABOUTME: Static provider that serves equipment data from the JSON file on disk.
// ABOUTME: Used in static mode when Supabase environment variables are not set.

import log from "loglevel";

import equipmentsJson from "~/data/equipments.json";
import {
  EQUIPMENT_QUALITIES,
  type EquipmentRecord,
} from "~/data/equipment.zod";
import type { EquipmentRequirements } from "~/repositories/EquipmentRepository";
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
  constructor() {
    log.info(
      "StaticEquipmentProvider: serving equipment data from static JSON files",
    );
  }

  async findAll(): Promise<RepositoryResult<EquipmentRow[]>> {
    const rows = sortByQuality(equipments.map(mapRecordToRow));
    return { data: rows, error: null };
  }

  async findById(slug: string): Promise<RepositoryResult<EquipmentRow>> {
    const record = equipments.find((r) => r.slug === slug);
    if (!record) {
      return {
        data: null,
        error: { message: `Equipment not found: ${slug}`, code: "NOT_FOUND" },
      };
    }
    return { data: mapRecordToRow(record), error: null };
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

  // Relationship queries implemented via in-memory crafting data from equipments.json.

  // Find all equipment whose crafting recipe includes the given slug as a required item.
  async findEquipmentThatRequires(
    slug: string,
  ): Promise<
    RepositoryResult<Array<{ equipment: EquipmentRow; quantity: number }>>
  > {
    const results: Array<{ equipment: EquipmentRow; quantity: number }> = [];
    for (const record of equipments) {
      if (!("crafting" in record) || !record.crafting?.required_items) continue;
      const qty = (record.crafting.required_items as Record<string, number>)[
        slug
      ];
      if (qty !== undefined) {
        results.push({ equipment: mapRecordToRow(record), quantity: qty });
      }
    }
    return { data: results, error: null };
  }

  // Return the direct crafting ingredients of the given equipment (by slug or row).
  async findEquipmentRequiredFor(
    slugOrEquipment: string | EquipmentRow,
  ): Promise<
    RepositoryResult<Array<{ equipment: EquipmentRow; quantity: number }>>
  > {
    const slug =
      typeof slugOrEquipment === "string"
        ? slugOrEquipment
        : slugOrEquipment.slug;
    const record = equipments.find((r) => r.slug === slug);
    if (
      !record ||
      !("crafting" in record) ||
      !record.crafting?.required_items
    ) {
      return { data: [], error: null };
    }
    const requiredItems = record.crafting.required_items as Record<
      string,
      number
    >;
    const results: Array<{ equipment: EquipmentRow; quantity: number }> = [];
    for (const [reqSlug, qty] of Object.entries(requiredItems)) {
      const reqRecord = equipments.find((r) => r.slug === reqSlug);
      if (reqRecord) {
        results.push({ equipment: mapRecordToRow(reqRecord), quantity: qty });
      }
    }
    return { data: results, error: null };
  }

  async findEquipmentRequiredForRaw(
    equipment: EquipmentRow,
  ): Promise<RepositoryResult<EquipmentRequirements | null>> {
    const record = equipments.find((r) => r.slug === equipment.slug);
    if (
      !record ||
      !("crafting" in record) ||
      !record.crafting?.required_items
    ) {
      return { data: null, error: null };
    }
    const baseItems: EquipmentRequirements = {
      gold_cost: 0,
      required_items: [],
    };
    const crafting = record.crafting as {
      gold_cost: number;
      required_items: Record<string, number>;
    };
    baseItems.gold_cost += crafting.gold_cost;
    for (const [reqSlug, qty] of Object.entries(crafting.required_items)) {
      const reqRecord = equipments.find((r) => r.slug === reqSlug);
      if (!reqRecord) continue;
      const reqRow = mapRecordToRow(reqRecord);
      // If the required item also has crafting, recurse to get raw components
      if ("crafting" in reqRecord && reqRecord.crafting) {
        const rawResult = await this.findEquipmentRequiredForRaw(reqRow);
        if (rawResult.data) {
          baseItems.gold_cost += rawResult.data.gold_cost * qty;
          for (const raw of rawResult.data.required_items) {
            const existing = baseItems.required_items.find(
              (ri) => ri.equipment.slug === raw.equipment.slug,
            );
            if (existing) {
              existing.quantity += raw.quantity * qty;
            } else {
              baseItems.required_items.push({
                ...raw,
                quantity: raw.quantity * qty,
              });
            }
          }
        }
      } else {
        const existing = baseItems.required_items.find(
          (ri) => ri.equipment.slug === reqRow.slug,
        );
        if (existing) {
          existing.quantity += qty;
        } else {
          baseItems.required_items.push({ equipment: reqRow, quantity: qty });
        }
      }
    }
    return { data: baseItems, error: null };
  }

  // Walk the crafting tree upward to find all final products (non-craftable equipables) that use this slug.
  async findRawComponentOf(
    slug: string,
  ): Promise<
    RepositoryResult<Array<{ equipment: EquipmentRow; totalQuantity: number }>>
  > {
    const finalProducts = new Map<
      string,
      { equipment: EquipmentRow; totalQuantity: number }
    >();

    const traverse = async (
      componentSlug: string,
      multiplier: number,
      path: string[],
    ): Promise<void> => {
      if (path.includes(componentSlug)) return;
      const newPath = [...path, componentSlug];

      const requiredForResult =
        await this.findEquipmentThatRequires(componentSlug);
      if (!requiredForResult.data?.length) return;

      for (const { equipment, quantity } of requiredForResult.data) {
        const newMultiplier = multiplier * quantity;
        const nextResult = await this.findEquipmentThatRequires(equipment.slug);
        if (!nextResult.data?.length) {
          // This is a final product
          const existing = finalProducts.get(equipment.slug);
          if (existing) {
            existing.totalQuantity += newMultiplier;
          } else {
            finalProducts.set(equipment.slug, {
              equipment,
              totalQuantity: newMultiplier,
            });
          }
        } else {
          await traverse(equipment.slug, newMultiplier, newPath);
        }
      }
    };

    await traverse(slug, 1, []);
    return { data: Array.from(finalProducts.values()), error: null };
  }
}
