import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter, Outlet } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import ProtectedEditorLayout from "../ProtectedEditorLayout";

// Mock the AuthContext
vi.mock("~/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock the Outlet component
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Outlet: vi.fn(() => <div>Protected Content</div>),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockOutlet = vi.mocked(Outlet);

// Helper component to wrap with router
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("ProtectedEditorLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOutlet.mockReturnValue(<div>Protected Content</div>);
  });

  describe("when user has editor role", () => {
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
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("renders the outlet content", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Protected Content")).toBeInTheDocument();
    });

    it("does not show unauthorized access message", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.queryByText("Insufficient Permissions")).not.toBeInTheDocument();
      expect(result.queryByText("Authentication Required")).not.toBeInTheDocument();
    });
  });

  describe("when user has admin role", () => {
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
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("renders the outlet content", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  describe("when user has both admin and editor roles", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "super-1",
          email: "super@example.com",
          name: "Super User",
          avatar: "/avatar.png",
          roles: ["user", "admin", "editor"],
          fallback: "SU",
        },
        isAuthenticated: true,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("renders the outlet content", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  describe("when user only has user role", () => {
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
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("shows unauthorized access message", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(result.getByText("You need admin or editor role to access this page.")).toBeInTheDocument();
    });

    it("does not render the outlet content", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows user's current role information", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Current user: Test User")).toBeInTheDocument();
      expect(result.getByText("Your roles: user")).toBeInTheDocument();
      expect(result.getByText("Required role: admin or editor")).toBeInTheDocument();
    });
  });

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });
    });

    it("shows authentication required message", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Authentication Required")).toBeInTheDocument();
      expect(result.getByText("You must be logged in to access this page.")).toBeInTheDocument();
    });

    it("does not render the outlet content", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows sign in button", () => {
      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles user with empty roles array", () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-2",
          email: "user2@example.com",
          name: "No Roles User",
          avatar: "/avatar.png",
          roles: [],
          fallback: "NR",
        },
        isAuthenticated: true,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(result.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("handles user with unrecognized roles", () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-3",
          email: "user3@example.com",
          name: "Unknown Role User",
          avatar: "/avatar.png",
          roles: ["viewer", "guest"],
          fallback: "UR",
        },
        isAuthenticated: true,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const result = render(
        <Wrapper>
          <ProtectedEditorLayout />
        </Wrapper>
      );

      expect(result.getByText("Insufficient Permissions")).toBeInTheDocument();
      expect(result.getByText("Your roles: viewer, guest")).toBeInTheDocument();
      expect(result.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });
});