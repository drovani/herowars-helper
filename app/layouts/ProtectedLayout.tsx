import { Outlet } from "react-router";
import { UnauthorizedAccess } from "~/components/auth/UnauthorizedAccess";
import { useAuth } from "~/contexts/AuthContext";

export default function ProtectedLayout({ roles = [] }: { roles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const hasRole =
    roles.length === 0 || user?.roles.some((role) => roles?.includes(role));

  if (isAuthenticated && hasRole) {
    return <Outlet />;
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
