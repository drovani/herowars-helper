import { Badge } from "~/components/ui/badge";
import { useNetlifyAuth } from "~/hooks/useNetlifyAuth";

export default function Account() {
  const { user } = useNetlifyAuth();

  return (
    <section>
      <h2>{user?.user_metadata?.full_name}</h2>
      <p>{user?.email}</p>

      {user?.app_metadata.roles.map((role) => (
        <Badge key={role}>{role}</Badge>
      ))}
    </section>
  );
}
