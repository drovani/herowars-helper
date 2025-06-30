import { useEffect, useState, type ReactNode } from "react";
import { useRoles } from "~/hooks/useRoles";

interface RequireRoleProps {
  roles: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user roles
 */
export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasRole, isAuthenticated, user } = useRoles();
  const [shouldRender, setShouldRender] = useState(false);

  // Update render state when authentication or user data changes
  useEffect(() => {
    setShouldRender(hasRole(roles));
  }, [hasRole, roles, isAuthenticated, user]);

  if (shouldRender) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Component that renders children only if user has editor permissions
 */
export function RequireEditor({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RequireRole roles={["admin", "editor"]} fallback={fallback}>
      {children}
    </RequireRole>
  );
}