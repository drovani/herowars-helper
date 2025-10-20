import { Outlet } from "react-router";
import { UnauthorizedAccess } from "~/components/auth/UnauthorizedAccess";
import { AuthenticationErrorBoundary } from "~/components/auth/AuthenticationErrorBoundary";
import { useAuth } from "~/contexts/AuthContext";
import { NavigationSkeleton } from "~/components/skeletons";

export default function ProtectedLayout({ roles = [] }: { roles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-background"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <div className="flex">
          {/* Sidebar skeleton */}
          <div className="w-64 border-r bg-card">
            <NavigationSkeleton type="sidebar" />
          </div>

          {/* Main content skeleton */}
          <div className="flex-1">
            {/* Header skeleton */}
            <div className="border-b bg-card">
              <NavigationSkeleton type="header" />
            </div>

            {/* Page content loading */}
            <div className="p-6 space-y-6">
              <NavigationSkeleton type="breadcrumbs" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <span className="sr-only">Application is loading, please wait.</span>
      </div>
    );
  }

  const hasRole =
    roles.length === 0 || user?.roles.some((role) => roles?.includes(role));

  if (isAuthenticated && hasRole) {
    return (
      <AuthenticationErrorBoundary requiredRoles={roles}>
        <Outlet />
      </AuthenticationErrorBoundary>
    );
  } else {
    const requiredRole =
      roles.length > 0 ? roles.join(" or ") : "authenticated user";
    return (
      <UnauthorizedAccess
        requiredRole={requiredRole}
        action="access this page"
      />
    );
  }
}
