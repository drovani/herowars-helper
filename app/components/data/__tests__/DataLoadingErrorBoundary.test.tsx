// ABOUTME: Tests for DataLoadingErrorBoundary component
// ABOUTME: Covers data loading errors, network detection, and retry mechanisms

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import log from "loglevel";
import { DataLoadingErrorBoundary } from "../DataLoadingErrorBoundary";

function ThrowDataError({ errorType }: { errorType?: string }) {
  if (errorType === "network") {
    throw new Error("Network fetch failed");
  }
  if (errorType === "timeout") {
    throw new Error("Request timed out after 30 seconds");
  }
  if (errorType === "repository") {
    throw new Error("Repository query failed - database connection error");
  }
  if (errorType === "unauthorized") {
    throw new Error("Unauthorized access to resource");
  }
  if (errorType === "notfound") {
    throw new Error("Resource not found - 404");
  }
  throw new Error("Generic data loading error");
  // eslint-disable-next-line no-unreachable
  return null;
}

describe("DataLoadingErrorBoundary", () => {
  let capturedLogs: Array<{ level: string; message: string; args: any[] }> = [];
  let originalMethodFactory: any;
  let originalOnLine: boolean;

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

    // Store original navigator.onLine
    originalOnLine = navigator.onLine;
  });

  afterEach(() => {
    log.methodFactory = originalMethodFactory;
    log.rebuild();

    // Restore navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: originalOnLine,
    });
  });

  it("should render children when no error occurs", () => {
    const result = render(
      <DataLoadingErrorBoundary>
        <div>Data content</div>
      </DataLoadingErrorBoundary>
    );

    expect(result.getByText("Data content")).toBeInTheDocument();
  });

  describe("Error-specific messages", () => {
    it("should show network error message", () => {
      const result = render(
        <DataLoadingErrorBoundary dataDescription="hero list">
          <ThrowDataError errorType="network" />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/network error while loading hero list/)).toBeInTheDocument();
    });

    it("should show timeout error message", () => {
      const result = render(
        <DataLoadingErrorBoundary dataDescription="equipment catalog">
          <ThrowDataError errorType="timeout" />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/request to load equipment catalog timed out/)).toBeInTheDocument();
    });

    it("should show repository error message", () => {
      const result = render(
        <DataLoadingErrorBoundary>
          <ThrowDataError errorType="repository" />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/error accessing data from the database/)).toBeInTheDocument();
    });

    it("should show unauthorized error message", () => {
      const result = render(
        <DataLoadingErrorBoundary dataDescription="admin settings">
          <ThrowDataError errorType="unauthorized" />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/don't have permission to access admin settings/)).toBeInTheDocument();
    });

    it("should show not found error message", () => {
      const result = render(
        <DataLoadingErrorBoundary dataDescription="hero details">
          <ThrowDataError errorType="notfound" />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/hero details you're looking for could not be found/)).toBeInTheDocument();
    });
  });

  describe("Offline detection", () => {
    it("should show offline message when navigator.onLine is false", () => {
      // Mock offline state
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      const result = render(
        <DataLoadingErrorBoundary detectOffline={true}>
          <ThrowDataError errorType="network" />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/You appear to be offline/)).toBeInTheDocument();
      expect(result.getByText(/Offline:/)).toBeInTheDocument();
    });

    it("should not show offline message when online", () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: true,
      });

      const result = render(
        <DataLoadingErrorBoundary detectOffline={true}>
          <ThrowDataError errorType="network" />
        </DataLoadingErrorBoundary>
      );

      expect(result.queryByText(/Offline:/)).not.toBeInTheDocument();
    });
  });

  describe("Action buttons", () => {
    it("should show try again button when allowRetry is true", () => {
      const result = render(
        <DataLoadingErrorBoundary allowRetry={true}>
          <ThrowDataError />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    });

    it("should not show try again button when allowRetry is false", () => {
      const result = render(
        <DataLoadingErrorBoundary allowRetry={false}>
          <ThrowDataError />
        </DataLoadingErrorBoundary>
      );

      expect(result.queryByRole("button", { name: /Try Again/i })).not.toBeInTheDocument();
    });

    it("should show refresh and home buttons", () => {
      const result = render(
        <DataLoadingErrorBoundary>
          <ThrowDataError />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Refresh Page/i })).toBeInTheDocument();
      expect(result.getByRole("button", { name: /Go Home/i })).toBeInTheDocument();
    });
  });

  describe("Data context", () => {
    it("should include data description in error message", () => {
      const result = render(
        <DataLoadingErrorBoundary dataDescription="mission list">
          <ThrowDataError />
        </DataLoadingErrorBoundary>
      );

      expect(result.getByText(/loading mission list/)).toBeInTheDocument();
    });

    it("should include data description in context logging", () => {
      render(
        <DataLoadingErrorBoundary dataDescription="player roster">
          <ThrowDataError />
        </DataLoadingErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs[0].message).toContain("DataLoadingErrorBoundary");
      expect(errorLogs[0].message).toContain("player roster");
    });
  });
});
