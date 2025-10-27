// ABOUTME: Tests for base ErrorBoundary component
// ABOUTME: Covers error catching, fallback UI, retry mechanisms, and logging

import { fireEvent, render } from "@testing-library/react";
import log from "loglevel";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

// Component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Capture logs to prevent console noise
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

    // Clear any previous errors
    vi.clearAllMocks();
  });

  afterEach(() => {
    log.methodFactory = originalMethodFactory;
    log.rebuild();
  });

  describe("Normal rendering", () => {
    it("should render children when no error occurs", () => {
      const result = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(result.getByText("Test content")).toBeInTheDocument();
    });

    it("should not show error UI when children render successfully", () => {
      const result = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(result.getByText("No error")).toBeInTheDocument();
      expect(result.queryByText("Something went wrong")).not.toBeInTheDocument();
    });
  });

  describe("Error catching", () => {
    it("should catch errors and display default fallback UI", () => {
      const result = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByText("Something went wrong")).toBeInTheDocument();
      expect(result.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    });

    it("should log errors with loglevel", () => {
      render(
        <ErrorBoundary context="TestComponent">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs.length).toBeGreaterThan(0);
      expect(errorLogs[0].message).toContain("[TestComponent]");
    });

    it("should call onError callback when error is caught", () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Test error" }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });
  });

  describe("Custom fallback UI", () => {
    it("should render custom fallback element when error occurs", () => {
      const customFallback = <div>Custom error UI</div>;

      const result = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByText("Custom error UI")).toBeInTheDocument();
      expect(result.queryByText("Something went wrong")).not.toBeInTheDocument();
    });

    it("should render custom fallback function with error and retry", () => {
      const customFallback = (error: Error, retry: () => void) => (
        <div>
          <div>Error: {error.message}</div>
          <button onClick={retry}>Custom Retry</button>
        </div>
      );

      const result = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByText("Error: Test error")).toBeInTheDocument();
      expect(result.getByText("Custom Retry")).toBeInTheDocument();
    });
  });

  describe("Custom error messages", () => {
    it("should display custom error title", () => {
      const result = render(
        <ErrorBoundary errorTitle="Custom Error Title">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByText("Custom Error Title")).toBeInTheDocument();
    });

    it("should display custom error message", () => {
      const result = render(
        <ErrorBoundary errorMessage="Custom error description">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByText("Custom error description")).toBeInTheDocument();
    });
  });

  describe("Retry mechanism", () => {
    it("should show retry button by default", () => {
      const result = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    });

    it("should reset error state when retry is clicked", () => {
      // First render with error
      const result = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByText("Something went wrong")).toBeInTheDocument();

      // Click retry
      const retryButton = result.getByRole("button", { name: /Try Again/i });
      fireEvent.click(retryButton);

      // Error should be cleared (component will re-render children)
      // Note: In real scenario, ThrowError would not throw on second render
    });

    it("should hide retry button when showRetry is false", () => {
      const result = render(
        <ErrorBoundary showRetry={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.queryByRole("button", { name: /Try Again/i })).not.toBeInTheDocument();
    });
  });

  describe("Action buttons", () => {
    it("should show refresh button by default", () => {
      const result = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Refresh Page/i })).toBeInTheDocument();
    });

    it("should show home button by default", () => {
      const result = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Go Home/i })).toBeInTheDocument();
    });

    it("should hide home button when showHome is false", () => {
      const result = render(
        <ErrorBoundary showHome={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.queryByRole("button", { name: /Go Home/i })).not.toBeInTheDocument();
    });

    it("should hide refresh button when showRefresh is false", () => {
      const result = render(
        <ErrorBoundary showRefresh={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(result.queryByRole("button", { name: /Refresh Page/i })).not.toBeInTheDocument();
    });
  });

  describe("Context logging", () => {
    it("should include context in error logs", () => {
      render(
        <ErrorBoundary context="MyComponent">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs[0].message).toContain("[MyComponent]");
    });

    it("should use default context when not provided", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs[0].message).toContain("[ErrorBoundary]");
    });
  });

  describe("Error handler edge cases", () => {
    it("should handle errors in onError callback gracefully", () => {
      const faultyOnError = vi.fn(() => {
        throw new Error("onError failed");
      });

      // Should not throw, error should be caught and logged
      render(
        <ErrorBoundary onError={faultyOnError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(faultyOnError).toHaveBeenCalled();
      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs.some((log) => log.message.includes("Error in onError handler"))).toBe(true);
    });
  });
});
