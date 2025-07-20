// ABOUTME: Example test file demonstrating modern component testing patterns
// ABOUTME: Shows correct destructured render pattern and common testing scenarios
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Example component for demonstration
interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

function ExampleButton({ onClick, disabled, loading, children, variant = "primary" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-secondary"}`}
      data-testid="example-button"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

describe("Modern Component Testing Examples", () => {
  describe("✅ CORRECT: Destructured Render Pattern", () => {
    it("should render button with text", () => {
      // ✅ Destructure queries from render return value
      const { getByRole, getByText } = render(<ExampleButton>Click me</ExampleButton>);

      expect(getByRole("button")).toBeInTheDocument();
      expect(getByText("Click me")).toBeInTheDocument();
    });

    it("should handle click events", () => {
      const mockClick = vi.fn();
      // ✅ Destructure only the queries you need
      const { getByRole } = render(<ExampleButton onClick={mockClick}>Click me</ExampleButton>);

      fireEvent.click(getByRole("button"));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it("should show loading state", () => {
      // ✅ Use queryBy for elements that may not exist
      const { getByText, queryByText } = render(
        <ExampleButton loading={true}>Click me</ExampleButton>
      );

      expect(getByText("Loading...")).toBeInTheDocument();
      expect(queryByText("Click me")).not.toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      const { getByRole } = render(<ExampleButton disabled={true}>Click me</ExampleButton>);

      const button = getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should apply variant classes", () => {
      const { getByTestId, rerender } = render(
        <ExampleButton variant="primary">Primary</ExampleButton>
      );

      expect(getByTestId("example-button")).toHaveClass("btn-primary");

      // ✅ Rerender to test different props
      rerender(<ExampleButton variant="secondary">Secondary</ExampleButton>);
      expect(getByTestId("example-button")).toHaveClass("btn-secondary");
    });

    it("should handle async operations", async () => {
      const mockAsyncClick = vi.fn().mockResolvedValue("success");
      const { getByRole, getByText } = render(
        <ExampleButton onClick={mockAsyncClick}>Async Action</ExampleButton>
      );

      fireEvent.click(getByRole("button"));

      // ✅ Use waitFor for async operations
      await waitFor(() => {
        expect(mockAsyncClick).toHaveBeenCalled();
      });

      expect(getByText("Async Action")).toBeInTheDocument();
    });
  });

  /*
  ❌ DEPRECATED: Screen Pattern (DO NOT USE)
  
  These examples show the OLD pattern that should NOT be used:
  
  import { render, screen, fireEvent } from "@testing-library/react";
  
  it("should render button with text", () => {
    render(<ExampleButton>Click me</ExampleButton>);
    
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
  
  it("should handle click events", () => {
    const mockClick = vi.fn();
    render(<ExampleButton onClick={mockClick}>Click me</ExampleButton>);
    
    fireEvent.click(screen.getByRole("button"));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
  */

  describe("Common Testing Patterns", () => {
    it("should test form interactions", () => {
      // Example form component testing
      const FormExample = () => (
        <form>
          <input type="text" placeholder="Enter name" />
          <ExampleButton>Submit</ExampleButton>
        </form>
      );

      const { getByPlaceholderText, getByRole } = render(<FormExample />);

      const input = getByPlaceholderText("Enter name");
      const submitButton = getByRole("button", { name: "Submit" });

      fireEvent.change(input, { target: { value: "John Doe" } });
      expect(input).toHaveValue("John Doe");

      fireEvent.click(submitButton);
      // Additional assertions would go here
    });

    it("should test conditional rendering", () => {
      const ConditionalExample = ({ showButton }: { showButton: boolean }) => (
        <div>
          <p>Always visible</p>
          {showButton && <ExampleButton>Conditional</ExampleButton>}
        </div>
      );

      const { getByText, queryByText, rerender } = render(
        <ConditionalExample showButton={false} />
      );

      expect(getByText("Always visible")).toBeInTheDocument();
      expect(queryByText("Conditional")).not.toBeInTheDocument();

      rerender(<ConditionalExample showButton={true} />);
      expect(queryByText("Conditional")).toBeInTheDocument();
    });

    it("should test accessibility", () => {
      const { getByRole } = render(
        <ExampleButton disabled={true}>Disabled Button</ExampleButton>
      );

      const button = getByRole("button");
      expect(button).toHaveAttribute("disabled");
      expect(button).toHaveAccessibleName("Disabled Button");
    });

    it("should test multiple instances", () => {
      const MultipleButtons = () => (
        <div>
          <ExampleButton variant="primary">Primary</ExampleButton>
          <ExampleButton variant="secondary">Secondary</ExampleButton>
        </div>
      );

      const { getAllByRole, getByText } = render(<MultipleButtons />);

      const buttons = getAllByRole("button");
      expect(buttons).toHaveLength(2);

      expect(getByText("Primary")).toBeInTheDocument();
      expect(getByText("Secondary")).toBeInTheDocument();
    });
  });

  describe("Best Practices Summary", () => {
    it("demonstrates comprehensive testing approach", () => {
      const mockClick = vi.fn();
      
      // ✅ Destructure all needed queries at once
      const { 
        getByRole, 
        getByText, 
        queryByText, 
        getByTestId,
        rerender 
      } = render(
        <ExampleButton onClick={mockClick} variant="primary">
          Test Button
        </ExampleButton>
      );

      // ✅ Test rendering
      expect(getByRole("button")).toBeInTheDocument();
      expect(getByText("Test Button")).toBeInTheDocument();
      
      // ✅ Test styling/classes
      expect(getByTestId("example-button")).toHaveClass("btn-primary");
      
      // ✅ Test interactions
      fireEvent.click(getByRole("button"));
      expect(mockClick).toHaveBeenCalledTimes(1);
      
      // ✅ Test state changes with rerender
      rerender(
        <ExampleButton onClick={mockClick} loading={true}>
          Test Button
        </ExampleButton>
      );
      
      expect(getByText("Loading...")).toBeInTheDocument();
      expect(queryByText("Test Button")).not.toBeInTheDocument();
      expect(getByRole("button")).toBeDisabled();
    });
  });
});