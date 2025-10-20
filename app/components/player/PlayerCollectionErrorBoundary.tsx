// ABOUTME: PlayerCollectionErrorBoundary handles errors specific to player collection components
// ABOUTME: Provides user-friendly error messages and fallback UI for collection operations

import { Component, type ErrorInfo, type ReactNode } from "react";
import log from "loglevel";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PlayerCollectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error("[PlayerCollectionErrorBoundary] Error caught:", error);
    log.error("[PlayerCollectionErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="size-5" />
              Collection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                There was an error loading your hero collection. This might be a
                temporary issue.
              </AlertDescription>
            </Alert>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-3 bg-gray-100 rounded text-sm font-mono">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCwIcon className="size-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
