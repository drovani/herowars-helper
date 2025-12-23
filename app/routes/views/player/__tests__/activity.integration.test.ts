// ABOUTME: Integration tests for player activity page covering event loading
// ABOUTME: Tests authentication flows and event repository integration
import { describe, it, expect, beforeEach, vi } from "vitest";
import { loader } from "../activity";
import { PlayerEventRepository } from "~/repositories/PlayerEventRepository";
import { createMockSupabaseClient } from "~//__tests__/mocks/supabase";
import { getAuthenticatedUser } from "~/lib/auth/utils";

// Mock the repository
vi.mock("~/repositories/PlayerEventRepository");

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
}));

describe("Player Activity Integration", () => {
  let mockRequest: Request;
  let mockPlayerEventRepo: any;

  beforeEach(() => {
    mockRequest = new Request("http://localhost:3000/player/activity");

    mockPlayerEventRepo = {
      findRecentEvents: vi.fn(),
      findEventsByUser: vi.fn(),
    };

    vi.mocked(PlayerEventRepository).mockImplementation(
      function() { return mockPlayerEventRepo; }
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
  });

  describe("loader", () => {
    it("should load user events", async () => {
      const mockEvents = [
        {
          id: "1",
          user_id: "user1",
          event_type: "CLAIM_HERO",
          hero_slug: "astaroth",
          event_data: { initial_stars: 1, initial_equipment_level: 1 },
          created_at: "2024-01-15T10:00:00Z",
          created_by: "user1",
        },
        {
          id: "2",
          user_id: "user1",
          event_type: "UPDATE_HERO_STARS",
          hero_slug: "astaroth",
          event_data: { previous_stars: 1, new_stars: 5 },
          created_at: "2024-01-15T11:00:00Z",
          created_by: "user1",
        },
      ];

      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: mockEvents,
        error: null,
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(2);
      expect(result.events[0].event_type).toBe("CLAIM_HERO");
      expect(result.events[1].event_type).toBe("UPDATE_HERO_STARS");
      expect(mockPlayerEventRepo.findRecentEvents).toHaveBeenCalledWith(
        "user1",
        10,
        0
      );
      expect(mockPlayerEventRepo.findEventsByUser).toHaveBeenCalledWith(
        "user1"
      );
    });

    it("should handle empty events for unauthenticated user", async () => {
      // Mock getAuthenticatedUser to return no user for this test
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: null,
        error: null,
      });

      const mockRequest = new Request("http://localhost:3000/player/activity");

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(0);
      expect(mockPlayerEventRepo.findRecentEvents).not.toHaveBeenCalled();
    });

    it("should handle event loading errors gracefully", async () => {
      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: null,
        error: { message: "Events error" },
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(0); // Should default to empty array
    });

    it("should handle null events data", async () => {
      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: null,
        error: null,
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(0);
    });
  });

  describe("event filtering", () => {
    it("should load recent events with correct pagination", async () => {
      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: [],
        error: null,
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: [],
        error: null,
      });

      await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(mockPlayerEventRepo.findRecentEvents).toHaveBeenCalledWith(
        "user1",
        10,
        0
      );
      expect(mockPlayerEventRepo.findEventsByUser).toHaveBeenCalledWith(
        "user1"
      );
    });

    it("should handle different user IDs", async () => {
      // Mock getAuthenticatedUser to return user2 for this test
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: {
          id: "user2",
          email: "test2@example.com",
          app_metadata: { roles: ["user"] },
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const mockRequest = new Request("http://localhost:3000/player/activity");
      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: [],
        error: null,
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: [],
        error: null,
      });

      await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(mockPlayerEventRepo.findRecentEvents).toHaveBeenCalledWith(
        "user2",
        10,
        0
      );
      expect(mockPlayerEventRepo.findEventsByUser).toHaveBeenCalledWith(
        "user2"
      );
    });
  });

  describe("event types", () => {
    it("should load all event types", async () => {
      const mockEvents = [
        {
          id: "1",
          user_id: "user1",
          event_type: "CLAIM_HERO",
          hero_slug: "astaroth",
          event_data: { initial_stars: 1, initial_equipment_level: 1 },
          created_at: "2024-01-15T10:00:00Z",
          created_by: "user1",
        },
        {
          id: "2",
          user_id: "user1",
          event_type: "UPDATE_HERO_STARS",
          hero_slug: "astaroth",
          event_data: { previous_stars: 1, new_stars: 5 },
          created_at: "2024-01-15T11:00:00Z",
          created_by: "user1",
        },
        {
          id: "3",
          user_id: "user1",
          event_type: "UPDATE_HERO_EQUIPMENT",
          hero_slug: "astaroth",
          event_data: { previous_equipment_level: 1, new_equipment_level: 12 },
          created_at: "2024-01-15T12:00:00Z",
          created_by: "user1",
        },
        {
          id: "4",
          user_id: "user1",
          event_type: "UNCLAIM_HERO",
          hero_slug: "astaroth",
          event_data: { final_stars: 5, final_equipment_level: 12 },
          created_at: "2024-01-15T13:00:00Z",
          created_by: "user1",
        },
      ];

      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: mockEvents,
        error: null,
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(4);

      const eventTypes = result.events.map((e) => e.event_type);
      expect(eventTypes).toContain("CLAIM_HERO");
      expect(eventTypes).toContain("UPDATE_HERO_STARS");
      expect(eventTypes).toContain("UPDATE_HERO_EQUIPMENT");
      expect(eventTypes).toContain("UNCLAIM_HERO");
    });
  });

  describe("event data structure", () => {
    it("should preserve event data structure", async () => {
      const mockEvents = [
        {
          id: "1",
          user_id: "user1",
          event_type: "CLAIM_HERO",
          hero_slug: "astaroth",
          event_data: {
            initial_stars: 1,
            initial_equipment_level: 1,
            metadata: { source: "manual" },
          },
          created_at: "2024-01-15T10:00:00Z",
          created_by: "user1",
        },
      ];

      mockPlayerEventRepo.findRecentEvents.mockResolvedValue({
        data: mockEvents,
        error: null,
      });
      mockPlayerEventRepo.findEventsByUser.mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events[0].event_data).toEqual({
        initial_stars: 1,
        initial_equipment_level: 1,
        metadata: { source: "manual" },
      });
    });
  });

  describe("authentication handling", () => {
    it("should handle missing user (unauthenticated)", async () => {
      // Mock getAuthenticatedUser to return no user for this test
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: null,
        error: null,
      });

      const mockRequest = new Request("http://localhost:3000/player/activity");

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(0);
      expect(mockPlayerEventRepo.findRecentEvents).not.toHaveBeenCalled();
    });

    it("should handle authentication errors", async () => {
      // Mock getAuthenticatedUser to return an error for this test
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: null,
        error: "Authentication failed",
      });

      const mockRequest = new Request("http://localhost:3000/player/activity");

      const result = await loader({
        request: mockRequest,
        params: {},
        context: { VALUE_FROM_NETLIFY: "test" },
      });

      expect(result.events).toHaveLength(0);
      expect(mockPlayerEventRepo.findRecentEvents).not.toHaveBeenCalled();
    });
  });
});
