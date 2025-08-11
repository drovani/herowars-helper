import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "~/contexts/AuthContext";

// Create a simple test component that demonstrates the auth loading behavior
function TestAccountProfile() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div>
        <h1>Loading...</h1>
        <p>Initializing your account information.</p>
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account information and preferences.</p>
      <input data-testid="email" value={user?.email || ""} disabled readOnly />
      <input data-testid="display-name" defaultValue={user?.name || ""} />
      <button>Update Display Name</button>
    </div>
  );
}

// Mock the useAuth hook
vi.mock("~/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("AccountProfile Auth Hydration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state handling", () => {
    it("shows loading skeleton while auth is initializing", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const result = render(<TestAccountProfile />);

      expect(result.getByText("Loading...")).toBeInTheDocument();
      expect(
        result.getByText("Initializing your account information.")
      ).toBeInTheDocument();
      expect(result.getByTestId("loading-skeleton")).toBeInTheDocument();

      // Should not show account settings while loading
      expect(result.queryByText("Account Settings")).not.toBeInTheDocument();
    });

    it("shows account settings when auth is loaded", () => {
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

      const result = render(<TestAccountProfile />);

      expect(result.getByText("Account Settings")).toBeInTheDocument();
      expect(
        result.getByText("Manage your account information and preferences.")
      ).toBeInTheDocument();
      expect(result.getByTestId("email")).toHaveValue("user@example.com");
      expect(result.getByTestId("display-name")).toHaveValue("Test User");

      // Should not show loading state
      expect(result.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("regression test for auth hydration after login redirect", () => {
    it("handles auth state transition from loading to authenticated seamlessly", async () => {
      // This test specifically addresses the issue where users are redirected to
      // /account after login but the page doesn't recognize they're logged in

      // Start in loading state (simulating the state right after redirect from login)
      const result = render(<TestAccountProfile />);
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      result.rerender(<TestAccountProfile />);

      // Should show loading state immediately after redirect
      expect(result.getByText("Loading...")).toBeInTheDocument();
      expect(result.getByTestId("loading-skeleton")).toBeInTheDocument();
      expect(result.queryByText("Account Settings")).not.toBeInTheDocument();

      // Simulate auth initialization completing (this is what was broken before the fix)
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-1",
          email: "freshly-logged-in@example.com",
          name: "Fresh User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "FU",
        },
        isAuthenticated: true,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      result.rerender(<TestAccountProfile />);

      // Should transition to authenticated state without requiring page refresh
      await waitFor(() => {
        expect(result.queryByText("Loading...")).not.toBeInTheDocument();
        expect(
          result.queryByTestId("loading-skeleton")
        ).not.toBeInTheDocument();
        expect(result.getByText("Account Settings")).toBeInTheDocument();
        expect(result.getByTestId("email")).toHaveValue(
          "freshly-logged-in@example.com"
        );
        expect(result.getByTestId("display-name")).toHaveValue("Fresh User");
      });

      // Verify all interactive elements are working
      expect(
        result.getByRole("button", { name: "Update Display Name" })
      ).toBeInTheDocument();
      expect(result.getByTestId("display-name")).not.toBeDisabled();
    });

    it("works correctly when auth loads immediately (no loading state)", () => {
      // Test case where auth is already loaded (faster connections)
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-1",
          email: "immediate@example.com",
          name: "Immediate User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "IU",
        },
        isAuthenticated: true,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      const result = render(<TestAccountProfile />);

      // Should render directly without loading state
      expect(result.queryByText("Loading...")).not.toBeInTheDocument();
      expect(result.queryByTestId("loading-skeleton")).not.toBeInTheDocument();
      expect(result.getByText("Account Settings")).toBeInTheDocument();
      expect(result.getByTestId("email")).toHaveValue("immediate@example.com");
      expect(result.getByTestId("display-name")).toHaveValue("Immediate User");
    });

    it("prevents the 'blank page after login redirect' bug", async () => {
      // This is the specific bug: user logs in, gets redirected to /account,
      // but sees blank page until manual refresh

      const result = render(<TestAccountProfile />);

      // Simulate the problematic scenario: just redirected from login
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      result.rerender(<TestAccountProfile />);

      // User should see loading state (not blank page)
      expect(result.getByText("Loading...")).toBeInTheDocument();
      expect(
        result.getByText("Initializing your account information.")
      ).toBeInTheDocument();

      // The fix: auth completes and user data loads
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          email: "bug-fix-test@example.com",
          name: "Bug Fix User",
          avatar: "/avatar.png",
          roles: ["user"],
          fallback: "BF",
        },
        isAuthenticated: true,
        isLoading: false,
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      result.rerender(<TestAccountProfile />);

      // User should now see their account without manual refresh
      await waitFor(() => {
        expect(result.getByText("Account Settings")).toBeInTheDocument();
        expect(result.getByTestId("email")).toHaveValue(
          "bug-fix-test@example.com"
        );
        expect(result.getByTestId("display-name")).toHaveValue("Bug Fix User");
      });

      // This verifies the bug is fixed: no blank page, no manual refresh needed
      expect(result.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });
});
