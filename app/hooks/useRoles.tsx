import { useAuth } from "~/contexts/AuthContext";

/**
 * Hook for checking user roles and permissions
 */
export function useRoles() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if user has any of the specified roles
   */
  const hasRole = (roles: string | string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return user.roles.some(role => requiredRoles.includes(role));
  };

  /**
   * Check if user has editor permissions (admin or editor role)
   */
  const canEdit = (): boolean => {
    return hasRole(["admin", "editor"]);
  };

  /**
   * Check if user has admin permissions
   */
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  /**
   * Check if user is authenticated with any role
   */
  const isUser = (): boolean => {
    return isAuthenticated && !!user;
  };

  return {
    hasRole,
    canEdit,
    isAdmin,
    isUser,
    user,
    isAuthenticated,
  };
}