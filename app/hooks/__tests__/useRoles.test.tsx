import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "~/contexts/AuthContext";
import { useRoles } from "../useRoles";

// Mock the AuthContext
vi.mock("~/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("useRoles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("hasRole returns false for any role", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("admin")).toBe(false);
      expect(result.current.hasRole("editor")).toBe(false);
      expect(result.current.hasRole(["admin", "editor"])).toBe(false);
    });

    it("canEdit returns false", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.canEdit()).toBe(false);
    });

    it("isAdmin returns false", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isAdmin()).toBe(false);
    });

    it("isUser returns false", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isUser()).toBe(false);
    });
  });

  describe("when user is authenticated with user role", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-1",
          email: "user@example.com",
          name: "Test User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "TU",
        },
        isAuthenticated: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("hasRole returns true for user role", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("user")).toBe(true);
      expect(result.current.hasRole(["user", "editor"])).toBe(true);
    });

    it("hasRole returns false for admin/editor roles", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("admin")).toBe(false);
      expect(result.current.hasRole("editor")).toBe(false);
      expect(result.current.hasRole(["admin", "editor"])).toBe(false);
    });

    it("canEdit returns false", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.canEdit()).toBe(false);
    });

    it("isAdmin returns false", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isAdmin()).toBe(false);
    });

    it("isUser returns true", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isUser()).toBe(true);
    });
  });

  describe("when user is authenticated with editor role", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "editor-1",
          email: "editor@example.com",
          name: "Test Editor",
          avatar: "/avatar.png",
          roles: ["user", "editor"],
          fallback: "TE",
        },
        isAuthenticated: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("hasRole returns true for user and editor roles", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("user")).toBe(true);
      expect(result.current.hasRole("editor")).toBe(true);
      expect(result.current.hasRole(["user", "editor"])).toBe(true);
    });

    it("hasRole returns false for admin role", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("admin")).toBe(false);
    });

    it("canEdit returns true", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.canEdit()).toBe(true);
    });

    it("isAdmin returns false", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isAdmin()).toBe(false);
    });

    it("isUser returns true", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isUser()).toBe(true);
    });
  });

  describe("when user is authenticated with admin role", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "admin-1",
          email: "admin@example.com",
          name: "Test Admin",
          avatar: "/avatar.png",
          roles: ["user", "admin"],
          fallback: "TA",
        },
        isAuthenticated: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("hasRole returns true for user and admin roles", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("user")).toBe(true);
      expect(result.current.hasRole("admin")).toBe(true);
      expect(result.current.hasRole(["admin", "editor"])).toBe(true);
    });

    it("canEdit returns true", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.canEdit()).toBe(true);
    });

    it("isAdmin returns true", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isAdmin()).toBe(true);
    });

    it("isUser returns true", () => {
      const { result } = renderHook(() => useRoles());
      
      expect(result.current.isUser()).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles empty roles array", () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-2",
          email: "user2@example.com",
          name: "User Without Roles",
          avatar: "/avatar.png",
          roles: [],
          fallback: "UW",
        },
        isAuthenticated: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("user")).toBe(false);
      expect(result.current.canEdit()).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isUser()).toBe(true);
    });

    it("handles single role as string parameter", () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-3",
          email: "user3@example.com",
          name: "User",
          avatar: "/avatar.png",
          roles: ["editor"],
          fallback: "U",
        },
        isAuthenticated: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole("editor")).toBe(true);
      expect(result.current.hasRole("admin")).toBe(false);
    });

    it("handles array of roles parameter", () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-4",
          email: "user4@example.com",
          name: "User",
          avatar: "/avatar.png",
          roles: ["editor"],
          fallback: "U",
        },
        isAuthenticated: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const { result } = renderHook(() => useRoles());
      
      expect(result.current.hasRole(["admin", "editor"])).toBe(true);
      expect(result.current.hasRole(["admin", "moderator"])).toBe(false);
    });
  });
});