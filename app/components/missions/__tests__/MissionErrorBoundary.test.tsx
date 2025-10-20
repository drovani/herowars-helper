// ABOUTME: Tests for MissionErrorBoundary component
// ABOUTME: Covers mission-specific error handling and context-aware messages

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import log from "loglevel";
import { MissionErrorBoundary } from "../MissionErrorBoundary";

function ThrowError() {
  throw new Error("Test mission error");
}

describe("MissionErrorBoundary", () => {
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
      <MissionErrorBoundary>
        <div>Mission content</div>
      </MissionErrorBoundary>
    );

    expect(result.getByText("Mission content")).toBeInTheDocument();
  });

  it("should show loading error message", () => {
    const result = render(
      <MissionErrorBoundary operation="loading">
        <ThrowError />
      </MissionErrorBoundary>
    );

    expect(result.getByText("Mission Loading Error")).toBeInTheDocument();
    expect(result.getByText(/error loading mission data/)).toBeInTheDocument();
  });

  it("should show list error message for listing", () => {
    const result = render(
      <MissionErrorBoundary operation="listing">
        <ThrowError />
      </MissionErrorBoundary>
    );

    expect(result.getByText("Mission List Error")).toBeInTheDocument();
    expect(result.getByText(/error loading the mission list/)).toBeInTheDocument();
  });

  it("should include mission identifier in error message when provided", () => {
    const result = render(
      <MissionErrorBoundary operation="loading" identifier="1-1">
        <ThrowError />
      </MissionErrorBoundary>
    );

    expect(result.getByText(/loading mission "1-1"/)).toBeInTheDocument();
  });

  it("should include mission identifier in context logging", () => {
    render(
      <MissionErrorBoundary operation="updating" identifier="2-5">
        <ThrowError />
      </MissionErrorBoundary>
    );

    const errorLogs = capturedLogs.filter((log) => log.level === "error");
    expect(errorLogs[0].message).toContain("MissionErrorBoundary");
    expect(errorLogs[0].message).toContain("2-5");
  });

  it("should show appropriate buttons for mission list", () => {
    const result = render(
      <MissionErrorBoundary operation="listing">
        <ThrowError />
      </MissionErrorBoundary>
    );

    expect(result.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    expect(result.getByRole("button", { name: /Refresh/i })).toBeInTheDocument();
  });
});
