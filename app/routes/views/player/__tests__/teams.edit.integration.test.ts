// ABOUTME: Integration tests for team editing page covering team updates and hero management
// ABOUTME: Tests authentication flows and team modification operations
import { describe, it, expect, beforeEach, vi } from "vitest";
import { loader, action } from "../teams/$teamId.edit";
import { PlayerTeamRepository } from "~/repositories/PlayerTeamRepository";
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository";
import { createMockSupabaseClient } from "~//__tests__/mocks/supabase";
import {
  getAuthenticatedUser,
  requireAuthenticatedUser,
} from "~/lib/auth/utils";

// Mock the repositories
vi.mock("~/repositories/PlayerTeamRepository");
vi.mock("~/repositories/PlayerHeroRepository");

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

describe("Player Teams Edit Integration", () => {
  let mockRequest: Request;
  let mockTeamRepo: any;
  let mockPlayerHeroRepo: any;
  const mockTeamId = "team123";

  beforeEach(() => {
    mockRequest = new Request(
      `http://localhost:3000/player/teams/${mockTeamId}`
    );

    mockTeamRepo = {
      findTeamWithHeroes: vi.fn(),
      updateTeam: vi.fn(),
      addHeroToTeam: vi.fn(),
      removeHeroFromTeam: vi.fn(),
    };

    mockPlayerHeroRepo = {
      findWithHeroDetails: vi.fn(),
    };

    vi.mocked(PlayerTeamRepository).mockImplementation(() => mockTeamRepo);
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
    it("should load team and user hero collection successfully", async () => {
      const mockTeam = {
        id: mockTeamId,
        user_id: "user1",
        name: "Arena Team",
        description: "Main arena team",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        heroes: [
          {
            id: "th1",
            team_id: mockTeamId,
            hero_slug: "astaroth",
            created_at: "2024-01-15T10:00:00Z",
            hero: {
              slug: "astaroth",
              name: "Astaroth",
              class: "tank",
              faction: "chaos",
              main_stat: "strength",
              attack_type: ["physical"],
            },
          },
        ],
      };

      const mockUserHeroes = [
        {
          id: "1",
          user_id: "user1",
          hero_slug: "astaroth",
          stars: 5,
          equipment_level: 12,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z",
          hero: {
            slug: "astaroth",
            name: "Astaroth",
            class: "tank",
            faction: "chaos",
            main_stat: "strength",
            attack_type: ["physical"],
          },
        },
        {
          id: "2",
          user_id: "user1",
          hero_slug: "aurora",
          stars: 3,
          equipment_level: 8,
          created_at: "2024-01-16T10:00:00Z",
          updated_at: "2024-01-16T10:00:00Z",
          hero: {
            slug: "aurora",
            name: "Aurora",
            class: "tank",
            faction: "chaos",
            main_stat: "intelligence",
            attack_type: ["magic"],
          },
        },
      ];

      mockTeamRepo.findTeamWithHeroes.mockResolvedValue({
        data: mockTeam,
        error: null,
      });
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: mockUserHeroes,
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.team).toEqual(mockTeam);
      expect(result.userHeroes).toHaveLength(2);
      expect(mockTeamRepo.findTeamWithHeroes).toHaveBeenCalledWith(
        mockTeamId,
        "user1"
      );
      expect(mockPlayerHeroRepo.findWithHeroDetails).toHaveBeenCalledWith(
        "user1"
      );
    });

    it("should throw error when user is not authenticated", async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: null,
        error: null,
      });

      await expect(
        loader({
          request: mockRequest,
          params: { teamId: mockTeamId },
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });

    it("should throw error when team ID is missing", async () => {
      await expect(
        loader({
          request: mockRequest,
          params: {},
          context: { VALUE_FROM_NETLIFY: "test" },
        } as any)
      ).rejects.toThrow(Response);
    });

    it("should throw error when team is not found", async () => {
      mockTeamRepo.findTeamWithHeroes.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        loader({
          request: mockRequest,
          params: { teamId: mockTeamId },
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });

    it("should throw error when hero collection fails to load", async () => {
      const mockTeam = {
        id: mockTeamId,
        user_id: "user1",
        name: "Arena Team",
        heroes: [],
      };

      mockTeamRepo.findTeamWithHeroes.mockResolvedValue({
        data: mockTeam,
        error: null,
      });
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(
        loader({
          request: mockRequest,
          params: { teamId: mockTeamId },
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });
  });

  describe("action - updateTeam", () => {
    it("should update team successfully", async () => {
      const formData = new FormData();
      formData.append("action", "updateTeam");
      formData.append("name", "Updated Arena Team");
      formData.append("description", "Updated description");

      const mockUpdatedTeam = {
        id: mockTeamId,
        user_id: "user1",
        name: "Updated Arena Team",
        description: "Updated description",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      };

      mockTeamRepo.updateTeam.mockResolvedValue({
        data: mockUpdatedTeam,
        error: null,
      });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Team "Updated Arena Team" updated successfully'
      );
      expect(mockTeamRepo.updateTeam).toHaveBeenCalledWith(
        mockTeamId,
        "user1",
        {
          name: "Updated Arena Team",
          description: "Updated description",
        }
      );
    });

    it("should update team with undefined values for empty fields", async () => {
      const formData = new FormData();
      formData.append("action", "updateTeam");
      formData.append("name", "");
      formData.append("description", "");

      const mockUpdatedTeam = {
        id: mockTeamId,
        user_id: "user1",
        name: "Team 1",
        description: null,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      };

      mockTeamRepo.updateTeam.mockResolvedValue({
        data: mockUpdatedTeam,
        error: null,
      });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(mockTeamRepo.updateTeam).toHaveBeenCalledWith(
        mockTeamId,
        "user1",
        {
          name: undefined,
          description: undefined,
        }
      );
    });

    it("should return error when team update fails", async () => {
      const formData = new FormData();
      formData.append("action", "updateTeam");
      formData.append("name", "Updated Team");

      mockTeamRepo.updateTeam.mockResolvedValue({
        data: null,
        error: new Error("Update failed"),
      });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Update failed");
    });
  });

  describe("action - addHero", () => {
    it("should add hero to team successfully", async () => {
      const formData = new FormData();
      formData.append("action", "addHero");
      formData.append("heroSlug", "aurora");

      mockTeamRepo.addHeroToTeam.mockResolvedValue({ data: {}, error: null });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero added to team");
      expect(mockTeamRepo.addHeroToTeam).toHaveBeenCalledWith(
        mockTeamId,
        "user1",
        { hero_slug: "aurora" }
      );
    });

    it("should return error when hero slug is missing", async () => {
      const formData = new FormData();
      formData.append("action", "addHero");

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Hero slug is required");
    });

    it("should return error when adding hero fails", async () => {
      const formData = new FormData();
      formData.append("action", "addHero");
      formData.append("heroSlug", "aurora");

      mockTeamRepo.addHeroToTeam.mockResolvedValue({
        data: null,
        error: new Error("Hero already in team"),
      });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Hero already in team");
    });
  });

  describe("action - removeHero", () => {
    it("should remove hero from team successfully", async () => {
      const formData = new FormData();
      formData.append("action", "removeHero");
      formData.append("heroSlug", "astaroth");

      mockTeamRepo.removeHeroFromTeam.mockResolvedValue({
        data: true,
        error: null,
      });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Hero removed from team");
      expect(mockTeamRepo.removeHeroFromTeam).toHaveBeenCalledWith(
        mockTeamId,
        "user1",
        "astaroth"
      );
    });

    it("should return error when hero slug is missing", async () => {
      const formData = new FormData();
      formData.append("action", "removeHero");

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Hero slug is required");
    });

    it("should return error when removing hero fails", async () => {
      const formData = new FormData();
      formData.append("action", "removeHero");
      formData.append("heroSlug", "astaroth");

      mockTeamRepo.removeHeroFromTeam.mockResolvedValue({
        data: null,
        error: new Error("Hero not found in team"),
      });

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Hero not found in team");
    });
  });

  describe("action - invalid action", () => {
    it("should return error for invalid action", async () => {
      const formData = new FormData();
      formData.append("action", "invalidAction");

      const actionRequest = new Request(
        `http://localhost:3000/player/teams/${mockTeamId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: { teamId: mockTeamId },
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Invalid action");
    });
  });
});
