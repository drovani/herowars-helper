// ABOUTME: FormErrorBoundary handles errors during form submissions with state preservation
// ABOUTME: Provides user-friendly fallback UI that preserves user input and offers retry

import { type ReactNode } from "react";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FileWarningIcon } from "lucide-react";

interface FormErrorBoundaryProps {
  children: ReactNode;
  /** Name of the form for context */
  formName?: string;
  /** Callback to preserve form state on error */
  onError?: (error: Error) => void;
}

/**
 * Error boundary specialized for form submission errors.
 *
 * Features:
 * - Preserves user input during error recovery
 * - Handles validation errors and network failures
 * - Provides clear guidance for form error resolution
 * - Supports form state restoration after error
 *
 * Best practices:
 * - Wrap individual forms, not entire form pages
 * - Use onError callback to save form state
 * - Provide specific formName for better error context
 *
 * @example
 * ```tsx
 * <FormErrorBoundary
 *   formName="Hero Creation"
 *   onError={(error) => saveFormDraft()}
 * >
 *   <HeroForm />
 * </FormErrorBoundary>
 * ```
 */
export function FormErrorBoundary({
  children,
  formName = "Form",
  onError,
}: FormErrorBoundaryProps) {
  const getErrorMessage = (error: Error) => {
    const errorMessage = error.message.toLowerCase();

    // Validation errors
    if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
      return "There was a validation error with your input. Please check the form fields and try again.";
    }

    // Network errors
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "There was a network error while submitting the form. Your data has been preserved. Please check your connection and try again.";
    }

    // Server errors
    if (errorMessage.includes("server") || errorMessage.includes("500")) {
      return "The server encountered an error while processing your submission. Your data has been preserved. Please try again in a moment.";
    }

    // Default form error
    return "An error occurred while submitting the form. Your input has been preserved. Please try again.";
  };

  return (
    <ErrorBoundary
      context={`FormErrorBoundary (${formName})`}
      onError={onError}
      errorTitle={`${formName} Error`}
      errorMessage="There was an error with your form submission."
      showRetry={true}
      showRefresh={false} // Don't refresh to preserve form state
      showHome={false} // Keep user on form
      fallback={(error, retry) => (
        <div className="w-full max-w-2xl mx-auto p-4">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <FileWarningIcon className="size-5" />
                {formName} Submission Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <FileWarningIcon className="size-4" />
                <AlertTitle>Submission Error</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <AlertDescription>
                  <strong>Good news:</strong> Your form data has been preserved. Click "Try
                  Again" to retry your submission.
                </AlertDescription>
              </Alert>

              {import.meta.env.DEV && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                  <strong>Error Details:</strong> {error.message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={retry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border rounded hover:bg-accent"
                >
                  Go Back
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                If this problem persists, please contact support with the error details above.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
