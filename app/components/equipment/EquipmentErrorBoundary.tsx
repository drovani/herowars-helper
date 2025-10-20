// ABOUTME: EquipmentErrorBoundary handles errors specific to equipment management features
// ABOUTME: Provides user-friendly fallback UI for equipment data loading and form errors

import { type ReactNode } from "react";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ShieldIcon } from "lucide-react";

interface EquipmentErrorBoundaryProps {
  children: ReactNode;
  /** Context for what equipment operation failed */
  operation?: "loading" | "creating" | "updating" | "deleting" | "listing";
  /** Specific equipment slug if applicable */
  equipmentSlug?: string;
}

/**
 * Error boundary specialized for equipment management operations.
 *
 * Handles errors from:
 * - Equipment catalog loading
 * - Equipment form submissions
 * - Equipment repository operations
 * - Equipment crafting recipes and sources
 *
 * Provides context-aware error messages based on operation type.
 *
 * @example
 * ```tsx
 * <EquipmentErrorBoundary operation="listing">
 *   <EquipmentCatalog />
 * </EquipmentErrorBoundary>
 * ```
 */
export function EquipmentErrorBoundary({
  children,
  operation = "loading",
  equipmentSlug,
}: EquipmentErrorBoundaryProps) {
  const getErrorMessage = () => {
    switch (operation) {
      case "loading":
        return equipmentSlug
          ? `There was an error loading equipment "${equipmentSlug}". The equipment data might be unavailable or there may be a network issue.`
          : "There was an error loading equipment data. This might be due to a network issue or temporary server problems.";

      case "creating":
        return "Failed to create the equipment item. Please check your input and try again. If the problem persists, contact support.";

      case "updating":
        return equipmentSlug
          ? `Failed to update equipment "${equipmentSlug}". Your changes were not saved. Please try again.`
          : "Failed to update the equipment item. Your changes were not saved. Please try again.";

      case "deleting":
        return equipmentSlug
          ? `Failed to delete equipment "${equipmentSlug}". The item was not removed. Please try again.`
          : "Failed to delete the equipment item. The item was not removed. Please try again.";

      case "listing":
        return "There was an error loading the equipment catalog. Some items might not be displayed. Please refresh the page or try again later.";

      default:
        return "An unexpected error occurred while working with equipment data. Please try again or contact support if the issue persists.";
    }
  };

  const getErrorTitle = () => {
    switch (operation) {
      case "loading":
        return "Equipment Loading Error";
      case "creating":
        return "Equipment Creation Failed";
      case "updating":
        return "Equipment Update Failed";
      case "deleting":
        return "Equipment Deletion Failed";
      case "listing":
        return "Equipment Catalog Error";
      default:
        return "Equipment Error";
    }
  };

  return (
    <ErrorBoundary
      context={`EquipmentErrorBoundary (${operation}${equipmentSlug ? `: ${equipmentSlug}` : ""})`}
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
                <ShieldIcon className="size-5" />
                {getErrorTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <ShieldIcon className="size-4" />
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
