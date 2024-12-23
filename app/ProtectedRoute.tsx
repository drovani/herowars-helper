import { type PropsWithChildren } from "react";
import { Button } from "./components/ui/button";
import { useNetlifyAuth } from "./hooks/useNetlifyAuth";

export default function ProtectedRoute({ children, roles }: PropsWithChildren<{ roles?: string[] }>) {
  const { isAuthenticated, user, authenticate } = useNetlifyAuth();
  const hasRole = !roles || user?.app_metadata.roles.some((role) => roles?.includes(role));

  if (isAuthenticated && hasRole) {
    return children;
  } else {
    return <Button onClick={() => authenticate((_) => window.location.reload())}>Sign in</Button>;
  }
}
