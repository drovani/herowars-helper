// ABOUTME: Tests for AuthContext, covering static mode and normal authenticated state.
// ABOUTME: Verifies the context provides correct values in each operating mode.

import React from "react";

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock static-mode detection so we can control it per-test
vi.mock("~/lib/static-mode", () => ({
  isStaticMode: vi.fn(() => false),
}));

// Mock the Supabase client to avoid real network calls
vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
    headers: new Headers(),
  })),
}));

import { isStaticMode } from "~/lib/static-mode";
import { AuthProvider, useAuth } from "./AuthContext";

const mockIsStaticMode = vi.mocked(isStaticMode);

// Helper component to read auth context values
function AuthContextReader({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useAuth>) => void;
}) {
  const auth = useAuth();
  onValue(auth);
  return null;
}

describe("AuthProvider in static mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStaticMode.mockReturnValue(true);
  });

  it("provides null user", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    expect(capturedAuth).not.toBeNull();
    expect(capturedAuth!.user).toBeNull();
  });

  it("provides isAuthenticated as false", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    expect(capturedAuth!.isAuthenticated).toBe(false);
  });

  it("provides isLoading as false", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    expect(capturedAuth!.isLoading).toBe(false);
  });

  it("provides isStaticMode as true", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    expect(capturedAuth!.isStaticMode).toBe(true);
  });

  it("provides no-op signOut that resolves without error", async () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    await expect(capturedAuth!.signOut()).resolves.toBeUndefined();
  });
});

describe("AuthProvider in live mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsStaticMode.mockReturnValue(false);
  });

  it("provides isStaticMode as false", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    expect(capturedAuth!.isStaticMode).toBe(false);
  });

  it("starts in loading state", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    // Initial state is loading (resolves async)
    expect(capturedAuth!.isLoading).toBe(true);
  });

  it("provides null user when no session", () => {
    const mockRequest = new Request("http://localhost/");
    let capturedAuth: ReturnType<typeof useAuth> | null = null;

    render(
      <AuthProvider request={mockRequest}>
        <AuthContextReader onValue={(v) => (capturedAuth = v)} />
      </AuthProvider>,
    );

    expect(capturedAuth!.user).toBeNull();
  });
});

describe("useAuth outside AuthProvider", () => {
  it("throws when used outside of an AuthProvider", () => {
    function ComponentWithoutProvider() {
      useAuth();
      return null;
    }

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});
