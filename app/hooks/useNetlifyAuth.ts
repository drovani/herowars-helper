import netlifyIdentity, { type User } from "netlify-identity-widget";
import { useEffect, useMemo } from "react";

export { type User } from "netlify-identity-widget";

export function useNetlifyAuth() {
  useEffect(() => {
    netlifyIdentity.init();
  }, []);

  const isAuthenticated = useMemo(() => netlifyIdentity.currentUser() !== null, [netlifyIdentity.currentUser()]);
  const user = useMemo(() => netlifyIdentity.currentUser(), [netlifyIdentity.currentUser()]);
  const isAdmin = useMemo(() => user?.app_metadata.roles.includes("admin"), [user?.app_metadata.roles]);

  return {
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    user: user,
    authenticate(callback: (user: User) => void) {
      netlifyIdentity.open();
      netlifyIdentity.on("login", (user) => {
        netlifyIdentity.close();
        callback(user);
      });
    },
    signout(callback: () => void) {
      netlifyIdentity.logout();
      netlifyIdentity.on("logout", () => {
        callback();
      });
    },
  };
}
