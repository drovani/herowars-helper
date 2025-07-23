// ABOUTME: Tests for StarRating component covering interactive star selection
// ABOUTME: Tests both readonly and interactive modes with proper event handling
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "~/__tests__/utils/test-utils";
import { StarRating } from "../StarRating";

describe("StarRating", () => {
  describe("readonly mode", () => {
    it("should render stars correctly in readonly mode", () => {
      const result = render(<StarRating stars={3} readOnly={true} />);

      const stars = result.getAllByRole("button");
      const filled = result.getAllByTestId("filled");
      const empty = result.getAllByTestId("empty");

      expect(stars).toHaveLength(6); // default maxStars

      // First 3 stars should be filled
      stars.slice(0, 3).forEach((star) => {
        expect(star).toHaveAttribute("disabled");
      });

      expect(filled.length).toEqual(3);
      expect(empty.length).toEqual(3);
    });

    it("should handle custom maxStars", () => {
      const result = render(
        <StarRating stars={2} maxStars={5} readOnly={true} />
      );

      const filled = result.getAllByTestId("filled");
      const empty = result.getAllByTestId("empty");

      const stars = result.getAllByRole("button");
      expect(stars).toHaveLength(5);

      expect(filled.length).toEqual(2);
      expect(empty.length).toEqual(3);
    });

    it("should disable all stars in readonly mode", () => {
      const result = render(<StarRating stars={4} readOnly={true} />);

      const stars = result.getAllByRole("button");
      stars.forEach((star) => {
        expect(star).toHaveAttribute("disabled");
      });
    });
  });

  describe("interactive mode", () => {
    it("should render stars correctly in interactive mode", () => {
      const onStarClick = vi.fn();
      const result = render(<StarRating stars={2} onStarClick={onStarClick} />);

      const stars = result.getAllByRole("button");
      expect(stars).toHaveLength(6);

      // Stars should not be disabled in interactive mode
      stars.forEach((star) => {
        expect(star).not.toHaveAttribute("disabled");
      });

      const filled = result.getAllByTestId("filled");
      const empty = result.getAllByTestId("empty");

      expect(filled.length).toEqual(2);
      expect(empty.length).toEqual(4);
    });

    it("should call onStarClick when star is clicked", () => {
      const onStarClick = vi.fn();
      const result = render(<StarRating stars={2} onStarClick={onStarClick} />);

      const stars = result.getAllByRole("button");

      // Click on the 4th star (index 3)
      fireEvent.click(stars[3]);

      expect(onStarClick).toHaveBeenCalledWith(4);
    });

    it("should handle clicking on first star", () => {
      const onStarClick = vi.fn();
      const result = render(<StarRating stars={3} onStarClick={onStarClick} />);

      const stars = result.getAllByRole("button");

      // Click on the first star
      fireEvent.click(stars[0]);

      expect(onStarClick).toHaveBeenCalledWith(1);
    });

    it("should handle clicking on last star", () => {
      const onStarClick = vi.fn();
      const result = render(
        <StarRating stars={3} maxStars={5} onStarClick={onStarClick} />
      );

      const stars = result.getAllByRole("button");

      // Click on the last star
      fireEvent.click(stars[4]);

      expect(onStarClick).toHaveBeenCalledWith(5);
    });

    it("should not call onStarClick when readOnly is true", () => {
      const onStarClick = vi.fn();
      const result = render(
        <StarRating stars={3} readOnly={true} onStarClick={onStarClick} />
      );

      const stars = result.getAllByRole("button");

      // Try to click on a star
      fireEvent.click(stars[2]);

      expect(onStarClick).not.toHaveBeenCalled();
    });

    it("should not call onStarClick when no handler is provided", () => {
      // This should not throw an error
      const result = render(<StarRating stars={3} />);

      const stars = result.getAllByRole("button");

      // Click should not cause an error
      fireEvent.click(stars[2]);

      // No assertions needed, just checking it doesn't throw
    });
  });

  describe("star display", () => {
    it("should show correct filled/empty stars", () => {
      const result = render(<StarRating stars={3} maxStars={5} />);

      expect(result.getAllByTestId("filled").length).toEqual(3);
      expect(result.getAllByTestId("empty").length).toEqual(2);
    });

    it("should handle zero stars", () => {
      const result = render(<StarRating stars={0} maxStars={5} />);

      expect(result.queryAllByTestId("filled").length).toEqual(0);
      expect(result.getAllByTestId("empty").length).toEqual(5);
    });

    it("should handle maximum stars", () => {
      const result = render(<StarRating stars={5} maxStars={5} />);

      expect(result.getAllByTestId("filled").length).toEqual(5);
      expect(result.queryAllByTestId("empty").length).toEqual(0);
    });
  });

  describe("accessibility", () => {
    it("should have proper button roles", () => {
      const result = render(<StarRating stars={3} />);

      const stars = result.getAllByRole("button");
      expect(stars).toHaveLength(6);
    });

    it("should have proper disabled state for readonly", () => {
      const result = render(<StarRating stars={3} readOnly={true} />);

      const stars = result.getAllByRole("button");
      stars.forEach((star) => {
        expect(star).toHaveAttribute("disabled");
      });
    });

    it("should have proper enabled state for interactive", () => {
      const result = render(<StarRating stars={3} readOnly={false} />);

      const stars = result.getAllByRole("button");
      stars.forEach((star) => {
        expect(star).not.toHaveAttribute("disabled");
      });
    });
  });

  describe("custom styling", () => {
    it("should apply custom className", () => {
      const result = render(<StarRating stars={3} className="custom-class" />);

      expect(result.container.firstChild).toHaveClass("custom-class");
    });
  });
});
