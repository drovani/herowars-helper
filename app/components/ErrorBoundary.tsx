// ABOUTME: Base ErrorBoundary component with configurable fallback UI and error reporting
// ABOUTME: Provides foundation for all error boundaries in the application with retry mechanisms

import { Component, type ErrorInfo, type ReactNode } from "react";
import log from "loglevel";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from "lucide-react";

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI to show on error */
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom error message to display */
  errorMessage?: string;
  /** Title for error display */
  errorTitle?: string;
  /** Context information for logging (e.g., component name, route) */
  context?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Whether to show home button */
  showHome?: boolean;
  /** Whether to show page refresh button */
  showRefresh?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Base error boundary component that catches React errors and displays fallback UI.
 *
 * Features:
 * - Configurable fallback UI
 * - Development vs production error display
 * - Retry mechanism to reset error state
 * - Integration with loglevel for consistent logging
 * - Error context tracking for debugging
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   context="HeroList"
 *   errorTitle="Hero Loading Error"
 *   onError={(error) => reportToMonitoring(error)}
 * >
 *   <HeroList />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, context } = this.props;

    // Log error with context
    const logPrefix = context ? `[${context}]` : "[ErrorBoundary]";
    log.error(`${logPrefix} Error caught:`, error);
    log.error(`${logPrefix} Component stack:`, errorInfo.componentStack);

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        log.error(`${logPrefix} Error in onError handler:`, handlerError);
      }
    }

    // Store error info in state for display
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    const { context } = this.props;
    const logPrefix = context ? `[${context}]` : "[ErrorBoundary]";

    log.info(`${logPrefix} User initiated retry`);
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleRefresh = () => {
    const { context } = this.props;
    const logPrefix = context ? `[${context}]` : "[ErrorBoundary]";

    log.info(`${logPrefix} User initiated page refresh`);
    window.location.reload();
  };

  private handleGoHome = () => {
    const { context } = this.props;
    const logPrefix = context ? `[${context}]` : "[ErrorBoundary]";

    log.info(`${logPrefix} User navigating to home`);
    window.location.href = "/";
  };

  private renderDefaultFallback() {
    const {
      errorTitle = "Something went wrong",
      errorMessage = "An unexpected error occurred. Please try again or contact support if the problem persists.",
      showRetry = true,
      showHome = true,
      showRefresh = true,
    } = this.props;

    const { error } = this.state;
    const isDevelopment = import.meta.env.DEV;

    return (
      <Card className="w-full max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangleIcon className="size-5" />
            {errorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          {isDevelopment && error && (
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                <div className="font-bold text-red-600 dark:text-red-400 mb-1">
                  Error Message:
                </div>
                <div className="text-gray-800 dark:text-gray-200">{error.message}</div>
              </div>

              {error.stack && (
                <details className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  <summary className="cursor-pointer font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stack Trace
                  </summary>
                  <pre className="text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}

              {this.state.errorInfo?.componentStack && (
                <details className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  <summary className="cursor-pointer font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Component Stack
                  </summary>
                  <pre className="text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {showRetry && (
              <Button
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCwIcon className="size-4" />
                Try Again
              </Button>
            )}

            {showRefresh && (
              <Button
                variant="outline"
                onClick={this.handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCwIcon className="size-4" />
                Refresh Page
              </Button>
            )}

            {showHome && (
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <HomeIcon className="size-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  public render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === "function") {
          const fallbackResult = fallback(this.state.error || new Error("Unknown error"), this.handleRetry);
          // If fallback function returns a value, use it; otherwise fall through to default
          if (fallbackResult !== null && fallbackResult !== undefined) {
            return fallbackResult;
          }
        } else {
          return fallback;
        }
      }

      // Render default fallback
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }
}
