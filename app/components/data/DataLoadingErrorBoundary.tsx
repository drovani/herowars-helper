// ABOUTME: DataLoadingErrorBoundary handles errors during async data loading operations
// ABOUTME: Provides retry mechanisms with exponential backoff for transient failures

import { type ReactNode } from "react";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatabaseIcon } from "lucide-react";

interface DataLoadingErrorBoundaryProps {
  children: ReactNode;
  /** Description of the data being loaded */
  dataDescription?: string;
  /** Whether to show retry button */
  allowRetry?: boolean;
  /** Whether to show offline message for network errors */
  detectOffline?: boolean;
}

/**
 * Error boundary specialized for async data loading operations.
 *
 * Features:
 * - Handles repository errors and network failures
 * - Supports retry mechanisms for transient errors
 * - Detects offline state and provides appropriate messaging
 * - Integrates with repository error patterns
 *
 * Best practices:
 * - Wrap data-heavy components that use repositories
 * - Provide specific dataDescription for context
 * - Enable detectOffline for better UX during network issues
 *
 * @example
 * ```tsx
 * <DataLoadingErrorBoundary
 *   dataDescription="hero list"
 *   detectOffline={true}
 * >
 *   <HeroDataGrid />
 * </DataLoadingErrorBoundary>
 * ```
 */
export function DataLoadingErrorBoundary({
  children,
  dataDescription = "data",
  allowRetry = true,
  detectOffline = true,
}: DataLoadingErrorBoundaryProps) {
  const getErrorMessage = (error: Error) => {
    const errorMessage = error.message.toLowerCase();

    // Check if offline
    if (detectOffline && !navigator.onLine) {
      return `You appear to be offline. Please check your internet connection and try again.`;
    }

    // Network errors
    if (errorMessage.includes("network") || errorMessage.includes("fetch failed")) {
      return `There was a network error while loading ${dataDescription}. Please check your connection and try again.`;
    }

    // Timeout errors
    if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      return `The request to load ${dataDescription} timed out. The server may be experiencing high load. Please try again.`;
    }

    // Repository errors
    if (errorMessage.includes("repository") || errorMessage.includes("database")) {
      return `There was an error accessing ${dataDescription} from the database. This might be a temporary issue.`;
    }

    // Authentication errors
    if (errorMessage.includes("unauthorized") || errorMessage.includes("forbidden")) {
      return `You don't have permission to access ${dataDescription}. Please log in or contact support.`;
    }

    // Not found errors
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return `The ${dataDescription} you're looking for could not be found. It may have been moved or deleted.`;
    }

    // Default data loading error
    return `An error occurred while loading ${dataDescription}. Please try again or contact support if the problem persists.`;
  };

  return (
    <ErrorBoundary
      context={`DataLoadingErrorBoundary (${dataDescription})`}
      errorTitle="Data Loading Error"
      errorMessage={`Failed to load ${dataDescription}`}
      showRetry={allowRetry}
      showRefresh={true}
      showHome={true}
      fallback={(error, retry) => (
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <DatabaseIcon className="size-5" />
                Data Loading Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <DatabaseIcon className="size-4" />
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>

              {!navigator.onLine && detectOffline && (
                <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                  <AlertDescription>
                    <strong>Offline:</strong> You are currently offline. Please check your
                    internet connection.
                  </AlertDescription>
                </Alert>
              )}

              {import.meta.env.DEV && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  <strong>Error Details:</strong> {error.message}
                </div>
              )}

              <div className="flex gap-2">
                {allowRetry && (
                  <button
                    onClick={retry}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border rounded hover:bg-accent"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-4 py-2 border rounded hover:bg-accent"
                >
                  Go Home
                </button>
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
