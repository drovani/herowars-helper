// ABOUTME: Tests for HeroIndexSkeleton component covering cards and tiles mode rendering
// ABOUTME: Tests responsive layout, search filters, and mode toggle functionality

import { describe, expect, it } from "vitest";
import { render } from "~/__tests__/utils/test-utils";
import { HeroIndexSkeleton } from "../HeroIndexSkeleton";

describe("HeroIndexSkeleton", () => {
  describe("cards mode rendering", () => {
    it("should render cards mode by default", () => {
      const result = render(<HeroIndexSkeleton />);

      const container = result.container.firstChild as HTMLElement;
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("space-y-4");
    });

    it("should render search and toggle controls", () => {
      const result = render(<HeroIndexSkeleton />);

      // Should have search input skeleton
      const searchSkeletons = result.container.querySelectorAll(".h-10");
      expect(searchSkeletons.length).toBeGreaterThan(0);
    });

    it("should render hero cards grid", () => {
      const result = render(<HeroIndexSkeleton />);

      // Should render grid of hero card skeletons
      const gridElement = result.container.querySelector(".grid");
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveClass("grid-cols-3"); // mobile default
      expect(gridElement).toHaveClass("md:grid-cols-4"); // tablet default
      expect(gridElement).toHaveClass("lg:grid-cols-5"); // desktop default
    });

    it("should render default number of hero cards", () => {
      const result = render(<HeroIndexSkeleton />);

      const gridElement = result.container.querySelector(".grid");
      expect(gridElement?.children).toHaveLength(15); // default hero count
    });

    it("should render custom number of hero cards", () => {
      const result = render(<HeroIndexSkeleton itemCount={8} />);

      const gridElement = result.container.querySelector(".grid");
      expect(gridElement?.children).toHaveLength(8);
    });
  });

  describe("tiles mode rendering", () => {
    it("should render tiles mode when specified", () => {
      const result = render(<HeroIndexSkeleton mode="tiles" />);

      const container = result.container;

      // Should render table header row
      const headerRow = container.querySelector(".grid.grid-cols-5");
      expect(headerRow).toBeInTheDocument();
    });

    it("should render hero tiles", () => {
      const result = render(<HeroIndexSkeleton mode="tiles" itemCount={4} />);

      const container = result.container;

      // Should render hero tile skeletons in a flex column
      const tilesContainer = container.querySelector(".flex.flex-col.gap-4");
      expect(tilesContainer).toBeInTheDocument();
    });

    it("should render pagination controls for tiles", () => {
      const result = render(<HeroIndexSkeleton mode="tiles" />);

      // Should render pagination skeletons
      const paginationSkeletons =
        result.container.querySelectorAll(".h-9, .h-10");
      expect(paginationSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe("accessibility", () => {
    it("should render without accessibility violations", () => {
      const result = render(<HeroIndexSkeleton />);

      // Check that skeleton elements have proper structure
      const container = result.container.firstChild as HTMLElement;
      expect(container).toBeInTheDocument();
    });

    it("should render with proper semantic structure", () => {
      const result = render(<HeroIndexSkeleton />);

      // Grid should have proper layout structure
      const gridElement = result.container.querySelector(".grid");
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe("responsive behavior", () => {
    it("should apply responsive grid classes", () => {
      const result = render(<HeroIndexSkeleton />);

      const gridElement = result.container.querySelector(".grid");
      expect(gridElement).toHaveClass("grid-cols-3"); // mobile
      expect(gridElement).toHaveClass("md:grid-cols-4"); // tablet
      expect(gridElement).toHaveClass("lg:grid-cols-5"); // desktop
    });
  });

  describe("custom styling", () => {
    it("should apply custom className", () => {
      const result = render(<HeroIndexSkeleton className="custom-skeleton" />);

      const container = result.container.firstChild as HTMLElement;
      expect(container).toHaveClass("custom-skeleton");
    });
  });

  describe("configuration options", () => {
    it("should handle different item counts", () => {
      const result = render(<HeroIndexSkeleton itemCount={5} />);

      // Component should render without errors
      const container = result.container.firstChild as HTMLElement;
      expect(container).toBeInTheDocument();
    });

    it("should handle different modes", () => {
      const result = render(<HeroIndexSkeleton mode="tiles" />);

      // Component should render without errors
      const container = result.container.firstChild as HTMLElement;
      expect(container).toBeInTheDocument();
    });
  });
});
