// ABOUTME: Tests for AddHeroButton component covering different states and interactions
// ABOUTME: Tests button behavior for collection status and loading states
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddHeroButton } from "../AddHeroButton";

describe("AddHeroButton", () => {
  const defaultProps = {
    heroSlug: "astaroth",
    heroName: "Astaroth",
  };

  describe("button states", () => {
    it("should render add button when hero is not in collection", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={false} />
      );

      expect(
        result.getByRole("button", { name: /add to collection/i })
      ).toBeInTheDocument();
      expect(result.getByTitle("Add to Collection")).toBeInTheDocument();
    });

    it("should render collection status when hero is in collection", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={true} />
      );

      expect(
        result.getByRole("button", { name: /in collection/i })
      ).toBeInTheDocument();
      expect(result.getByTitle("In Collection")).toBeInTheDocument();
    });

    it("should render loading state when isLoading is true", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isLoading={true} />
      );

      expect(result.getByTitle("Adding...")).toBeInTheDocument();
    });

    it("should be disabled when hero is in collection", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={true} />
      );

      const button = result.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });

    it("should be disabled when loading", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isLoading={true} />
      );

      const button = result.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });
  });

  describe("button interactions", () => {
    it("should call onAddHero when clicked", () => {
      const onAddHero = vi.fn();
      const result = render(
        <AddHeroButton {...defaultProps} onAddHero={onAddHero} />
      );

      const button = result.getByRole("button");
      fireEvent.click(button);

      expect(onAddHero).toHaveBeenCalledWith("astaroth");
    });

    it("should not call onAddHero when hero is in collection", () => {
      const onAddHero = vi.fn();
      const result = render(
        <AddHeroButton
          {...defaultProps}
          isInCollection={true}
          onAddHero={onAddHero}
        />
      );

      const button = result.getByRole("button");
      fireEvent.click(button);

      expect(onAddHero).not.toHaveBeenCalled();
    });

    it("should not call onAddHero when loading", () => {
      const onAddHero = vi.fn();
      const result = render(
        <AddHeroButton
          {...defaultProps}
          isLoading={true}
          onAddHero={onAddHero}
        />
      );

      const button = result.getByRole("button");
      fireEvent.click(button);

      expect(onAddHero).not.toHaveBeenCalled();
    });

    it("should not call onAddHero when no handler is provided", () => {
      // This should not throw an error
      const result = render(<AddHeroButton {...defaultProps} />);

      const button = result.getByRole("button");
      fireEvent.click(button);

      // No assertions needed, just checking it doesn't throw
    });
  });

  describe("button variants and sizes", () => {
    it("should apply default variant", () => {
      const result = render(<AddHeroButton {...defaultProps} />);

      const button = result.getByRole("button");
      expect(button).toHaveClass("dark:border-input"); // outline variant in dark mode
    });

    it("should apply default variant for collection status", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={true} />
      );

      const button = result.getByRole("button");
      expect(button).toHaveClass("bg-green-600"); // green background when in collection
    });

    it("should apply custom variant", () => {
      const result = render(
        <AddHeroButton {...defaultProps} variant="ghost" />
      );

      const button = result.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent"); // ghost variant
    });

    it("should apply custom size", () => {
      const result = render(<AddHeroButton {...defaultProps} size="lg" />);

      const button = result.getByRole("button");
      expect(button).toHaveClass("h-10"); // default size since lg maps to h-10
    });

    it("should apply small size", () => {
      const result = render(<AddHeroButton {...defaultProps} size="sm" />);

      const button = result.getByRole("button");
      expect(button).toHaveClass("h-8"); // small size
    });
  });

  describe("icons", () => {
    it("should show plus icon when not in collection", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={false} />
      );

      const button = result.getByRole("button");
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should show check icon when in collection", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={true} />
      );

      const button = result.getByRole("button");
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should not show icon when loading", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isLoading={true} />
      );

      const button = result.getByRole("button");
      const icon = button.querySelector("svg");
      expect(icon).toBeNull();
    });
  });

  describe("accessibility", () => {
    it("should have proper button role", () => {
      const result = render(<AddHeroButton {...defaultProps} />);

      expect(result.getByRole("button")).toBeInTheDocument();
    });

    it("should have proper disabled state", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={true} />
      );

      const button = result.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });

    it("should have proper enabled state", () => {
      const result = render(
        <AddHeroButton {...defaultProps} isInCollection={false} />
      );

      const button = result.getByRole("button");
      expect(button).not.toHaveAttribute("disabled");
    });
  });

  describe("custom styling", () => {
    it("should apply custom className", () => {
      const result = render(
        <AddHeroButton {...defaultProps} className="custom-class" />
      );

      const button = result.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("text content", () => {
    it("should have correct title text for different states", () => {
      const result = render(<AddHeroButton {...defaultProps} />);
      expect(result.getByTitle("Add to Collection")).toBeInTheDocument();

      result.rerender(
        <AddHeroButton {...defaultProps} isInCollection={true} />
      );
      expect(result.getByTitle("In Collection")).toBeInTheDocument();

      result.rerender(<AddHeroButton {...defaultProps} isLoading={true} />);
      expect(result.getByTitle("Adding...")).toBeInTheDocument();
    });
  });
});
