// ABOUTME: Integration tests for player roster page covering data loading and actions
// ABOUTME: Tests authentication flows and repository integration
import { describe, it, expect, beforeEach, vi } from "vitest";
import { loader, action } from "../roster/layout";
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { createMockSupabaseClient } from "~/__tests__/mocks/supabase";
import {
  getAuthenticatedUser,
  requireAuthenticatedUser,
} from "~/lib/auth/utils";

// Mock the repositories
vi.mock("~/repositories/PlayerHeroRepository");
vi.mock("~/repositories/HeroRepository");

// Mock the Supabase client
vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    supabase: createMockSupabaseClient(),
    headers: undefined,
  })),
}));

// Mock the auth utilities
vi.mock("~/lib/auth/utils", () => ({
  getAuthenticatedUser: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}));

describe("Player Roster Integration", () => {
  let mockRequest: Request;
  let mockHeroRepo: any;
  let mockPlayerHeroRepo: any;

  beforeEach(() => {
    mockRequest = new Request("http://localhost:3000/player?userId=user1");

    mockHeroRepo = {
      findAll: vi.fn(),
    };

    mockPlayerHeroRepo = {
      findWithHeroDetails: vi.fn(),
      addHeroToCollection: vi.fn(),
      updateHeroProgress: vi.fn(),
      removeFromCollection: vi.fn(),
      addAllHeroesToCollection: vi.fn(),
    };

    vi.mocked(HeroRepository).mockImplementation(() => mockHeroRepo);
    vi.mocked(PlayerHeroRepository).mockImplementation(
      () => mockPlayerHeroRepo
    );

    // Mock auth utilities
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: {
        id: "user1",
        email: "test@example.com",
        app_metadata: { roles: ["user"] },
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    });

    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: "user1",
      email: "test@example.com",
      app_metadata: { roles: ["user"] },
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  describe("loader", () => {
    it("should load heroes and user collection", async () => {
      const mockHeroes = [
        {
          slug: "astaroth",
          name: "Astaroth",
          class: "tank",
          faction: "chaos",
          main_stat: "strength",
          attack_type: ["physical"],
        },
        {
          slug: "aurora",
          name: "Aurora",
          class: "tank",
          faction: "chaos",
          main_stat: "intelligence",
          attack_type: ["magic"],
        },
      ];

      const mockCollection = [
        {
          id: "1",
          user_id: "user1",
          hero_slug: "astaroth",
          stars: 5,
          equipment_level: 12,
          level: 80,
          talisman_level: 15,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
          hero: mockHeroes[0],
        },
      ];

      mockHeroRepo.findAll.mockResolvedValue({ data: mockHeroes, error: null });
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: mockCollection,
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.heroes).toHaveLength(2);
      expect(result.playerCollection).toHaveLength(1);
      expect(result.playerCollection[0].hero_slug).toBe("astaroth");
    });

    it("should handle empty collection for unauthenticated user", async () => {
      // Mock getAuthenticatedUser to return no user for this test
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: null,
        error: null,
      });

      const mockRequest = new Request("http://localhost:3000/player");
      const mockHeroes = [
        {
          slug: "astaroth",
          name: "Astaroth",
          class: "tank",
          faction: "chaos",
          main_stat: "strength",
          attack_type: ["physical"],
        },
      ];

      mockHeroRepo.findAll.mockResolvedValue({ data: mockHeroes, error: null });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.heroes).toHaveLength(1);
      expect(result.playerCollection).toHaveLength(0);
      expect(mockPlayerHeroRepo.findWithHeroDetails).not.toHaveBeenCalled();
    });

    it("should handle hero loading errors", async () => {
      mockHeroRepo.findAll.mockResolvedValue({
        data: null,
        error: { message: "DB Error" },
      });

      await expect(
        loader({
          request: mockRequest,
          params: {},
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });

    it("should handle collection loading errors gracefully", async () => {
      const mockHeroes = [
        {
          slug: "astaroth",
          name: "Astaroth",
          class: "tank",
          faction: "chaos",
          main_stat: "strength",
          attack_type: ["physical"],
        },
      ];

      mockHeroRepo.findAll.mockResolvedValue({ data: mockHeroes, error: null });
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: null,
        error: { message: "Collection error" },
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.heroes).toHaveLength(1);
      expect(result.playerCollection).toHaveLength(0); // Should default to empty array
    });
  });

  describe("action - addHero", () => {
    it("should add hero to collection", async () => {
      const formData = new FormData();
      formData.append("action", "addHero");
      formData.append("heroSlug", "astaroth");
      formData.append("stars", "1");
      formData.append("equipmentLevel", "1");
      formData.append("level", "1");
      formData.append("talismanLevel", "0");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const mockResult = {
        data: {
          id: "1",
          user_id: "user1",
          hero_slug: "astaroth",
          stars: 1,
          equipment_level: 1,
        },
        error: null,
      };

      mockPlayerHeroRepo.addHeroToCollection.mockResolvedValue(mockResult);

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero added to collection");
      expect(mockPlayerHeroRepo.addHeroToCollection).toHaveBeenCalledWith(
        "user1",
        {
          hero_slug: "astaroth",
          stars: 1,
          equipment_level: 1,
          level: 1,
          talisman_level: 0,
        }
      );
    });

    it("should handle add hero errors", async () => {
      const formData = new FormData();
      formData.append("action", "addHero");
      formData.append("heroSlug", "astaroth");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      mockPlayerHeroRepo.addHeroToCollection.mockResolvedValue({
        data: null,
        error: { message: "Hero already exists" },
      });

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Hero already exists");
    });
  });

  describe("action - updateHero", () => {
    it("should update hero stars", async () => {
      const formData = new FormData();
      formData.append("action", "updateHero");
      formData.append("heroSlug", "astaroth");
      formData.append("stars", "5");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      mockPlayerHeroRepo.updateHeroProgress.mockResolvedValue({
        data: { id: "1", stars: 5 },
        error: null,
      });

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero updated");
      expect(mockPlayerHeroRepo.updateHeroProgress).toHaveBeenCalledWith(
        "user1",
        "astaroth",
        { stars: 5 }
      );
    });

    it("should update hero equipment level", async () => {
      const formData = new FormData();
      formData.append("action", "updateHero");
      formData.append("heroSlug", "astaroth");
      formData.append("equipmentLevel", "15");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      mockPlayerHeroRepo.updateHeroProgress.mockResolvedValue({
        data: { id: "1", equipment_level: 15 },
        error: null,
      });

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero updated");
      expect(mockPlayerHeroRepo.updateHeroProgress).toHaveBeenCalledWith(
        "user1",
        "astaroth",
        { equipment_level: 15 }
      );
    });

    it("should update hero level and talisman level", async () => {
      const formData = new FormData();
      formData.append("action", "updateHero");
      formData.append("heroSlug", "astaroth");
      formData.append("level", "120");
      formData.append("talismanLevel", "25");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      mockPlayerHeroRepo.updateHeroProgress.mockResolvedValue({
        data: { id: "1", level: 120, talisman_level: 25 },
        error: null,
      });

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero updated");
      expect(mockPlayerHeroRepo.updateHeroProgress).toHaveBeenCalledWith(
        "user1",
        "astaroth",
        { level: 120, talisman_level: 25 }
      );
    });
  });

  describe("action - removeHero", () => {
    it("should remove hero from collection", async () => {
      const formData = new FormData();
      formData.append("action", "removeHero");
      formData.append("heroSlug", "astaroth");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      mockPlayerHeroRepo.removeFromCollection.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero removed from collection");
      expect(mockPlayerHeroRepo.removeFromCollection).toHaveBeenCalledWith(
        "user1",
        "astaroth"
      );
    });
  });

  describe("action - authentication", () => {
    it("should return error for unauthenticated user", async () => {
      // Mock requireAuthenticatedUser to throw for this test
      vi.mocked(requireAuthenticatedUser).mockRejectedValue(
        new Response("Authentication required", { status: 401 })
      );

      const formData = new FormData();
      formData.append("action", "addHero");
      formData.append("heroSlug", "astaroth");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      await expect(
        action({
          request: mockRequest,
          params: {},
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });

    it("should return error for invalid action", async () => {
      const formData = new FormData();
      formData.append("action", "invalidAction");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Invalid action");
    });
  });

  describe("action - addAllHeroes", () => {
    it("should successfully add all heroes to collection", async () => {
      const formData = new FormData();
      formData.append("action", "addAllHeroes");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const mockResult = {
        data: {
          totalHeroes: 10,
          addedCount: 8,
          skippedCount: 2,
          errorCount: 0,
          addedHeroes: ["galahad", "keira", "maya", "qing-mao", "jet", "thea", "aurora", "dante"],
          skippedHeroes: ["astaroth", "celeste"],
          errors: [],
        },
        error: null,
      };

      mockPlayerHeroRepo.addAllHeroesToCollection.mockResolvedValue(mockResult);

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Successfully added 8 heroes to your collection!");
      expect(result.data).toEqual(mockResult.data);
      expect(mockPlayerHeroRepo.addAllHeroesToCollection).toHaveBeenCalledWith("user1", {
        batchSize: 50,
        parallelism: 5,
      });
    });

    it("should handle case when all heroes already in collection", async () => {
      const formData = new FormData();
      formData.append("action", "addAllHeroes");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const mockResult = {
        data: {
          totalHeroes: 5,
          addedCount: 0,
          skippedCount: 5,
          errorCount: 0,
          addedHeroes: [],
          skippedHeroes: ["astaroth", "galahad", "keira", "maya", "qing-mao"],
          errors: [],
        },
        error: null,
      };

      mockPlayerHeroRepo.addAllHeroesToCollection.mockResolvedValue(mockResult);

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("All heroes are already in your collection!");
      expect(result.data).toEqual(mockResult.data);
    });

    it("should handle partial success with errors", async () => {
      const formData = new FormData();
      formData.append("action", "addAllHeroes");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const mockResult = {
        data: {
          totalHeroes: 5,
          addedCount: 3,
          skippedCount: 1,
          errorCount: 1,
          addedHeroes: ["galahad", "keira", "maya"],
          skippedHeroes: ["astaroth"],
          errors: [
            {
              heroSlug: "qing-mao",
              message: "Database constraint violation",
              code: "DB_ERROR",
            },
          ],
        },
        error: {
          code: "BULK_ADD_PARTIAL",
          message: "Bulk hero addition partially successful: 3 added, 1 errors",
        },
      };

      mockPlayerHeroRepo.addAllHeroesToCollection.mockResolvedValue(mockResult);

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Added 3 heroes to your collection. 1 heroes had errors.");
      expect(result.data).toEqual(mockResult.data);
    });

    it("should handle complete failure", async () => {
      const formData = new FormData();
      formData.append("action", "addAllHeroes");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const mockResult = {
        data: null,
        error: {
          code: "FETCH_HEROES_FAILED",
          message: "Failed to fetch available heroes: Database connection failed",
        },
      };

      mockPlayerHeroRepo.addAllHeroesToCollection.mockResolvedValue(mockResult);

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Failed to fetch available heroes: Database connection failed");
      expect(result.code).toBe("FETCH_HEROES_FAILED");
    });

    it("should handle unexpected error cases", async () => {
      const formData = new FormData();
      formData.append("action", "addAllHeroes");

      const mockRequest = new Request("http://localhost:3000/player", {
        method: "POST",
        body: formData,
      });

      const mockResult = {
        data: null,
        error: null, // Unusual case where both data and error are null
      };

      mockPlayerHeroRepo.addAllHeroesToCollection.mockResolvedValue(mockResult);

      const result = await action({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Unexpected error during bulk hero addition");
    });
  });
});
