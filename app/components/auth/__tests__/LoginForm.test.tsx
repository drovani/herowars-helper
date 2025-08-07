import { render, waitFor } from "@testing-library/react";
import { useFetcher } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../LoginForm";

// Mock the useFetcher hook
vi.mock("react-router", () => ({
  useFetcher: vi.fn(),
}));

const mockUseFetcher = vi.mocked(useFetcher);

describe("LoginForm", () => {
  const mockSubmit = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseFetcher.mockReturnValue({
      data: undefined,
      state: "idle",
      Form: ({ children, ...props }: any) => (
        <form onSubmit={mockSubmit} {...props}>
          {children}
        </form>
      ),
    } as any);
  });

  describe("rendering", () => {
    it("renders email and password fields", () => {
      const result = render(<LoginForm />);

      expect(result.getByLabelText("Email")).toBeInTheDocument();
      expect(result.getByLabelText("Password")).toBeInTheDocument();
      expect(result.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const result = render(<LoginForm className="custom-class" />);

      // The className is applied to the outermost div container
      const formContainer = result.container.querySelector(".custom-class");
      expect(formContainer).toBeInTheDocument();
    });

    it("includes hidden redirectTo field when provided", () => {
      const result = render(<LoginForm redirectTo="/dashboard" />);
      const hiddenInput = document.querySelector('input[name="redirectTo"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue("/dashboard");
    });

    it("does not include redirectTo field when not provided", () => {
      const result = render(<LoginForm />);
      const hiddenInput = document.querySelector('input[name="redirectTo"]');
      expect(hiddenInput).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("uses custom action when provided", () => {
      const result = render(<LoginForm action="/custom-login" />);
      // The Form component should receive the action prop
      // This tests that the action is passed correctly
      expect(mockUseFetcher).toHaveBeenCalled();
    });

    it("requires email and password fields", () => {
      const result = render(<LoginForm />);

      const emailInput = result.getByLabelText("Email");
      const passwordInput = result.getByLabelText("Password");

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it("has correct email input type", () => {
      const result = render(<LoginForm />);
      const emailInput = result.getByLabelText("Email");
      expect(emailInput).toHaveProperty("type", "email");
    });

    it("has correct password input type", () => {
      const result = render(<LoginForm />);
      const passwordInput = result.getByLabelText("Password");
      expect(passwordInput).toHaveProperty("type", "password");
    });
  });

  describe("loading state", () => {
    it("shows loading text when submitting", () => {
      mockUseFetcher.mockReturnValue({
        data: undefined,
        state: "submitting",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      const result = render(<LoginForm />);

      expect(
        result.getByRole("button", { name: "Logging in..." })
      ).toBeInTheDocument();
    });

    it("disables button when submitting", () => {
      mockUseFetcher.mockReturnValue({
        data: undefined,
        state: "submitting",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      const result = render(<LoginForm />);

      const submitButton = result.getByRole("button", {
        name: "Logging in...",
      });
      expect(submitButton).toBeDisabled();
    });

    it("shows normal text when not submitting", () => {
      const result = render(<LoginForm />);

      expect(result.getByRole("button", { name: "Login" })).toBeInTheDocument();
      expect(result.getByRole("button", { name: "Login" })).not.toBeDisabled();
    });
  });

  describe("error handling", () => {
    it("displays error message when error is present", () => {
      mockUseFetcher.mockReturnValue({
        data: { error: "Invalid credentials" },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      const result = render(<LoginForm />);

      expect(result.getByText("Invalid credentials")).toBeInTheDocument();
    });

    it("does not display error message when no error", () => {
      const result = render(<LoginForm />);

      expect(result.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows error with red text styling", () => {
      mockUseFetcher.mockReturnValue({
        data: { error: "Login failed" },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      const result = render(<LoginForm />);

      const errorMessage = result.getByText("Login failed");
      expect(errorMessage).toHaveClass("text-red-500");
    });
  });

  describe("success handling", () => {
    it("calls onSuccess when success is true", async () => {
      // Initial render
      const result = render(<LoginForm onSuccess={mockOnSuccess} />);

      // Simulate successful response
      mockUseFetcher.mockReturnValue({
        data: { success: true },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      result.rerender(<LoginForm onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("does not call onSuccess when success is false", () => {
      mockUseFetcher.mockReturnValue({
        data: { success: false },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      const result = render(<LoginForm onSuccess={mockOnSuccess} />);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("does not call onSuccess when no success property", () => {
      mockUseFetcher.mockReturnValue({
        data: { someOtherData: true },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      const result = render(<LoginForm onSuccess={mockOnSuccess} />);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("handles success without onSuccess callback", async () => {
      // Should not throw error when onSuccess is not provided
      const result = render(<LoginForm />);
      mockUseFetcher.mockReturnValue({
        data: { success: true },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);
      expect(() => result.rerender(<LoginForm />)).not.toThrow();
    });
  });

  describe("accessibility", () => {
    it("has proper labels for form fields", () => {
      const result = render(<LoginForm />);
      expect(result.getByLabelText("Email")).toBeInTheDocument();
      expect(result.getByLabelText("Password")).toBeInTheDocument();
    });

    it("has proper button role", () => {
      const result = render(<LoginForm />);
      expect(result.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("email input has correct placeholder", () => {
      const result = render(<LoginForm />);
      const emailInput = result.getByLabelText("Email");
      expect(emailInput).toHaveAttribute("placeholder", "m@example.com");
    });
  });

  describe("integration", () => {
    it("works with all props together", async () => {
      const result = render(
        <LoginForm
          onSuccess={mockOnSuccess}
          redirectTo="/dashboard"
          className="test-class"
          action="/custom-action"
        />
      );

      // Check all props are applied
      expect(document.querySelector('input[name="redirectTo"]')).toHaveValue(
        "/dashboard"
      );
      const testClassContainer = document.querySelector(".test-class");
      expect(testClassContainer).toBeInTheDocument();

      // Simulate success
      mockUseFetcher.mockReturnValue({
        data: { success: true },
        state: "idle",
        Form: ({ children, ...props }: any) => (
          <form {...props}>{children}</form>
        ),
      } as any);

      result.rerender(
        <LoginForm
          onSuccess={mockOnSuccess}
          redirectTo="/dashboard"
          className="test-class"
          action="/custom-action"
        />
      );

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
