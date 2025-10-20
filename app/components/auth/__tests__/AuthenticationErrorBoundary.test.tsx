// ABOUTME: Tests for AuthenticationErrorBoundary component
// ABOUTME: Covers auth-specific error handling, session expiration, and permission errors

import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import log from "loglevel";
import { AuthenticationErrorBoundary } from "../AuthenticationErrorBoundary";

// Component that throws different types of auth errors
function ThrowAuthError({ errorType }: { errorType?: string }) {
  if (errorType === "token") {
    throw new Error("Authentication token expired");
  }
  if (errorType === "unauthorized") {
    throw new Error("Unauthorized access - invalid token");
  }
  if (errorType === "permission") {
    throw new Error("Permission denied - insufficient privileges");
  }
  if (errorType === "role") {
    throw new Error("Role verification failed");
  }
  if (errorType === "forbidden") {
    throw new Error("Forbidden - access not allowed");
  }
  if (errorType === "generic") {
    throw new Error("Generic authentication error");
  }
  return <div>Authenticated content</div>;
}

describe("AuthenticationErrorBoundary", () => {
  // Capture logs
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
        <AuthenticationErrorBoundary>
          <div>Protected content</div>
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText("Protected content")).toBeInTheDocument();
    });
  });

  describe("Session expiration errors", () => {
    it("should show session expired UI for token errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="token" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText("Session Expired")).toBeInTheDocument();
      expect(result.getByText(/Your session has expired/)).toBeInTheDocument();
      expect(result.getByRole("button", { name: /Log In Again/i })).toBeInTheDocument();
    });

    it("should show session expired UI for unauthorized errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="unauthorized" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText("Session Expired")).toBeInTheDocument();
      expect(result.getByText(/authentication token is invalid/)).toBeInTheDocument();
    });

    it("should provide login button that redirects to /login", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="token" />
        </AuthenticationErrorBoundary>
      );

      const loginButton = result.getByRole("button", { name: /Log In Again/i });
      expect(loginButton).toBeInTheDocument();

      // Note: Actual redirect testing requires more sophisticated mocking
    });

    it("should provide home button for session errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="token" />
        </AuthenticationErrorBoundary>
      );

      const homeButton = result.getByRole("button", { name: /Home/i });
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe("Permission/role errors", () => {
    it("should show access denied UI for permission errors", () => {
      const result = render(
        <AuthenticationErrorBoundary requiredRoles={["admin"]}>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText("Access Denied")).toBeInTheDocument();
      expect(result.getByText(/don't have permission/)).toBeInTheDocument();
      expect(result.getByText(/Required role: admin/)).toBeInTheDocument();
    });

    it("should show access denied UI for role errors", () => {
      const result = render(
        <AuthenticationErrorBoundary requiredRoles={["editor", "admin"]}>
          <ThrowAuthError errorType="role" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText("Access Denied")).toBeInTheDocument();
      expect(result.getByText(/Required role: editor or admin/)).toBeInTheDocument();
    });

    it("should show access denied UI for forbidden errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="forbidden" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText("Access Denied")).toBeInTheDocument();
      expect(result.getByText(/Insufficient permissions/)).toBeInTheDocument();
    });

    it("should provide go back button for permission errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      const backButton = result.getByRole("button", { name: /Go Back/i });
      expect(backButton).toBeInTheDocument();
    });

    it("should show contact admin message for permission errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText(/contact your administrator/)).toBeInTheDocument();
    });
  });

  describe("Required roles display", () => {
    it("should display single required role", () => {
      const result = render(
        <AuthenticationErrorBoundary requiredRoles={["admin"]}>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText(/Required role: admin/)).toBeInTheDocument();
    });

    it("should display multiple required roles", () => {
      const result = render(
        <AuthenticationErrorBoundary requiredRoles={["admin", "editor", "moderator"]}>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText(/Required role: admin or editor or moderator/)).toBeInTheDocument();
    });

    it("should show insufficient permissions when no specific roles provided", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      expect(result.getByText(/Insufficient permissions/)).toBeInTheDocument();
    });
  });

  describe("Generic auth errors", () => {
    it("should fall back to base ErrorBoundary for generic errors", () => {
      const result = render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="generic" />
        </AuthenticationErrorBoundary>
      );

      // Should use base ErrorBoundary's default fallback
      expect(result.getByText("Authentication Error")).toBeInTheDocument();
    });
  });

  describe("Context logging", () => {
    it("should log errors with AuthenticationErrorBoundary context", () => {
      render(
        <AuthenticationErrorBoundary>
          <ThrowAuthError errorType="token" />
        </AuthenticationErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs.length).toBeGreaterThan(0);
      expect(errorLogs[0].message).toContain("[AuthenticationErrorBoundary]");
    });

    it("should include required roles in context", () => {
      render(
        <AuthenticationErrorBoundary requiredRoles={["admin", "editor"]}>
          <ThrowAuthError errorType="permission" />
        </AuthenticationErrorBoundary>
      );

      const errorLogs = capturedLogs.filter((log) => log.level === "error");
      expect(errorLogs[0].message).toContain("admin, editor");
    });
  });
});
