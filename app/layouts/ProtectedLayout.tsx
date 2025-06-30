import log from "loglevel";
import { Outlet } from "react-router";
import { UnauthorizedAccess } from "~/components/auth/UnauthorizedAccess";
import { useAuth } from "~/contexts/AuthContext";

export default function ProtectedLayout({ roles = [] }: { roles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  log.debug("ProtectedLayout", { isAuthenticated, user });

  const hasRole = roles.length === 0 || user?.roles.some((role) => roles?.includes(role));

  if (isAuthenticated && hasRole) {
    return <Outlet />;
  } else {
    const requiredRole = roles.length > 0 ? roles.join(" or ") : "authenticated user";
    return <UnauthorizedAccess requiredRole={requiredRole} action="access this page" />;
  }
}
