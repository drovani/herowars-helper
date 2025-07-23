// ABOUTME: Unit tests for PlayerTeamRepository with mocked Supabase client
// ABOUTME: Tests CRUD operations, team validation, hero management, and auto-naming functionality

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import log from "loglevel";
import { PlayerTeamRepository } from "../PlayerTeamRepository";

// Mock the createClient function
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "test-user" } },
      error: null,
    }),
  },
};

vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    supabase: mockSupabaseClient,
    headers: undefined,
  })),
}));

describe("PlayerTeamRepository", () => {
  let repository: PlayerTeamRepository;
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

    repository = new PlayerTeamRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("findByUserId", () => {
    it("should fetch user teams with heroes ordered by rank", async () => {
      const mockTeamData = [
        {
          id: "team-1",
          user_id: "user-1",
          name: "Team 1",
          description: "Test team",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
          player_team_hero: [
            {
              id: "th-1",
              team_id: "team-1",
              hero_slug: "astaroth",
              created_at: "2023-01-01T00:00:00Z",
              hero: {
                slug: "astaroth",
                name: "Astaroth",
                order_rank: 100,
                class: "tank",
                faction: "chaos",
                main_stat: "strength",
                attack_type: ["physical"],
                stone_source: ["campaign"],
                updated_on: null,
              },
            },
            {
              id: "th-2",
              team_id: "team-1",
              hero_slug: "galahad",
              created_at: "2023-01-01T00:00:00Z",
              hero: {
                slug: "galahad",
                name: "Galahad",
                order_rank: 90,
                class: "tank",
                faction: "order",
                main_stat: "strength",
                attack_type: ["physical"],
                stone_source: ["campaign"],
                updated_on: null,
              },
            },
          ],
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: mockTeamData,
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.findByUserId("user-1");

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe("Team 1");
      expect(result.data![0].heroes).toHaveLength(2);
      // Verify heroes are sorted by order_rank descending
      expect(result.data![0].heroes[0].hero.order_rank).toBe(100);
      expect(result.data![0].heroes[1].hero.order_rank).toBe(90);
    });

    it("should handle database errors", async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              data: null,
              error: { message: "Database error", code: "DB001" },
            }),
          }),
        }),
      });

      const result = await repository.findByUserId("user-1");

      expect(result.error).not.toBeNull();
      expect(result.error!.message).toBe("Database error");
      expect(result.data).toBeNull();
    });
  });

  describe("createTeam", () => {
    it("should create team with provided name", async () => {
      const mockTeam = {
        id: "team-1",
        user_id: "user-1",
        name: "My Custom Team",
        description: "Custom description",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue({
              data: mockTeam,
              error: null,
            }),
          }),
        }),
      });

      const result = await repository.createTeam("user-1", {
        name: "My Custom Team",
        description: "Custom description",
      });

      expect(result.error).toBeNull();
      expect(result.data!.name).toBe("My Custom Team");
    });

    it("should auto-generate team name when empty", async () => {
      // Mock existing teams query for auto-naming
      const mockExistingTeams = [
        { name: "Team 1" },
        { name: "Team 3" },
        { name: "Custom Team" },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              like: vi.fn().mockReturnValue({
                data: mockExistingTeams,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue({
                data: {
                  id: "team-1",
                  user_id: "user-1",
                  name: "Team 4",
                  description: null,
                  created_at: "2023-01-01T00:00:00Z",
                  updated_at: "2023-01-01T00:00:00Z",
                },
                error: null,
              }),
            }),
          }),
        });

      const result = await repository.createTeam("user-1", { name: "" });

      expect(result.error).toBeNull();
      expect(result.data!.name).toBe("Team 4");
    });
  });

  describe("addHeroToTeam", () => {
    it("should add hero to team successfully", async () => {
      // Mock team verification
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: {
                    id: "team-1",
                    player_team_hero: [{ id: "th-1" }, { id: "th-2" }],
                  },
                  error: null,
                }),
              }),
            }),
          }),
        })
        // Mock duplicate check
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: null,
                  error: { code: "PGRST116" }, // Not found
                }),
              }),
            }),
          }),
        })
        // Mock insert
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue({
                data: {
                  id: "th-3",
                  team_id: "team-1",
                  hero_slug: "astaroth",
                  created_at: "2023-01-01T00:00:00Z",
                },
                error: null,
              }),
            }),
          }),
        });

      const result = await repository.addHeroToTeam("team-1", "user-1", {
        hero_slug: "astaroth",
      });

      expect(result.error).toBeNull();
      expect(result.data!.hero_slug).toBe("astaroth");
    });

    it("should reject adding 6th hero to team", async () => {
      // Mock team with 5 heroes
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue({
                data: {
                  id: "team-1",
                  player_team_hero: [
                    { id: "th-1" },
                    { id: "th-2" },
                    { id: "th-3" },
                    { id: "th-4" },
                    { id: "th-5" },
                  ],
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await repository.addHeroToTeam("team-1", "user-1", {
        hero_slug: "astaroth",
      });

      expect(result.error).not.toBeNull();
      expect(result.error!.message).toBe(
        "Team already has maximum of 5 heroes"
      );
      expect(result.data).toBeNull();
    });

    it("should reject adding duplicate hero", async () => {
      // Mock team verification
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: {
                    id: "team-1",
                    player_team_hero: [{ id: "th-1" }],
                  },
                  error: null,
                }),
              }),
            }),
          }),
        })
        // Mock duplicate check - hero exists
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { id: "th-existing" },
                  error: null,
                }),
              }),
            }),
          }),
        });

      const result = await repository.addHeroToTeam("team-1", "user-1", {
        hero_slug: "astaroth",
      });

      expect(result.error).not.toBeNull();
      expect(result.error!.message).toBe("Hero is already in this team");
      expect(result.data).toBeNull();
    });
  });

  describe("removeHeroFromTeam", () => {
    it("should remove hero from team successfully", async () => {
      // Mock team verification
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { id: "team-1" },
                  error: null,
                }),
              }),
            }),
          }),
        })
        // Mock delete
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          }),
        });

      const result = await repository.removeHeroFromTeam(
        "team-1",
        "user-1",
        "astaroth"
      );

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });
  });

  describe("deleteTeam", () => {
    it("should delete team successfully", async () => {
      // Mock team verification
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue({
                  data: { id: "team-1" },
                  error: null,
                }),
              }),
            }),
          }),
        })
        // Mock delete
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          }),
        });

      const result = await repository.deleteTeam("team-1", "user-1");

      expect(result.error).toBeNull();
      expect(result.data).toBe(true);
    });

    it("should reject deleting non-existent or unauthorized team", async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
      });

      const result = await repository.deleteTeam("team-1", "user-1");

      expect(result.error).not.toBeNull();
      expect(result.error!.message).toBe("Team not found or access denied");
      expect(result.data).toBeNull();
    });
  });
});
