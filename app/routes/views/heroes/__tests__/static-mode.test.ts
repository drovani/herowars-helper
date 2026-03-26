// ABOUTME: Tests for hero route actions in static mode.
// ABOUTME: Verifies that hero index and slug actions return 403 when in static mode.

import { describe, it, expect, vi, beforeEach } from "vitest";

import { action as heroIndexAction } from "../index";
import { action as heroSlugAction } from "../slug";

vi.mock("~/lib/static-mode", () => ({
  isStaticMode: vi.fn(() => true),
}));

// Mock createClient to prevent real Supabase calls
vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

function makePostArgs(url: string) {
  return {
    request: new Request(url, { method: "POST" }),
    params: {},
    context: {},
    unstable_pattern: "",
  } as any;
}

describe("hero routes in static mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("heroes index action", () => {
    it("returns 403 Response with error when in static mode", async () => {
      const response = await heroIndexAction(
        makePostArgs("http://localhost:3000/heroes"),
      );
      expect(response).toBeInstanceOf(Response);
      const res = response as Response;
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Not available in read-only mode");
    });
  });

  describe("heroes slug action", () => {
    it("returns 403 Response with error when in static mode", async () => {
      const response = await heroSlugAction(
        makePostArgs("http://localhost:3000/heroes/astaroth"),
      );
      expect(response).toBeInstanceOf(Response);
      const res = response as Response;
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Not available in read-only mode");
    });
  });
});
