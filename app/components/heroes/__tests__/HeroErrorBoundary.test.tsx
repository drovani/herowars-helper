// ABOUTME: Tests for HeroErrorBoundary component
// ABOUTME: Covers hero-specific error handling and context-aware messages

import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import log from "loglevel";
import { HeroErrorBoundary } from "../HeroErrorBoundary";

function ThrowError() {
  throw new Error("Test hero error");
  // eslint-disable-next-line no-unreachable
  return null;
}

describe("HeroErrorBoundary", () => {
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

  describe("Normal rendering", () => {
    it("should render children when no error occurs", () => {
      const result = render(
        <HeroErrorBoundary>
          <div>Hero content</div>
        </HeroErrorBoundary>
      );

      expect(result.getByText("Hero content")).toBeInTheDocument();
    });
  });

  describe("Operation-specific error messages", () => {
    it("should show loading error message", () => {
      const result = render(
        <HeroErrorBoundary operation="loading">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByText("Hero Loading Error")).toBeInTheDocument();
      expect(result.getByText(/error loading hero data/)).toBeInTheDocument();
    });

    it("should show creating error message", () => {
      const result = render(
        <HeroErrorBoundary operation="creating">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByText("Hero Creation Failed")).toBeInTheDocument();
      expect(result.getByText(/Failed to create the hero/)).toBeInTheDocument();
    });

    it("should show updating error message", () => {
      const result = render(
        <HeroErrorBoundary operation="updating">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByText("Hero Update Failed")).toBeInTheDocument();
      expect(result.getByText(/Failed to update/)).toBeInTheDocument();
    });

    it("should show deleting error message", () => {
      const result = render(
        <HeroErrorBoundary operation="deleting">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByText("Hero Deletion Failed")).toBeInTheDocument();
      expect(result.getByText(/Failed to delete/)).toBeInTheDocument();
    });

    it("should show listing error message", () => {
      const result = render(
        <HeroErrorBoundary operation="listing">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByText("Hero List Error")).toBeInTheDocument();
      expect(result.getByText(/error loading the hero list/)).toBeInTheDocument();
    });
  });

  describe("Hero-specific context", () => {
    it("should include hero slug in error message when provided", () => {
      const result = render(
        <HeroErrorBoundary operation="loading" heroSlug="astaroth">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByText(/loading hero "astaroth"/)).toBeInTheDocument();
    });

    it("should include hero slug in context logging", () => {
      render(
        <HeroErrorBoundary operation="updating" heroSlug="galahad">
          <ThrowError />
        </HeroErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs[0].message).toContain("HeroErrorBoundary");
      expect(errorLogs[0].message).toContain("updating");
      expect(errorLogs[0].message).toContain("galahad");
    });
  });

  describe("Action buttons", () => {
    it("should show try again button for all operations", () => {
      const result = render(
        <HeroErrorBoundary operation="loading">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    });

    it("should show refresh button for loading operation", () => {
      const result = render(
        <HeroErrorBoundary operation="loading">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Refresh/i })).toBeInTheDocument();
    });

    it("should show refresh button for listing operation", () => {
      const result = render(
        <HeroErrorBoundary operation="listing">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.getByRole("button", { name: /Refresh/i })).toBeInTheDocument();
    });

    it("should not show refresh button for creating operation", () => {
      const result = render(
        <HeroErrorBoundary operation="creating">
          <ThrowError />
        </HeroErrorBoundary>
      );

      expect(result.queryByRole("button", { name: /Refresh/i })).not.toBeInTheDocument();
    });
  });
});
