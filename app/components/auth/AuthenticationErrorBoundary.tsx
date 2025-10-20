// ABOUTME: AuthenticationErrorBoundary handles authentication-specific errors
// ABOUTME: Provides user-friendly messages for auth failures with appropriate recovery actions

import { type ReactNode } from "react";
import { ErrorBoundary, type ErrorBoundaryProps } from "~/components/ErrorBoundary";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ShieldAlertIcon, LogInIcon, HomeIcon } from "lucide-react";

interface AuthenticationErrorBoundaryProps {
  children: ReactNode;
  /** Required role(s) for this protected area */
  requiredRoles?: string[];
}

/**
 * Error boundary specialized for authentication and authorization errors.
 *
 * Handles:
 * - Authentication token expiration
 * - Permission/role verification failures
 * - Session errors
 * - Auth context initialization failures
 *
 * Provides user-friendly messages with appropriate actions:
 * - Re-login for expired sessions
 * - Contact admin for permission issues
 * - Return home for general auth errors
 *
 * @example
 * ```tsx
 * <AuthenticationErrorBoundary requiredRoles={["admin"]}>
 *   <AdminDashboard />
 * </AuthenticationErrorBoundary>
 * ```
 */
export function AuthenticationErrorBoundary({
  children,
  requiredRoles = [],
}: AuthenticationErrorBoundaryProps) {
  const handleAuthError = (error: Error) => {
    // Determine error type and provide appropriate messaging
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("token") ||
      errorMessage.includes("expired") ||
      errorMessage.includes("unauthorized")
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlertIcon className="size-5" />
                Session Expired
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <ShieldAlertIcon className="size-4" />
                <AlertDescription>
                  Your session has expired or your authentication token is invalid.
                  Please log in again to continue.
                </AlertDescription>
              </Alert>

              {import.meta.env.DEV && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  <strong>Error:</strong> {error.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => (window.location.href = "/login")}
                  className="flex items-center gap-2 flex-1"
                >
                  <LogInIcon className="size-4" />
                  Log In Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex items-center gap-2"
                >
                  <HomeIcon className="size-4" />
                  Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (
      errorMessage.includes("permission") ||
      errorMessage.includes("role") ||
      errorMessage.includes("forbidden")
    ) {
      const roleText = requiredRoles.length > 0
        ? `Required role: ${requiredRoles.join(" or ")}`
        : "Insufficient permissions";

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <ShieldAlertIcon className="size-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <ShieldAlertIcon className="size-4" />
                <AlertDescription>
                  You don't have permission to access this area. {roleText}
                </AlertDescription>
              </Alert>

              {import.meta.env.DEV && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  <strong>Error:</strong> {error.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Go Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="flex items-center gap-2 flex-1"
                >
                  <HomeIcon className="size-4" />
                  Home
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                If you believe this is an error, please contact your administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Default auth error (use base ErrorBoundary fallback)
    return null;
  };

  const errorBoundaryProps: ErrorBoundaryProps = {
    children,
    context: `AuthenticationErrorBoundary${requiredRoles.length > 0 ? ` (${requiredRoles.join(", ")})` : ""}`,
    fallback: (error: Error) => handleAuthError(error),
    errorTitle: "Authentication Error",
    errorMessage: "There was an error with authentication. Please try logging in again or contact support.",
    showRetry: false, // Auth errors typically can't be retried without re-login
    showRefresh: false, // Refresh won't help auth errors
    showHome: true,
  };

  return <ErrorBoundary {...errorBoundaryProps} />;
}
