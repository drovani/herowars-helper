// ABOUTME: Tests for static mode detection utility.
// ABOUTME: Verifies correct behavior when Supabase env vars are present or absent.

import { afterEach, describe, expect, it, vi } from "vitest";

describe("isStaticMode", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("returns true when SUPABASE_DATABASE_URL is not set", async () => {
    delete process.env.SUPABASE_DATABASE_URL;
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns false when SUPABASE_DATABASE_URL is set to a valid URL", async () => {
    process.env.SUPABASE_DATABASE_URL = "https://example.supabase.co";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(false);
  });

  it("returns true when SUPABASE_DATABASE_URL is an empty string", async () => {
    process.env.SUPABASE_DATABASE_URL = "";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns false when SUPABASE_DATABASE_URL is set to any non-empty value", async () => {
    process.env.SUPABASE_DATABASE_URL = "postgresql://localhost:5432/db";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(false);
  });
});
