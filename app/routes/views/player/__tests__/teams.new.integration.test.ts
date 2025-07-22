// ABOUTME: Integration tests for team creation page covering team building and hero collection loading
// ABOUTME: Tests authentication flows and team creation with hero assignment
import { describe, it, expect, beforeEach, vi } from "vitest";
import { loader, action } from "../teams/new";
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

describe("Player Teams New Integration", () => {
  let mockRequest: Request;
  let mockTeamRepo: any;
  let mockPlayerHeroRepo: any;

  beforeEach(() => {
    mockRequest = new Request("http://localhost:3000/player/teams/new");

    mockTeamRepo = {
      createTeam: vi.fn(),
      addHeroToTeam: vi.fn(),
      deleteTeam: vi.fn(),
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
    it("should load user hero collection for team building", async () => {
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

      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: mockUserHeroes,
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.userHeroes).toHaveLength(2);
      expect(result.userHeroes[0].hero_slug).toBe("astaroth");
      expect(result.userHeroes[1].hero_slug).toBe("aurora");
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
          params: {},
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });

    it("should throw error when hero collection fails to load", async () => {
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(
        loader({
          request: mockRequest,
          params: {},
          context: { VALUE_FROM_NETLIFY: "test" },
        })
      ).rejects.toThrow(Response);
    });

    it("should return empty hero collection when user has no heroes", async () => {
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.userHeroes).toHaveLength(0);
    });
  });

  describe("action - createTeam", () => {
    it("should create team with heroes successfully", async () => {
      const formData = new FormData();
      formData.append("action", "createTeam");
      formData.append("name", "Arena Team");
      formData.append("description", "My main arena team");
      formData.append("heroSlugs", "astaroth");
      formData.append("heroSlugs", "aurora");
      formData.append("heroSlugs", "celeste");

      const mockCreatedTeam = {
        id: "new-team-id",
        user_id: "user1",
        name: "Arena Team",
        description: "My main arena team",
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      };

      mockTeamRepo.createTeam.mockResolvedValue({
        data: mockCreatedTeam,
        error: null,
      });
      mockTeamRepo.addHeroToTeam.mockResolvedValue({ data: {}, error: null });

      const actionRequest = new Request(
        "http://localhost:3000/player/teams/new",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.teamId).toBe("new-team-id");
      expect(result.message).toBe('Team "Arena Team" created successfully');
      expect(result.redirect).toBe("/player/teams");

      expect(mockTeamRepo.createTeam).toHaveBeenCalledWith("user1", {
        name: "Arena Team",
        description: "My main arena team",
      });

      expect(mockTeamRepo.addHeroToTeam).toHaveBeenCalledTimes(3);
      expect(mockTeamRepo.addHeroToTeam).toHaveBeenNthCalledWith(
        1,
        "new-team-id",
        "user1",
        { hero_slug: "astaroth" }
      );
      expect(mockTeamRepo.addHeroToTeam).toHaveBeenNthCalledWith(
        2,
        "new-team-id",
        "user1",
        { hero_slug: "aurora" }
      );
      expect(mockTeamRepo.addHeroToTeam).toHaveBeenNthCalledWith(
        3,
        "new-team-id",
        "user1",
        { hero_slug: "celeste" }
      );
    });

    it("should create team without heroes successfully", async () => {
      const formData = new FormData();
      formData.append("action", "createTeam");
      formData.append("name", "Empty Team");
      formData.append("description", "Team to fill later");

      const mockCreatedTeam = {
        id: "new-team-id",
        user_id: "user1",
        name: "Empty Team",
        description: "Team to fill later",
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      };

      mockTeamRepo.createTeam.mockResolvedValue({
        data: mockCreatedTeam,
        error: null,
      });

      const actionRequest = new Request(
        "http://localhost:3000/player/teams/new",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(mockTeamRepo.createTeam).toHaveBeenCalledWith("user1", {
        name: "Empty Team",
        description: "Team to fill later",
      });
      expect(mockTeamRepo.addHeroToTeam).not.toHaveBeenCalled();
    });

    it("should create team with auto-generated name when name is empty", async () => {
      const formData = new FormData();
      formData.append("action", "createTeam");
      formData.append("name", "");
      formData.append("description", "");

      const mockCreatedTeam = {
        id: "new-team-id",
        user_id: "user1",
        name: "Team 1",
        description: null,
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      };

      mockTeamRepo.createTeam.mockResolvedValue({
        data: mockCreatedTeam,
        error: null,
      });

      const actionRequest = new Request(
        "http://localhost:3000/player/teams/new",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.success).toBe(true);
      expect(mockTeamRepo.createTeam).toHaveBeenCalledWith("user1", {
        name: "",
        description: undefined,
      });
    });

    it("should return error when team creation fails", async () => {
      const formData = new FormData();
      formData.append("action", "createTeam");
      formData.append("name", "Test Team");

      mockTeamRepo.createTeam.mockResolvedValue({
        data: null,
        error: new Error("Team creation failed"),
      });

      const actionRequest = new Request(
        "http://localhost:3000/player/teams/new",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Team creation failed");
    });

    it("should clean up team and return error when adding hero fails", async () => {
      const formData = new FormData();
      formData.append("action", "createTeam");
      formData.append("name", "Test Team");
      formData.append("heroSlugs", "astaroth");
      formData.append("heroSlugs", "invalid-hero");

      const mockCreatedTeam = {
        id: "new-team-id",
        user_id: "user1",
        name: "Test Team",
        description: null,
        created_at: "2024-01-17T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
      };

      mockTeamRepo.createTeam.mockResolvedValue({
        data: mockCreatedTeam,
        error: null,
      });
      mockTeamRepo.addHeroToTeam
        .mockResolvedValueOnce({ data: {}, error: null }) // First hero succeeds
        .mockResolvedValueOnce({
          data: null,
          error: new Error("Hero not found"),
        }); // Second hero fails
      mockTeamRepo.deleteTeam.mockResolvedValue({ data: true, error: null });

      const actionRequest = new Request(
        "http://localhost:3000/player/teams/new",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe(
        "Failed to add hero invalid-hero: Hero not found"
      );
      expect(mockTeamRepo.deleteTeam).toHaveBeenCalledWith(
        "new-team-id",
        "user1"
      );
    });
  });

  describe("action - invalid action", () => {
    it("should return error for invalid action", async () => {
      const formData = new FormData();
      formData.append("action", "invalidAction");

      const actionRequest = new Request(
        "http://localhost:3000/player/teams/new",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await action({
        request: actionRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.error).toBe("Invalid action");
    });
  });
});
