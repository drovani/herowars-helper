import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRoles } from "~/hooks/useRoles";
import { RequireEditor, RequireRole } from "../RequireRole";

// Mock the useRoles hook
vi.mock("~/hooks/useRoles", () => ({
  useRoles: vi.fn(),
}));

const mockUseRoles = vi.mocked(useRoles);

describe("RequireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when user has required role", () => {
    beforeEach(() => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn((roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          return requiredRoles.includes("editor");
        }),
        canEdit: vi.fn(() => true),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
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
      });
    });

    it("renders children when user has single required role", () => {
      const result = render(
        <RequireRole roles="editor">
          <div>Editor content</div>
        </RequireRole>
      );

      expect(result.getByText("Editor content")).toBeInTheDocument();
    });

    it("renders children when user has one of multiple required roles", () => {
      const result = render(
        <RequireRole roles={["admin", "editor"]}>
          <div>Admin or editor content</div>
        </RequireRole>
      );

      expect(result.getByText("Admin or editor content")).toBeInTheDocument();
    });

    it("renders children and not fallback", () => {
      const result = render(
        <RequireRole roles="editor" fallback={<div>No access</div>}>
          <div>Editor content</div>
        </RequireRole>
      );

      expect(result.getByText("Editor content")).toBeInTheDocument();
      expect(result.queryByText("No access")).not.toBeInTheDocument();
    });
  });

  describe("when user does not have required role", () => {
    beforeEach(() => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn((roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          return requiredRoles.includes("user");
        }),
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

    it("does not render children when user lacks required role", () => {
      const result = render(
        <RequireRole roles="admin">
          <div>Admin content</div>
        </RequireRole>
      );

      expect(result.queryByText("Admin content")).not.toBeInTheDocument();
    });

    it("renders fallback when provided", () => {
      const result = render(
        <RequireRole roles="admin" fallback={<div>No admin access</div>}>
          <div>Admin content</div>
        </RequireRole>
      );

      expect(result.queryByText("Admin content")).not.toBeInTheDocument();
      expect(result.getByText("No admin access")).toBeInTheDocument();
    });

    it("renders nothing when no fallback provided", () => {
      const result = render(
        <RequireRole roles="admin">
          <div>Admin content</div>
        </RequireRole>
      );

      expect(result.container).toBeEmptyDOMElement();
    });

    it("does not render children when user has none of multiple required roles", () => {
      const result = render(
        <RequireRole roles={["admin", "moderator"]}>
          <div>Admin or moderator content</div>
        </RequireRole>
      );

      expect(
        result.queryByText("Admin or moderator content")
      ).not.toBeInTheDocument();
    });
  });

  describe("complex role scenarios", () => {
    it("renders when user has at least one of multiple required roles", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn((roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          const userRoles = ["user", "editor"];
          return requiredRoles.some((role) => userRoles.includes(role));
        }),
        canEdit: vi.fn(() => true),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
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
      });

      const result = render(
        <RequireRole roles={["admin", "editor", "moderator"]}>
          <div>Privileged content</div>
        </RequireRole>
      );

      expect(result.getByText("Privileged content")).toBeInTheDocument();
    });
  });
});

describe("RequireEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when user can edit", () => {
    beforeEach(() => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn((roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          return requiredRoles.some((role) =>
            ["admin", "editor"].includes(role)
          );
        }),
        canEdit: vi.fn(() => true),
        isAdmin: vi.fn(() => false),
        isUser: vi.fn(() => true),
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
      });
    });

    it("renders children when user has editor role", () => {
      const result = render(
        <RequireEditor>
          <div>Edit button</div>
        </RequireEditor>
      );

      expect(result.getByText("Edit button")).toBeInTheDocument();
    });

    it("renders children when user has admin role", () => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn((roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          return requiredRoles.some((role) => ["admin"].includes(role));
        }),
        canEdit: vi.fn(() => true),
        isAdmin: vi.fn(() => true),
        isUser: vi.fn(() => true),
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
      });

      const result = render(
        <RequireEditor>
          <div>Edit button</div>
        </RequireEditor>
      );

      expect(result.getByText("Edit button")).toBeInTheDocument();
    });

    it("renders fallback when provided and user cannot edit", () => {
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
        <RequireEditor fallback={<div>Cannot edit</div>}>
          <div>Edit button</div>
        </RequireEditor>
      );

      expect(result.queryByText("Edit button")).not.toBeInTheDocument();
      expect(result.getByText("Cannot edit")).toBeInTheDocument();
    });
  });

  describe("when user cannot edit", () => {
    beforeEach(() => {
      mockUseRoles.mockReturnValue({
        hasRole: vi.fn((roles) => {
          const requiredRoles = Array.isArray(roles) ? roles : [roles];
          return requiredRoles.includes("user");
        }),
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

    it("does not render children when user cannot edit", () => {
      const result = render(
        <RequireEditor>
          <div>Edit button</div>
        </RequireEditor>
      );

      expect(result.queryByText("Edit button")).not.toBeInTheDocument();
    });

    it("renders nothing when no fallback provided", () => {
      const result = render(
        <RequireEditor>
          <div>Edit button</div>
        </RequireEditor>
      );

      expect(result.container).toBeEmptyDOMElement();
    });
  });
});
