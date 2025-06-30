import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { useRoles } from "~/hooks/useRoles";
import { UnauthorizedAccess } from "../UnauthorizedAccess";

// Mock the useRoles hook
vi.mock("~/hooks/useRoles", () => ({
  useRoles: vi.fn(),
}));

const mockUseRoles = vi.mocked(useRoles);

// Helper component to wrap with router
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("UnauthorizedAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => false),
        user: null,
        isAuthenticated: false,
      });
    });

    it("shows authentication required message with default text", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
      expect(screen.getByText("You must be logged in to edit this content.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    });

    it("shows authentication required message with custom action", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess action="access this feature" />
        </Wrapper>
      );

      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
      expect(screen.getByText("You must be logged in to access this feature.")).toBeInTheDocument();
    });

    it("has correct sign in link", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      const signInLink = screen.getByRole("link", { name: "Sign In" });
      expect(signInLink).toHaveAttribute("href", "/login");
    });
  });

  describe("when user is authenticated but lacks permissions", () => {
    beforeEach(() => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
        user: {
          id: "user-1",
          email: "user@example.com",
          name: "Test User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "TU",
        },
        isAuthenticated: true,
      });
    });

    it("shows insufficient permissions message with default text", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(screen.getByText("You need editor role to edit this content.")).toBeInTheDocument();
    });

    it("shows insufficient permissions message with custom role and action", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess requiredRole="admin" action="manage users" />
        </Wrapper>
      );

      expect(screen.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(screen.getByText("You need admin role to manage users.")).toBeInTheDocument();
    });

    it("displays current user information", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByText("Current user: Test User")).toBeInTheDocument();
      expect(screen.getByText("Your roles: user")).toBeInTheDocument();
      expect(screen.getByText("Required role: editor")).toBeInTheDocument();
    });

    it("displays multiple roles correctly", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
        user: {
          id: "user-2",
          email: "user2@example.com",
          name: "Multi Role User",
          avatar: "/avatar.png",
          roles: ["user", "viewer"],
          fallback: "MR",
        },
        isAuthenticated: true,
      });

      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByText("Your roles: user, viewer")).toBeInTheDocument();
    });

    it("has correct navigation links", () => {
      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      const heroesLink = screen.getByRole("link", { name: "Back to Heroes" });
      const equipmentLink = screen.getByRole("link", { name: "Back to Equipment" });

      expect(heroesLink).toHaveAttribute("href", "/heroes");
      expect(equipmentLink).toHaveAttribute("href", "/equipment");
    });
  });

  describe("user information edge cases", () => {
    it("handles user with empty roles array", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
        user: {
          id: "user-3",
          email: "user3@example.com",
          name: "No Roles User",
          avatar: "/avatar.png",
          roles: [],
          fallback: "NR",
        },
        isAuthenticated: true,
      });

      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByText("Your roles:")).toBeInTheDocument();
    });

    it("displays custom required role", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
        user: {
          id: "user-4",
          email: "user4@example.com",
          name: "Test User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "TU",
        },
        isAuthenticated: true,
      });

      render(
        <Wrapper>
          <UnauthorizedAccess requiredRole="moderator" />
        </Wrapper>
      );

      expect(screen.getByText("Required role: moderator")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper heading structure", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => false),
        user: null,
        isAuthenticated: false,
      });

      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByRole("heading", { name: "Authentication Required" })).toBeInTheDocument();
    });

    it("has accessible buttons and links", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn(() => false),
        canEdit: vi.fn(() => false),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
        user: {
          id: "user-1",
          email: "user@example.com",
          name: "Test User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "TU",
        },
        isAuthenticated: true,
      });

      render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(screen.getByRole("link", { name: "Back to Heroes" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to Equipment" })).toBeInTheDocument();
    });
  });
});