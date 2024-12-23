import { Badge } from "~/components/ui/badge";
import { useNetlifyAuth } from "~/hooks/useNetlifyAuth";
import ProtectedRoute from "~/ProtectedRoute";

export default function Account() {
  const { user } = useNetlifyAuth();

  return (
    <ProtectedRoute>
      <section>
        <h2>{user?.user_metadata?.full_name}</h2>
        <p>{user?.email}</p>

        {user?.app_metadata.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </section>
    </ProtectedRoute>
  );
}
