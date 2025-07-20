import { render } from "@testing-library/react";
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
        isLoading: false,
      });
    });

    it("shows authentication required message with default text", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByText("Authentication Required")).toBeInTheDocument();
      expect(result.getByText("You must be logged in to edit this content.")).toBeInTheDocument();
      expect(result.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    });

    it("shows authentication required message with custom action", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess action="access this feature" />
        </Wrapper>
      );

      expect(result.getByText("Authentication Required")).toBeInTheDocument();
      expect(result.getByText("You must be logged in to access this feature.")).toBeInTheDocument();
    });

    it("has correct sign in link", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      const signInLink = result.getByRole("link", { name: "Sign In" });
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
        isLoading: false,
      });
    });

    it("shows insufficient permissions message with default text", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(result.getByText("You need editor role to edit this content.")).toBeInTheDocument();
    });

    it("shows insufficient permissions message with custom role and action", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess requiredRole="admin" action="manage users" />
        </Wrapper>
      );

      expect(result.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(result.getByText("You need admin role to manage users.")).toBeInTheDocument();
    });

    it("displays current user information", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByText("Current user: Test User")).toBeInTheDocument();
      expect(result.getByText("Your roles: user")).toBeInTheDocument();
      expect(result.getByText("Required role: editor")).toBeInTheDocument();
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
        isLoading: false,
      });

      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByText("Your roles: user, viewer")).toBeInTheDocument();
    });

    it("has correct navigation links", () => {
      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      const heroesLink = result.getByRole("link", { name: "Back to Heroes" });
      const equipmentLink = result.getByRole("link", { name: "Back to Equipment" });

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
        isLoading: false,
      });

      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByText("Your roles:")).toBeInTheDocument();
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
        isLoading: false,
      });

      const result = render(
        <Wrapper>
          <UnauthorizedAccess requiredRole="moderator" />
        </Wrapper>
      );

      expect(result.getByText("Required role: moderator")).toBeInTheDocument();
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
        isLoading: false,
      });

      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByRole("heading", { name: "Authentication Required" })).toBeInTheDocument();
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
        isLoading: false,
      });

      const result = render(
        <Wrapper>
          <UnauthorizedAccess />
        </Wrapper>
      );

      expect(result.getByRole("link", { name: "Back to Heroes" })).toBeInTheDocument();
      expect(result.getByRole("link", { name: "Back to Equipment" })).toBeInTheDocument();
    });
  });
});