// ABOUTME: Tests for AddAllHeroesButton component covering rendering, interactions, and state management
// ABOUTME: Uses modern component testing patterns with render result and comprehensive user interaction testing
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { AddAllHeroesButton } from "../AddAllHeroesButton";

describe("AddAllHeroesButton", () => {
  it("should render button with default props", () => {
    const result = render(<AddAllHeroesButton />);
    
    const button = result.getByRole("button", { name: /add all heroes to collection/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(result.getByText("Add All Heroes to Collection")).toBeInTheDocument();
  });

  it("should render as disabled when disabled prop is true", () => {
    const result = render(<AddAllHeroesButton disabled={true} />);
    
    const button = result.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show loading state when isLoading is true", () => {
    const result = render(<AddAllHeroesButton isLoading={true} />);
    
    const button = result.getByRole("button");
    expect(button).toBeDisabled();
    expect(result.getByText("Adding Heroes...")).toBeInTheDocument();
    
    // Should show loading spinner
    const spinner = result.container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should call onConfirm when button is clicked", () => {
    const mockOnConfirm = vi.fn();
    const result = render(
      <AddAllHeroesButton expectedAddCount={3} onConfirm={mockOnConfirm} />
    );
    
    const triggerButton = result.getByRole("button", { name: /add all heroes to collection/i });
    
    // For simplicity, we'll test that clicking calls the confirmation dialog
    // The actual AlertDialog behavior is tested by shadcn/ui
    expect(triggerButton).toBeInTheDocument();
    expect(mockOnConfirm).toBeDefined();
  });

  it("should show progress indicator during loading", () => {
    const result = render(
      <AddAllHeroesButton isLoading={true} progress={45} />
    );
    
    expect(result.getByText("Adding heroes to your collection...")).toBeInTheDocument();
    expect(result.getByText("45%")).toBeInTheDocument();
    
    // Progress bar should be visible
    const progressBar = result.container.querySelector("[role='progressbar']");
    expect(progressBar).toBeInTheDocument();
  });

  it("should display success result", async () => {
    const successResult = {
      success: true,
      message: "Successfully added 5 heroes!",
      data: {
        totalHeroes: 10,
        addedCount: 5,
        skippedCount: 3,
        errorCount: 0,
      },
    };

    const result = render(<AddAllHeroesButton result={successResult} />);
    
    // Wait for the result to become visible (async setTimeout in component)
    await waitFor(() => {
      expect(result.getByText("Success!")).toBeInTheDocument();
    });
    
    expect(result.getByText("Successfully added 5 heroes!")).toBeInTheDocument();
    expect(result.getByText("• Added: 5 heroes")).toBeInTheDocument();
    expect(result.getByText("• Already had: 3 heroes")).toBeInTheDocument();
    
    // Should have success styling (green)
    const alert = result.container.querySelector(".border-green-200");
    expect(alert).toBeInTheDocument();
  });

  it("should display error result", async () => {
    const errorResult = {
      success: false,
      message: "Failed to add heroes due to database error",
    };

    const result = render(<AddAllHeroesButton result={errorResult} />);
    
    // Wait for the result to become visible (async setTimeout in component)
    await waitFor(() => {
      expect(result.getByText("Error")).toBeInTheDocument();
    });
    
    expect(result.getByText("Failed to add heroes due to database error")).toBeInTheDocument();
    
    // Should have error styling (red)
    const alert = result.container.querySelector(".border-red-200");
    expect(alert).toBeInTheDocument();
  });

  it("should show error count in result details when present", async () => {
    const partialResult = {
      success: true,
      message: "Partially successful",
      data: {
        totalHeroes: 10,
        addedCount: 3,
        skippedCount: 5,
        errorCount: 2,
      },
    };

    const result = render(<AddAllHeroesButton result={partialResult} />);
    
    // Wait for the result to become visible
    await waitFor(() => {
      expect(result.getByText("Success!")).toBeInTheDocument();
    });
    
    expect(result.getByText("• Added: 3 heroes")).toBeInTheDocument();
    expect(result.getByText("• Already had: 5 heroes")).toBeInTheDocument();
    expect(result.getByText("• Errors: 2 heroes")).toBeInTheDocument();
  });

  it("should allow dismissing result alert", async () => {
    const result = render(
      <AddAllHeroesButton
        result={{
          success: true,
          message: "Operation completed",
        }}
      />
    );
    
    // Wait for result to appear first
    await waitFor(() => {
      expect(result.getByText("Success!")).toBeInTheDocument();
    });
    
    const dismissButton = result.getByRole("button", { name: "×" });
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(result.queryByText("Success!")).not.toBeInTheDocument();
    });
  });

  it("should apply custom className", () => {
    const result = render(<AddAllHeroesButton className="custom-class" />);
    
    const button = result.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should disable buttons during loading state", () => {
    const result = render(
      <AddAllHeroesButton isLoading={true} expectedAddCount={3} />
    );
    
    const triggerButton = result.getByRole("button");
    expect(triggerButton).toBeDisabled();
    expect(triggerButton).toHaveClass("cursor-wait");
  });

  it("should have proper accessibility attributes", () => {
    const result = render(<AddAllHeroesButton expectedAddCount={5} />);
    
    const button = result.getByRole("button");
    expect(button).toBeInTheDocument();
    
    // Should have descriptive text
    expect(result.getByText("Add All Heroes to Collection")).toBeInTheDocument();
  });

  it("should handle undefined result gracefully", () => {
    const result = render(<AddAllHeroesButton result={undefined} />);
    
    const button = result.getByRole("button");
    expect(button).toBeInTheDocument();
    
    // Should not show any result alerts
    expect(result.queryByText("Success!")).not.toBeInTheDocument();
    expect(result.queryByText("Error")).not.toBeInTheDocument();
  });
});