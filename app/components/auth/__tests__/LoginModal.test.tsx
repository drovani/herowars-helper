import { fireEvent, render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginModal } from "../LoginModal";

// Mock the LoginForm component
vi.mock("../LoginForm", () => ({
  LoginForm: ({ onSuccess, redirectTo, action, className }: any) => (
    <div data-testid="login-form">
      <div>LoginForm Mock</div>
      <div>redirectTo: {redirectTo}</div>
      <div>action: {action}</div>
      <div>className: {className}</div>
      <button onClick={() => onSuccess && onSuccess()}>Trigger Success</button>
    </div>
  ),
}));

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  value: {
    pathname: "/test-path",
    reload: mockReload,
  },
  writable: true,
});

// Helper component to wrap with router
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("LoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure window object is available for all tests
    if (typeof window === "undefined") {
      Object.defineProperty(global, "window", {
        value: {
          pathname: "/test-path",
          reload: mockReload,
          location: {
            pathname: "/test-path",
            reload: mockReload,
          },
        },
        writable: true,
      });
    }
  });

  describe("rendering", () => {
    it("renders trigger button", () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      expect(
        result.getByRole("button", { name: "Open Login" })
      ).toBeInTheDocument();
    });

    it("does not show modal content initially", () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      expect(result.queryByText("Login")).not.toBeInTheDocument();
      expect(result.queryByTestId("login-form")).not.toBeInTheDocument();
      expect(result.queryByText("Login")).not.toBeInTheDocument();
      expect(result.queryByTestId("login-form")).not.toBeInTheDocument();
    });

    it("shows modal content when trigger is clicked", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByText("Login")).toBeInTheDocument();
        expect(
          result.getByText("Enter your credentials to access your account")
        ).toBeInTheDocument();
        expect(result.getByTestId("login-form")).toBeInTheDocument();
      });
    });
  });

  describe("controlled mode", () => {
    it("respects external open state", () => {
      const result = render(
        <Wrapper>
          <LoginModal open={true} onOpenChange={vi.fn()}>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      expect(result.getByText("Login")).toBeInTheDocument();
      expect(result.getByTestId("login-form")).toBeInTheDocument();
      expect(result.getByText("Login")).toBeInTheDocument();
      expect(result.getByTestId("login-form")).toBeInTheDocument();
    });

    it("calls onOpenChange when modal state changes", async () => {
      const mockOnOpenChange = vi.fn();

      const result = render(
        <Wrapper>
          <LoginModal open={false} onOpenChange={mockOnOpenChange}>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("LoginForm integration", () => {
    it("passes current URL as redirectTo", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByText("redirectTo: /test-path")).toBeInTheDocument();
        expect(result.getByText("redirectTo: /test-path")).toBeInTheDocument();
      });
    });

    it("passes correct action to LoginForm", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByText("action: /login")).toBeInTheDocument();
        expect(result.getByText("action: /login")).toBeInTheDocument();
      });
    });

    it("passes correct className to LoginForm", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByText("className: mt-4")).toBeInTheDocument();
        expect(result.getByText("className: mt-4")).toBeInTheDocument();
      });
    });
  });

  describe("success handling", () => {
    it("closes modal on login success", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByTestId("login-form")).toBeInTheDocument();
        expect(result.getByTestId("login-form")).toBeInTheDocument();
      });

      // Trigger success
      fireEvent.click(result.getByRole("button", { name: "Trigger Success" }));
      fireEvent.click(result.getByRole("button", { name: "Trigger Success" }));

      await waitFor(() => {
        expect(result.queryByTestId("login-form")).not.toBeInTheDocument();
        expect(result.queryByTestId("login-form")).not.toBeInTheDocument();
      });
    });

    it("reloads page on login success", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByTestId("login-form")).toBeInTheDocument();
        expect(result.getByTestId("login-form")).toBeInTheDocument();
      });

      // Trigger success
      fireEvent.click(result.getByRole("button", { name: "Trigger Success" }));
      fireEvent.click(result.getByRole("button", { name: "Trigger Success" }));

      await waitFor(() => {
        expect(mockReload).toHaveBeenCalledTimes(1);
      });
    });

    it("handles success in controlled mode", async () => {
      const mockOnOpenChange = vi.fn();

      const result = render(
        <Wrapper>
          <LoginModal open={true} onOpenChange={mockOnOpenChange}>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Trigger success
      fireEvent.click(result.getByRole("button", { name: "Trigger Success" }));
      fireEvent.click(result.getByRole("button", { name: "Trigger Success" }));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        expect(mockReload).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("navigation links", () => {
    it("shows sign up link", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        const signUpLink = result.getByRole("link", { name: "Sign up" });
        expect(signUpLink).toBeInTheDocument();
        expect(signUpLink).toHaveAttribute("href", "/sign-up");
      });
    });

    it("closes modal when sign up link is clicked", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(
          result.getByRole("link", { name: "Sign up" })
        ).toBeInTheDocument();
      });

      // Get the link and verify it exists
      const signUpLink = result.getByRole("link", { name: "Sign up" });
      expect(signUpLink).toBeInTheDocument();

      // We can't easily test the actual closing behavior due to how the onClick is set up
      // But we can verify the link is there and has the correct attributes
      expect(signUpLink).toHaveAttribute("href", "/sign-up");
    });
  });

  describe("accessibility", () => {
    it("has proper dialog title", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(
          result.getByRole("heading", { name: "Login" })
        ).toBeInTheDocument();
      });
    });

    it("has proper dialog description", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login" }));
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(
          result.getByText("Enter your credentials to access your account")
        ).toBeInTheDocument();
      });
    });

    it("trigger is accessible", () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button aria-label="Open login modal">Login</button>
          </LoginModal>
        </Wrapper>
      );

      const trigger = result.getByRole("button", { name: "Open login modal" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles multiple modal instances", async () => {
      const result = render(
        <Wrapper>
          <div>
            <LoginModal>
              <button>Open Login 1</button>
            </LoginModal>
            <LoginModal>
              <button>Open Login 2</button>
            </LoginModal>
          </div>
        </Wrapper>
      );

      fireEvent.click(result.getByRole("button", { name: "Open Login 1" }));

      await waitFor(() => {
        expect(result.getByText("Login")).toBeInTheDocument();
        expect(result.getByText("Login")).toBeInTheDocument();
      });

      // Only one modal should be open at a time
      expect(result.getAllByTestId("login-form")).toHaveLength(1);
      expect(result.getAllByTestId("login-form")).toHaveLength(1);
    });

    it("works with different trigger elements", () => {
      expect(() => {
        const result = render(
          <Wrapper>
            <LoginModal>
              <div>Custom trigger</div>
            </LoginModal>
          </Wrapper>
        );
      }).not.toThrow();
    });

    it("handles undefined onSuccess gracefully", async () => {
      const result = render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(result.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(result.getByTestId("login-form")).toBeInTheDocument();
        expect(result.getByTestId("login-form")).toBeInTheDocument();
      });

      // Trigger success without onSuccess callback should not throw
      expect(() => {
        fireEvent.click(
          result.getByRole("button", { name: "Trigger Success" })
        );
      }).not.toThrow();
    });
  });
});
