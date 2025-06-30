import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useRoles } from "~/hooks/useRoles";

interface UnauthorizedAccessProps {
  requiredRole?: string;
  action?: string;
}

export function UnauthorizedAccess({ 
  requiredRole = "editor", 
  action = "edit this content" 
}: UnauthorizedAccessProps) {
  const { isAuthenticated, user } = useRoles();

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You must be logged in to {action}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Insufficient Permissions</CardTitle>
        <CardDescription>
          You need {requiredRole} role to {action}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Current user: {user?.name}</p>
          <p>Your roles: {user?.roles.join(", ")}</p>
          <p>Required role: {requiredRole}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/heroes">Back to Heroes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/equipment">Back to Equipment</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}