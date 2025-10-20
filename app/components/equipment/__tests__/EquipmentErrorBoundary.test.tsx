// ABOUTME: Tests for EquipmentErrorBoundary component
// ABOUTME: Covers equipment-specific error handling and context-aware messages

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import log from "loglevel";
import { EquipmentErrorBoundary } from "../EquipmentErrorBoundary";

function ThrowError() {
  throw new Error("Test equipment error");
}

describe("EquipmentErrorBoundary", () => {
  let capturedLogs: Array<{ level: string; message: string; args: any[] }> = [];
  let originalMethodFactory: any;

  beforeEach(() => {
    capturedLogs = [];
    originalMethodFactory = log.methodFactory;
    log.methodFactory = function (methodName, _logLevel, _loggerName) {
      return function (message, ...args) {
        capturedLogs.push({ level: methodName, message, args });
      };
    };
    log.rebuild();
    vi.clearAllMocks();
  });

  afterEach(() => {
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  it("should render children when no error occurs", () => {
    const result = render(
      <EquipmentErrorBoundary>
        <div>Equipment content</div>
      </EquipmentErrorBoundary>
    );

    expect(result.getByText("Equipment content")).toBeInTheDocument();
  });

  it("should show loading error message", () => {
    const result = render(
      <EquipmentErrorBoundary operation="loading">
        <ThrowError />
      </EquipmentErrorBoundary>
    );

    expect(result.getByText("Equipment Loading Error")).toBeInTheDocument();
    expect(result.getByText(/error loading equipment data/)).toBeInTheDocument();
  });

  it("should show catalog error message for listing", () => {
    const result = render(
      <EquipmentErrorBoundary operation="listing">
        <ThrowError />
      </EquipmentErrorBoundary>
    );

    expect(result.getByText("Equipment Catalog Error")).toBeInTheDocument();
    expect(result.getByText(/error loading the equipment catalog/)).toBeInTheDocument();
  });

  it("should include equipment slug in error message when provided", () => {
    const result = render(
      <EquipmentErrorBoundary operation="loading" equipmentSlug="brothers-fragment">
        <ThrowError />
      </EquipmentErrorBoundary>
    );

    expect(result.getByText(/loading equipment "brothers-fragment"/)).toBeInTheDocument();
  });

  it("should include equipment slug in context logging", () => {
    render(
      <EquipmentErrorBoundary operation="updating" equipmentSlug="penetrating-spear">
        <ThrowError />
      </EquipmentErrorBoundary>
    );

    const errorLogs = capturedLogs.filter((log) => log.level === "error");
    expect(errorLogs[0].message).toContain("EquipmentErrorBoundary");
    expect(errorLogs[0].message).toContain("penetrating-spear");
  });

  it("should show appropriate buttons for catalog listing", () => {
    const result = render(
      <EquipmentErrorBoundary operation="listing">
        <ThrowError />
      </EquipmentErrorBoundary>
    );

    expect(result.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    expect(result.getByRole("button", { name: /Refresh/i })).toBeInTheDocument();
  });
});
