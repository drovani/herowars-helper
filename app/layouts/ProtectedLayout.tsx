import log from "loglevel";
import { Outlet } from "react-router";
import { useAuth } from "~/contexts/AuthContext";

export default function ProtectedLayout({ roles = [] }: { roles?: string[] }) {
  const { isAuthenticated, user, hasRole } = useAuth();
  log.debug("ProtectedLayout", { isAuthenticated, user });

  const hasRequiredRole = roles.length === 0 || hasRole(roles);

  if (isAuthenticated && hasRequiredRole) {
    return <Outlet />;
  } else {
    return <div>Not authorized to view this page</div>;
  }
}
