// ABOUTME: Tests for FormErrorBoundary component
// ABOUTME: Covers form submission errors, state preservation, and validation errors

import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import log from "loglevel";
import { FormErrorBoundary } from "../FormErrorBoundary";

function ThrowFormError({ errorType }: { errorType?: string }) {
  if (errorType === "validation") {
    throw new Error("Validation failed for email field");
  }
  if (errorType === "network") {
    throw new Error("Network error during form submission");
  }
  if (errorType === "server") {
    throw new Error("Server error 500 - internal server error");
  }
  throw new Error("Generic form error");
  // eslint-disable-next-line no-unreachable
  return null;
}

describe("FormErrorBoundary", () => {
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
      <FormErrorBoundary>
        <form>Form content</form>
      </FormErrorBoundary>
    );

    expect(result.getByText("Form content")).toBeInTheDocument();
  });

  describe("Error-specific messages", () => {
    it("should show validation error message", () => {
      const result = render(
        <FormErrorBoundary formName="User Registration">
          <ThrowFormError errorType="validation" />
        </FormErrorBoundary>
      );

      expect(result.getByText(/validation error/)).toBeInTheDocument();
      expect(result.getByText("User Registration Submission Failed")).toBeInTheDocument();
    });

    it("should show network error message", () => {
      const result = render(
        <FormErrorBoundary>
          <ThrowFormError errorType="network" />
        </FormErrorBoundary>
      );

      expect(result.getByText(/network error/)).toBeInTheDocument();
      expect(result.getByText(/There was a network error while submitting/)).toBeInTheDocument();
    });

    it("should show server error message", () => {
      const result = render(
        <FormErrorBoundary>
          <ThrowFormError errorType="server" />
        </FormErrorBoundary>
      );

      expect(result.getByText(/server encountered an error/)).toBeInTheDocument();
    });
  });

  describe("State preservation", () => {
    it("should inform user that data is preserved", () => {
      const result = render(
        <FormErrorBoundary>
          <ThrowFormError errorType="network" />
        </FormErrorBoundary>
      );

      expect(result.getByText(/form data has been preserved/)).toBeInTheDocument();
    });

    it("should call onError callback when error occurs", () => {
      const onError = vi.fn();

      render(
        <FormErrorBoundary onError={onError}>
          <ThrowFormError />
        </FormErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });
  });

  describe("Action buttons", () => {
    it("should show try again button", () => {
      const result = render(
        <FormErrorBoundary>
          <ThrowFormError />
        </FormErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    });

    it("should show go back button", () => {
      const result = render(
        <FormErrorBoundary>
          <ThrowFormError />
        </FormErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Go Back/i })).toBeInTheDocument();
    });

    it("should not show refresh or home buttons to preserve form state", () => {
      const result = render(
        <FormErrorBoundary>
          <ThrowFormError />
        </FormErrorBoundary>
      );

      // These should not be shown to avoid losing form data
      expect(result.queryByRole("button", { name: /Refresh/i })).not.toBeInTheDocument();
      expect(result.queryByRole("button", { name: /Home/i })).not.toBeInTheDocument();
    });
  });

  describe("Form context", () => {
    it("should include form name in error title", () => {
      const result = render(
        <FormErrorBoundary formName="Hero Creation">
          <ThrowFormError />
        </FormErrorBoundary>
      );

      expect(result.getByText("Hero Creation Submission Failed")).toBeInTheDocument();
    });

    it("should include form name in context logging", () => {
      render(
        <FormErrorBoundary formName="Equipment Update">
          <ThrowFormError />
        </FormErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs[0].message).toContain("FormErrorBoundary");
      expect(errorLogs[0].message).toContain("Equipment Update");
    });
  });
});
