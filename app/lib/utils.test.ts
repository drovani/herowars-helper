import { describe, expect, it } from "vitest";
import {
  cn,
  generateSlug,
  getEquipmentImageUrl,
  getHeroImageUrl,
} from "./utils";

describe("Utility Functions", () => {
  describe("generateSlug", () => {
    it("converts text to lowercase slug", () => {
      expect(generateSlug("Hello World")).toBe("hello-world");
      expect(generateSlug("Test Title")).toBe("test-title");
    });

    it("handles special characters and spaces", () => {
      expect(generateSlug("Hello, World!")).toBe("hello-world");
      expect(generateSlug("Test & Development")).toBe("test-and-development");
      expect(generateSlug("Multiple   Spaces")).toBe("multiple-spaces");
    });

    it("strips suffix when provided", () => {
      expect(generateSlug("test-item-suffix", "-suffix")).toBe("test-item");
      expect(generateSlug("hello-world-end", "-end")).toBe("hello-world");
    });

    it("handles suffix that does not exist", () => {
      expect(generateSlug("test-item", "-nonexistent")).toBe("test-item");
      expect(generateSlug("hello-world", "-missing")).toBe("hello-world");
    });

    it("handles empty and undefined input", () => {
      expect(generateSlug("")).toBe("");
      expect(generateSlug(undefined)).toBe("");
    });

    it("handles edge cases with suffix", () => {
      expect(generateSlug("suffix", "suffix")).toBe("");
      expect(generateSlug("test-suffix-suffix", "-suffix")).toBe("test-suffix");
    });

    it("handles unicode characters", () => {
      expect(generateSlug("Café & Restaurant")).toBe("cafe-and-restaurant");
      expect(generateSlug("Naïve résumé")).toBe("naive-resume");
    });

    it("trims leading and trailing spaces", () => {
      expect(generateSlug("  hello world  ")).toBe("hello-world");
      expect(generateSlug("\t\ntest\t\n")).toBe("test");
    });
  });

  describe("getEquipmentImageUrl", () => {
    it("generates basic image URL with default extension", () => {
      expect(getEquipmentImageUrl("test-item")).toBe(
        "/images/equipment/test-item.png"
      );
      expect(getEquipmentImageUrl("another-slug")).toBe(
        "/images/equipment/another-slug.png"
      );
    });

    it("uses custom extension when provided", () => {
      expect(getEquipmentImageUrl("test-item", "jpg")).toBe(
        "/images/equipment/test-item.jpg"
      );
      expect(getEquipmentImageUrl("test-item", "svg")).toBe(
        "/images/equipment/test-item.svg"
      );
    });

    it("removes fragment suffix from slug", () => {
      expect(getEquipmentImageUrl("test-item-fragment")).toBe(
        "/images/equipment/test-item.png"
      );
      expect(getEquipmentImageUrl("complex-slug-fragment", "jpg")).toBe(
        "/images/equipment/complex-slug.jpg"
      );
    });

    it("handles slug without fragment", () => {
      expect(getEquipmentImageUrl("normal-slug")).toBe(
        "/images/equipment/normal-slug.png"
      );
      expect(getEquipmentImageUrl("regular-item", "gif")).toBe(
        "/images/equipment/regular-item.gif"
      );
    });

    it("handles empty slug", () => {
      expect(getEquipmentImageUrl("")).toBe("/images/equipment/.png");
      expect(getEquipmentImageUrl("", "jpg")).toBe("/images/equipment/.jpg");
    });

    it("handles slug that is only fragment", () => {
      expect(getEquipmentImageUrl("-fragment")).toBe("/images/equipment/.png");
      expect(getEquipmentImageUrl("-fragment", "svg")).toBe(
        "/images/equipment/.svg"
      );
    });
  });

  describe("getHeroImageUrl", () => {
    it("generates basic image URL with default extension", () => {
      expect(getHeroImageUrl("test-hero")).toBe("/images/heroes/test-hero.png");
      expect(getHeroImageUrl("another-hero")).toBe(
        "/images/heroes/another-hero.png"
      );
    });

    it("uses custom extension when provided", () => {
      expect(getHeroImageUrl("test-hero", "jpg")).toBe(
        "/images/heroes/test-hero.jpg"
      );
      expect(getHeroImageUrl("test-hero", "svg")).toBe(
        "/images/heroes/test-hero.svg"
      );
    });

    it("handles complex hero slugs", () => {
      expect(getHeroImageUrl("dark-star")).toBe("/images/heroes/dark-star.png");
      expect(getHeroImageUrl("judge-of-the-eternal-flame", "jpg")).toBe(
        "/images/heroes/judge-of-the-eternal-flame.jpg"
      );
    });

    it("handles empty slug", () => {
      expect(getHeroImageUrl("")).toBe("/images/heroes/.png");
      expect(getHeroImageUrl("", "jpg")).toBe("/images/heroes/.jpg");
    });

    it("does not remove fragment suffix like equipment function", () => {
      expect(getHeroImageUrl("hero-fragment")).toBe(
        "/images/heroes/hero-fragment.png"
      );
      expect(getHeroImageUrl("test-hero-fragment", "svg")).toBe(
        "/images/heroes/test-hero-fragment.svg"
      );
    });

    it("handles numeric slugs", () => {
      expect(getHeroImageUrl("123")).toBe("/images/heroes/123.png");
      expect(getHeroImageUrl("hero-123", "gif")).toBe(
        "/images/heroes/hero-123.gif"
      );
    });

    it("handles special characters in slug", () => {
      expect(getHeroImageUrl("hero-with-numbers-123")).toBe(
        "/images/heroes/hero-with-numbers-123.png"
      );
      expect(getHeroImageUrl("underscore_hero")).toBe(
        "/images/heroes/underscore_hero.png"
      );
    });
  });

  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
    });

    it("handles conditional classes", () => {
      expect(cn("base", true && "active")).toBe("base active");
      expect(cn("base", false && "hidden")).toBe("base");
    });

    it("handles overlapping Tailwind classes", () => {
      // tailwind-merge should handle conflicting utilities
      expect(cn("p-4", "p-8")).toBe("p-8");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("handles arrays and objects", () => {
      expect(cn(["class1", "class2"])).toBe("class1 class2");
      expect(cn({ active: true, disabled: false })).toBe("active");
    });

    it("handles undefined and null values", () => {
      expect(cn("base", undefined, null, "extra")).toBe("base extra");
      expect(cn()).toBe("");
    });

    it("handles complex combinations", () => {
      const result = cn(
        "base-class",
        ["array-class1", "array-class2"],
        { conditional: true, hidden: false },
        undefined,
        "final-class"
      );
      expect(result).toBe(
        "base-class array-class1 array-class2 conditional final-class"
      );
    });
  });
});
