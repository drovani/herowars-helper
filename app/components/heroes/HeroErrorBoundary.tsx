// ABOUTME: HeroErrorBoundary handles errors specific to hero management features
// ABOUTME: Provides user-friendly fallback UI for hero data loading and form errors

import { type ReactNode } from "react";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UsersRoundIcon } from "lucide-react";

interface HeroErrorBoundaryProps {
  children: ReactNode;
  /** Context for what hero operation failed */
  operation?: "loading" | "creating" | "updating" | "deleting" | "listing";
  /** Specific hero slug if applicable */
  heroSlug?: string;
}

/**
 * Error boundary specialized for hero management operations.
 *
 * Handles errors from:
 * - Hero data loading and queries
 * - Hero form submissions
 * - Hero repository operations
 * - Hero relationship data (artifacts, equipment, skills)
 *
 * Provides context-aware error messages based on operation type.
 *
 * @example
 * ```tsx
 * <HeroErrorBoundary operation="loading">
 *   <HeroList />
 * </HeroErrorBoundary>
 * ```
 */
export function HeroErrorBoundary({
  children,
  operation = "loading",
  heroSlug,
}: HeroErrorBoundaryProps) {
  const getErrorMessage = () => {
    switch (operation) {
      case "loading":
        return heroSlug
          ? `There was an error loading hero "${heroSlug}". This might be due to a network issue or the hero data might be unavailable.`
          : "There was an error loading hero data. This might be due to a network issue or temporary server problems.";

      case "creating":
        return "Failed to create the hero. Please check your input and try again. If the problem persists, contact support.";

      case "updating":
        return heroSlug
          ? `Failed to update hero "${heroSlug}". Your changes were not saved. Please try again.`
          : "Failed to update the hero. Your changes were not saved. Please try again.";

      case "deleting":
        return heroSlug
          ? `Failed to delete hero "${heroSlug}". The hero was not removed. Please try again.`
          : "Failed to delete the hero. The hero was not removed. Please try again.";

      case "listing":
        return "There was an error loading the hero list. Some heroes might not be displayed. Please refresh the page or try again later.";

      default:
        return "An unexpected error occurred while working with hero data. Please try again or contact support if the issue persists.";
    }
  };

  const getErrorTitle = () => {
    switch (operation) {
      case "loading":
        return "Hero Loading Error";
      case "creating":
        return "Hero Creation Failed";
      case "updating":
        return "Hero Update Failed";
      case "deleting":
        return "Hero Deletion Failed";
      case "listing":
        return "Hero List Error";
      default:
        return "Hero Error";
    }
  };

  return (
    <ErrorBoundary
      context={`HeroErrorBoundary (${operation}${heroSlug ? `: ${heroSlug}` : ""})`}
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
                <UsersRoundIcon className="size-5" />
                {getErrorTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <UsersRoundIcon className="size-4" />
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
