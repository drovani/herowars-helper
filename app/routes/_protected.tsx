import log from "loglevel";
import { Outlet, useLoaderData } from "react-router";
import { useAuth } from "~/contexts/AuthContext";

export default function ProtectedLayout() {
  const loaderData = useLoaderData()
  const { isAuthenticated, user } = useAuth();
  log.debug("ProtectedLayout", { isAuthenticated, user });

  const roles = loaderData?.roles || [];

  const hasRole = roles?.length === 0 || user?.roles.some((role) => roles?.includes(role));

  if (isAuthenticated && hasRole) {
    return <Outlet />;
  } else {
    return <div>
      <h1 className="mb-5">Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <p>Please contact your administrator if you believe this is an error.</p>
      <p>Current user roles: {user?.roles.join(", ")}</p>
      <p>Required roles: {roles.join(", ")}</p>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: <pre>{JSON.stringify(user, null, 2)}</pre></p>
      <p>Roles: <pre>{JSON.stringify(roles, null, 2)}</pre></p>
      <p>Has role: {hasRole ? "Yes" : "No"}</p>
    </div>
  }
}
