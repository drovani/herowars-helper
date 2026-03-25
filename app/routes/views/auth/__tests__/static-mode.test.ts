// ABOUTME: Tests for auth route loaders and actions in static mode.
// ABOUTME: Verifies that login, sign-up, and forgot-password redirect/reject in static mode.

import { describe, it, expect, vi, beforeEach } from "vitest";

import { loader as loginLoader, action as loginAction } from "../login";
import { loader as signUpLoader, action as signUpAction } from "../sign-up";
import {
  loader as forgotPasswordLoader,
  action as forgotPasswordAction,
} from "../forgot-password";

vi.mock("~/lib/static-mode", () => ({
  isStaticMode: vi.fn(() => true),
}));

// Mock createClient to prevent real Supabase calls in non-static branches (unused here)
vi.mock("~/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

function makeArgs(url: string) {
  return {
    request: new Request(url),
    params: {},
    context: {},
    unstable_pattern: "",
  } as any;
}

function makePostArgs(url: string) {
  return {
    request: new Request(url, { method: "POST" }),
    params: {},
    context: {},
    unstable_pattern: "",
  } as any;
}

describe("auth routes in static mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login loader", () => {
    it("returns a redirect to / when in static mode", async () => {
      const response = await loginLoader(
        makeArgs("http://localhost:3000/login"),
      );
      expect(response).toBeInstanceOf(Response);
      const redirect = response as Response;
      expect(redirect.status).toBe(302);
      expect(redirect.headers.get("Location")).toBe("/");
    });
  });

  describe("login action", () => {
    it("returns 403 Response with error when in static mode", async () => {
      const response = await loginAction(
        makePostArgs("http://localhost:3000/login"),
      );
      expect(response).toBeInstanceOf(Response);
      const res = response as Response;
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Not available in read-only mode");
    });
  });

  describe("sign-up loader", () => {
    it("returns a redirect to / when in static mode", async () => {
      const response = await signUpLoader(
        makeArgs("http://localhost:3000/sign-up"),
      );
      expect(response).toBeInstanceOf(Response);
      const redirect = response as Response;
      expect(redirect.status).toBe(302);
      expect(redirect.headers.get("Location")).toBe("/");
    });
  });

  describe("sign-up action", () => {
    it("returns 403 Response with error when in static mode", async () => {
      const response = await signUpAction(
        makePostArgs("http://localhost:3000/sign-up"),
      );
      expect(response).toBeInstanceOf(Response);
      const res = response as Response;
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Not available in read-only mode");
    });
  });

  describe("forgot-password loader", () => {
    it("returns a redirect to / when in static mode", async () => {
      const response = await forgotPasswordLoader(
        makeArgs("http://localhost:3000/forgot-password"),
      );
      expect(response).toBeInstanceOf(Response);
      const redirect = response as Response;
      expect(redirect.status).toBe(302);
      expect(redirect.headers.get("Location")).toBe("/");
    });
  });

  describe("forgot-password action", () => {
    it("returns 403 Response with error when in static mode", async () => {
      const response = await forgotPasswordAction(
        makePostArgs("http://localhost:3000/forgot-password"),
      );
      expect(response).toBeInstanceOf(Response);
      const res = response as Response;
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Not available in read-only mode");
    });
  });
});
