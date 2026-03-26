// ABOUTME: Tests for StaticEquipmentProvider — verifies equipment data served from JSON files.
// ABOUTME: Covers findAll, getAllAsJson, and relationship query methods.

import { describe, expect, it } from "vitest";

import { StaticEquipmentProvider } from "../StaticEquipmentProvider";

describe("StaticEquipmentProvider", () => {
  const provider = new StaticEquipmentProvider();

  describe("findAll", () => {
    it("returns a list of equipment without errors", async () => {
      const result = await provider.findAll();
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns equipment with required DB row fields", async () => {
      const result = await provider.findAll();
      const items = result.data!;
      expect(items.length).toBeGreaterThan(0);
      const first = items[0];
      expect(first).toHaveProperty("slug");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("quality");
      expect(first).toHaveProperty("type");
      expect(first).toHaveProperty("sell_value");
      expect(first).toHaveProperty("guild_activity_points");
    });

    it("returns equipment sorted by quality then name", async () => {
      const result = await provider.findAll();
      const items = result.data!;
      const qualityOrder = ["gray", "green", "blue", "violet", "orange"];
      // First item should be gray quality (lowest)
      expect(qualityOrder.indexOf(items[0].quality)).toBeLessThanOrEqual(
        qualityOrder.indexOf(items[items.length - 1].quality),
      );
    });
  });

  describe("findById", () => {
    it("returns an equipment row for a known slug", async () => {
      const result = await provider.findById("apprentices-mantle");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.slug).toBe("apprentices-mantle");
      expect(result.data).toHaveProperty("name");
      expect(result.data).toHaveProperty("quality");
      expect(result.data).toHaveProperty("type");
    });

    it("returns NOT_FOUND error for unknown slug", async () => {
      const result = await provider.findById("no-such-equipment");
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe("NOT_FOUND");
    });
  });

  describe("getAllAsJson", () => {
    it("returns EquipmentRecord array without errors", async () => {
      const result = await provider.getAllAsJson();
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("returns the same count as findAll", async () => {
      const allResult = await provider.findAll();
      const jsonResult = await provider.getAllAsJson();
      expect(jsonResult.data!.length).toBe(allResult.data!.length);
    });

    it("returns records with slug and name fields", async () => {
      const result = await provider.getAllAsJson();
      const items = result.data!;
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty("slug");
      expect(items[0]).toHaveProperty("name");
    });

    it("accepts an ids filter to return specific equipment", async () => {
      const result = await provider.getAllAsJson(["apprentices-mantle"]);
      expect(result.error).toBeNull();
      expect(result.data!.length).toBe(1);
      expect(result.data![0].slug).toBe("apprentices-mantle");
    });

    it("returns empty array when ids filter matches nothing", async () => {
      const result = await provider.getAllAsJson(["no-such-item"]);
      expect(result.error).toBeNull();
      expect(result.data!.length).toBe(0);
    });
  });

  // Relationship queries use real equipment data from equipments.json.
  // crossbow requires: orcish-yatagan (x1) and lucky-arrow (x1) — both are base (non-crafted) items.
  // lucky-arrow is used in both crossbow and elven-bow.
  // elven-bow requires: giants-belt (x1, which is itself crafted) and lucky-arrow (x1).
  // orcish-yatagan is a base ingredient used only in crossbow.

  describe("findEquipmentThatRequires", () => {
    it("finds parent items that require a known ingredient slug", async () => {
      // lucky-arrow is used in crossbow and elven-bow
      const result = await provider.findEquipmentThatRequires("lucky-arrow");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      const slugs = result.data!.map((r) => r.equipment.slug);
      expect(slugs).toContain("crossbow");
      expect(slugs).toContain("elven-bow");
    });

    it("returns each result with a quantity", async () => {
      const result = await provider.findEquipmentThatRequires("lucky-arrow");
      const crossbowEntry = result.data!.find(
        (r) => r.equipment.slug === "crossbow",
      );
      expect(crossbowEntry).toBeDefined();
      expect(crossbowEntry!.quantity).toBe(1);
    });

    it("returns empty array for a slug not used in any recipe", async () => {
      const result =
        await provider.findEquipmentThatRequires("no-such-ingredient");
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe("findEquipmentRequiredFor", () => {
    it("returns direct crafting ingredients with quantities for a crafted item", async () => {
      // crossbow requires orcish-yatagan and lucky-arrow
      const result = await provider.findEquipmentRequiredFor("crossbow");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      const slugs = result.data!.map((r) => r.equipment.slug);
      expect(slugs).toContain("orcish-yatagan");
      expect(slugs).toContain("lucky-arrow");
    });

    it("returns quantity values for each ingredient", async () => {
      const result = await provider.findEquipmentRequiredFor("crossbow");
      const entry = result.data!.find(
        (r) => r.equipment.slug === "orcish-yatagan",
      );
      expect(entry).toBeDefined();
      expect(entry!.quantity).toBe(1);
    });

    it("returns empty array for equipment with no crafting recipe", async () => {
      // orcish-yatagan is a base ingredient, not crafted
      const result = await provider.findEquipmentRequiredFor("orcish-yatagan");
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe("findEquipmentRequiredForRaw", () => {
    it("recursively flattens ingredients for a multi-level crafted item", async () => {
      // elven-bow requires giants-belt (which requires quiver, oil-lamp, travellers-shoes) and lucky-arrow
      const elvenBowRow = (await provider.findById("elven-bow")).data!;
      const result = await provider.findEquipmentRequiredForRaw(elvenBowRow);
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      // The raw ingredients should be base items, not giants-belt itself
      const slugs = result.data!.required_items.map((r) => r.equipment.slug);
      expect(slugs).not.toContain("giants-belt");
      // Should include giants-belt's base components
      expect(slugs).toContain("quiver");
      expect(slugs).toContain("oil-lamp");
      expect(slugs).toContain("travellers-shoes");
      expect(slugs).toContain("lucky-arrow");
    });

    it("returns null data for equipment with no crafting recipe", async () => {
      // orcish-yatagan is a base ingredient with no crafting
      const baseRow = (await provider.findById("orcish-yatagan")).data!;
      const result = await provider.findEquipmentRequiredForRaw(baseRow);
      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });
  });

  describe("findRawComponentOf", () => {
    it("finds end products that use a base ingredient", async () => {
      // orcish-yatagan is only used in crossbow; crossbow is a final product (not used in other recipes)
      const result = await provider.findRawComponentOf("orcish-yatagan");
      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      const slugs = result.data!.map((r) => r.equipment.slug);
      expect(slugs).toContain("crossbow");
    });

    it("includes totalQuantity for each end product", async () => {
      const result = await provider.findRawComponentOf("orcish-yatagan");
      const crossbowEntry = result.data!.find(
        (r) => r.equipment.slug === "crossbow",
      );
      expect(crossbowEntry).toBeDefined();
      expect(crossbowEntry!.totalQuantity).toBeGreaterThan(0);
    });

    it("returns empty array for a slug not used in any recipe", async () => {
      const result = await provider.findRawComponentOf("no-such-ingredient");
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });
});
