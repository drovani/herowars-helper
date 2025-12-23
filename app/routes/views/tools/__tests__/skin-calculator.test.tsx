// ABOUTME: UI component tests for skin calculator page
// ABOUTME: Tests rendering, input handling, clear button, checkbox toggle, and calculations

import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SkinCalculator from "../skin-calculator";

describe("SkinCalculator", () => {
  describe("Component Rendering", () => {
    it("should render page title and description", () => {
      const result = render(<SkinCalculator />);

      expect(result.getByText("Skin Upgrade Calculator")).toBeInTheDocument();
      expect(
        result.getByText(/Calculate how many skin stone chests you need/i)
      ).toBeInTheDocument();
    });

    it("should render all skin type rows in table", () => {
      const result = render(<SkinCalculator />);

      // Check for main skin types
      expect(result.getByText("Default")).toBeInTheDocument();
      expect(result.getByText("Champion")).toBeInTheDocument();
      expect(result.getByText("Winter")).toBeInTheDocument();

      // Check for some "Other" skin types
      expect(result.getByText("Beach")).toBeInTheDocument();
      expect(result.getByText("Stellar")).toBeInTheDocument();
      expect(result.getByText("Masquerade")).toBeInTheDocument();
    });

    it("should render table headers", () => {
      const result = render(<SkinCalculator />);

      expect(result.getByText("Skin")).toBeInTheDocument();
      expect(result.getByText("Level")).toBeInTheDocument();
      expect(result.getByText("Stones")).toBeInTheDocument();
      expect(result.getByText("Small")).toBeInTheDocument();
      expect(result.getByText("Large")).toBeInTheDocument();
    });

    it("should render unlock cost checkbox", () => {
      const result = render(<SkinCalculator />);

      const checkbox = result.getByLabelText(
        /Include unlock cost for "Other" skins/i
      );
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("should render clear button", () => {
      const result = render(<SkinCalculator />);

      const clearButton = result.getByRole("button", { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it("should render how it works section", () => {
      const result = render(<SkinCalculator />);

      expect(result.getByText("How It Works")).toBeInTheDocument();
      expect(
        result.getByText(/Small Skin Stone Chests: 10 stones/i)
      ).toBeInTheDocument();
      expect(
        result.getByText(/Large Skin Stone Chests: 150 stones/i)
      ).toBeInTheDocument();
    });

    it("should render total row", () => {
      const result = render(<SkinCalculator />);

      // Get all cells with "Total" text
      const totalCells = result.getAllByText("Total");
      expect(totalCells.length).toBeGreaterThan(0);
    });
  });

  describe("Input Field Behavior", () => {
    it("should initialize all inputs with value 0", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toHaveValue(0);
      });
    });

    it("should update input value when user types valid number", () => {
      const result = render(<SkinCalculator />);

      // Find the Default skin input
      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0]; // First input is Default

      fireEvent.change(defaultInput, { target: { value: "30" } });
      expect(defaultInput).toHaveValue(30);
    });

    it("should accept empty string input", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0];

      fireEvent.change(defaultInput, { target: { value: "" } });
      expect(defaultInput).toHaveValue(null);
    });

    it("should not accept negative values", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0];

      // Set to 30 first
      fireEvent.change(defaultInput, { target: { value: "30" } });
      expect(defaultInput).toHaveValue(30);

      // Try to set to -5 - should stay at 30
      fireEvent.change(defaultInput, { target: { value: "-5" } });
      expect(defaultInput).toHaveValue(30);
    });

    it("should not accept values greater than 60", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0];

      // Set to 30 first
      fireEvent.change(defaultInput, { target: { value: "30" } });
      expect(defaultInput).toHaveValue(30);

      // Try to set to 100 - should stay at 30
      fireEvent.change(defaultInput, { target: { value: "100" } });
      expect(defaultInput).toHaveValue(30);
    });

    it("should accept valid range values (0-60)", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0];

      // Test boundary values
      fireEvent.change(defaultInput, { target: { value: "0" } });
      expect(defaultInput).toHaveValue(0);

      fireEvent.change(defaultInput, { target: { value: "60" } });
      expect(defaultInput).toHaveValue(60);

      fireEvent.change(defaultInput, { target: { value: "25" } });
      expect(defaultInput).toHaveValue(25);
    });
  });

  describe("Clear Button Functionality", () => {
    it("should reset all inputs to 0 when clear is clicked", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const clearButton = result.getByRole("button", { name: /clear/i });

      // Set some values
      fireEvent.change(inputs[0], { target: { value: "30" } });
      fireEvent.change(inputs[1], { target: { value: "45" } });
      fireEvent.change(inputs[2], { target: { value: "10" } });

      // Click clear
      fireEvent.click(clearButton);

      // All should be reset to 0
      inputs.forEach((input) => {
        expect(input).toHaveValue(0);
      });
    });

    it("should reset totals to 0 when clear is clicked", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const clearButton = result.getByRole("button", { name: /clear/i });

      // Set a value
      fireEvent.change(inputs[0], { target: { value: "30" } });

      // Verify totals are not 0
      const totalRow = result.getByText("Total").closest("tr");
      const totalCells = totalRow?.querySelectorAll("td");
      expect(totalCells?.[2].textContent).not.toBe("0");

      // Click clear
      fireEvent.click(clearButton);

      // Totals should be 0
      const newTotalRow = result.getByText("Total").closest("tr");
      const newTotalCells = newTotalRow?.querySelectorAll("td");
      expect(newTotalCells?.[2].textContent).toBe("0");
    });
  });

  describe("Unlock Cost Checkbox Toggle", () => {
    it("should toggle checkbox state when clicked", () => {
      const result = render(<SkinCalculator />);

      const checkbox = result.getByRole("checkbox", {
        name: /Include unlock cost for "Other" skins/i,
      }) as HTMLInputElement;

      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should not affect calculations for non-zero levels", () => {
      const result = render(<SkinCalculator />);

      // Find Beach skin (an "Other" type) - should be after Default, Champion, and sorted
      const beachRow = result.getByText("Beach").closest("tr");
      const beachInput = beachRow?.querySelector("input") as HTMLInputElement;

      // Set Beach to level 1
      fireEvent.change(beachInput, { target: { value: "1" } });

      // Get the stones value without unlock cost
      const stonesCell = beachRow?.querySelectorAll("td")[2];
      const stonesWithoutUnlock = stonesCell?.textContent;

      // Toggle checkbox
      const checkbox = result.getByLabelText(
        /Include unlock cost for "Other" skins/i
      );
      fireEvent.click(checkbox);

      // Stones should be the same for level 1+ (unlock cost only applies at level 0)
      const newStonesCell = beachRow?.querySelectorAll("td")[2];
      expect(newStonesCell?.textContent).toBe(stonesWithoutUnlock);
    });
  });

  describe("Total Calculations Rendering", () => {
    it("should show 0 totals when no inputs are set", () => {
      const result = render(<SkinCalculator />);

      const totalRow = result.getByText("Total").closest("tr");
      const cells = totalRow?.querySelectorAll("td");

      expect(cells?.[2].textContent).toBe("0"); // Stones
      expect(cells?.[3].textContent).toBe("0"); // Small chests
      expect(cells?.[4].textContent).toBe("0"); // Large chests
    });

    it("should calculate totals correctly for single skin", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0]; // Default skin

      // Set Default to level 1 (should be 30,825 stones from tests)
      fireEvent.change(defaultInput, { target: { value: "1" } });

      const totalRow = result.getByText("Total").closest("tr");
      const cells = totalRow?.querySelectorAll("td");

      // Check totals match expected values
      expect(cells?.[2].textContent).toBe("30,825"); // Stones with locale formatting
      expect(cells?.[3].textContent).toBe("3,083"); // Small chests
      expect(cells?.[4].textContent).toBe("206"); // Large chests
    });

    it("should calculate totals correctly for multiple skins", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");

      // Set Default to level 1 (30,825 stones)
      fireEvent.change(inputs[0], { target: { value: "1" } });

      // Set Champion to level 1 (54,330 stones)
      fireEvent.change(inputs[1], { target: { value: "1" } });

      // Total should be 30,825 + 54,330 = 85,155 stones
      const totalRow = result.getByText("Total").closest("tr");
      const cells = totalRow?.querySelectorAll("td");

      expect(cells?.[2].textContent).toBe("85,155");
      // Small: ceil(85155 / 10) = 8516
      expect(cells?.[3].textContent).toBe("8,516");
      // Large: ceil(85155 / 150) = 567.7 -> 568, but actually 569 due to rounding per skin
      expect(cells?.[4].textContent).toBe("569");
    });

    it("should update totals when inputs change", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0];

      // Set to level 1
      fireEvent.change(defaultInput, { target: { value: "1" } });

      let totalRow = result.getByText("Total").closest("tr");
      let cells = totalRow?.querySelectorAll("td");
      const initialStones = cells?.[2].textContent;

      // Change to level 30
      fireEvent.change(defaultInput, { target: { value: "30" } });

      totalRow = result.getByText("Total").closest("tr");
      cells = totalRow?.querySelectorAll("td");
      const updatedStones = cells?.[2].textContent;

      // Should be different
      expect(updatedStones).not.toBe(initialStones);
    });

    it("should ignore empty string inputs in totals", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");

      // Set Default to level 1
      fireEvent.change(inputs[0], { target: { value: "1" } });

      // Set Champion to empty string
      fireEvent.change(inputs[1], { target: { value: "" } });

      // Total should only include Default
      const totalRow = result.getByText("Total").closest("tr");
      const cells = totalRow?.querySelectorAll("td");

      expect(cells?.[2].textContent).toBe("30,825");
    });
  });

  describe("State Management", () => {
    it("should maintain independent state for each skin input", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");

      // Set different values for different skins
      fireEvent.change(inputs[0], { target: { value: "10" } });
      fireEvent.change(inputs[1], { target: { value: "20" } });
      fireEvent.change(inputs[2], { target: { value: "30" } });

      // Verify each maintains its own value
      expect(inputs[0]).toHaveValue(10);
      expect(inputs[1]).toHaveValue(20);
      expect(inputs[2]).toHaveValue(30);
    });

    it("should preserve checkbox state during input changes", () => {
      const result = render(<SkinCalculator />);

      const checkbox = result.getByRole("checkbox", {
        name: /Include unlock cost for "Other" skins/i,
      }) as HTMLInputElement;
      const inputs = result.getAllByRole("spinbutton");

      // Toggle checkbox
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      // Change input values
      fireEvent.change(inputs[0], { target: { value: "25" } });

      // Checkbox should still be checked
      expect(checkbox).toBeChecked();
    });
  });

  describe("Calculation Display", () => {
    it("should display calculations for each row", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");
      const defaultInput = inputs[0];

      // Set Default to level 1
      fireEvent.change(defaultInput, { target: { value: "1" } });

      // Find Default row
      const defaultRow = result.getByText("Default").closest("tr");
      const cells = defaultRow?.querySelectorAll("td");

      // Check that stones, small chests, and large chests are displayed
      expect(cells?.[2].textContent).toBe("30,825");
      expect(cells?.[3].textContent).toBe("3,083");
      expect(cells?.[4].textContent).toBe("206");
    });

    it("should show 0 for rows with no level set", () => {
      const result = render(<SkinCalculator />);

      // Default row should show 0s since level is 0
      const defaultRow = result.getByText("Default").closest("tr");
      const cells = defaultRow?.querySelectorAll("td");

      expect(cells?.[2].textContent).toBe("0");
      expect(cells?.[3].textContent).toBe("0");
      expect(cells?.[4].textContent).toBe("0");
    });

    it("should format numbers with locale formatting", () => {
      const result = render(<SkinCalculator />);

      const inputs = result.getAllByRole("spinbutton");

      // Set Champion to level 1 (54,330 stones)
      fireEvent.change(inputs[1], { target: { value: "1" } });

      const championRow = result.getByText("Champion").closest("tr");
      const cells = championRow?.querySelectorAll("td");

      // Should have comma formatting
      expect(cells?.[2].textContent).toContain(",");
      expect(cells?.[2].textContent).toBe("54,330");
    });
  });
});
