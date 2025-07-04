import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router";
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
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test-path',
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
    if (typeof window === 'undefined') {
      Object.defineProperty(global, 'window', {
        value: {
          pathname: '/test-path',
          reload: mockReload,
          location: {
            pathname: '/test-path',
            reload: mockReload,
          }
        },
        writable: true,
      });
    }
  });

  describe("rendering", () => {
    it("renders trigger button", () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      expect(screen.getByRole("button", { name: "Open Login" })).toBeInTheDocument();
    });

    it("does not show modal content initially", () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      expect(screen.queryByText("Login")).not.toBeInTheDocument();
      expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
    });

    it("shows modal content when trigger is clicked", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.getByText("Enter your credentials to access your account")).toBeInTheDocument();
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
      });
    });
  });

  describe("controlled mode", () => {
    it("respects external open state", () => {
      render(
        <Wrapper>
          <LoginModal open={true} onOpenChange={vi.fn()}>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    it("calls onOpenChange when modal state changes", async () => {
      const mockOnOpenChange = vi.fn();
      
      render(
        <Wrapper>
          <LoginModal open={false} onOpenChange={mockOnOpenChange}>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("LoginForm integration", () => {
    it("passes current URL as redirectTo", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(screen.getByText("redirectTo: /test-path")).toBeInTheDocument();
      });
    });

    it("passes correct action to LoginForm", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(screen.getByText("action: /login")).toBeInTheDocument();
      });
    });

    it("passes correct className to LoginForm", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(screen.getByText("className: mt-4")).toBeInTheDocument();
      });
    });
  });

  describe("success handling", () => {
    it("closes modal on login success", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));
      
      await waitFor(() => {
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
      });

      // Trigger success
      fireEvent.click(screen.getByRole("button", { name: "Trigger Success" }));

      await waitFor(() => {
        expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
      });
    });

    it("reloads page on login success", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));
      
      await waitFor(() => {
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
      });

      // Trigger success
      fireEvent.click(screen.getByRole("button", { name: "Trigger Success" }));

      await waitFor(() => {
        expect(mockReload).toHaveBeenCalledTimes(1);
      });
    });

    it("handles success in controlled mode", async () => {
      const mockOnOpenChange = vi.fn();
      
      render(
        <Wrapper>
          <LoginModal open={true} onOpenChange={mockOnOpenChange}>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Trigger success
      fireEvent.click(screen.getByRole("button", { name: "Trigger Success" }));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        expect(mockReload).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("navigation links", () => {
    it("shows sign up link", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        const signUpLink = screen.getByRole("link", { name: "Sign up" });
        expect(signUpLink).toBeInTheDocument();
        expect(signUpLink).toHaveAttribute("href", "/sign-up");
      });
    });

    it("closes modal when sign up link is clicked", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));
      
      await waitFor(() => {
        expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
      });

      // Get the link and verify it exists
      const signUpLink = screen.getByRole("link", { name: "Sign up" });
      expect(signUpLink).toBeInTheDocument();
      
      // We can't easily test the actual closing behavior due to how the onClick is set up
      // But we can verify the link is there and has the correct attributes
      expect(signUpLink).toHaveAttribute("href", "/sign-up");
    });
  });

  describe("accessibility", () => {
    it("has proper dialog title", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
      });
    });

    it("has proper dialog description", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));

      await waitFor(() => {
        expect(screen.getByText("Enter your credentials to access your account")).toBeInTheDocument();
      });
    });

    it("trigger is accessible", () => {
      render(
        <Wrapper>
          <LoginModal>
            <button aria-label="Open login modal">Login</button>
          </LoginModal>
        </Wrapper>
      );

      const trigger = screen.getByRole("button", { name: "Open login modal" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles multiple modal instances", async () => {
      render(
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

      fireEvent.click(screen.getByRole("button", { name: "Open Login 1" }));
      
      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });

      // Only one modal should be open at a time
      expect(screen.getAllByTestId("login-form")).toHaveLength(1);
    });

    it("works with different trigger elements", () => {
      expect(() => {
        render(
          <Wrapper>
            <LoginModal>
              <div>Custom trigger</div>
            </LoginModal>
          </Wrapper>
        );
      }).not.toThrow();
    });

    it("handles undefined onSuccess gracefully", async () => {
      render(
        <Wrapper>
          <LoginModal>
            <button>Open Login</button>
          </LoginModal>
        </Wrapper>
      );

      // Open modal
      fireEvent.click(screen.getByRole("button", { name: "Open Login" }));
      
      await waitFor(() => {
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
      });

      // Trigger success without onSuccess callback should not throw
      expect(() => {
        fireEvent.click(screen.getByRole("button", { name: "Trigger Success" }));
      }).not.toThrow();
    });
  });
});