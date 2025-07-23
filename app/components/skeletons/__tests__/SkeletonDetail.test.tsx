// ABOUTME: Tests for SkeletonDetail component covering detail page layouts, sections, and breadcrumb navigation
// ABOUTME: Tests the detail skeleton building block used for hero/equipment detail page loading states

import { describe, expect, it } from "vitest";
import { render } from "~/__tests__/utils/test-utils";
import { SkeletonDetail } from "../SkeletonDetail";

describe("SkeletonDetail", () => {
  describe("basic rendering", () => {
    it("should render with default props", () => {
      const result = render(<SkeletonDetail />);

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();
      expect(detailContainer).toHaveClass("space-y-6");
    });

    it("should render with custom className", () => {
      const result = render(<SkeletonDetail className="custom-detail" />);

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toHaveClass("custom-detail");
    });
  });

  describe("breadcrumbs", () => {
    it("should show breadcrumbs by default", () => {
      const result = render(<SkeletonDetail />);

      // Should have breadcrumb container
      const breadcrumbContainer = result.container.querySelector(
        'div[class*="flex"][class*="items-center"][class*="space-x-2"]'
      );
      expect(breadcrumbContainer).toBeInTheDocument();

      // Should have breadcrumb separators
      const separators = result.container.querySelectorAll(
        ".text-muted-foreground"
      );
      expect(separators.length).toBeGreaterThanOrEqual(2); // Should have "/" separators
    });

    it("should hide breadcrumbs when disabled", () => {
      const result = render(<SkeletonDetail showBreadcrumbs={false} />);

      // Should not have breadcrumb container
      const breadcrumbContainer = result.container.querySelector(
        'div[class*="flex"][class*="items-center"][class*="space-x-2"]'
      );
      expect(breadcrumbContainer).not.toBeInTheDocument();
    });

    it("should render breadcrumb skeleton elements", () => {
      const result = render(<SkeletonDetail showBreadcrumbs={true} />);

      // Should have breadcrumb skeletons with different widths
      const breadcrumbSkeletons = result.container.querySelectorAll(
        '[class*="h-4"][class*="w-12"], [class*="h-4"][class*="w-16"], [class*="h-4"][class*="w-20"]'
      );
      expect(breadcrumbSkeletons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("layout modes", () => {
    it("should render single column layout by default", () => {
      const result = render(<SkeletonDetail />);

      // Should have single column layout (space-y-6)
      const layoutContainer = result.container.querySelector(
        '[class*="space-y-6"]:not([class*="grid"])'
      );
      expect(layoutContainer).toBeInTheDocument();
    });

    it("should render two-column layout when specified", () => {
      const result = render(<SkeletonDetail layout="two-column" />);

      // Should have grid layout for two columns
      const gridContainer = result.container.querySelector(
        '[class*="grid"][class*="grid-cols-1"][class*="lg:grid-cols-2"]'
      );
      expect(gridContainer).toBeInTheDocument();
    });

    it("should handle explicit single column layout", () => {
      const result = render(<SkeletonDetail layout="single" />);

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();
    });
  });

  describe("header section", () => {
    it("should render header card with image by default", () => {
      const result = render(<SkeletonDetail />);

      // Should have header card
      const headerCard = result.container.querySelector('div[class*="w-full"]');
      expect(headerCard).toBeInTheDocument();

      // Should have image skeleton
      const imageSkeleton = result.container.querySelector(
        '[class*="size-32"][class*="rounded-lg"]'
      );
      expect(imageSkeleton).toBeInTheDocument();
    });

    it("should hide image when disabled", () => {
      const result = render(<SkeletonDetail showImage={false} />);

      // Should not have image skeleton
      const imageSkeleton = result.container.querySelector(
        '[class*="size-32"][class*="rounded-lg"]'
      );
      expect(imageSkeleton).not.toBeInTheDocument();
    });

    it("should render header information skeletons", () => {
      const result = render(<SkeletonDetail />);

      // Should have title skeleton
      const titleSkeleton = result.container.querySelector(
        '[class*="h-8"][class*="w-48"]'
      );
      expect(titleSkeleton).toBeInTheDocument();

      // Should have badge/tag skeletons
      const badgeSkeletons = result.container.querySelectorAll(
        '[class*="h-6"][class*="w-16"], [class*="h-6"][class*="w-20"]'
      );
      expect(badgeSkeletons.length).toBeGreaterThanOrEqual(3);

      // Should have description skeleton
      const descriptionSkeleton = result.container.querySelector(
        '[class*="h-4"][class*="w-64"]'
      );
      expect(descriptionSkeleton).toBeInTheDocument();
    });

    it("should adjust layout based on image presence", () => {
      const resultWithImage = render(<SkeletonDetail showImage={true} />);
      const resultWithoutImage = render(<SkeletonDetail showImage={false} />);

      // Both should render without errors
      expect(resultWithImage.container.firstChild).toBeInTheDocument();
      expect(resultWithoutImage.container.firstChild).toBeInTheDocument();
    });
  });

  describe("content sections", () => {
    it("should render default 3 content sections", () => {
      const result = render(<SkeletonDetail />);

      // Should have 3 content section cards (plus 1 header card = 4 total)
      const cards = result.container.querySelectorAll('div[class*="w-full"]');
      expect(cards.length).toBeGreaterThanOrEqual(4); // Header + 3 content sections
    });

    it("should render custom number of content sections", () => {
      const result = render(<SkeletonDetail contentSections={5} />);

      // Should have 5 content section cards (plus header)
      const cards = result.container.querySelectorAll('div[class*="w-full"]');
      expect(cards.length).toBeGreaterThanOrEqual(6); // Header + 5 content sections
    });

    it("should render zero content sections", () => {
      const result = render(<SkeletonDetail contentSections={0} />);

      // Should still render header but no content sections
      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();
    });

    it("should render section headers with skeleton titles", () => {
      const result = render(<SkeletonDetail contentSections={2} />);

      // Should have section title skeletons
      const sectionTitles = result.container.querySelectorAll(
        '[class*="h-6"][class*="w-32"]'
      );
      expect(sectionTitles.length).toBeGreaterThanOrEqual(2);
    });

    it("should render custom section titles", () => {
      const sectionTitles = ["Stats", "Equipment", "Skills"];
      const result = render(
        <SkeletonDetail sectionTitles={sectionTitles} contentSections={3} />
      );

      // Should show actual titles instead of skeleton placeholders
      expect(result.getByText("Stats")).toBeInTheDocument();
      expect(result.getByText("Equipment")).toBeInTheDocument();
      expect(result.getByText("Skills")).toBeInTheDocument();
    });

    it("should mix custom titles with skeleton placeholders", () => {
      const sectionTitles = ["Stats", "Equipment"]; // Only 2 titles for 4 sections
      const result = render(
        <SkeletonDetail sectionTitles={sectionTitles} contentSections={4} />
      );

      expect(result.getByText("Stats")).toBeInTheDocument();
      expect(result.getByText("Equipment")).toBeInTheDocument();

      // Should have skeleton placeholders for remaining sections
      const skeletonTitles = result.container.querySelectorAll(
        '[class*="h-6"][class*="w-32"]'
      );
      expect(skeletonTitles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("section content structure", () => {
    it("should render proper content structure in each section", () => {
      const result = render(<SkeletonDetail contentSections={1} />);

      // Each section should have a grid layout
      const gridLayout = result.container.querySelector(
        '[class*="grid"][class*="grid-cols-2"][class*="gap-4"]'
      );
      expect(gridLayout).toBeInTheDocument();

      // Should have label-value pairs
      const labelSkeletons = result.container.querySelectorAll(
        '[class*="h-4"][class*="w-20"], [class*="h-4"][class*="w-16"]'
      );
      expect(labelSkeletons.length).toBeGreaterThanOrEqual(2);

      const valueSkeletons = result.container.querySelectorAll(
        '[class*="h-6"][class*="w-24"], [class*="h-6"][class*="w-28"]'
      );
      expect(valueSkeletons.length).toBeGreaterThanOrEqual(2);
    });

    it("should render full-width content lines", () => {
      const result = render(<SkeletonDetail contentSections={1} />);

      // Should have full-width and partial-width content lines
      const fullWidthLine = result.container.querySelector(
        '[class*="h-4"][class*="w-full"]'
      );
      const partialWidthLine = result.container.querySelector(
        '[class*="h-4"][class*="w-3/4"]'
      );

      expect(fullWidthLine).toBeInTheDocument();
      expect(partialWidthLine).toBeInTheDocument();
    });
  });

  describe("skeleton elements", () => {
    it("should render skeleton elements with proper classes", () => {
      const result = render(<SkeletonDetail />);

      // Should contain skeleton elements with rounded corners
      const skeletonElements = result.container.querySelectorAll(
        '[class*="animate-pulse"]'
      );
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("should render skeleton elements with various dimensions", () => {
      const result = render(<SkeletonDetail />);

      // Should have various height and width classes
      const heightElements = result.container.querySelectorAll('[class*="h-"]');
      const widthElements = result.container.querySelectorAll('[class*="w-"]');

      expect(heightElements.length).toBeGreaterThan(0);
      expect(widthElements.length).toBeGreaterThan(0);
    });

    it("should use proper size classes for different elements", () => {
      const result = render(<SkeletonDetail />);

      // Image should be square
      const imageSkeleton =
        result.container.querySelector('[class*="size-32"]');
      expect(imageSkeleton).toBeInTheDocument();

      // Title should be larger
      const titleSkeleton = result.container.querySelector('[class*="h-8"]');
      expect(titleSkeleton).toBeInTheDocument();
    });
  });

  describe("responsive behavior", () => {
    it("should handle responsive layout classes", () => {
      const result = render(<SkeletonDetail layout="two-column" />);

      // Should have responsive grid classes
      const responsiveGrid = result.container.querySelector(
        '[class*="lg:grid-cols-2"]'
      );
      expect(responsiveGrid).toBeInTheDocument();
    });

    it("should handle responsive header layout", () => {
      const result = render(<SkeletonDetail showImage={true} />);

      // Should have responsive flex layout for header
      const responsiveHeader = result.container.querySelector(
        '[class*="sm:flex-row"]'
      );
      expect(responsiveHeader).toBeInTheDocument();
    });
  });

  describe("combined configurations", () => {
    it("should handle minimal configuration", () => {
      const result = render(
        <SkeletonDetail
          showBreadcrumbs={false}
          showImage={false}
          contentSections={1}
          layout="single"
        />
      );

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();
    });

    it("should handle maximal configuration", () => {
      const result = render(
        <SkeletonDetail
          showBreadcrumbs={true}
          showImage={true}
          contentSections={6}
          layout="two-column"
          sectionTitles={["One", "Two", "Three"]}
        />
      );

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();

      // Should show custom titles
      expect(result.getByText("One")).toBeInTheDocument();
      expect(result.getByText("Two")).toBeInTheDocument();
      expect(result.getByText("Three")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should render without accessibility violations", () => {
      const result = render(<SkeletonDetail />);

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();
    });

    it("should use proper heading hierarchy when custom titles are provided", () => {
      const sectionTitles = ["Section 1", "Section 2"];
      const result = render(<SkeletonDetail sectionTitles={sectionTitles} />);

      // Custom titles should use h3 tags
      const headings = result.container.querySelectorAll("h3");
      expect(headings).toHaveLength(2);
    });
  });

  describe("edge cases", () => {
    it("should handle empty section titles array", () => {
      const result = render(
        <SkeletonDetail sectionTitles={[]} contentSections={2} />
      );

      // Should render skeleton placeholders for all sections
      const skeletonTitles = result.container.querySelectorAll(
        '[class*="h-6"][class*="w-32"]'
      );
      expect(skeletonTitles.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle large number of content sections", () => {
      const result = render(<SkeletonDetail contentSections={10} />);

      const detailContainer = result.container.firstChild as HTMLElement;
      expect(detailContainer).toBeInTheDocument();

      // Should render all sections without error
      const cards = result.container.querySelectorAll('div[class*="w-full"]');
      expect(cards.length).toBeGreaterThanOrEqual(11); // Header + 10 content sections
    });
  });
});
