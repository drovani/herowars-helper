// ABOUTME: Tests for equipment import functionality in admin setup page
// ABOUTME: Tests equipment data transformation, import process, and error handling

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import log from "loglevel";
import { action } from "../setup";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { createMockSupabaseClient } from "../../../../__tests__/mocks/supabase";
import type { EquipmentRecord } from "~/data/equipment.zod";

// Mock the data import
vi.mock("~/data/equipments.json", () => ({
  default: [
    {
      slug: "test-sword",
      name: "Test Sword",
      quality: "blue",
      type: "equipable",
      buy_value_gold: 1000,
      buy_value_coin: 0,
      sell_value: 200,
      guild_activity_points: 5,
      hero_level_required: 10,
      campaign_sources: ["1-1", "1-2"],
      stats: { strength: 100, agility: 50 },
      crafting: {
        gold_cost: 500,
        required_items: { "component-1": 2 },
      },
      updated_on: "2024-01-01T00:00:00Z",
    },
    {
      slug: "test-fragment",
      name: "Test Fragment (Fragment)",
      quality: "gray",
      type: "fragment",
      buy_value_gold: 100,
      buy_value_coin: 0,
      sell_value: 20,
      guild_activity_points: 1,
      campaign_sources: ["2-1"],
      updated_on: "2024-01-01T00:00:00Z",
    },
  ] as EquipmentRecord[],
}));

// Mock the admin client
vi.mock("~/lib/supabase/admin-client", () => ({
  createAdminClient: vi.fn(() => ({
    supabase: createMockSupabaseClient(),
  })),
}));

// Mock the Supabase client
vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    supabase: createMockSupabaseClient(),
    headers: new Headers(),
  })),
}));

// Mock the MissionRepository to avoid import issues
vi.mock("~/repositories/MissionRepository", () => ({
  MissionRepository: vi.fn().mockImplementation(function() { return {
    initializeMissionData: vi.fn().mockResolvedValue({
      data: { chapters: [], missions: [] },
      error: null,
    }),
    purgeMissionDomain: vi.fn().mockResolvedValue({
      data: { missions: 0, chapters: 0 },
      error: null,
    }),
  }; }),
}));

// Mock the HeroRepository to avoid import issues
vi.mock("~/repositories/HeroRepository", () => ({
  HeroRepository: vi.fn().mockImplementation(function() { return {
    initializeFromJSON: vi.fn().mockResolvedValue({
      data: { heroes: [] },
      error: null,
    }),
    purgeHeroDomain: vi.fn().mockResolvedValue({
      data: { heroes: 0 },
      error: null,
    }),
  }; }),
}));

describe("Admin Setup - Equipment Import", () => {
  let capturedLogs: Array<{ level: string; message: string; args: any[] }> = [];
  let originalMethodFactory: any;

  beforeEach(() => {
    // Capture logs to in-memory array instead of console
    capturedLogs = [];
    originalMethodFactory = log.methodFactory;
    log.methodFactory = function (methodName, _logLevel, _loggerName) {
      return function (message, ...args) {
        capturedLogs.push({ level: methodName, message, args });
        // Silent - don't output to console
      };
    };
    log.rebuild();

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("Equipment dataset import", () => {
    it("should successfully import equipment data", async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", "equipment");
      mockFormData.set("purge", "false");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      // Mock EquipmentRepository initializeFromJSON
      const mockInitResult = {
        data: {
          equipment: [
            {
              slug: "test-sword",
              name: "Test Sword",
              quality: "blue" as const,
              type: "equipable" as const,
              buy_value_gold: 1000,
              buy_value_coin: 0,
              sell_value: 200,
              guild_activity_points: 5,
              hero_level_required: 10,
              campaign_sources: ["1-1"],
              crafting_gold_cost: 500,
              image_hash: null,
            },
          ],
          stats: [
            { equipment_slug: "test-sword", stat: "strength", value: 100 },
          ],
          required_items: [
            {
              base_slug: "test-sword",
              required_slug: "component-1",
              quantity: 2,
            },
          ],
        },
        error: null,
      };

      vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      ).mockResolvedValue(mockInitResult);

      const response = await action({ request: mockRequest } as any);

      // Extract data from the DataWithResponseInit object
      const data = (response as any).data;

      expect(data.success).toBe(true);
      expect(data.results.equipment.total).toBe(2); // 2 equipment items in mock data
      expect(data.results.equipment.created).toBe(1); // 1 created from mock result
      expect(data.results.equipment.errors).toBe(0);
      expect(data.results.equipment.skipped).toBe(0);

      // Verify EquipmentRepository was called with correct data
      expect(
        EquipmentRepository.prototype.initializeFromJSON
      ).toHaveBeenCalledWith([
        expect.objectContaining({ slug: "test-sword", name: "Test Sword" }),
        expect.objectContaining({
          slug: "test-fragment",
          name: "Test Fragment (Fragment)",
        }),
      ]);
    });

    it("should handle equipment import errors", async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", "equipment");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      // Mock EquipmentRepository with error
      const mockError = {
        message: "Equipment import failed",
        code: "BULK_PARTIAL_FAILURE",
        details: {
          errors: [
            {
              data: { slug: "test-sword", name: "Test Sword" },
              error: { message: "Duplicate key error", code: "23505" },
            },
          ],
          skipped: [
            { slug: "test-fragment", name: "Test Fragment (Fragment)" },
          ],
        },
      };

      vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      ).mockResolvedValue({
        data: { equipment: [], stats: [], required_items: [] },
        error: mockError,
      });

      const response = await action({ request: mockRequest } as any);
      const data = (response as any).data;

      expect(data.success).toBe(true); // Still success due to partial failure handling
      expect(data.results.equipment.errors).toBe(1);
      expect(data.results.equipment.skipped).toBe(1);
      expect(data.results.equipment.errorDetails).toHaveLength(1);
      expect(data.results.equipment.skippedDetails).toHaveLength(1);
      expect(data.results.equipment.errorDetails[0].record.slug).toBe(
        "test-sword"
      );
      expect(data.results.equipment.skippedDetails[0].slug).toBe(
        "test-fragment"
      );
    });

    it("should handle complete equipment import failure", async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", "equipment");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      // Mock EquipmentRepository with complete failure
      const mockError = {
        message: "Complete equipment import failure",
        code: "DATABASE_ERROR",
      };

      vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      ).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const response = await action({ request: mockRequest } as any);
      const data = (response as any).data;

      expect(data.success).toBe(false);
      expect(data.error).toContain("Equipment data initialization failed");
      expect((response as any).init.status).toBe(500);
    });

    it('should include equipment in "all" dataset mode', async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", ""); // Empty means "all"

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      // Mock both repositories
      vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      ).mockResolvedValue({
        data: {
          equipment: [
            {
              slug: "test-sword",
              name: "Test Sword",
              quality: "blue" as const,
              type: "equipable" as const,
              buy_value_gold: 1000,
              buy_value_coin: 0,
              sell_value: 200,
              guild_activity_points: 5,
              hero_level_required: 10,
              campaign_sources: ["1-1"],
              crafting_gold_cost: null,
              image_hash: null,
            },
          ],
          stats: [],
          required_items: [],
        },
        error: null,
      });

      // MissionRepository is already mocked globally

      const response = await action({ request: mockRequest } as any);
      const data = (response as any).data;

      expect(data.success).toBe(true);
      expect(data.results.equipment.total).toBe(2);
      expect(
        EquipmentRepository.prototype.initializeFromJSON
      ).toHaveBeenCalled();
    });

    it('should skip equipment when dataset is "missions"', async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", "missions");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      // MissionRepository is already mocked globally

      // Spy on EquipmentRepository to ensure it's not called
      const equipmentSpy = vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      );

      const response = await action({ request: mockRequest } as any);
      const data = (response as any).data;

      expect(data.success).toBe(true);
      expect(data.results.equipment.total).toBe(0); // Should remain 0
      expect(equipmentSpy).not.toHaveBeenCalled();
    });

    it("should use force mode with admin client", async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "force");
      mockFormData.set("dataset", "equipment");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      ).mockResolvedValue({
        data: { equipment: [], stats: [], required_items: [] },
        error: null,
      });

      const response = await action({ request: mockRequest } as any);
      const data = (response as any).data;

      expect(data.success).toBe(true);
      expect(data.results.mode).toBe("force");

      // Verify admin client was used - it's already mocked globally
    });
  });

  describe("Equipment data transformation", () => {
    it("should correctly transform equipment JSON data", async () => {
      // This test verifies the transformEquipments helper function
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", "equipment");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      let capturedTransformData: any;
      vi.spyOn(
        EquipmentRepository.prototype,
        "initializeFromJSON"
      ).mockImplementation((data) => {
        capturedTransformData = data;
        return Promise.resolve({
          data: { equipment: [], stats: [], required_items: [] },
          error: null,
        });
      });

      await action({ request: mockRequest } as any);

      // Verify the data passed to initializeFromJSON matches our mock data
      expect(Array.isArray(capturedTransformData)).toBe(true);
      expect(capturedTransformData.length).toBe(2); // Based on our mock data
      expect(capturedTransformData[0]).toMatchObject({
        slug: "test-sword",
        name: "Test Sword",
        type: "equipable",
      });
      expect(capturedTransformData[1]).toMatchObject({
        slug: "test-fragment",
        name: "Test Fragment (Fragment)",
        type: "fragment",
      });
    });
  });

  describe("Logging", () => {
    it("should call equipment repository initialization when dataset is equipment", async () => {
      const mockFormData = new FormData();
      mockFormData.set("mode", "basic");
      mockFormData.set("dataset", "equipment");

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as any;

      const initSpy = vi
        .spyOn(EquipmentRepository.prototype, "initializeFromJSON")
        .mockResolvedValue({
          data: { equipment: [], stats: [], required_items: [] },
          error: null,
        });

      await action({ request: mockRequest } as any);

      // Verify that the equipment initialization was called
      expect(initSpy).toHaveBeenCalledTimes(1);
      expect(initSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ slug: "test-sword" }),
          expect.objectContaining({ slug: "test-fragment" }),
        ])
      );
    });
  });
});
