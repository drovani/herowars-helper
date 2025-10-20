// ABOUTME: MissionErrorBoundary handles errors specific to mission management features
// ABOUTME: Provides user-friendly fallback UI for mission/chapter data loading and errors

import { type ReactNode } from "react";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MapIcon } from "lucide-react";

interface MissionErrorBoundaryProps {
  children: ReactNode;
  /** Context for what mission operation failed */
  operation?: "loading" | "creating" | "updating" | "deleting" | "listing";
  /** Specific mission slug or chapter ID if applicable */
  identifier?: string;
}

/**
 * Error boundary specialized for mission and chapter management operations.
 *
 * Handles errors from:
 * - Mission and chapter data loading
 * - Mission form submissions
 * - Mission repository operations
 * - Equipment drop location data
 * - Boss hero relationships
 *
 * Provides context-aware error messages based on operation type.
 *
 * @example
 * ```tsx
 * <MissionErrorBoundary operation="listing">
 *   <MissionList />
 * </MissionErrorBoundary>
 * ```
 */
export function MissionErrorBoundary({
  children,
  operation = "loading",
  identifier,
}: MissionErrorBoundaryProps) {
  const getErrorMessage = () => {
    switch (operation) {
      case "loading":
        return identifier
          ? `There was an error loading mission "${identifier}". The mission data might be unavailable or there may be a network issue.`
          : "There was an error loading mission data. This might be due to a network issue or temporary server problems.";

      case "creating":
        return "Failed to create the mission. Please check your input and try again. If the problem persists, contact support.";

      case "updating":
        return identifier
          ? `Failed to update mission "${identifier}". Your changes were not saved. Please try again.`
          : "Failed to update the mission. Your changes were not saved. Please try again.";

      case "deleting":
        return identifier
          ? `Failed to delete mission "${identifier}". The mission was not removed. Please try again.`
          : "Failed to delete the mission. The mission was not removed. Please try again.";

      case "listing":
        return "There was an error loading the mission list. Some chapters or missions might not be displayed. Please refresh the page or try again later.";

      default:
        return "An unexpected error occurred while working with mission data. Please try again or contact support if the issue persists.";
    }
  };

  const getErrorTitle = () => {
    switch (operation) {
      case "loading":
        return "Mission Loading Error";
      case "creating":
        return "Mission Creation Failed";
      case "updating":
        return "Mission Update Failed";
      case "deleting":
        return "Mission Deletion Failed";
      case "listing":
        return "Mission List Error";
      default:
        return "Mission Error";
    }
  };

  return (
    <ErrorBoundary
      context={`MissionErrorBoundary (${operation}${identifier ? `: ${identifier}` : ""})`}
      errorTitle={getErrorTitle()}
      errorMessage={getErrorMessage()}
      showRetry={true}
      showRefresh={operation === "loading" || operation === "listing"}
      showHome={true}
      fallback={(error, retry) => (
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <MapIcon className="size-5" />
                {getErrorTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <MapIcon className="size-4" />
                <AlertDescription>{getErrorMessage()}</AlertDescription>
              </Alert>

              {import.meta.env.DEV && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  <strong>Error:</strong> {error.message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={retry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Try Again
                </button>
                {(operation === "loading" || operation === "listing") && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border rounded hover:bg-accent"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
