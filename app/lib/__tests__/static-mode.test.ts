// ABOUTME: Tests for static mode detection utility.
// ABOUTME: Verifies correct behavior when Supabase env vars are present or absent.

import { afterEach, describe, expect, it, vi } from "vitest";

describe("isStaticMode", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("returns false when both SUPABASE_DATABASE_URL and SUPABASE_ANON_KEY are set", async () => {
    process.env.SUPABASE_DATABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key-value";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(false);
  });

  it("returns true when only SUPABASE_DATABASE_URL is set (SUPABASE_ANON_KEY missing)", async () => {
    process.env.SUPABASE_DATABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_ANON_KEY;
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns true when only SUPABASE_ANON_KEY is set (SUPABASE_DATABASE_URL missing)", async () => {
    delete process.env.SUPABASE_DATABASE_URL;
    process.env.SUPABASE_ANON_KEY = "anon-key-value";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns true when neither SUPABASE_DATABASE_URL nor SUPABASE_ANON_KEY is set", async () => {
    delete process.env.SUPABASE_DATABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns true when SUPABASE_DATABASE_URL is an empty string", async () => {
    process.env.SUPABASE_DATABASE_URL = "";
    process.env.SUPABASE_ANON_KEY = "anon-key-value";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns true when SUPABASE_ANON_KEY is an empty string", async () => {
    process.env.SUPABASE_DATABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(true);
  });

  it("returns false when both env vars are set to non-empty values", async () => {
    process.env.SUPABASE_DATABASE_URL = "postgresql://localhost:5432/db";
    process.env.SUPABASE_ANON_KEY = "some-anon-key";
    const { isStaticMode } = await import("../static-mode");
    expect(isStaticMode()).toBe(false);
  });
});
