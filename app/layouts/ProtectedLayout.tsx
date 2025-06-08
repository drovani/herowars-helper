import log from "loglevel";
import { Outlet } from "react-router";
import { useAuth } from "~/contexts/AuthContext";

export default function ProtectedLayout({ roles = [] }: { roles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  log.debug("ProtectedLayout", { isAuthenticated, user });

  const hasRole = roles.length === 0 || user?.roles.some((role) => roles?.includes(role));

  if (isAuthenticated && hasRole) {
    return <Outlet />;
  } else {
    return <div />
  }
}
