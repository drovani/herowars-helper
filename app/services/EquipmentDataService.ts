import {
  EQUIPMENT_QUALITIES,
  EquipmentMutationSchema,
  type EquipmentMutation,
  type EquipmentRecord,
} from "~/data/equipment.zod";
import equipmentJson from "~/data/equipments.json";
import { generateSlug } from "~/lib/utils";
import { BaseDataService } from "./BaseDataService";

class EquipmentDataService extends BaseDataService<EquipmentRecord, EquipmentMutation> {
  protected mutationSchema = EquipmentMutationSchema;

  constructor() {
    super("equipment", "Equipment", equipmentJson as EquipmentRecord[]);
  }

  protected getRecordId(record: EquipmentRecord | EquipmentMutation): string {
    if ("slug" in record) return record.slug;
    else return generateSlug(record.name);
  }
  protected sortRecords(records: EquipmentRecord[]) {
    return records.sort((l, r) =>
      EQUIPMENT_QUALITIES.indexOf(l.quality) !== EQUIPMENT_QUALITIES.indexOf(r.quality)
        ? EQUIPMENT_QUALITIES.indexOf(l.quality) - EQUIPMENT_QUALITIES.indexOf(r.quality)
        : l.name.localeCompare(r.name)
    );
  }

  async getEquipmentRequiredFor(itemFor: EquipmentRecord | string): Promise<EquipmentRecord[]> {
    if (typeof itemFor === "string") {
      const eqp = await this.getById(itemFor);
      if (eqp === null) return [];
      else return await this.getEquipmentRequiredFor(eqp);
    } else if ("crafting" in itemFor && itemFor.crafting) {
      return await this.getAll(Object.keys(itemFor.crafting.required_items));
    } else {
      return [];
    }
  }

  async getEquipmentRequiredForRaw(equipment: EquipmentRecord): Promise<EquipmentRequirements | null> {
    const baseItems: EquipmentRequirements = { gold_cost: 0, required_items: [] };

    if ("crafting" in equipment && equipment.crafting) {
      baseItems.gold_cost += equipment.crafting.gold_cost;

      for (const [slug, qty] of Object.entries(equipment.crafting.required_items)) {
        const component = await this.getById(slug);
        if (component === null) continue;

        if ("crafting" in component && component.crafting) {
          const raws = await this.getEquipmentRequiredForRaw(component);
          if (raws === null) continue;
          baseItems.gold_cost += raws.gold_cost * qty;
          this.combineEquipmentRequirements(baseItems.required_items, raws.required_items, qty);
        } else {
          const found = baseItems.required_items.find((ri) => ri.equipment.slug === component.slug);
          if (found) found.quantity += qty;
          else baseItems.required_items.push({ equipment: component, quantity: qty });
        }
      }
    } else {
      return null;
    }
    return baseItems;
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

  async getEquipableEquipment(): Promise<EquipmentRecord[]> {
    return await this.getAll().then((records) => {
      return records.filter((e) => e.type === "equipable");
    });
  }

  async getEquipmentThatRequires(slug: string): Promise<EquipmentRecord[]> {
    return await this.getAll().then((records) => {
      return records.filter(
        (e) => "crafting" in e && e.crafting && Object.keys(e.crafting.required_items).includes(slug)
      );
    });
  }
}

interface EquipmentRequirements {
  gold_cost: number;
  required_items: {
    equipment: EquipmentRecord;
    quantity: number;
  }[];
}

export default new EquipmentDataService();
