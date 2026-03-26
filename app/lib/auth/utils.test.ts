// ABOUTME: Tests for authentication utility functions, including static mode behavior.
// ABOUTME: Verifies early returns and errors are thrown correctly in static mode.

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the static-mode module so we can control it per-test
vi.mock("~/lib/static-mode", () => ({
  isStaticMode: vi.fn(() => false),
}));

// Mock the supabase client
vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    },
    headers: new Headers(),
  })),
}));

// Mock the AuthContext (useAuth is only used in client-side hooks, not in server utilities)
vi.mock("~/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isStaticMode: false,
    signOut: vi.fn(),
    updateProfile: vi.fn(),
  })),
}));

import { isStaticMode } from "~/lib/static-mode";
import {
  getAuthenticatedUser,
  requireAuthenticatedUser,
  isAuthenticated,
} from "./utils";

const mockIsStaticMode = vi.mocked(isStaticMode);

describe("getAuthenticatedUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStaticMode.mockReturnValue(false);
  });

  it("returns null user and null error in static mode", async () => {
    mockIsStaticMode.mockReturnValue(true);
    const mockRequest = new Request("http://localhost/");

    const result = await getAuthenticatedUser(mockRequest);

    expect(result).toEqual({ user: null, error: null });
  });

  it("calls Supabase when not in static mode", async () => {
    mockIsStaticMode.mockReturnValue(false);
    const mockRequest = new Request("http://localhost/");

    const result = await getAuthenticatedUser(mockRequest);

    // Should return from the mocked Supabase client (null user, no error)
    expect(result.error).toBeNull();
    expect(result.user).toBeNull();
  });
});

describe("requireAuthenticatedUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStaticMode.mockReturnValue(false);
  });

  it("throws 403 Response in static mode", async () => {
    mockIsStaticMode.mockReturnValue(true);
    const mockRequest = new Request("http://localhost/");

    let thrown: unknown;
    try {
      await requireAuthenticatedUser(mockRequest);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    const response = thrown as Response;
    expect(response.status).toBe(403);
    expect(await response.text()).toBe("Not available in read-only mode");
  });

  it("throws 401 Response when user is not authenticated (non-static mode)", async () => {
    mockIsStaticMode.mockReturnValue(false);
    const mockRequest = new Request("http://localhost/");

    let thrown: unknown;
    try {
      await requireAuthenticatedUser(mockRequest);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    const response = thrown as Response;
    expect(response.status).toBe(401);
  });
});

describe("isAuthenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStaticMode.mockReturnValue(false);
  });

  it("returns false in static mode", async () => {
    mockIsStaticMode.mockReturnValue(true);
    const mockRequest = new Request("http://localhost/");

    const result = await isAuthenticated(mockRequest);

    expect(result).toBe(false);
  });

  it("returns false when no user in non-static mode", async () => {
    mockIsStaticMode.mockReturnValue(false);
    const mockRequest = new Request("http://localhost/");

    const result = await isAuthenticated(mockRequest);

    expect(result).toBe(false);
  });
});
