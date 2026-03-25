// ABOUTME: Tests for StaticEquipmentProvider — verifies equipment data served from JSON files.
// ABOUTME: Covers findAll and getAllAsJson methods.

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
});
